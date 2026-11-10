import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import fileUpload from 'express-fileupload';
import pdfParse from 'pdf-parse';
import { requireAuth } from '../middleware/auth';
import { supabase } from '../services/supabase';
import { generateMockTest, evaluateMockTestAnswers } from '../agents/mockTestAgent';
import { runPhase1, runPhase2 } from '../agents/orchestrator';
import { buildModuleMaterialsFromPointers } from '../agents/pointersAgent';
import { callGeminiJSON } from '../services/gemini';
import { DEMO_MODULES } from './demo';

export const mockTestRouter = Router();

// Allow public access to demo modules (e.g. demo-photosynthesis) without login
mockTestRouter.use((req, res, next) => {
  if (req.body?.moduleId && typeof req.body.moduleId === 'string' && req.body.moduleId.startsWith('demo-')) {
    return next();
  }
  return requireAuth(req, res, next);
});

/**
 * Checks if the requested marks distribution grid matches the question mark distribution of a stored mock test.
 */
function distributionsMatch(requestedDist: any[], dbQuestions: any[]): boolean {
  if (!Array.isArray(requestedDist) || !Array.isArray(dbQuestions)) return false;
  
  // Group requested distribution: map of marks -> count
  const reqMap: Record<number, number> = {};
  for (const item of requestedDist) {
    if (item && typeof item.marks === 'number') {
      reqMap[item.marks] = (reqMap[item.marks] || 0) + (item.count || 1);
    }
  }
  
  // Group DB questions distribution: map of marks -> count
  const dbMap: Record<number, number> = {};
  for (const q of dbQuestions) {
    if (q && typeof q.marks === 'number') {
      dbMap[q.marks] = (dbMap[q.marks] || 0) + 1;
    }
  }
  
  const reqKeys = Object.keys(reqMap).sort();
  const dbKeys = Object.keys(dbMap).sort();
  if (reqKeys.length !== dbKeys.length) return false;
  
  for (let i = 0; i < reqKeys.length; i++) {
    const k = parseInt(reqKeys[i], 10);
    if (parseInt(dbKeys[i], 10) !== k) return false;
    if (reqMap[k] !== dbMap[k]) return false;
  }
  
  return true;
}

mockTestRouter.post('/generate', async (req, res) => {
  try {
    const { syllabusText, maxMarks, distribution, instructions, moduleId, topic, persona, difficulty } = req.body;

    // 1. Parse and validate maxMarks and distribution (supporting FormData strings)
    let parsedMaxMarks = typeof maxMarks === 'string' ? parseInt(maxMarks, 10) : maxMarks;
    let parsedDistribution = distribution;
    if (typeof distribution === 'string') {
      try {
        parsedDistribution = JSON.parse(distribution);
      } catch (err) {
        parsedDistribution = null;
      }
    }
    let parsedPersona = persona;
    if (typeof persona === 'string') {
      try {
        parsedPersona = JSON.parse(persona);
      } catch (err) {}
    }

    if (!parsedMaxMarks || !parsedDistribution || !Array.isArray(parsedDistribution)) {
      return res.status(400).json({ error: 'maxMarks and questions distribution grid are required.' });
    }

    let sourceText = syllabusText || '';

    // Check for uploaded files (e.g. syllabus PDF)
    if (req.files && req.files.files) {
      const rawFiles = req.files.files;
      const files = Array.isArray(rawFiles) ? rawFiles : [rawFiles];
      for (const file of files) {
        if (file.size > 10 * 1024 * 1024) {
          return res.status(400).json({ error: `File "${file.name}" exceeds the 10 MB size limit.` });
        }
        if (file.mimetype === 'application/pdf') {
          const data = await pdfParse(file.data);
          sourceText += data.text + '\n\n';
        }
      }
    }
    
    // 2. If no syllabus text, but we have a topic, let's query SerpAPI and run Phase 1!
    if (!sourceText.trim() && topic) {
      console.log(`[MockTestRouter] Syllabus empty, running SerpAPI fallback for topic: ${topic}`);
      const defaultPersona = parsedPersona || { grade: 'College', interest: 'everyday life' };
      const { source } = await runPhase1(topic, defaultPersona);
      sourceText = source.sourceExcerpt;
    }

    if (!sourceText.trim()) {
      return res.status(400).json({ error: 'Please upload a syllabus PDF or specify a topic.' });
    }

    // 3. Database lookup for match
    let matchingModule = null;
    let targetModule = null;

    if (moduleId) {
      console.log(`[MockTestRouter] Syllabus generate called for existing moduleId: ${moduleId}`);
      const { data } = await supabase
        .from('modules')
        .select('*')
        .eq('id', moduleId)
        .eq('user_id', req.user!.id)
        .maybeSingle();
      
      targetModule = data;
      
      if (targetModule && targetModule.mock_test) {
        const isNewFormat = targetModule.mock_test.easy || targetModule.mock_test.medium || targetModule.mock_test.hard;
        if (isNewFormat) {
          const maxMarksMatch = targetModule.mock_test.maxMarks === parsedMaxMarks;
          const activeDiff = targetModule.mock_test.activeDifficulty || 'medium';
          const paperQuestions = targetModule.mock_test[activeDiff]?.questions || targetModule.mock_test.easy?.questions || [];
          const distMatch = distributionsMatch(parsedDistribution, paperQuestions);
          
          if (maxMarksMatch && distMatch) {
            matchingModule = targetModule;
          }
        }
      }
    } else {
      console.log(`[MockTestRouter] General cache search for syllabusText/topic`);
      const { data: userModules } = await supabase
        .from('modules')
        .select('*')
        .eq('user_id', req.user!.id);

      if (userModules && userModules.length > 0) {
        for (const mod of userModules) {
          let contentMatches = false;
          if (sourceText.trim()) {
            contentMatches = mod.source && mod.source.sourceExcerpt && mod.source.sourceExcerpt.trim() === sourceText.trim();
          } else if (topic) {
            contentMatches = mod.topic && mod.topic.toLowerCase().trim() === topic.toLowerCase().trim();
          }

          if (contentMatches && mod.mock_test) {
            const isNewFormat = mod.mock_test.easy || mod.mock_test.medium || mod.mock_test.hard;
            if (isNewFormat) {
              const maxMarksMatch = mod.mock_test.maxMarks === parsedMaxMarks;
              const activeDiff = mod.mock_test.activeDifficulty || 'medium';
              const paperQuestions = mod.mock_test[activeDiff]?.questions || mod.mock_test.easy?.questions || [];
              const distMatch = distributionsMatch(parsedDistribution, paperQuestions);
              if (maxMarksMatch && distMatch) {
                matchingModule = mod;
                break;
              }
            }
          }
        }
      }
    }

    // 4. Cache HIT path: directly fetch and return result from database
    if (matchingModule) {
      console.log(`[MockTestRouter] Cache HIT: Found existing module ${matchingModule.id} with same content and marks distribution!`);
      const cachedMockTest = {
        ...matchingModule.mock_test,
        moduleId: matchingModule.id,
        source: matchingModule.source || {
          title: matchingModule.topic || 'Custom Syllabus',
          sourceExcerpt: sourceText,
          url: null
        }
      };
      return res.json(cachedMockTest);
    }

    // 5. Cache MISS path: generate 3 question papers in parallel (Easy, Medium, Hard)
    console.log(`[MockTestRouter] Cache MISS: Generating 3 parallel question papers for ${topic || 'Custom Syllabus'}`);
    const selectedDifficulty = (difficulty || 'easy').toLowerCase();
    
    const [easyRes, mediumRes, hardRes] = await Promise.all([
      generateMockTest(sourceText, {
        maxMarks: parsedMaxMarks,
        distribution: parsedDistribution,
        instructions: (instructions || '') + ' (Difficulty Level: Easy. Questions must be direct, simple, and test basic concepts/definitions. Set difficultyRating for each question to be an integer between 1 and 2.)'
      }),
      generateMockTest(sourceText, {
        maxMarks: parsedMaxMarks,
        distribution: parsedDistribution,
        instructions: (instructions || '') + ' (Difficulty Level: Medium. Questions must test intermediate analytical ability. Set difficultyRating for each question to be an integer between 3 and 4.)'
      }),
      generateMockTest(sourceText, {
        maxMarks: parsedMaxMarks,
        distribution: parsedDistribution,
        instructions: (instructions || '') + ' (Difficulty Level: Hard. Questions must test advanced comprehension and complex multi-step reasoning. Set difficultyRating for each question to be 5.)'
      })
    ]);

    if (easyRes.error) return res.json({ error: easyRes.error });
    if (mediumRes.error) return res.json({ error: mediumRes.error });
    if (hardRes.error) return res.json({ error: hardRes.error });

    // Helper to format mock test questions
    const formatPaper = (resObj: any, diff: string) => ({
      id: uuidv4(),
      topic: topic || 'Custom Syllabus Exam',
      title: topic || 'Custom Syllabus Exam',
      maxMarks: parsedMaxMarks,
      instructions: (instructions || '') + ` (Difficulty: ${diff})`,
      questions: resObj.questions?.map((q: any) => ({
        id: 'q_' + uuidv4(),
        ...q
      })) || [],
      isEvaluated: false
    });

    const easyPaper = formatPaper(easyRes, 'Easy');
    const mediumPaper = formatPaper(mediumRes, 'Medium');
    const hardPaper = formatPaper(hardRes, 'Hard');

    // Extract pointers from the Medium paper only (to avoid over-granular concept bloat) and cap at 15
    const pointers: string[] = [];
    const representativeQuestions = mediumPaper.questions || [];
    for (const q of representativeQuestions) {
      if (q.stepMarking && Array.isArray(q.stepMarking)) {
        for (const sm of q.stepMarking) {
          if (sm.step && !pointers.includes(sm.step)) {
            pointers.push(sm.step);
          }
        }
      }
    }
    
    // Limit to 15 pointers maximum to keep prompt/response sizes highly focused and fast
    if (pointers.length > 15) {
      pointers.splice(15);
    }

    // Ensure we have learning pointers, extracting 5 key pointers from sourceText if stepMarking is empty
    if (pointers.length === 0 && sourceText.trim().length > 0) {
      console.log('[MockTestRouter] No step markings found, extracting 5 key pointers from source text...');
      try {
        const extractPrompt = `
Analyze this text/syllabus excerpt and extract exactly 5 key, descriptive learning pointers (each as a single clear sentence summarizing a core concept).
Source Text:
${sourceText.slice(0, 4000)}

Output strictly as a valid JSON array of strings:
["Pointer 1", "Pointer 2", ...]
`;
        const extracted = await callGeminiJSON<string[]>(extractPrompt);
        if (Array.isArray(extracted) && extracted.length > 0) {
          pointers.push(...extracted.filter(Boolean));
        }
      } catch (e: any) {
        console.warn('[MockTestRouter] Failed to extract pointers from sourceText:', e.message);
      }
    }

    const mockTestObj: any = {
      id: uuidv4(),
      topic: topic || 'Custom Syllabus Exam',
      title: topic || 'Custom Syllabus Exam',
      maxMarks: parsedMaxMarks,
      easy: easyPaper,
      medium: mediumPaper,
      hard: hardPaper,
      activeDifficulty: selectedDifficulty,
      pointers,
      source: {
        title: topic || 'Custom Syllabus',
        sourceExcerpt: sourceText,
        url: null
      }
    };

    // If updating an existing module, save the new mock test and pointers to it directly!
    if (moduleId && targetModule) {
      console.log(`[MockTestRouter] Cache MISS: Updating existing module ${moduleId} with new mock test and pointers`);
      const { error: updateError } = await supabase
        .from('modules')
        .update({
          mock_test: mockTestObj,
          pointers: pointers
        })
        .eq('id', moduleId)
        .eq('user_id', req.user!.id);
      
      if (updateError) throw new Error(updateError.message);
      
      mockTestObj.moduleId = moduleId;
      return res.json(mockTestObj);
    }

    // 6. Create Module with skeleton materials (to be rendered dynamically client-side in the browser)
    const defaultPersona = parsedPersona || { grade: 'College', interest: 'everyday life' };
    const newModuleId = uuidv4();
    
    try {
      console.log(`[MockTestRouter] Creating module ${newModuleId} with skeleton study materials`);
      await supabase.from('modules').insert({
        id: newModuleId,
        user_id: req.user!.id,
        topic: topic || 'Custom Syllabus',
        title: topic || 'Custom Syllabus Exam',
        persona: defaultPersona,
        source: {
          title: topic || 'Custom Syllabus',
          sourceExcerpt: sourceText,
          url: null
        },
        master_context: {
          topic: topic || 'Custom Syllabus',
          oneLiner: 'Interactive study guide and mock test',
          coreConcepts: [],
          keyFacts: [],
          toc: []
        },
        text_content: { title: topic || 'Custom Syllabus', subtitle: '', toc: [], sections: [] },
        slides: [],
        mindmap: [],
        audio: { title: topic || 'Custom Syllabus', script: '', chapters: [] },
        progress: 0,
        from_upload: true,
        status: 'complete',
        mock_test: mockTestObj,
        pointers: pointers
      });
      mockTestObj.moduleId = newModuleId;
    } catch (err: any) {
      console.error('[MockTestRouter] Failed to insert module:', err.message);
      throw err;
    }

    res.json(mockTestObj);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

mockTestRouter.post('/evaluate', async (req, res) => {
  try {
    const { moduleId, userAnswers } = req.body;
    if (!moduleId || !userAnswers) {
      return res.status(400).json({ error: 'moduleId and userAnswers are required.' });
    }

    // Demo module evaluation (in-memory, no Supabase required)
    if (moduleId && typeof moduleId === 'string' && moduleId.startsWith('demo-')) {
      const demoMod = DEMO_MODULES[moduleId];
      if (!demoMod || !demoMod.mock_test) {
        return res.status(404).json({ error: 'Demo mock test not found.' });
      }
      const mockTest = demoMod.mock_test;
      const activeDifficulty = (mockTest.activeDifficulty || 'medium').toLowerCase();
      const paper = mockTest[activeDifficulty] || mockTest;
      const questions = paper.questions || [];

      let evaluationResult;
      try {
        evaluationResult = await evaluateMockTestAnswers(questions, userAnswers);
      } catch (evalErr) {
        // Fallback evaluation for offline / key limits
        let totalScore = 0;
        const evals: Record<string, any> = {};
        for (const q of questions) {
          const ans = (userAnswers[q.id] || '').trim();
          const marks = ans.length > 20 ? q.marks : (ans.length > 0 ? Math.ceil(q.marks / 2) : 0);
          totalScore += marks;
          evals[q.id] = {
            marksObtained: marks,
            feedback: marks === q.marks
              ? `Outstanding answer! Demonstrates clear understanding of the scientific mechanism.`
              : (marks > 0 ? `Good answer covering key concepts. Could elaborate on chemical stoichiometry.` : `No answer provided.`),
            stepGrades: q.stepMarking.map((sm: any) => ({
              step: sm.step,
              marksObtained: marks === q.marks ? sm.marks : (marks > 0 ? Math.round(sm.marks / 2 * 10) / 10 : 0),
              feedback: marks > 0 ? `Step addressed appropriately.` : `Missing detail for this step.`
            }))
          };
        }
        evaluationResult = { score: totalScore, evaluations: evals };
      }

      const evaluatedQuestions = questions.map((q: any) => {
        const qEval = evaluationResult.evaluations[q.id] || {
          marksObtained: 0,
          feedback: 'No evaluation provided.',
          stepGrades: q.stepMarking.map((sm: any) => ({ step: sm.step, marksObtained: 0, feedback: 'No feedback.' }))
        };
        return {
          ...q,
          userAnswer: userAnswers[q.id] || '',
          evaluation: qEval
        };
      });

      const evaluatedPaper = {
        ...paper,
        questions: evaluatedQuestions,
        score: evaluationResult.score,
        isEvaluated: true
      };

      const evaluatedMockTest = {
        ...mockTest,
        [activeDifficulty]: evaluatedPaper,
        isEvaluated: true
      };

      return res.json(evaluatedMockTest);
    }

    // 1. Fetch mock test from the module
    const { data: moduleData, error: fetchError } = await supabase
      .from('modules')
      .select('mock_test')
      .eq('id', moduleId)
      .eq('user_id', req.user!.id)
      .single();

    if (fetchError || !moduleData || !moduleData.mock_test) {
      return res.status(404).json({ error: 'Mock test not found for this module.' });
    }

    const mockTest = moduleData.mock_test;
    const activeDifficulty = (mockTest.activeDifficulty || 'easy').toLowerCase();
    const paper = mockTest[activeDifficulty] || mockTest;
    const questions = paper.questions || [];
    
    // 2. Evaluate answers
    const evaluationResult = await evaluateMockTestAnswers(questions, userAnswers);

    // 3. Build the evaluated mock test object
    const evaluatedQuestions = questions.map((q: any) => {
      const qEval = evaluationResult.evaluations[q.id] || {
        marksObtained: 0,
        feedback: 'No evaluation provided.',
        stepGrades: q.stepMarking.map((sm: any) => ({ step: sm.step, marksObtained: 0, feedback: 'No feedback.' }))
      };
      return {
        ...q,
        userAnswer: userAnswers[q.id] || '',
        evaluation: qEval
      };
    });

    const evaluatedPaper = {
      ...paper,
      questions: evaluatedQuestions,
      score: evaluationResult.score,
      isEvaluated: true
    };

    const evaluatedMockTest = {
      ...mockTest,
      [activeDifficulty]: evaluatedPaper,
      isEvaluated: true // support old checks
    };

    // 4. Update in database
    const { error: updateError } = await supabase
      .from('modules')
      .update({ mock_test: evaluatedMockTest })
      .eq('id', moduleId);

    if (updateError) throw new Error(updateError.message);

    res.json(evaluatedMockTest);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

mockTestRouter.post('/evaluate-single', async (req, res) => {
  try {
    const { moduleId, questionId, userAnswer, timeTaken } = req.body;
    if (!moduleId || !questionId || userAnswer === undefined || timeTaken === undefined) {
      return res.status(400).json({ error: 'moduleId, questionId, userAnswer, and timeTaken are required.' });
    }

    const { data: moduleData, error: fetchError } = await supabase
      .from('modules')
      .select('mock_test')
      .eq('id', moduleId)
      .eq('user_id', req.user!.id)
      .single();

    if (fetchError || !moduleData || !moduleData.mock_test) {
      return res.status(404).json({ error: 'Mock test not found for this module.' });
    }

    const mockTest = moduleData.mock_test;
    const activeDifficulty = (mockTest.activeDifficulty || 'easy').toLowerCase();
    const paper = mockTest[activeDifficulty] || mockTest;
    const questions = paper.questions || [];
    const question = questions.find((q: any) => q.id === questionId);
    if (!question) {
      return res.status(404).json({ error: 'Question not found in this mock test.' });
    }

    const evaluationResult = await evaluateMockTestAnswers([question], { [questionId]: userAnswer });
    const qEval = evaluationResult.evaluations[questionId];

    if (!qEval) {
      return res.status(500).json({ error: 'Failed to evaluate answer.' });
    }

    // Compute global average time for this question from historic data
    let avgTime = question.marks * 30; // fallback: 30 seconds per mark
    try {
      const { data: timingData, error: timingError } = await supabase
        .from('question_timings')
        .select('time_taken')
        .eq('question_id', questionId);
      if (!timingError && timingData && timingData.length > 0) {
        const total = timingData.reduce((sum, rec) => sum + (rec.time_taken ?? 0), 0);
        avgTime = total / timingData.length;
      }
    } catch (e) {
      // ignore and use fallback
    }
    const timeExceeded = Math.max(0, timeTaken - avgTime);
    const penaltyCount = Math.floor(timeExceeded / 10);
    const timePenalty = penaltyCount * 0.01; // -0.01 per 10s over avg
    
    const baseMarks = qEval.marksObtained;
    const finalMarks = Math.max(0, baseMarks - timePenalty);

    // Store this timing for future global averages
    try {
      await supabase.from('question_timings').insert({
        question_id: questionId,
        user_id: req.user?.id,
        time_taken: timeTaken
      });
    } catch (e) {
      // ignore insert errors
    }

    res.json({
      questionId,
      question: question.question,
      marks: question.marks,
      baseScore: baseMarks,
      timePenalty,
      finalScore: Number(finalMarks.toFixed(2)),
      averageTimeAllowed: avgTime,
      feedback: qEval.feedback,
      stepGrades: qEval.stepGrades
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

mockTestRouter.post('/difficulty', async (req, res) => {
  try {
    const { moduleId, difficulty } = req.body;
    if (!moduleId || !difficulty) {
      return res.status(400).json({ error: 'moduleId and difficulty are required.' });
    }

    if (moduleId && typeof moduleId === 'string' && moduleId.startsWith('demo-')) {
      const demoMod = DEMO_MODULES[moduleId];
      if (demoMod && demoMod.mock_test) {
        demoMod.mock_test.activeDifficulty = difficulty.toLowerCase();
      }
      return res.json({ success: true, activeDifficulty: difficulty.toLowerCase() });
    }

    const { data: moduleData, error: fetchError } = await supabase
      .from('modules')
      .select('mock_test')
      .eq('id', moduleId)
      .eq('user_id', req.user!.id)
      .single();

    if (fetchError || !moduleData || !moduleData.mock_test) {
      return res.status(404).json({ error: 'Mock test not found for this module.' });
    }

    const mockTest = moduleData.mock_test;
    mockTest.activeDifficulty = difficulty.toLowerCase();

    const { error: updateError } = await supabase
      .from('modules')
      .update({ mock_test: mockTest })
      .eq('id', moduleId);

    if (updateError) throw new Error(updateError.message);

    res.json({ success: true, activeDifficulty: mockTest.activeDifficulty });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});



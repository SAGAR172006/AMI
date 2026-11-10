import { Router } from 'express';

export const demoRouter = Router();

// ── Full demo content — served directly from memory, no Supabase needed ──────

export const DEMO_MODULES: Record<string, any> = {

  'demo-photosynthesis': {
    id: 'demo-photosynthesis',
    topic: 'Photosynthesis',
    status: 'complete',
    progress: 0,
    fromUpload: false,
    source: {
      topic: 'Photosynthesis',
      sourceTitle: 'OpenStax Biology 2e — Chapter 8',
      sourceExcerpt: 'Photosynthesis is essential to all life on earth. It is the only biological process that captures energy from outer space (sunlight) and converts it into chemical energy in the form of glucose. The general equation is: 6CO₂ + 6H₂O + light → C₆H₁₂O₆ + 6O₂. The process occurs in two stages inside chloroplasts.',
      sourceUrl: null,
    },
    mock_test: {
      topic: 'Photosynthesis',
      maxMarks: 12,
      activeDifficulty: 'medium',
      instructions: 'Answer each question thoroughly. You can speak your answers in any Indic language (e.g. Hinglish or Hindi) using Gnani Prisma STT, and listen to questions and grader feedback using Gnani Timbre TTS.',
      isEvaluated: false,
      score: 0,
      medium: {
        maxMarks: 12,
        score: 0,
        isEvaluated: false,
        questions: [
          {
            id: 'q1',
            marks: 3,
            difficultyRating: 2,
            question: 'What is photosynthesis? State its balanced overall chemical equation and identify the organelle where it occurs.',
            suggestedAnswer: 'Photosynthesis is the biological process by which autotrophic plants convert light energy into chemical energy stored in glucose. The balanced chemical equation is 6CO₂ + 6H₂O + light energy → C₆H₁₂O₆ + 6O₂. It takes place primarily inside the chloroplasts of plant cells.',
            stepMarking: [
              { step: 'Definition of photosynthesis as converting solar energy to chemical energy in glucose', marks: 1 },
              { step: 'Accurate balanced chemical equation (6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂)', marks: 1 },
              { step: 'Identification of chloroplasts (and thylakoids/stroma) as the site of reaction', marks: 1 }
            ]
          },
          {
            id: 'q2',
            marks: 4,
            difficultyRating: 3,
            question: 'Explain the fundamental differences between the light-dependent reactions and the Calvin cycle (light-independent reactions).',
            suggestedAnswer: 'Light-dependent reactions occur in the thylakoid membranes where chlorophyll absorbs sunlight to split water (photolysis), releasing oxygen and synthesizing ATP and NADPH. In contrast, the Calvin cycle takes place in the stroma, utilizing the ATP and NADPH generated in the first stage to fix atmospheric CO₂ into carbohydrates like G3P and glucose without requiring direct sunlight.',
            stepMarking: [
              { step: 'Contrast location: Thylakoid membranes vs Chloroplast stroma', marks: 1 },
              { step: 'Contrast energy inputs: Sunlight and water photolysis vs Chemical energy (ATP/NADPH)', marks: 1.5 },
              { step: 'Contrast primary outputs: Oxygen, ATP, NADPH vs G3P and Glucose', marks: 1.5 }
            ]
          },
          {
            id: 'q3',
            marks: 5,
            difficultyRating: 4,
            question: 'Describe the three key stages of the Calvin cycle (Fixation, Reduction, Regeneration) and explain why six turns of the cycle are required to produce one net glucose molecule.',
            suggestedAnswer: 'The Calvin cycle consists of: 1) Carbon Fixation: The enzyme RuBisCO catalyzes the addition of CO₂ to 5-carbon RuBP, producing 3-PGA. 2) Reduction: ATP and NADPH convert 3-PGA into glyceraldehyde-3-phosphate (G3P). 3) Regeneration: ATP is used to rearrange remaining G3P molecules back into RuBP to continue the cycle. Because each turn fixes only one carbon atom from one CO₂ molecule and glucose is a 6-carbon hexose (C₆H₁₂O₆), six full turns of the Calvin cycle are required to fix six carbons and yield the two surplus G3P molecules needed to synthesize one glucose molecule.',
            stepMarking: [
              { step: 'Accurately explain Carbon Fixation by RuBisCO converting RuBP + CO₂ to 3-PGA', marks: 1.5 },
              { step: 'Explain Reduction phase utilizing ATP and NADPH to produce G3P', marks: 1.5 },
              { step: 'Explain Regeneration phase reforming RuBP to maintain the cycle', marks: 1 },
              { step: 'Explain stoichiometry: 6 turns fixing 6 CO₂ molecules produce 2 surplus G3P for 1 glucose', marks: 1 }
            ]
          }
        ]
      },
      easy: {
        maxMarks: 6,
        score: 0,
        isEvaluated: false,
        questions: [
          {
            id: 'q_easy_1',
            marks: 2,
            difficultyRating: 1,
            question: 'Name the green pigment in plants that absorbs sunlight and mention which gas is released as a byproduct of photosynthesis.',
            suggestedAnswer: 'Chlorophyll is the green pigment in chloroplasts that absorbs sunlight. Oxygen (O₂) gas is released as a byproduct from the splitting of water.',
            stepMarking: [
              { step: 'Identification of Chlorophyll pigment', marks: 1 },
              { step: 'Identification of Oxygen (O₂) gas released', marks: 1 }
            ]
          },
          {
            id: 'q_easy_2',
            marks: 4,
            difficultyRating: 2,
            question: 'What are the two main stages of photosynthesis, and in which parts of the chloroplast do they take place?',
            suggestedAnswer: 'The two main stages are the light-dependent reactions (which occur in the thylakoid membranes) and the light-independent reactions or Calvin cycle (which occurs in the stroma).',
            stepMarking: [
              { step: 'Identify Light-dependent reactions and location (thylakoid)', marks: 2 },
              { step: 'Identify Calvin cycle / dark reactions and location (stroma)', marks: 2 }
            ]
          }
        ]
      },
      hard: {
        maxMarks: 15,
        score: 0,
        isEvaluated: false,
        questions: [
          {
            id: 'q_hard_1',
            marks: 7,
            difficultyRating: 5,
            question: 'Analyze the dual carboxylase and oxygenase activity of RuBisCO. How does photorespiration lead to energetic waste, and how do C4 plants circumvent this?',
            suggestedAnswer: 'RuBisCO can bind O₂ instead of CO₂, initiating photorespiration which produces 2-phosphoglycolate, a toxic metabolite that requires ATP to salvage without producing sugar. C4 plants use PEP carboxylase in mesophyll cells to fix CO₂ into 4-carbon oxaloacetate, transporting malate into bundle-sheath cells (Kranz anatomy) where high CO₂ concentration outcompetes oxygen binding.',
            stepMarking: [
              { step: 'Explanation of RuBisCO oxygenase activity forming 2-phosphoglycolate', marks: 2 },
              { step: 'Energetic cost and loss of fixed carbon in photorespiration', marks: 2 },
              { step: 'C4 Kranz anatomy and spatial separation mechanism using PEP carboxylase', marks: 3 }
            ]
          },
          {
            id: 'q_hard_2',
            marks: 8,
            difficultyRating: 5,
            question: 'Trace the path of electron transfer from Photosystem II through Photosystem I (Z-scheme) and explain how the proton gradient powers ATP synthesis.',
            suggestedAnswer: 'P680 in PSII absorbs light, exciting electrons that transfer to plastoquinone, the cytochrome b6f complex, and plastocyanin, which delivers electrons to P700 in PSI. The electron transport chain pumps protons into the thylakoid lumen, creating an electrochemical gradient (chemiosmosis). Protons pass through ATP synthase into the stroma, generating ATP, while ferredoxin-NADP+ reductase at PSI produces NADPH.',
            stepMarking: [
              { step: 'P680 photoexcitation and photolysis of water in PSII', marks: 2 },
              { step: 'Electron transport through Cytochrome b6f and Plastocyanin to PSI', marks: 2 },
              { step: 'Establishment of proton electrochemical gradient across thylakoid lumen', marks: 2 },
              { step: 'Chemiosmotic ATP synthesis via ATP synthase and NADPH formation', marks: 2 }
            ]
          }
        ]
      }
    },
    textContent: {
      title: 'Photosynthesis & the Carbon Cycle',
      subtitle: 'How plants turn sunlight into life — and feed the planet doing it.',
      toc: [
        { id: 's1', title: 'What is Photosynthesis?', done: false, current: true },
        { id: 's2', title: 'The Two Stages: Light & Dark', done: false, current: false },
        { id: 's3', title: 'The Calvin Cycle', done: false, current: false },
        { id: 's4', title: 'Why It Matters', done: false, current: false },
      ],
      sections: [
        { id: 'obj', kind: 'objectives', heading: 'What you will learn', items: [
          'Explain the two stages of photosynthesis and where each occurs.',
          'Describe how the Calvin cycle builds glucose from CO₂.',
          'Connect photosynthesis to the broader carbon cycle.',
        ]},
        { id: 'p1', kind: 'prose', heading: 'What is Photosynthesis?', body: 'Inside every green leaf, billions of tiny organelles called **chloroplasts** capture light and use it to turn carbon dioxide and water into glucose.\n\nThe overall equation is simple: 6CO₂ + 6H₂O + light → C₆H₁₂O₆ + 6O₂. Plants get to eat, and we get oxygen to breathe. Not a bad deal.', figure: 'leaf-cell' },
        { id: 'q1', kind: 'inline-quiz', question: 'Where does photosynthesis take place inside a plant cell?', hint: 'Think about what makes leaves green.', choices: [
          { id: 'a', text: 'Mitochondria', correct: false },
          { id: 'b', text: 'Chloroplasts', correct: true },
          { id: 'c', text: 'Nucleus', correct: false },
          { id: 'd', text: 'Vacuole', correct: false },
        ]},
        { id: 'p2', kind: 'prose', heading: 'The Two Stages: Light & Dark', body: 'Photosynthesis happens in two stages. The **light-dependent reactions** occur in the thylakoid membranes. Light energy splits water molecules, releasing oxygen and creating energy carriers (ATP and NADPH).\n\nThe **light-independent reactions** (Calvin Cycle) happen in the stroma. They use those energy carriers to assemble glucose from CO₂ — no direct sunlight needed.' },
        { id: 'q2', kind: 'inline-quiz', question: 'Which stage of photosynthesis releases oxygen as a byproduct?', hint: 'Oxygen comes from splitting water molecules.', choices: [
          { id: 'a', text: 'Calvin Cycle', correct: false },
          { id: 'b', text: 'Light-dependent reactions', correct: true },
          { id: 'c', text: 'Glycolysis', correct: false },
          { id: 'd', text: 'Fermentation', correct: false },
        ]},
        { id: 'p3', kind: 'prose', heading: 'The Calvin Cycle', body: 'The Calvin Cycle runs in the stroma of the chloroplast. It has three phases: **fixation** (CO₂ is attached to a 5-carbon molecule called RuBP), **reduction** (ATP and NADPH convert the molecule into G3P sugar), and **regeneration** (RuBP is rebuilt to keep the cycle going).\n\nSix turns of the cycle produce one molecule of glucose.', figure: 'calvin-cycle' },
        { id: 'q3', kind: 'inline-quiz', question: 'How many turns of the Calvin cycle are needed to produce one glucose molecule?', hint: 'Glucose has 6 carbons, and each turn fixes one CO₂.', choices: [
          { id: 'a', text: '1', correct: false },
          { id: 'b', text: '3', correct: false },
          { id: 'c', text: '6', correct: true },
          { id: 'd', text: '12', correct: false },
        ]},
        { id: 'p4', kind: 'prose', heading: 'Why It Matters', body: 'Photosynthesis removes roughly **120 billion tonnes** of carbon from the atmosphere every year. Without it, CO₂ would accumulate and temperatures would spike.\n\nEvery bite of food you eat traces back to photosynthesis — the energy originated as sunlight captured by a plant.' },
        { id: 'q4', kind: 'inline-quiz', question: 'What happens to CO₂ during the fixation stage of the Calvin Cycle?', hint: 'Think about what fixation means — attaching something to something else.', choices: [
          { id: 'a', text: 'It is released as a waste product', correct: false },
          { id: 'b', text: 'It is attached to RuBP to start building sugar', correct: true },
          { id: 'c', text: 'It is converted into oxygen', correct: false },
          { id: 'd', text: 'It is stored in the vacuole', correct: false },
        ]},
      ],
    },
    slides: [
      { id: 'slide_1', kind: 'cover', title: 'Photosynthesis', subtitle: 'How plants turn sunlight into food', narration: 'Welcome to photosynthesis — the process that powers almost all life on Earth.', imageUrl: null },
      { id: 'slide_2', kind: 'bullet', title: 'The Big Picture', points: ['Plants capture sunlight in chloroplasts', 'CO₂ + H₂O + Light → Glucose + O₂', 'Two main stages: light and dark reactions', 'Powers nearly all food chains on Earth'], narration: 'Let us start with the overall picture of what photosynthesis achieves.', imageUrl: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&auto=format' },
      { id: 'slide_3', kind: 'split', title: 'Two Stages', cards: [{ label: 'Stage 1', title: 'Light Reactions', body: 'Occur in thylakoid membranes. Capture light, split water, produce ATP and NADPH.' }, { label: 'Stage 2', title: 'Calvin Cycle', body: 'Occurs in the stroma. Uses ATP and NADPH to fix CO₂ into glucose.' }], narration: 'Photosynthesis has two distinct stages that work together like a relay race.', imageUrl: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=800&auto=format' },
      { id: 'slide_4', kind: 'equation', title: 'The Photosynthesis Equation', left: '6CO₂ + 6H₂O + Light', operator: '→', right: 'C₆H₁₂O₆ + 6O₂', narration: 'This elegant equation summarises everything — inputs on the left, outputs on the right.', imageUrl: null },
      { id: 'slide_5', kind: 'bullet', title: 'The Calvin Cycle', points: ['Fixation: CO₂ joins RuBP', 'Reduction: ATP powers sugar building', 'Regeneration: RuBP is rebuilt', '6 turns = 1 glucose molecule'], narration: 'The Calvin Cycle is where the actual food-making happens — a beautiful three-step loop.', imageUrl: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=800&auto=format' },
      { id: 'slide_6', kind: 'stat', title: 'Global Impact', stat: '120 Gt', caption: 'Carbon removed from the atmosphere by photosynthesis every single year', narration: 'Photosynthesis is our planet\'s biggest carbon capture system — and it is entirely free.', imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&auto=format' },
    ],
    mindmap: [
      { id: 'root', label: 'Photosynthesis', parent: null, x: 0, y: 0 },
      { id: 'n1', label: 'Light Reactions', parent: 'root', x: -240, y: -150 },
      { id: 'n1a', label: 'Thylakoid', parent: 'n1', x: -380, y: -90 },
      { id: 'n1b', label: 'ATP & NADPH', parent: 'n1', x: -380, y: -210 },
      { id: 'n2', label: 'Calvin Cycle', parent: 'root', x: 240, y: -150 },
      { id: 'n2a', label: 'CO₂ Fixation', parent: 'n2', x: 380, y: -90 },
      { id: 'n2b', label: 'Glucose', parent: 'n2', x: 380, y: -210 },
      { id: 'n3', label: 'Chloroplast', parent: 'root', x: -240, y: 150 },
      { id: 'n3a', label: 'Stroma', parent: 'n3', x: -380, y: 90 },
      { id: 'n3b', label: 'Thylakoids', parent: 'n3', x: -380, y: 210 },
      { id: 'n4', label: 'Carbon Cycle', parent: 'root', x: 240, y: 150 },
      { id: 'n4a', label: '120 Gt/year', parent: 'n4', x: 380, y: 90 },
      { id: 'n4b', label: 'Oxygen release', parent: 'n4', x: 380, y: 210 },
    ],
    audio: {
      title: 'Photosynthesis Audio Lesson',
      script: '[CHAPTER: Introduction]\nWelcome to this audio lesson on Photosynthesis. By the end, you will understand how plants turn sunlight into food.\n\n[CHAPTER: What is Photosynthesis?]\nInside every green leaf, billions of tiny organelles called chloroplasts capture light and use it to turn carbon dioxide and water into glucose. The overall equation is: 6CO₂ plus 6H₂O plus light gives us C₆H₁₂O₆ plus 6O₂.\n\n[CHAPTER: The Two Stages]\nPhotosynthesis happens in two stages. The light-dependent reactions occur in the thylakoid membranes, producing ATP and NADPH. The Calvin Cycle happens in the stroma, using those energy carriers to build glucose.\n\n[CHAPTER: The Calvin Cycle]\nThe Calvin Cycle has three phases: fixation, where CO₂ joins RuBP; reduction, where ATP powers sugar building; and regeneration, where RuBP is rebuilt. Six turns produce one glucose molecule.\n\n[CHAPTER: Why It Matters]\nPhotosynthesis removes 120 billion tonnes of carbon from the atmosphere every year. Every bite of food you eat traces back to this process. Keep learning!',
      chapters: [
        { title: 'Introduction', timestamp: 0 },
        { title: 'What is Photosynthesis?', timestamp: 0 },
        { title: 'The Two Stages', timestamp: 0 },
        { title: 'The Calvin Cycle', timestamp: 0 },
        { title: 'Why It Matters', timestamp: 0 },
      ],
    },
  },

  'demo-black-holes': {
    id: 'demo-black-holes',
    topic: 'Black Holes',
    status: 'complete',
    progress: 0,
    fromUpload: false,
    source: {
      topic: 'Black Holes',
      sourceTitle: 'NASA Science — Black Holes',
      sourceExcerpt: 'A black hole is a place in space where gravity pulls so much that even light cannot escape. The gravity is so strong because matter has been squeezed into a tiny space. This can happen when a star is dying.',
      sourceUrl: 'https://science.nasa.gov/universe/black-holes/',
    },
    textContent: {
      title: 'Black Holes: The Universe\'s Most Extreme Objects',
      subtitle: 'Where gravity wins over everything — including light.',
      toc: [
        { id: 's1', title: 'What is a Black Hole?', done: false, current: true },
        { id: 's2', title: 'How Black Holes Form', done: false, current: false },
        { id: 's3', title: 'The Event Horizon', done: false, current: false },
        { id: 's4', title: 'Black Holes & Time', done: false, current: false },
      ],
      sections: [
        { id: 'obj', kind: 'objectives', heading: 'What you will learn', items: [
          'Define what a black hole is and why nothing can escape it.',
          'Explain how stellar black holes form from dying stars.',
          'Describe the event horizon and its significance.',
          'Understand how black holes distort time.',
        ]},
        { id: 'p1', kind: 'prose', heading: 'What is a Black Hole?', body: 'A **black hole** is a region of space where gravity is so extreme that nothing — not even light — can escape once it crosses the boundary. This boundary is called the **event horizon**.\n\nBlack holes contain an enormous amount of mass squeezed into an incredibly small space called the **singularity**. At the singularity, our current laws of physics break down completely.' },
        { id: 'q1', kind: 'inline-quiz', question: 'Why can nothing escape a black hole once it crosses the event horizon?', hint: 'Think about what the event horizon represents.', choices: [
          { id: 'a', text: 'Because black holes are made of antimatter', correct: false },
          { id: 'b', text: 'Because gravity exceeds the speed of light at that point', correct: true },
          { id: 'c', text: 'Because black holes are invisible', correct: false },
          { id: 'd', text: 'Because they are in deep space', correct: false },
        ]},
        { id: 'p2', kind: 'prose', heading: 'How Black Holes Form', body: 'Most black holes form when a **massive star** (at least 20× the mass of our Sun) runs out of nuclear fuel. Without the outward pressure of fusion to balance gravity, the star collapses in a **supernova** explosion.\n\nThe core that remains becomes so dense it collapses into a singularity. Stellar black holes are typically a few kilometres across, while supermassive black holes can span billions of kilometres.' },
        { id: 'q2', kind: 'inline-quiz', question: 'What triggers the formation of a stellar black hole?', hint: 'What was keeping the star from collapsing before?', choices: [
          { id: 'a', text: 'A planet colliding with the star', correct: false },
          { id: 'b', text: 'The star running out of nuclear fuel', correct: true },
          { id: 'c', text: 'The star cooling down over millions of years', correct: false },
          { id: 'd', text: 'Two neutron stars merging', correct: false },
        ]},
        { id: 'p3', kind: 'prose', heading: 'The Event Horizon', body: 'The **event horizon** is the point of no return. It is not a physical surface — if you fell through it you would not feel anything special in that moment. But you could never send a signal back to the outside universe.\n\nThe radius of the event horizon is called the **Schwarzschild radius**. For an object the mass of the Sun, this would be about 3 km. For Earth, it would be the size of a marble.' },
        { id: 'q3', kind: 'inline-quiz', question: 'What is the Schwarzschild radius?', hint: 'It defines the size of something specific.', choices: [
          { id: 'a', text: 'The distance where time stops', correct: false },
          { id: 'b', text: 'The radius of the event horizon for a given mass', correct: true },
          { id: 'c', text: 'The size of the singularity at the centre', correct: false },
          { id: 'd', text: 'The distance light travels around a black hole', correct: false },
        ]},
        { id: 'p4', kind: 'prose', heading: 'Black Holes & Time', body: 'Near a black hole, **time dilation** becomes extreme. According to Einstein\'s general relativity, time passes slower in stronger gravitational fields. Near the event horizon, time slows to a crawl relative to a distant observer.\n\nIf you watched a friend fall into a black hole, you would see them slow down and freeze at the event horizon — never quite crossing it. From their perspective, they cross it instantly.' },
        { id: 'q4', kind: 'inline-quiz', question: 'According to general relativity, what happens to time near a black hole?', hint: 'Think about gravitational time dilation.', choices: [
          { id: 'a', text: 'Time speeds up dramatically', correct: false },
          { id: 'b', text: 'Time passes slower in stronger gravity', correct: true },
          { id: 'c', text: 'Time reverses direction', correct: false },
          { id: 'd', text: 'Time is unaffected by gravity', correct: false },
        ]},
      ],
    },
    slides: [
      { id: 'slide_1', kind: 'cover', title: 'Black Holes', subtitle: 'Where gravity wins over everything — including light', narration: 'Today we explore the most extreme objects in the known universe.', imageUrl: null },
      { id: 'slide_2', kind: 'bullet', title: 'What is a Black Hole?', points: ['Region where gravity overwhelms everything', 'Nothing escapes — not even light', 'Contains a singularity at its centre', 'Bounded by the event horizon'], narration: 'A black hole is defined by its event horizon — the point of no return.', imageUrl: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=800&auto=format' },
      { id: 'slide_3', kind: 'split', title: 'Two Types', cards: [{ label: 'Stellar', title: 'Stellar Black Holes', body: 'Formed from collapsed massive stars. Typically 5–100 solar masses.' }, { label: 'Supermassive', title: 'Supermassive Black Holes', body: 'Millions to billions of solar masses. Found at the centres of galaxies.' }], narration: 'Black holes come in dramatically different sizes.', imageUrl: 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=800&auto=format' },
      { id: 'slide_4', kind: 'stat', title: 'Our Galaxy\'s Black Hole', stat: '4M☉', caption: 'Mass of Sagittarius A* — the supermassive black hole at the Milky Way\'s centre', narration: 'Right at the heart of our galaxy sits a black hole four million times the mass of our Sun.', imageUrl: 'https://images.unsplash.com/photo-1543722530-d2c3201371e7?w=800&auto=format' },
      { id: 'slide_5', kind: 'bullet', title: 'Time Near a Black Hole', points: ['Time slows in stronger gravity (time dilation)', 'Near event horizon: time nearly stops', 'Falling in feels normal from inside', 'External observers see you freeze'], narration: 'Black holes bend not just space but time itself.', imageUrl: 'https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?w=800&auto=format' },
      { id: 'slide_6', kind: 'stat', title: 'Escape Velocity', stat: 'c', caption: 'Speed needed to escape a black hole\'s event horizon — the speed of light', narration: 'At the event horizon, you would need to travel at the speed of light just to stay in place.', imageUrl: 'https://images.unsplash.com/photo-1506318137071-a8e063b4bec0?w=800&auto=format' },
    ],
    mindmap: [
      { id: 'root', label: 'Black Holes', parent: null, x: 0, y: 0 },
      { id: 'n1', label: 'Formation', parent: 'root', x: -240, y: -150 },
      { id: 'n1a', label: 'Supernova', parent: 'n1', x: -380, y: -90 },
      { id: 'n1b', label: 'Stellar Collapse', parent: 'n1', x: -380, y: -210 },
      { id: 'n2', label: 'Event Horizon', parent: 'root', x: 240, y: -150 },
      { id: 'n2a', label: 'Point of No Return', parent: 'n2', x: 380, y: -90 },
      { id: 'n2b', label: 'Schwarzschild Radius', parent: 'n2', x: 380, y: -210 },
      { id: 'n3', label: 'Types', parent: 'root', x: -240, y: 150 },
      { id: 'n3a', label: 'Stellar', parent: 'n3', x: -380, y: 90 },
      { id: 'n3b', label: 'Supermassive', parent: 'n3', x: -380, y: 210 },
      { id: 'n4', label: 'Space-Time', parent: 'root', x: 240, y: 150 },
      { id: 'n4a', label: 'Time Dilation', parent: 'n4', x: 380, y: 90 },
      { id: 'n4b', label: 'Singularity', parent: 'n4', x: 380, y: 210 },
    ],
    audio: {
      title: 'Black Holes Audio Lesson',
      script: '[CHAPTER: Introduction]\nWelcome to this audio lesson on Black Holes — the most extreme objects in the universe.\n\n[CHAPTER: What is a Black Hole?]\nA black hole is a region of space where gravity is so extreme that nothing, not even light, can escape once it crosses the event horizon. At the centre lies the singularity, where our physics breaks down.\n\n[CHAPTER: How Black Holes Form]\nMost black holes form when a massive star, at least 20 times the mass of our Sun, runs out of nuclear fuel and collapses in a supernova explosion. The remaining core becomes so dense it forms a singularity.\n\n[CHAPTER: The Event Horizon]\nThe event horizon is the point of no return. Its radius is called the Schwarzschild radius. For the Sun, that would be just 3 kilometres. For Earth, the size of a marble.\n\n[CHAPTER: Black Holes and Time]\nNear a black hole, time passes slower — this is called gravitational time dilation, predicted by Einstein\'s general relativity. From outside, someone falling in appears to freeze at the horizon. Keep exploring the cosmos!',
      chapters: [
        { title: 'Introduction', timestamp: 0 },
        { title: 'What is a Black Hole?', timestamp: 0 },
        { title: 'How Black Holes Form', timestamp: 0 },
        { title: 'The Event Horizon', timestamp: 0 },
        { title: 'Black Holes and Time', timestamp: 0 },
      ],
    },
  },

  'demo-french-revolution': {
    id: 'demo-french-revolution',
    topic: 'The French Revolution',
    status: 'complete',
    progress: 0,
    fromUpload: false,
    source: {
      topic: 'The French Revolution',
      sourceTitle: 'Encyclopaedia Britannica — French Revolution',
      sourceExcerpt: 'The French Revolution was a period of radical political and societal change in France that began with the Estates General of 1789 and ended with the formation of the French Consulate in November 1799.',
      sourceUrl: null,
    },
    textContent: {
      title: 'The French Revolution: Liberty, Equality, Chaos',
      subtitle: 'How a bankrupt kingdom became the blueprint for modern democracy.',
      toc: [
        { id: 's1', title: 'Causes of the Revolution', done: false, current: true },
        { id: 's2', title: 'The Fall of the Monarchy', done: false, current: false },
        { id: 's3', title: 'The Reign of Terror', done: false, current: false },
        { id: 's4', title: 'Napoleon and the Legacy', done: false, current: false },
      ],
      sections: [
        { id: 'obj', kind: 'objectives', heading: 'What you will learn', items: [
          'Identify the key causes of the French Revolution.',
          'Explain how the monarchy collapsed in 1792–1793.',
          'Describe the Reign of Terror and Robespierre\'s role.',
          'Assess the long-term legacy of the Revolution.',
        ]},
        { id: 'p1', kind: 'prose', heading: 'Causes of the Revolution', body: 'By 1789, France was essentially **bankrupt**. Two decades of wars had emptied the treasury. Meanwhile, the vast majority of French people — the **Third Estate** — paid nearly all the taxes while the nobility and clergy paid almost none.\n\nA series of terrible harvests made bread unaffordable. When King Louis XVI called the Estates-General to solve the financial crisis, the Third Estate seized the moment to demand political reform.' },
        { id: 'q1', kind: 'inline-quiz', question: 'Which group paid the majority of taxes in pre-revolutionary France?', hint: 'Think about who had the least political power.', choices: [
          { id: 'a', text: 'The nobility', correct: false },
          { id: 'b', text: 'The clergy', correct: false },
          { id: 'c', text: 'The Third Estate (commoners)', correct: true },
          { id: 'd', text: 'The royal family', correct: false },
        ]},
        { id: 'p2', kind: 'prose', heading: 'The Fall of the Monarchy', body: 'On 14 July 1789, Parisian crowds stormed the **Bastille** prison — a symbol of royal tyranny — and the Revolution began in earnest. The National Assembly produced the **Declaration of the Rights of Man**.\n\nBy 1792, Louis XVI was found to have been secretly negotiating with France\'s enemies. He was put on trial for treason and **executed by guillotine** on 21 January 1793. The monarchy was over.' },
        { id: 'q2', kind: 'inline-quiz', question: 'What did the storming of the Bastille on 14 July 1789 symbolise?', hint: 'The Bastille was a prison that represented royal power.', choices: [
          { id: 'a', text: 'The end of Napoleon\'s rule', correct: false },
          { id: 'b', text: 'The beginning of the Reign of Terror', correct: false },
          { id: 'c', text: 'The start of the Revolution and rejection of royal tyranny', correct: true },
          { id: 'd', text: 'France declaring war on Britain', correct: false },
        ]},
        { id: 'p3', kind: 'prose', heading: 'The Reign of Terror', body: 'With enemies inside and outside France, the Committee of Public Safety under **Maximilien Robespierre** launched the Reign of Terror (1793–1794). Over 17,000 people were officially executed.\n\nRobespierre justified it as necessary to protect the Revolution. But when the Terror threatened even his own allies, the National Convention turned on him. He was arrested and guillotined in July 1794 — a victim of the very machine he had built.' },
        { id: 'q3', kind: 'inline-quiz', question: 'Who led the Committee of Public Safety during the Reign of Terror?', hint: 'He was later executed by the same methods he used on others.', choices: [
          { id: 'a', text: 'Napoleon Bonaparte', correct: false },
          { id: 'b', text: 'Louis XVI', correct: false },
          { id: 'c', text: 'Maximilien Robespierre', correct: true },
          { id: 'd', text: 'Marie Antoinette', correct: false },
        ]},
        { id: 'p4', kind: 'prose', heading: 'Napoleon and the Legacy', body: 'Out of the chaos rose **Napoleon Bonaparte**, who seized power in 1799 and eventually crowned himself Emperor. He preserved many Revolutionary ideals — the **Napoleonic Code** enshrined legal equality — while dismantling democratic government.\n\nThe Revolution\'s legacy was enormous: it spread the ideas of **liberty, equality, and popular sovereignty** across Europe and inspired revolutions for the next two centuries.' },
        { id: 'q4', kind: 'inline-quiz', question: 'What legal achievement of Napoleon preserved key Revolutionary ideals?', hint: 'It became a model for civil law in dozens of countries.', choices: [
          { id: 'a', text: 'The Magna Carta', correct: false },
          { id: 'b', text: 'The Napoleonic Code', correct: true },
          { id: 'c', text: 'The Declaration of Independence', correct: false },
          { id: 'd', text: 'The Treaty of Versailles', correct: false },
        ]},
      ],
    },
    slides: [
      { id: 'slide_1', kind: 'cover', title: 'The French Revolution', subtitle: 'Liberty, Equality, and the birth of the modern world', narration: 'The French Revolution reshaped politics, society, and ideas across the globe.', imageUrl: null },
      { id: 'slide_2', kind: 'bullet', title: 'Why It Happened', points: ['France was bankrupt from decades of war', 'Third Estate paid all taxes, had no power', 'Bad harvests caused bread shortages', 'Estates-General meeting sparked the explosion'], narration: 'The Revolution was the result of decades of inequality and financial crisis.', imageUrl: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=800&auto=format' },
      { id: 'slide_3', kind: 'split', title: 'Two Turning Points', cards: [{ label: '1789', title: 'Storming the Bastille', body: 'July 14, 1789. The symbolic start. A Parisian crowd seized the royal prison.' }, { label: '1793', title: 'Execution of Louis XVI', body: 'The King was guillotined for treason. The republic had truly begun.' }], narration: 'Two moments defined the Revolution — one tore down the old order, the other made the break permanent.', imageUrl: 'https://images.unsplash.com/photo-1431274172761-fca41d930114?w=800&auto=format' },
      { id: 'slide_4', kind: 'stat', title: 'The Reign of Terror', stat: '17,000', caption: 'People officially executed during the Reign of Terror between 1793 and 1794', narration: 'The Revolution turned on itself — thousands killed in the name of protecting revolutionary ideals.', imageUrl: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=800&auto=format' },
      { id: 'slide_5', kind: 'bullet', title: 'The Legacy', points: ['Spread ideas of liberty and equality worldwide', 'Inspired revolutions across Europe and Latin America', 'Napoleonic Code became foundation of modern civil law', 'Proved popular sovereignty could topple monarchies'], narration: 'The Revolution echoes in every modern democracy.', imageUrl: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&auto=format' },
      { id: 'slide_6', kind: 'stat', title: 'Global Reach', stat: '70+', caption: 'Countries whose legal systems are based on the Napoleonic Code', narration: 'The ideas born in Paris in 1789 now underpin the legal systems of over 70 nations.', imageUrl: 'https://images.unsplash.com/photo-1431274172761-fca41d930114?w=800&auto=format' },
    ],
    mindmap: [
      { id: 'root', label: 'French Revolution', parent: null, x: 0, y: 0 },
      { id: 'n1', label: 'Causes', parent: 'root', x: -240, y: -150 },
      { id: 'n1a', label: 'Bankruptcy', parent: 'n1', x: -380, y: -90 },
      { id: 'n1b', label: 'Tax Inequality', parent: 'n1', x: -380, y: -210 },
      { id: 'n2', label: 'Key Events', parent: 'root', x: 240, y: -150 },
      { id: 'n2a', label: 'Bastille 1789', parent: 'n2', x: 380, y: -90 },
      { id: 'n2b', label: 'Louis XVI Executed', parent: 'n2', x: 380, y: -210 },
      { id: 'n3', label: 'Reign of Terror', parent: 'root', x: -240, y: 150 },
      { id: 'n3a', label: 'Robespierre', parent: 'n3', x: -380, y: 90 },
      { id: 'n3b', label: '17,000 Killed', parent: 'n3', x: -380, y: 210 },
      { id: 'n4', label: 'Legacy', parent: 'root', x: 240, y: 150 },
      { id: 'n4a', label: 'Napoleon', parent: 'n4', x: 380, y: 90 },
      { id: 'n4b', label: 'Napoleonic Code', parent: 'n4', x: 380, y: 210 },
    ],
    audio: {
      title: 'The French Revolution Audio Lesson',
      script: '[CHAPTER: Introduction]\nWelcome to the French Revolution — one of history\'s most dramatic turning points.\n\n[CHAPTER: Causes of the Revolution]\nBy 1789, France was bankrupt and the Third Estate — ordinary people — paid nearly all the taxes while the nobility paid almost none. Bad harvests made bread unaffordable. When the King called a meeting to solve the financial crisis, the people demanded change.\n\n[CHAPTER: The Fall of the Monarchy]\nOn 14 July 1789, crowds stormed the Bastille prison, igniting the Revolution. The National Assembly declared the Rights of Man. By 1793, King Louis XVI was tried for treason and executed by guillotine. The monarchy was finished.\n\n[CHAPTER: The Reign of Terror]\nRobespierre and the Committee of Public Safety launched the Reign of Terror, executing over 17,000 people. Eventually Robespierre himself was arrested and guillotined — a victim of his own revolution.\n\n[CHAPTER: Napoleon and the Legacy]\nNapoleon Bonaparte seized power in 1799, preserving revolutionary ideals in the Napoleonic Code while ending democracy. The Revolution\'s ideas of liberty and equality spread across the world and inspired generations of reformers.',
      chapters: [
        { title: 'Introduction', timestamp: 0 },
        { title: 'Causes of the Revolution', timestamp: 0 },
        { title: 'The Fall of the Monarchy', timestamp: 0 },
        { title: 'The Reign of Terror', timestamp: 0 },
        { title: 'Napoleon and the Legacy', timestamp: 0 },
      ],
    },
  },

  'demo-transformers': {
    id: 'demo-transformers',
    topic: 'How Transformers Work',
    status: 'complete',
    progress: 0,
    fromUpload: false,
    source: {
      topic: 'How Transformers Work',
      sourceTitle: 'Attention Is All You Need — Vaswani et al. (2017)',
      sourceExcerpt: 'We propose a new simple network architecture, the Transformer, based solely on attention mechanisms, dispensing with recurrence and convolutions entirely. The model achieves superior quality while being more parallelizable and requiring significantly less time to train.',
      sourceUrl: 'https://arxiv.org/abs/1706.03762',
    },
    textContent: {
      title: 'How Transformers Work: The Architecture Behind AI',
      subtitle: 'The attention mechanism that changed everything — from BERT to ChatGPT.',
      toc: [
        { id: 's1', title: 'What is a Transformer?', done: false, current: true },
        { id: 's2', title: 'The Attention Mechanism', done: false, current: false },
        { id: 's3', title: 'Encoder and Decoder', done: false, current: false },
        { id: 's4', title: 'Why Transformers Won', done: false, current: false },
      ],
      sections: [
        { id: 'obj', kind: 'objectives', heading: 'What you will learn', items: [
          'Explain what a Transformer model is and why it was revolutionary.',
          'Describe how the self-attention mechanism works.',
          'Distinguish between encoder and decoder architectures.',
          'Understand why Transformers replaced earlier RNN models.',
        ]},
        { id: 'p1', kind: 'prose', heading: 'What is a Transformer?', body: 'A **Transformer** is a type of neural network architecture introduced in the 2017 paper *Attention Is All You Need* by researchers at Google. It was originally designed for language translation but became the foundation for almost every major AI system today — ChatGPT, Gemini, Copilot, and DALL-E.\n\nThe key insight was replacing recurrent processing (reading words one at a time) with **self-attention** — a mechanism that lets the model look at all words simultaneously and figure out which ones are relevant to each other.' },
        { id: 'q1', kind: 'inline-quiz', question: 'What was the original task Transformers were designed to solve?', hint: 'Think about translating between languages.', choices: [
          { id: 'a', text: 'Image recognition', correct: false },
          { id: 'b', text: 'Language translation', correct: true },
          { id: 'c', text: 'Playing chess', correct: false },
          { id: 'd', text: 'Speech recognition', correct: false },
        ]},
        { id: 'p2', kind: 'prose', heading: 'The Attention Mechanism', body: '**Self-attention** allows every word in a sentence to look at every other word and compute a relevance score. For the sentence "The cat sat on the mat because it was tired", the model learns that "it" refers to "cat" — not "mat".\n\nEach word is represented as three vectors: **Query** (what am I looking for?), **Key** (what do I contain?), and **Value** (what should I pass forward?). The dot product of Query and Key determines the attention weight.' },
        { id: 'q2', kind: 'inline-quiz', question: 'In the attention mechanism, what does the Query vector represent?', hint: 'Think of it as a search query in a database.', choices: [
          { id: 'a', text: 'The final output of the model', correct: false },
          { id: 'b', text: 'What the current word is looking for in other words', correct: true },
          { id: 'c', text: 'The memory of previous sentences', correct: false },
          { id: 'd', text: 'The position of the word in the sentence', correct: false },
        ]},
        { id: 'p3', kind: 'prose', heading: 'Encoder and Decoder', body: 'The original Transformer has two halves. The **encoder** reads the input (e.g. a French sentence) and builds a rich contextual representation. The **decoder** generates the output (e.g. the English translation) one token at a time.\n\nModels like **BERT** use only the encoder (great for understanding). Models like **GPT** use only the decoder (great for generating). Models like the original translation Transformer use both.' },
        { id: 'q3', kind: 'inline-quiz', question: 'Which part of the Transformer architecture does GPT primarily use?', hint: 'GPT generates text — it produces output one token at a time.', choices: [
          { id: 'a', text: 'Only the encoder', correct: false },
          { id: 'b', text: 'Both encoder and decoder equally', correct: false },
          { id: 'c', text: 'Only the decoder', correct: true },
          { id: 'd', text: 'Neither — GPT uses a recurrent network', correct: false },
        ]},
        { id: 'p4', kind: 'prose', heading: 'Why Transformers Won', body: 'Before Transformers, the dominant approach was **Recurrent Neural Networks (RNNs)**, which processed text sequentially — word by word. This made them slow to train and bad at capturing long-range dependencies.\n\nTransformers process all words in **parallel**, making them massively faster to train on GPUs. Their ability to scale with more data and compute led directly to the large language model revolution. GPT-4, Gemini, Claude — all are Transformers.' },
        { id: 'q4', kind: 'inline-quiz', question: 'What was the main advantage of Transformers over RNNs?', hint: 'Think about how they process input differently.', choices: [
          { id: 'a', text: 'They use less memory', correct: false },
          { id: 'b', text: 'They process all tokens in parallel instead of sequentially', correct: true },
          { id: 'c', text: 'They require no training data', correct: false },
          { id: 'd', text: 'They only work on short sentences', correct: false },
        ]},
      ],
    },
    slides: [
      { id: 'slide_1', kind: 'cover', title: 'How Transformers Work', subtitle: 'The architecture powering ChatGPT, Gemini, and every modern AI', narration: 'Transformers are the engine behind the AI revolution — let us understand how they actually work.', imageUrl: null },
      { id: 'slide_2', kind: 'bullet', title: 'What Makes Transformers Special?', points: ['Introduced in "Attention Is All You Need" (2017)', 'Process all words simultaneously — not one at a time', 'Self-attention lets words relate to all other words', 'Foundation for GPT, BERT, Gemini, Claude'], narration: 'The 2017 paper that introduced Transformers is one of the most influential in AI history.', imageUrl: 'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=800&auto=format' },
      { id: 'slide_3', kind: 'split', title: 'Query, Key, Value', cards: [{ label: 'Query + Key', title: 'Attention Scores', body: 'Each word asks: how relevant are you to me? The dot product gives an attention score.' }, { label: 'Value', title: 'Output Weighting', body: 'High-scoring words contribute more to the output. The model learns to focus on what matters.' }], narration: 'The QKV mechanism is the mathematical heart of self-attention.', imageUrl: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800&auto=format' },
      { id: 'slide_4', kind: 'split', title: 'Encoder vs Decoder', cards: [{ label: 'Encoder (BERT)', title: 'Understanding Text', body: 'Reads entire input at once. Used for classification, Q&A, and search.' }, { label: 'Decoder (GPT)', title: 'Generating Text', body: 'Generates output one token at a time. Used for chatbots, code, and writing.' }], narration: 'The encoder understands; the decoder creates.', imageUrl: 'https://images.unsplash.com/photo-1655720828018-edd2daec9349?w=800&auto=format' },
      { id: 'slide_5', kind: 'bullet', title: 'Why Transformers Beat RNNs', points: ['RNNs processed words one-by-one: slow', 'Transformers process all words in parallel: fast', 'Better at long-range dependencies', 'Scale with compute — bigger = smarter'], narration: 'Parallelism is the killer feature — it is why Transformers can be trained on billions of documents.', imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format' },
      { id: 'slide_6', kind: 'stat', title: 'The Scaling Law', stat: '1T+', caption: 'Parameters in the largest Transformer models — and performance keeps improving with scale', narration: 'The most remarkable thing: Transformers just keep getting better as you make them bigger.', imageUrl: 'https://images.unsplash.com/photo-1614741118887-7a4ee193a5fa?w=800&auto=format' },
    ],
    mindmap: [
      { id: 'root', label: 'Transformers', parent: null, x: 0, y: 0 },
      { id: 'n1', label: 'Self-Attention', parent: 'root', x: -240, y: -150 },
      { id: 'n1a', label: 'Query / Key / Value', parent: 'n1', x: -380, y: -90 },
      { id: 'n1b', label: 'Attention Scores', parent: 'n1', x: -380, y: -210 },
      { id: 'n2', label: 'Architecture', parent: 'root', x: 240, y: -150 },
      { id: 'n2a', label: 'Encoder (BERT)', parent: 'n2', x: 380, y: -90 },
      { id: 'n2b', label: 'Decoder (GPT)', parent: 'n2', x: 380, y: -210 },
      { id: 'n3', label: 'vs RNNs', parent: 'root', x: -240, y: 150 },
      { id: 'n3a', label: 'Sequential → Parallel', parent: 'n3', x: -380, y: 90 },
      { id: 'n3b', label: 'Long-range context', parent: 'n3', x: -380, y: 210 },
      { id: 'n4', label: 'Applications', parent: 'root', x: 240, y: 150 },
      { id: 'n4a', label: 'ChatGPT / Gemini', parent: 'n4', x: 380, y: 90 },
      { id: 'n4b', label: 'Vision & Code AI', parent: 'n4', x: 380, y: 210 },
    ],
    audio: {
      title: 'How Transformers Work Audio Lesson',
      script: '[CHAPTER: Introduction]\nWelcome to this lesson on Transformers — the architecture powering every major AI system today.\n\n[CHAPTER: What is a Transformer?]\nA Transformer is a neural network introduced in the 2017 paper Attention Is All You Need. Unlike older models that read words one at a time, Transformers look at all words simultaneously using a mechanism called self-attention.\n\n[CHAPTER: The Attention Mechanism]\nSelf-attention lets every word compute a relevance score against every other word. Each word has three vectors: a Query asking what it is looking for, a Key describing what it contains, and a Value for what it passes forward. This is how the model understands context.\n\n[CHAPTER: Encoder and Decoder]\nThe encoder reads and understands input — models like BERT are encoder-only. The decoder generates output one token at a time — GPT is decoder-only. Translation models use both.\n\n[CHAPTER: Why Transformers Won]\nOlder recurrent networks processed text sequentially, making them slow. Transformers process everything in parallel, making them vastly faster to train. This parallelism is why we can train models with trillions of parameters today.',
      chapters: [
        { title: 'Introduction', timestamp: 0 },
        { title: 'What is a Transformer?', timestamp: 0 },
        { title: 'The Attention Mechanism', timestamp: 0 },
        { title: 'Encoder and Decoder', timestamp: 0 },
        { title: 'Why Transformers Won', timestamp: 0 },
      ],
    },
  },

};

// GET /api/demo/:id
demoRouter.get('/:id', (req, res) => {
  const mod = DEMO_MODULES[req.params.id];
  if (!mod) return res.status(404).json({ error: 'Demo module not found' });
  res.json(mod);
});

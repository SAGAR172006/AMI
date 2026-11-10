export const PHOTO_CONTENT = {
  title: 'Photosynthesis & the Carbon Cycle',
  subtitle: 'How plants turn sunlight into life — and feed the planet doing it.',
  source: {
    title: 'OpenStax Biology 2e — Chapter 8',
    excerpt: `Photosynthesis is essential to all life on earth; both plants and animals depend on it. It is the only biological process that captures energy from outer space (sunlight) and converts it into chemical energy in the form of G3P (Glyceraldehyde 3-phosphate) which in turn can be made into sugars and other molecular compounds. Plants use these compounds in all of their metabolic processes; plants do not need to consume other organisms for food because they build all the molecules they need.

The general equation for photosynthesis is:

6 CO₂ + 6 H₂O + (light energy) → C₆H₁₂O₆ + 6 O₂

The process takes place in two stages. The light-dependent reactions, which capture light energy, occur in the thylakoid membranes of the chloroplasts. The light-independent reactions, also called the Calvin cycle, occur in the stroma of the chloroplast, and use the energy carriers from the first stage to assemble carbohydrate molecules from carbon dioxide.`,
  },
  toc: [
    { id: 's1', title: 'What is Photosynthesis?', done: true },
    { id: 's2', title: 'The Two Stages: Light & Dark', done: true },
    { id: 's3', title: 'The Calvin Cycle', done: false, current: true },
    { id: 's4', title: 'Why It Matters: The Carbon Cycle', done: false },
  ],
  sections: [
    {
      id: 's1-obj', heading: 'What you will learn', kind: 'objectives',
      items: [
        'Explain the fundamental biological purpose of photosynthesis and its overall chemical equation.',
        'Identify chloroplasts, thylakoids, and chlorophyll as the structural centers of light absorption.',
        'Understand the two interdependent stages: light-dependent reactions and the Calvin cycle.',
      ],
    },
    {
      id: 's1-p1', heading: 'How Plants Convert Sunlight into Chemical Energy', kind: 'prose',
      body: `Inside every green leaf, billions of microscopic cellular engines called **chloroplasts** perform one of the most vital chemical reactions on Earth: capturing solar photons and converting carbon dioxide and water into energy-rich sugars.\n\nThe overall balanced chemical equation summarizes this extraordinary process:\n**6 CO₂ + 6 H₂O + light energy → C₆H₁₂O₆ + 6 O₂**\n\nPlants do not consume other organisms for food because they are autotrophs — they assemble all their metabolic building blocks from scratch using the sun's electromagnetic energy. The oxygen gas released in this process is simply a byproduct of splitting water molecules, yet it sustains almost all aerobic life across our planet.`,
      figure: 'leaf-cell',
    },
    {
      id: 's1-quiz1', kind: 'inline-quiz',
      question: 'Where does photosynthesis primarily take place inside a green plant cell?',
      choices: [
        { id: 'a', text: 'Mitochondria' },
        { id: 'b', text: 'Chloroplasts', correct: true },
        { id: 'c', text: 'Nucleus' },
        { id: 'd', text: 'Endoplasmic Reticulum' },
      ],
      hint: 'Look for the organelle containing the green pigment chlorophyll that captures light photons.',
    },
    {
      id: 's2-p1', heading: 'The Light Reactions vs. The Calvin Cycle', kind: 'prose',
      body: `Photosynthesis does not happen all in one single continuous reaction. Instead, it operates in two coordinated stages:\n\n1. **Light-Dependent Reactions (in Thylakoid Membranes):** Chlorophyll pigments absorb sunlight, exciting high-energy electrons. Water (H₂O) is split in photolysis, releasing **O₂** gas into the atmosphere. The energy from electron transport is harnessed to produce chemical batteries: **ATP** and **NADPH**.\n\n2. **Light-Independent Reactions / Calvin Cycle (in the Stroma):** These reactions do not require direct photons. Instead, they use the chemical energy stored in ATP and NADPH to capture atmospheric CO₂ and fix it into stable carbohydrate molecules.`,
    },
    {
      id: 's2-quiz1', kind: 'inline-quiz',
      question: 'Which stage of photosynthesis is responsible for releasing **oxygen (O₂)** gas into the air?',
      choices: [
        { id: 'a', text: 'The Calvin Cycle' },
        { id: 'b', text: 'Light-Dependent Reactions', correct: true },
        { id: 'c', text: 'Cellular Respiration' },
        { id: 'd', text: 'Glycolysis' },
      ],
      hint: 'Oxygen comes from photolysis — the splitting of water molecules driven directly by absorbed sunlight.',
    },
    {
      id: 's2-quiz2', kind: 'inline-quiz',
      question: 'Where specifically inside the chloroplast do the **light-dependent reactions** occur?',
      choices: [
        { id: 'a', text: 'In the thylakoid membranes', correct: true },
        { id: 'b', text: 'In the stroma fluid' },
        { id: 'c', text: 'In the outer membrane pores' },
        { id: 'd', text: 'In the central vacuole' },
      ],
      hint: 'They occur on the disc-shaped membrane stacks (grana) where chlorophyll proteins are embedded.',
    },
    {
      id: 's3-h1', heading: 'How does a leaf turn sunlight into sugar?', kind: 'prose',
      body: `Inside every green leaf, billions of tiny factories called **chloroplasts** are running the same chemistry that powers your favorite song's recording studio — just with photons instead of microphones. Light hits a stack of disc-shaped membranes called **thylakoids**, and an electron gets knocked loose. That single electron, dancing through a chain of proteins, ends up storing the sun's energy as two chemical batteries: **ATP** and **NADPH**.

Think of it like a band's setlist. The light reactions are the loud opening number — fast, dramatic, depending entirely on the spotlight. The Calvin cycle is the long, intricate jam session that follows: it doesn't need light directly, but it absolutely needs the energy the opener generated.`,
      figure: 'leaf-cell',
    },
    {
      id: 's3-quiz1', kind: 'inline-quiz',
      question: 'Where do the **light-dependent reactions** of photosynthesis occur?',
      choices: [
        { id: 'a', text: 'In the stroma of the chloroplast' },
        { id: 'b', text: 'In the thylakoid membranes', correct: true },
        { id: 'c', text: "In the cell's mitochondria" },
        { id: 'd', text: 'In the cytoplasm of the leaf cell' },
      ],
      hint: 'Think about where the chlorophyll pigment lives — it has to be where the light hits.',
    },
    {
      id: 's3-h2', heading: 'The Calvin Cycle: Building Sugar from Air', kind: 'prose',
      body: `The Calvin cycle takes carbon dioxide — yes, the same gas you exhale and the same gas warming the planet — and stitches it into a sugar called **G3P**. From G3P, the plant builds glucose, starches, cellulose, and eventually you (if you ate a salad recently).

The cycle has three phases: **fixation** (CO₂ joins an existing 5-carbon molecule), **reduction** (ATP and NADPH from the light reactions power the chemistry), and **regeneration** (the starting molecule is rebuilt so the cycle can run again). It takes 6 turns of the cycle to make one glucose.`,
      figure: 'calvin-cycle',
    },
    {
      id: 's3-quiz2', kind: 'inline-quiz',
      question: 'How many turns of the Calvin cycle are needed to produce **one molecule of glucose**?',
      choices: [
        { id: 'a', text: '1' },
        { id: 'b', text: '3' },
        { id: 'c', text: '6', correct: true },
        { id: 'd', text: '12' },
      ],
      hint: 'Glucose has 6 carbons — and each turn of the cycle fixes one carbon atom from CO₂.',
    },
    // ── SECTION 4: Why It Matters: The Carbon Cycle (s4) ────────────────────
    {
      id: 's4-p1', heading: 'Photosynthesis & the Earth\'s Climate System', kind: 'prose',
      body: `Photosynthetic autotrophs are the energetic cornerstone of virtually all life on Earth. Every piece of fruit, grain, and carbohydrate consumed by animals originates in photosynthetic sugar production.\n\nOn a planetary scale, photosynthesis acts as the largest natural carbon sequestration mechanism. Terrestrial forests and marine phytoplankton remove approximately **120 gigatons (Gt)** of elemental carbon from the atmosphere every year. Without this massive biological flux, greenhouse gases would rapidly build up, drastically altering global climatic stability.`,
    },
    {
      id: 's4-quiz1', kind: 'inline-quiz',
      question: 'Roughly how many **gigatons (Gt)** of carbon do photosynthetic organisms remove from the atmosphere each year?',
      choices: [
        { id: 'a', text: '~1.2 Gt' },
        { id: 'b', text: '~12 Gt' },
        { id: 'c', text: '~120 Gt', correct: true },
        { id: 'd', text: '~1,200 Gt' },
      ],
      hint: 'Think of the large planetary statistic highlighting the scale of forests and marine phytoplankton.',
    },
    {
      id: 's4-quiz2', kind: 'inline-quiz',
      question: 'What happens to CO₂ during the **carbon fixation** stage of photosynthesis?',
      choices: [
        { id: 'a', text: 'It is released as a waste gas' },
        { id: 'b', text: 'It is covalently attached to RuBP to form 3-PGA', correct: true },
        { id: 'c', text: 'It is converted directly into oxygen' },
        { id: 'd', text: 'It is stored in vacuoles' },
      ],
      hint: 'Remember: fixation means locking gaseous inorganic carbon into an organic molecule.',
    },
  ],
  slides: [
    { title: 'Photosynthesis', subtitle: 'Sunlight → Sugar', kind: 'cover' },
    { title: 'The Equation', body: '6 CO₂ + 6 H₂O + light → C₆H₁₂O₆ + 6 O₂', kind: 'equation' },
    { title: 'Two Stages', body: 'Light-dependent + Light-independent (Calvin cycle)', kind: 'split' },
    { title: 'Inside the Chloroplast', body: 'Thylakoids capture light; the stroma builds sugar.', kind: 'diagram' },
    { title: 'Why It Matters', body: 'Plants remove ~120 Gt of carbon from the atmosphere every year.', kind: 'stat' },
  ],
  audio: {
    title: 'Photosynthesis, in 14 minutes',
    host: 'Hosted by AMI',
    duration: 14 * 60 + 32,
    chapters: [
      { t: 0, label: 'Opening: a leaf is a factory' },
      { t: 95, label: 'The light reactions' },
      { t: 312, label: 'The Calvin cycle' },
      { t: 540, label: 'RuBisCO: the most abundant protein on earth' },
      { t: 720, label: 'Photosynthesis & climate' },
    ],
  },
  mindmap: {
    root: { id: 'root', label: 'Photosynthesis', x: 0, y: 0 },
    nodes: [
      { id: 'n1', parent: 'root', label: 'Light Reactions', x: -260, y: -180 },
      { id: 'n11', parent: 'n1', label: 'Thylakoid', x: -460, y: -240 },
      { id: 'n12', parent: 'n1', label: 'Photosystem II', x: -460, y: -160 },
      { id: 'n13', parent: 'n1', label: 'ATP + NADPH', x: -460, y: -80 },
      { id: 'n2', parent: 'root', label: 'Calvin Cycle', x: 260, y: -180 },
      { id: 'n21', parent: 'n2', label: 'Fixation', x: 460, y: -240 },
      { id: 'n22', parent: 'n2', label: 'Reduction', x: 460, y: -160 },
      { id: 'n23', parent: 'n2', label: 'Regeneration', x: 460, y: -80 },
      { id: 'n3', parent: 'root', label: 'Pigments', x: -260, y: 70 },
      { id: 'n31', parent: 'n3', label: 'Chlorophyll a', x: -460, y: 30 },
      { id: 'n32', parent: 'n3', label: 'Chlorophyll b', x: -460, y: 110 },
      { id: 'n4', parent: 'root', label: 'Carbon Cycle', x: 260, y: 70 },
      { id: 'n41', parent: 'n4', label: '~120 Gt C / yr', x: 460, y: 30 },
      { id: 'n42', parent: 'n4', label: 'Climate impact', x: 460, y: 110 },
      { id: 'n5', parent: 'root', label: 'Inputs / Outputs', x: 0, y: 220 },
      { id: 'n51', parent: 'n5', label: 'CO₂ + H₂O + light', x: -180, y: 290 },
      { id: 'n52', parent: 'n5', label: 'C₆H₁₂O₆ + O₂', x: 180, y: 290 },
    ],
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
}

export const HISTORY_ITEMS = [
  { id: 'h1', subject: 'Biology', title: 'Photosynthesis & the Carbon Cycle', progress: 0.65, scene: 'leaf' },
  { id: 'h2', subject: 'Economics', title: 'An Overview of Economic Systems', progress: 0.42, scene: 'globe' },
  { id: 'h3', subject: 'History', title: 'Early Human Evolution and Migration', progress: 1.0, scene: 'fire' },
  { id: 'h4', subject: 'Sociology', title: 'What is Sociology?', progress: 0.18, scene: 'city' },
  { id: 'h5', subject: 'Astronomy', title: 'Earth, Sky and the Cosmos', progress: 0.08, scene: 'space' },
  { id: 'h6', subject: 'Chemistry', title: 'Atoms and Molecules', progress: 0.52, scene: 'molecule' },
  { id: 'h7', subject: 'Philosophy', title: 'What is Knowledge? Epistemology 101', progress: 0.0, scene: 'mind' },
  { id: 'h8', subject: 'Physics', title: "Newton's Laws of Motion", progress: 0.74, scene: 'orbit' },
]

export const SUBJECTS = {
  Economics: { color: '#5B8FB9', icon: 'Globe' },
  History: { color: '#C97064', icon: 'Book' },
  Sociology: { color: '#9B7CB6', icon: 'Users' },
  Biology: { color: '#7AAB7E', icon: 'Leaf' },
  Chemistry: { color: '#A45A52', icon: 'Beaker' },
  Astronomy: { color: '#4A6A9C', icon: 'Telescope' },
  Health: { color: '#D17B7B', icon: 'Heart' },
  Philosophy: { color: '#7A6BA8', icon: 'Brain' },
  Physics: { color: '#D88A57', icon: 'Atom' },
  'Computer Science': { color: '#6B7B95', icon: 'Atom' },
}

export interface LearnTopic {
  slug: string;
  title: string;
  description: string;
  type: 'article' | 'chart' | 'guide';
}

export const LEARN_TIPS = [
  'Why fabric content matters more than the brand',
  'The difference between 100% cotton and a cotton blend',
  'How to spot greenwashing on a clothing label',
  'GSM explained: what fabric weight tells you about quality',
];

export const LEARN_TOPICS: LearnTopic[] = [
  {
    slug: 'fabric-comparison',
    title: 'Fabric Comparison',
    description: 'See how common fabrics stack up on durability, sustainability, breathability, and cost.',
    type: 'chart',
  },
  {
    slug: 'what-is-gsm',
    title: 'What is GSM?',
    description: 'Fabric weight, explained — and why it matters when you\'re buying basics.',
    type: 'article',
  },
  {
    slug: 'care-label-guide',
    title: 'Read a Care Label',
    description: 'Decode every symbol on a clothing care label so you never ruin a garment again.',
    type: 'guide',
  },
  {
    slug: 'greenwashing',
    title: 'Greenwashing in Fashion',
    description: 'How brands mislead you — and how to see through the noise.',
    type: 'article',
  },
  {
    slug: 'natural-vs-synthetic',
    title: 'Natural vs Synthetic',
    description: 'The real tradeoffs between natural and synthetic fibers in your wardrobe.',
    type: 'article',
  },
];

export interface FabricData {
  name: string;
  durability: number;
  sustainability: number;
  breathability: number;
  cost: number;
}

export const FABRIC_CHART_DATA: FabricData[] = [
  { name: 'Cotton', durability: 72, sustainability: 60, breathability: 90, cost: 75 },
  { name: 'Linen', durability: 78, sustainability: 82, breathability: 95, cost: 55 },
  { name: 'Polyester', durability: 88, sustainability: 20, breathability: 30, cost: 90 },
  { name: 'Nylon', durability: 92, sustainability: 18, breathability: 25, cost: 70 },
  { name: 'Wool', durability: 85, sustainability: 70, breathability: 80, cost: 40 },
  { name: 'Silk', durability: 55, sustainability: 65, breathability: 85, cost: 20 },
  { name: 'Tencel', durability: 68, sustainability: 88, breathability: 82, cost: 45 },
  { name: 'Viscose', durability: 50, sustainability: 35, breathability: 75, cost: 60 },
];

export const ARTICLE_CONTENT: Record<string, string[]> = {
  'what-is-gsm': [
    'GSM stands for grams per square metre — it\'s the standard measure of fabric weight, and one of the most reliable indicators of quality.',
    'A basic t-shirt might use 140–160gsm cotton. A premium one runs at 180–200gsm. The difference in hand-feel is immediate: heavier fabric drapes better, pills less, and holds its shape through more washes.',
    'For casual wear, 150–180gsm is a good starting point. For tailoring, look for structured fabrics at 250–350gsm. Anything below 120gsm in a top is likely to pill within months.',
    'GSM isn\'t the only factor — fibre quality, weave tightness, and finishing all matter — but it\'s a quick proxy for anyone without access to a scale.',
    'As a rule: the heavier the fabric relative to its category, the longer it will last. When in doubt, feel the weight in your hand.',
  ],
  'greenwashing': [
    '"Sustainable." "Eco-friendly." "Conscious collection." These words are almost meaningless in fashion — legally undefined and unregulated.',
    'Greenwashing is the practice of making a product appear more environmentally friendly than it actually is. In fashion, it takes several forms.',
    'Vague claims: "made with sustainable materials" tells you nothing. 10% recycled polyester still means 90% virgin plastic.',
    'Distraction: a brand may launch a capsule recycled collection while 95% of their volume remains conventional fast fashion.',
    'Certifications can be gamed. GOTS (Global Organic Textile Standard) and bluesign are genuinely rigorous. Most others are not.',
    'The most reliable signal is fibre content. Read the label. If it says 100% conventional polyester or viscose with no certification, no amount of green marketing changes that.',
    'The most sustainable garment is always the one you already own.',
  ],
  'natural-vs-synthetic': [
    'The natural vs synthetic debate is more nuanced than most people assume. Neither category is categorically better — it depends entirely on what you\'re optimising for.',
    'Natural fibres (cotton, linen, wool, silk) are derived from plants or animals. They\'re generally more breathable, biodegradable, and feel better against skin. Their production, however, is land and water intensive — conventional cotton is one of the most water-heavy crops on earth.',
    'Synthetic fibres (polyester, nylon, acrylic) are petroleum-derived. They\'re durable, inexpensive, and moisture-wicking. The cost: they shed microplastics with every wash, they\'re not biodegradable, and production relies on fossil fuels.',
    'Blended fabrics sit in the middle. A 60/40 cotton-polyester blend is more wrinkle-resistant and longer-lasting than pure cotton — but also harder to recycle and slower to biodegrade.',
    'Semi-synthetic fibres like Tencel (lyocell) and Modal are made from wood pulp in a closed-loop process — more sustainable than viscose, and often softer than cotton.',
    'The honest answer: buy natural fibres when comfort and longevity matter, buy technical synthetics when performance is the priority, and avoid blends unless there\'s a specific reason for them.',
  ],
};

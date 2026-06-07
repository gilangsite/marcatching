export type CategoryAccent =
  | 'teal'
  | 'gold'
  | 'silver'
  | 'violet'
  | 'red'
  | 'blue'
  | 'green'
  | 'cyan';

export type PromptCategory =
  | 'trust'
  | 'urgency'
  | 'premium-perception'
  | 'identity-signaling'
  | 'loss-aversion'
  | 'cognitive-ease'
  | 'belonging'
  | 'relief';

export type CategoryMeta = {
  id: PromptCategory;
  name: string;
  description: string;
  count: number;
  accent: CategoryAccent;
  recommendedOrder: number;
  accentColor: string;
  accentSoft: string;
};

export const promptCategories: CategoryMeta[] = [
  {
    id: 'trust',
    name: 'Trust',
    description: 'Reduce perceived risk and make the next step feel safe.',
    count: 10,
    accent: 'teal',
    recommendedOrder: 1,
    accentColor: '#5FB7B0',
    accentSoft: 'rgba(95, 183, 176, 0.16)',
  },
  {
    id: 'relief',
    name: 'Relief',
    description: 'Reduce overwhelm and make the next step feel clear.',
    count: 10,
    accent: 'cyan',
    recommendedOrder: 2,
    accentColor: '#67C5D4',
    accentSoft: 'rgba(103, 197, 212, 0.16)',
  },
  {
    id: 'cognitive-ease',
    name: 'Cognitive Ease',
    description: 'Make messages easier to understand, remember, and trust.',
    count: 10,
    accent: 'blue',
    recommendedOrder: 3,
    accentColor: '#6B9FE4',
    accentSoft: 'rgba(107, 159, 228, 0.16)',
  },
  {
    id: 'premium-perception',
    name: 'Premium Perception',
    description: 'Increase perceived value without sounding loud or cheap.',
    count: 10,
    accent: 'silver',
    recommendedOrder: 4,
    accentColor: '#C8D2DD',
    accentSoft: 'rgba(200, 210, 221, 0.16)',
  },
  {
    id: 'identity-signaling',
    name: 'Identity Signaling',
    description: 'Turn products and content into signals of self-image.',
    count: 10,
    accent: 'violet',
    recommendedOrder: 5,
    accentColor: '#A78BFA',
    accentSoft: 'rgba(167, 139, 250, 0.16)',
  },
  {
    id: 'urgency',
    name: 'Urgency',
    description: 'Create action through timing, relevance, and opportunity cost.',
    count: 10,
    accent: 'gold',
    recommendedOrder: 6,
    accentColor: '#B9A57A',
    accentSoft: 'rgba(185, 165, 122, 0.16)',
  },
  {
    id: 'loss-aversion',
    name: 'Loss Aversion',
    description: 'Reveal the hidden cost of staying the same.',
    count: 10,
    accent: 'red',
    recommendedOrder: 7,
    accentColor: '#F87171',
    accentSoft: 'rgba(248, 113, 113, 0.16)',
  },
  {
    id: 'belonging',
    name: 'Belonging',
    description: 'Make audiences feel seen, represented, and part of a shared standard.',
    count: 10,
    accent: 'green',
    recommendedOrder: 8,
    accentColor: '#6EE7B7',
    accentSoft: 'rgba(110, 231, 183, 0.16)',
  },
];

export const getCategoryMeta = (id: PromptCategory): CategoryMeta => {
  return promptCategories.find((c) => c.id === id)!;
};

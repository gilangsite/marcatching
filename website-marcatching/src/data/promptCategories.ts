export type PromptCategory = {
  id: string;
  name: string;
  description: string;
  count: number;
  accent: string;
};

export const promptCategories: PromptCategory[] = [
  {
    id: "trust",
    name: "Trust",
    description: "Reduce perceived risk and make the next step feel safe.",
    count: 10,
    accent: "teal",
  },
  {
    id: "urgency",
    name: "Urgency",
    description: "Create action through timing, relevance, and opportunity cost.",
    count: 10,
    accent: "gold",
  },
  {
    id: "premium-perception",
    name: "Premium Perception",
    description: "Increase perceived value without sounding loud or cheap.",
    count: 10,
    accent: "silver",
  },
  {
    id: "identity-signaling",
    name: "Identity Signaling",
    description: "Turn products and content into signals of self-image.",
    count: 10,
    accent: "violet",
  },
  {
    id: "loss-aversion",
    name: "Loss Aversion",
    description: "Reveal the hidden cost of staying the same.",
    count: 10,
    accent: "red",
  },
  {
    id: "cognitive-ease",
    name: "Cognitive Ease",
    description: "Make messages easier to understand, remember, and trust.",
    count: 10,
    accent: "blue",
  },
  {
    id: "belonging",
    name: "Belonging",
    description: "Make audiences feel seen, represented, and part of a shared standard.",
    count: 10,
    accent: "green",
  },
  {
    id: "relief",
    name: "Relief",
    description: "Reduce overwhelm and make the next step feel clear.",
    count: 10,
    accent: "cyan",
  },
];

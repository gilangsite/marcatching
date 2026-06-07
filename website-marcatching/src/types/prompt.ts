export interface Prompt {
  id: string; // unique identifier, e.g., "trust-01"
  title: string; // Prompt name
  category: PromptCategory; // one of the 8 categories
  bestUsedFor: string; // short description of use case
  psychologicalJob: string; // e.g., "Trust"
  fullPrompt: string; // full markdown text of the prompt
  tags?: string[]; // optional tags for search
}

export type PromptCategory =
  | "trust"
  | "urgency"
  | "premium-perception"
  | "identity-signaling"
  | "loss-aversion"
  | "cognitive-ease"
  | "belonging"
  | "relief";

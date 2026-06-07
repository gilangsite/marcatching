const fs = require('fs');

const markdown = fs.readFileSync('prompt-library/marcatching_emotional_prompt_library_bank_v1_2_modular_updated.md', 'utf8');

const categoryMap = {
  'trust': { id: 'trust', label: 'Trust' },
  'urgency': { id: 'urgency', label: 'Urgency' },
  'premium perception': { id: 'premium-perception', label: 'Premium Perception' },
  'identity signaling': { id: 'identity-signaling', label: 'Identity Signaling' },
  'loss aversion': { id: 'loss-aversion', label: 'Loss Aversion' },
  'cognitive ease': { id: 'cognitive-ease', label: 'Cognitive Ease' },
  'belonging': { id: 'belonging', label: 'Belonging' },
  'relief': { id: 'relief', label: 'Relief' },
  'curiosity': { id: 'curiosity', label: 'Curiosity' }
};

const prompts = [];
let currentCategory = null;
let currentCatLabel = null;
let currentPsychJob = '';
let promptCounter = 0;

const lines = markdown.split('\n');
let i = 0;

while (i < lines.length) {
  const line = lines[i];

  if (line.startsWith('# Category ')) {
    const catNameMatch = line.match(/Category \d+: (.*)/i);
    if (catNameMatch) {
      let rawCat = catNameMatch[1].trim().toLowerCase();
      const matchedCat = Object.keys(categoryMap).find(k => rawCat.includes(k));
      if (matchedCat) {
        currentCategory = categoryMap[matchedCat].id;
        currentCatLabel = categoryMap[matchedCat].label;
      } else {
        currentCategory = rawCat.replace(/\s+/g, '-');
        currentCatLabel = catNameMatch[1].trim();
      }
    }
  }

  if (line.startsWith('## Psychological Job')) {
    let job = '';
    i++;
    while (i < lines.length && !lines[i].startsWith('#') && !lines[i].startsWith('---')) {
      if (lines[i].trim()) job += lines[i].trim() + ' ';
      i++;
    }
    currentPsychJob = job.trim();
    continue;
  }

  if (line.startsWith('## ') && !line.startsWith('## Category') && !line.startsWith('## Psychological') && !line.startsWith('## Version') && !line.startsWith('## Built For') && !line.startsWith('## Purpose') && !line.startsWith('## How To Use') && !line.startsWith('## Marcatching Skill') && !line.startsWith('## Standard Context') && !line.startsWith('## Changelog')) {
    const titleMatch = line.match(/## (?:.*?Prompt \d+: )?(.*)/i);
    const title = titleMatch ? titleMatch[1].trim() : line.replace('##', '').trim();
    promptCounter++;

    let bestUsedForStr = '';
    let fullPrompt = '';

    while (i < lines.length && !lines[i].startsWith('### Best Used For')) {
      i++;
      if (lines[i] && lines[i].startsWith('## ')) break;
    }
    
    if (lines[i] && lines[i].startsWith('### Best Used For')) {
      i++;
      while (i < lines.length && !lines[i].startsWith('### Full Prompt')) {
        if (lines[i].trim()) bestUsedForStr += lines[i].trim() + ' ';
        i++;
      }
    }

    if (lines[i] && lines[i].startsWith('### Full Prompt')) {
      i++;
      let inCodeBlock = false;
      while (i < lines.length) {
        if (lines[i].startsWith('```')) {
          inCodeBlock = !inCodeBlock;
          fullPrompt += lines[i] + '\n';
          if (!inCodeBlock) break; 
        } else if (inCodeBlock || lines[i].trim()) {
          fullPrompt += lines[i] + '\n';
        }
        i++;
      }
    }

    if (title && fullPrompt) {
      prompts.push({
        id: `${currentCategory}-${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
        title,
        category: currentCategory || 'other',
        categoryLabel: currentCatLabel || 'Other',
        promptNumber: promptCounter,
        psychologicalJob: currentPsychJob,
        bestUsedFor: bestUsedForStr.split(/, | dan /).map(s => s.trim()).filter(Boolean),
        shortDescription: title,
        fullPrompt: fullPrompt.trim(),
        tags: [currentCategory || 'other', ...title.toLowerCase().split(' ').filter(w => w.length > 3)],
        recommendedOrder: promptCounter
      });
    }
  }
  i++;
}

let typeDef = `export type PromptCategory =
  | "trust"
  | "urgency"
  | "premium-perception"
  | "identity-signaling"
  | "loss-aversion"
  | "cognitive-ease"
  | "belonging"
  | "relief"
  | "curiosity"
  | string;

export type PromptItem = {
  id: string;
  title: string;
  category: PromptCategory;
  categoryLabel: string;
  promptNumber: number;
  psychologicalJob: string;
  bestUsedFor: string[];
  shortDescription: string;
  fullPrompt: string;
  tags: string[];
  recommendedOrder: number;
};

export const promptLibrary: PromptItem[] = ${JSON.stringify(prompts, null, 2)};
`;

fs.writeFileSync('src/data/promptLibrary.ts', typeDef);
console.log(`Parsed ${prompts.length} prompts.`);

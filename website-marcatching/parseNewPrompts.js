/**
 * parseNewPrompts.js
 * 
 * Parses the two new setup-aligned prompt library .md files and generates
 * a new src/data/promptLibrary.ts file.
 * 
 * Emotional prompt library -> role: 'digital-marketer'
 * Content creation prompt library -> role: 'content-creator'
 */

const fs = require('fs');
const path = require('path');

// ─────────────────────────────────────────────────────
// DIGITAL MARKETER: Emotional Prompt Library
// ─────────────────────────────────────────────────────

function parseEmotionalLibrary(content) {
  const items = [];

  // Find all category sections (## Category N: ...)
  // Each category contains multiple prompts starting with ## Trust Prompt NN: ...
  // We'll split by category blocks

  // Split into category sections
  const categorySections = content.split(/\n# Category \d+:/);
  // remove the header part (index 0)
  categorySections.shift();

  for (const catSection of categorySections) {
    // First line has category name
    const catNameMatch = catSection.match(/^(.+)\n/);
    if (!catNameMatch) continue;
    const rawLabel = catNameMatch[1].trim();
    // Strip "Prompt for " prefix for cleaner UI labels
    const categoryLabel = rawLabel.replace(/^Prompt for /i, '');
    // Slugify from raw label to keep IDs stable
    const category = rawLabel.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    // Get the psychological job description
    const psychJobMatch = catSection.match(/## Psychological Job\s+([\s\S]*?)(?=\n---|\n## )/);
    const psychologicalJob = psychJobMatch ? psychJobMatch[1].trim() : categoryLabel;

    // Split into individual prompt sections
    // Format: ## CategoryName Prompt NN: Title
    const promptSections = catSection.split(/\n## [\w\s]+ Prompt \d+: /);
    promptSections.shift(); // remove category intro

    let promptCounter = 1;
    for (const promptSection of promptSections) {
      const lines = promptSection.split('\n');
      const promptTitle = lines[0].trim();

      // Best Used For
      const bestUsedMatch = promptSection.match(/### Best Used For\s+([\s\S]*?)(?=\n### |\n```)/);
      const bestUsedFor = bestUsedMatch
        ? bestUsedMatch[1].trim().split(/,\s*|\n+/).filter(s => s.trim()).map(s => s.trim())
        : [];

      // Full Prompt - extract content between ```text and ```
      const fullPromptMatch = promptSection.match(/```text\n([\s\S]*?)```/);
      const fullPrompt = fullPromptMatch ? '```text\n' + fullPromptMatch[1] + '```' : '';

      if (!fullPrompt) continue;

      // Generate ID
      const titleSlug = promptTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const id = `${category}-${titleSlug}`;

      // Generate tags from title words
      const tags = promptTitle.toLowerCase().split(/\s+/).filter(w => w.length > 2).slice(0, 4);

      items.push({
        id,
        title: promptTitle,
        category,
        categoryLabel,
        promptNumber: promptCounter,
        psychologicalJob,
        bestUsedFor,
        shortDescription: promptTitle,
        fullPrompt,
        tags,
        recommendedOrder: items.length + 1,
        role: 'digital-marketer',
      });

      promptCounter++;
    }
  }

  return items;
}

// ─────────────────────────────────────────────────────
// CONTENT CREATOR: Content Creation Prompt Library
// ─────────────────────────────────────────────────────

function parseContentCreationLibrary(content) {
  const items = [];

  // Split by roles: # Role N — Role Name
  const roleSections = content.split(/\n# Role \d+ — /);
  roleSections.shift(); // remove header

  for (const roleSection of roleSections) {
    const roleNameMatch = roleSection.match(/^(.+)\n/);
    if (!roleNameMatch) continue;
    const roleName = roleNameMatch[1].trim();

    const categoryLabel = roleName;
    const category = roleName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    // Get role description (first paragraph after role name)
    const roleDescMatch = roleSection.match(/^[^\n]+\n\s*([^\n#]+)/);
    const psychologicalJob = roleDescMatch ? roleDescMatch[1].trim() : roleName;

    // Split into individual prompt sections
    // Format: ## Role Name Prompt NN: Title
    const promptSections = roleSection.split(/\n## [\w\s,()]+ Prompt \d+: /);
    promptSections.shift(); // remove role intro

    let promptCounter = 1;
    for (const promptSection of promptSections) {
      const lines = promptSection.split('\n');
      const promptTitle = lines[0].trim();

      // Best Used For
      const bestUsedMatch = promptSection.match(/### Best Used For\s+([\s\S]*?)(?=\n### |\n```)/);
      const bestUsedFor = bestUsedMatch
        ? bestUsedMatch[1].trim().split(/,\s*|\n+/).filter(s => s.trim()).map(s => s.trim())
        : [];

      // Full Prompt
      const fullPromptMatch = promptSection.match(/```text\n([\s\S]*?)```/);
      const fullPrompt = fullPromptMatch ? '```text\n' + fullPromptMatch[1] + '```' : '';

      if (!fullPrompt) continue;

      // Generate ID
      const titleSlug = promptTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const id = `${category}-${titleSlug}`;

      const tags = promptTitle.toLowerCase().split(/\s+/).filter(w => w.length > 2).slice(0, 4);

      items.push({
        id,
        title: promptTitle,
        category,
        categoryLabel,
        promptNumber: promptCounter,
        psychologicalJob,
        bestUsedFor,
        shortDescription: promptTitle,
        fullPrompt,
        tags,
        recommendedOrder: items.length + 1,
        role: 'content-creator',
      });

      promptCounter++;
    }
  }

  return items;
}

// ─────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────

const BASE_DIR = path.join(__dirname, 'prompt-library', 'master-prompt');
const OUT_FILE = path.join(__dirname, 'src', 'data', 'promptLibrary.ts');

const emotionalContent = fs.readFileSync(
  path.join(BASE_DIR, 'marcatching-emotional-prompt-library_v1_3_setup-aligned.md'),
  'utf-8'
);
const contentCreationContent = fs.readFileSync(
  path.join(BASE_DIR, 'marcatching-content-creation-prompt-library_v1_2_setup-aligned.md'),
  'utf-8'
);

const digitalMarketerPrompts = parseEmotionalLibrary(emotionalContent);
const contentCreatorPrompts = parseContentCreationLibrary(contentCreationContent);

// Combine
const allPrompts = [...digitalMarketerPrompts, ...contentCreatorPrompts];

console.log(`Parsed ${digitalMarketerPrompts.length} digital marketer prompts`);
console.log(`Parsed ${contentCreatorPrompts.length} content creator prompts`);
console.log(`Total: ${allPrompts.length} prompts`);

// Log categories found
const dmCategories = [...new Set(digitalMarketerPrompts.map(p => p.categoryLabel))];
const ccCategories = [...new Set(contentCreatorPrompts.map(p => p.categoryLabel))];
console.log('\nDigital Marketer categories:', dmCategories);
console.log('\nContent Creator categories:', ccCategories);

// ─────────────────────────────────────────────────────
// Generate TypeScript
// ─────────────────────────────────────────────────────

function escapeTS(str) {
  // Escape backticks and template literal chars only - keep as regular string
  return str
    .replace(/\\/g, '\\\\')
    .replace(/`/g, '\\`')
    .replace(/\${/g, '\\${');
}

const header = `export type PromptCategory = string;
export type PromptRole = 'digital-marketer' | 'content-creator';

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
  role: PromptRole;
};

export const promptLibrary: PromptItem[] = [
`;

let body = '';
for (const item of allPrompts) {
  body += `  {\n`;
  body += `    "id": ${JSON.stringify(item.id)},\n`;
  body += `    "title": ${JSON.stringify(item.title)},\n`;
  body += `    "category": ${JSON.stringify(item.category)},\n`;
  body += `    "categoryLabel": ${JSON.stringify(item.categoryLabel)},\n`;
  body += `    "promptNumber": ${item.promptNumber},\n`;
  body += `    "psychologicalJob": ${JSON.stringify(item.psychologicalJob)},\n`;
  body += `    "bestUsedFor": ${JSON.stringify(item.bestUsedFor)},\n`;
  body += `    "shortDescription": ${JSON.stringify(item.shortDescription)},\n`;
  body += `    "fullPrompt": \`${escapeTS(item.fullPrompt)}\`,\n`;
  body += `    "tags": ${JSON.stringify(item.tags)},\n`;
  body += `    "recommendedOrder": ${item.recommendedOrder},\n`;
  body += `    "role": ${JSON.stringify(item.role)}\n`;
  body += `  },\n`;
}

const footer = `];\n`;

const output = header + body + footer;

fs.writeFileSync(OUT_FILE, output, 'utf-8');
console.log(`\n✅ Written to ${OUT_FILE}`);
console.log(`File size: ${(output.length / 1024).toFixed(1)} KB`);

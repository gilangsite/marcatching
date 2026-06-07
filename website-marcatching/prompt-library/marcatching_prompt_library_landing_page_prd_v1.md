# PRD — Marcatching Prompt Library Landing Page

## Product Name
**Marcatching Prompt Library**

## Route
`marcatching.com/prompt-library`

## Version
1.0.0

## Owner
Marcatching

## Primary Goal
Membangun landing page berbentuk **prompt library** yang berisi 80 AI marketing prompts berbasis consumer psychology. Halaman ini harus memudahkan user untuk mencari prompt, memilih berdasarkan kategori emosi, membaca detail prompt, lalu menyalin prompt dengan tombol **Copy Prompt**.

Prompt yang disalin akan digunakan user di generative AI tools seperti ChatGPT, Claude, Codex, Antigravity, dan AI workspace lain bersama dua file instruksi Marcatching:

1. `skill-marcatching.md`
2. `skill.copywritting-marcatching.md`

Core system flow:

```text
User opens marcatching.com/prompt-library
→ user searches or filters prompt by category
→ user opens prompt detail
→ user clicks Copy Prompt
→ UI shows “Prompt copied”
→ user pastes prompt into AI workspace
→ AI uses skill-marcatching.md as orchestrator
→ AI finalizes output with skill.copywritting-marcatching.md
```

## Strategic Context
Marcatching positioning untuk program ini:

**The first Indonesian marketing intelligence brand that teaches AI through consumer psychology.**

The landing page should not feel like a generic prompt directory.

It should feel like a premium marketing intelligence tool.

The page exists to help users understand that prompt quality comes from audience psychology, not from asking AI to write faster.

Signature line:

**Most prompts ask AI to write. Strategic prompts ask AI to think.**

---

# 1. Background

Marcatching sudah memiliki master skill system yang mengatur alur kerja:

```text
skill-marcatching.md
→ Emotional Prompt Library
→ skill.copywritting-marcatching.md
→ Final Marcatching Output
```

`skill-marcatching.md` berfungsi sebagai orchestrator utama untuk mendeteksi kategori, menjalankan Audience OS, menyesuaikan funnel stage, menerapkan ethical persuasion guardrails, dan melakukan quality gate evaluation sebelum output difinalisasi. `skill.copywritting-marcatching.md` kemudian memoles output agar terasa sharp, calm, premium, psychology-driven, dan sesuai voice Marcatching.

Prompt Library Bank berisi 80 prompt yang terbagi dalam 8 kategori:

1. Trust
2. Urgency
3. Premium Perception
4. Identity Signaling
5. Loss Aversion
6. Cognitive Ease
7. Belonging
8. Relief

Setiap prompt harus ditampilkan sebagai reusable prompt card yang bisa dicari, difilter, dibaca, dan disalin.

---

# 2. Problem Statement

Saat ini prompt library masih berbentuk dokumen markdown. User harus membuka file panjang, mencari kategori manual, copy prompt manual, dan berisiko salah mengambil konteks.

Masalah utama:

1. Prompt sulit dinavigasi jika hanya berupa dokumen panjang.
2. User tidak langsung memahami kategori psikologis yang cocok untuk kebutuhannya.
3. Copy-paste manual dari dokumen membuat pengalaman terasa tidak premium.
4. Tidak ada search, filter, dan quick copy.
5. Tidak ada onboarding singkat tentang cara menggunakan prompt bersama skill Marcatching.
6. Tidak ada visual experience yang menguatkan positioning Marcatching sebagai marketing intelligence brand.

---

# 3. Product Objective

Membuat halaman `/prompt-library` yang:

1. Menampilkan 80 prompts dalam format library yang clean dan premium.
2. Memiliki search bar untuk mencari prompt berdasarkan nama, kategori, use case, psychological job, dan isi prompt.
3. Memiliki filter atau sort by category.
4. Memiliki prompt cards dengan category badge, short description, use case, dan tombol copy.
5. Memiliki detail modal atau drawer untuk membaca prompt lengkap.
6. Memiliki tombol **Copy Prompt** dengan animasi **“Prompt copied”**.
7. Memiliki section “How to Use” yang menjelaskan penggunaan 2 file `.md` dan prompt yang disalin.
8. Mengikuti dark visual style Marcatching.com.
9. Bisa di-scale untuk prompt baru di masa depan.
10. Siap dipakai sebagai lead magnet dan product page untuk Emotional Prompt Library Pro.

---

# 4. Target Users

## Primary Users

### 1. Founder dan Business Owner
Mereka ingin memakai AI untuk membangun marketing system, bukan sekadar membuat caption.

### 2. Marketer dan Social Media Strategist
Mereka butuh prompt yang bisa membantu membuat copy, ads, landing page, email, dan content angle dengan dasar consumer psychology.

### 3. Content Creator dan Personal Brand Builder
Mereka ingin mengubah konten dari sekadar posting menjadi system yang membangun attention, trust, identity, dan conversion.

### 4. AI Power User
Mereka sudah memakai ChatGPT, Claude, Codex, atau Antigravity, tetapi ingin prompt yang lebih strategic dan brand-safe.

---

# 5. User Journey

## Journey 1 — Browse by Category

1. User membuka `/prompt-library`.
2. User melihat hero: “80 AI Marketing Prompts Built on Consumer Psychology.”
3. User melihat category chips.
4. User klik kategori “Trust”.
5. Page menampilkan 10 prompt Trust.
6. User membuka prompt “Trust Barrier Diagnostic”.
7. User membaca detail prompt.
8. User klik “Copy Prompt”.
9. UI menampilkan animated toast “Prompt copied”.
10. User paste ke AI workspace.

## Journey 2 — Search Prompt

1. User mengetik “landing page trust” di search bar.
2. Results menampilkan prompt yang relevan.
3. User melihat card dengan highlighted match.
4. User copy prompt langsung dari card atau buka modal detail.

## Journey 3 — Learn How to Use

1. User scroll ke section “How to Use This Library”.
2. User melihat 3-step guide:
   - Insert `skill-marcatching.md`
   - Insert `skill.copywritting-marcatching.md`
   - Copy any prompt from the library
3. User download atau open skill docs.
4. User kembali ke prompt library dan copy prompt.

---

# 6. Scope

## In Scope

### Core Pages
- `/prompt-library`

### Core Components
- Hero section
- Search bar
- Category filter chips
- Sort dropdown
- Prompt card grid
- Prompt detail modal or drawer
- Copy prompt button
- “Prompt copied” animation/toast
- Empty state
- How to Use section
- Skill docs CTA section
- FAQ section
- Footer CTA

### Core Data
- 80 prompts from `marcatching_emotional_prompt_library_bank_v1.md`
- 8 emotional categories
- Category metadata
- Prompt title
- Best used for
- Psychological job
- Full prompt text
- Optional tags
- Expected output
- Rules or quality check

### Core Interactions
- Search
- Filter by category
- Sort by category, A-Z, recommended
- Copy prompt
- Open detail modal/drawer
- Keyboard support
- Mobile responsive layout

## Out of Scope for V1

- User login
- Favorite prompts
- Saved prompt collections
- Payment
- Prompt customization form
- AI generation inside website
- Backend database
- User analytics dashboard
- Community submissions

These can be added in V2.

---

# 7. Information Architecture

## Page Structure

```text
/prompt-library

1. Navbar
2. Hero Section
3. How It Works Mini Strip
4. Search + Filter Control
5. Category Overview
6. Prompt Card Grid
7. Prompt Detail Modal / Drawer
8. How to Use With AI Workspace
9. Skill Docs CTA
10. FAQ
11. Footer CTA
```

---

# 8. Visual Direction

## Design Standard

The page must feel like the current Marcatching website: dark, premium, strategic, and editorial.

The Marcatching homepage uses language around marketing intelligence, AI-powered marketing workflow, growth and conversion architecture, consumer psychology, and systems thinking. The prompt-library page should continue that same narrative direction.

## Visual Keywords

- Dark
- Premium
- Editorial
- Intelligent
- Minimal
- Systemic
- Subtle glow
- Sharp typography
- High contrast
- Low noise
- AI x psychology atmosphere

## Color Direction

Use current website/global design tokens if available. If not available, use this recommended palette:

```css
--background: #030407;
--surface: #080B10;
--surface-elevated: #0D1118;
--surface-glass: rgba(255, 255, 255, 0.04);
--border: rgba(255, 255, 255, 0.10);
--border-strong: rgba(255, 255, 255, 0.18);
--text-primary: #F4F4F5;
--text-secondary: #A1A1AA;
--text-muted: #71717A;
--accent: #5FB7B0;
--accent-soft: rgba(95, 183, 176, 0.16);
--accent-glow: rgba(95, 183, 176, 0.28);
--warning-accent: #B9A57A;
```

## Typography

Use existing Marcatching fonts from the codebase. If unavailable:

- Heading: premium serif or editorial display font.
- Body: clean sans-serif such as Inter, Manrope, or Plus Jakarta Sans.
- Code/prompt block: mono font such as JetBrains Mono or Geist Mono.

## Layout Feel

- Full dark background.
- Subtle noise texture or radial glow.
- Large hero typography.
- Cards with thin border and glass surface.
- Minimal icons.
- Smooth hover state.
- Prompt details in dark drawer with code block.
- Category chips as pill buttons.
- Copy button with subtle animated feedback.

---

# 9. Hero Section Copy

## Eyebrow
**Prompt Psychology Lab**

## Headline
**80 AI Marketing Prompts Built on Consumer Psychology.**

## Alternative Headline
**Prompts that teach AI to think before it writes.**

## Subheadline
A curated prompt library for marketers, founders, and creators who want sharper copy, stronger funnels, and better audience understanding.

## Supporting Line
Most prompts ask AI to write. Strategic prompts ask AI to think.

## Primary CTA
**Browse Prompts**

## Secondary CTA
**How to Use**

## Hero Stats
- 80 Prompts
- 8 Emotional Categories
- Built for ChatGPT, Claude, Codex & Antigravity

---

# 10. How It Works Copy

```text
1. Insert the Marcatching skill files
Start with skill-marcatching.md, then add skill.copywritting-marcatching.md.

2. Choose your emotional lever
Trust, urgency, premium perception, identity, loss aversion, cognitive ease, belonging, or relief.

3. Copy the prompt
Paste it into your AI workspace with your brand context.

4. Let AI think like a strategist
The prompt will guide AI to analyze audience psychology before writing.
```

---

# 11. Prompt Library Categories

Each category must have a count of 10 prompts.

## Category Metadata

```ts
const categories = [
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
```

---

# 12. Prompt Inventory

The library must include all 80 prompts below.

### 1. Prompt for Trust (10 prompts)
- Trust Prompt 01: Trust Barrier Diagnostic
- Trust Prompt 02: Proof-First Copy Builder
- Trust Prompt 03: Skeptic Audience Reassurance
- Trust Prompt 04: Transparent Process Copy
- Trust Prompt 05: Risk Reversal Copy
- Trust Prompt 06: Founder Trust Story
- Trust Prompt 07: Educational Trust Builder
- Trust Prompt 08: Objection Handling Copy
- Trust Prompt 09: Cold Audience Trust Bridge
- Trust Prompt 10: Trust Audit and Rewrite

### 2. Prompt for Urgency (10 prompts)
- Urgency Prompt 01: Ethical Urgency Builder
- Urgency Prompt 02: Opportunity Cost Copy
- Urgency Prompt 03: Cart Closing Reminder
- Urgency Prompt 04: Market Shift Urgency
- Urgency Prompt 05: Webinar Attendance Urgency
- Urgency Prompt 06: Early Access Copy
- Urgency Prompt 07: Delay Pattern Interrupt
- Urgency Prompt 08: Seasonal Timing Urgency
- Urgency Prompt 09: Retargeting Urgency Copy
- Urgency Prompt 10: Urgency Audit and Rewrite

### 3. Prompt for Premium Perception (10 prompts)
- Premium Prompt 01: Premium Positioning Builder
- Premium Prompt 02: Minimal Luxury Product Description
- Premium Prompt 03: High-Ticket Offer Framing
- Premium Prompt 04: Premium Tone Rewrite
- Premium Prompt 05: Anti-Discount Premium Copy
- Premium Prompt 06: Premium Brand Manifesto
- Premium Prompt 07: Premium Landing Page Hero
- Premium Prompt 08: Premium Social Caption
- Premium Prompt 09: Premium Naming and Labeling
- Premium Prompt 10: Premium Perception Audit

### 4. Prompt for Identity Signaling (10 prompts)
- Identity Prompt 01: Desired Self Mapping
- Identity Prompt 02: Product as Signal
- Identity Prompt 03: Strategic Creator Identity
- Identity Prompt 04: Community Identity Manifesto
- Identity Prompt 05: Identity-Based Hook Generator
- Identity Prompt 06: Founder Identity Positioning
- Identity Prompt 07: Status Upgrade Copy
- Identity Prompt 08: Share-Worthy Identity Statement
- Identity Prompt 09: Identity Objection Reframe
- Identity Prompt 10: Identity Audit and Rewrite

### 5. Prompt for Loss Aversion (10 prompts)
- Loss Aversion Prompt 01: Hidden Cost Diagnostic
- Loss Aversion Prompt 02: Old Way vs Strategic Way
- Loss Aversion Prompt 03: AI Lag Risk Copy
- Loss Aversion Prompt 04: Missed Conversion Copy
- Loss Aversion Prompt 05: Abandoned Cart Loss Reframe
- Loss Aversion Prompt 06: Content Stagnation Loss
- Loss Aversion Prompt 07: Price Delay Loss
- Loss Aversion Prompt 08: Brand Irrelevance Risk
- Loss Aversion Prompt 09: Lost Trust Warning
- Loss Aversion Prompt 10: Loss Aversion Audit and Rewrite

### 6. Prompt for Cognitive Ease (10 prompts)
- Cognitive Ease Prompt 01: Clarity Rewrite
- Cognitive Ease Prompt 02: Complex Concept Simplifier
- Cognitive Ease Prompt 03: Message Hierarchy Builder
- Cognitive Ease Prompt 04: One Idea Per Slide Carousel
- Cognitive Ease Prompt 05: Jargon Detox
- Cognitive Ease Prompt 06: Landing Page Clarity Audit
- Cognitive Ease Prompt 07: TLI5 Marketing Explanation
- Cognitive Ease Prompt 08: CTA Clarity Builder
- Cognitive Ease Prompt 09: Copy Compression
- Cognitive Ease Prompt 10: Cognitive Ease Audit and Rewrite

### 7. Prompt for Belonging (10 prompts)
- Belonging Prompt 01: Shared Belief Builder
- Belonging Prompt 02: People Like Us Framing
- Belonging Prompt 03: Shared Frustration Hook
- Belonging Prompt 04: Movement Manifesto
- Belonging Prompt 05: Community Onboarding Copy
- Belonging Prompt 06: Shareable Tribe Statement
- Belonging Prompt 07: Founder to Audience Bridge
- Belonging Prompt 08: Comment Invitation Copy
- Belonging Prompt 09: Belonging Through Standards
- Belonging Prompt 10: Belonging Audit and Rewrite

### 8. Prompt for Relief (10 prompts)
- Relief Prompt 01: Overwhelm Diagnostic
- Relief Prompt 02: You Don’t Need More Tools Copy
- Relief Prompt 03: Beginner-Friendly Reassurance
- Relief Prompt 04: Chaos to System Copy
- Relief Prompt 05: Mistake Normalizer
- Relief Prompt 06: First Step CTA
- Relief Prompt 07: Email Nurture Relief
- Relief Prompt 08: Relief-Based Lead Magnet Page
- Relief Prompt 09: Relief Script for Short Video
- Relief Prompt 10: Relief Audit and Rewrite


---

# 13. Functional Requirements

## FR-001 — Page Route

The page must exist at:

```text
/prompt-library
```

Production URL:

```text
https://www.marcatching.com/prompt-library
```

## FR-002 — Search Bar

Search must filter prompts by:

- Prompt title
- Category
- Best used for
- Psychological job
- Prompt content
- Tags

Search behavior:

- Instant search as user types.
- Debounced input recommended: 150-300ms.
- Empty search returns all prompts.
- If no result, show an elegant empty state.

Search placeholder:

```text
Search by emotion, use case, funnel stage, or prompt name...
```

## FR-003 — Category Filter

Category filter must show:

- All
- Trust
- Urgency
- Premium Perception
- Identity Signaling
- Loss Aversion
- Cognitive Ease
- Belonging
- Relief

Each filter chip must show count.

Example:

```text
Trust · 10
```

## FR-004 — Sort

Sort options:

1. Recommended
2. Category
3. A-Z
4. Z-A

Default: Recommended.

Recommended order:

1. Trust
2. Relief
3. Cognitive Ease
4. Premium Perception
5. Identity Signaling
6. Urgency
7. Loss Aversion
8. Belonging

Reason: This order feels easier for users who are new to strategic prompting because it starts from safety, clarity, and understanding before moving to conversion pressure.

## FR-005 — Prompt Card

Each prompt card must show:

- Category badge
- Prompt title
- Short description or best used for
- Psychological job
- Tags
- “View Prompt”
- “Copy Prompt”

Card hover:

- Border becomes slightly brighter.
- Background glow appears subtly.
- Copy button becomes more visible.
- Card rises 2-4px with smooth transition.

## FR-006 — Prompt Detail Modal / Drawer

When user clicks “View Prompt”, open modal or right-side drawer.

Prompt detail must show:

- Prompt title
- Category
- Psychological job
- Best used for
- Full prompt
- Copy Prompt button
- Copy Prompt + Input Fields button, optional
- Close button
- Keyboard ESC close
- Mobile full-screen drawer

## FR-007 — Copy Prompt Button

When clicked:

1. Copy full prompt text to clipboard.
2. Show animated toast.
3. Change button state for 1.5-2 seconds.

Button states:

```text
Default: Copy Prompt
Loading optional: Copying...
Success: Copied
```

Toast text:

```text
Prompt copied
Paste it into your AI workspace with the Marcatching skill files.
```

## FR-008 — Prompt Copied Animation

Animation requirement:

- Toast slides up or fades in.
- Check icon appears.
- Subtle green/teal glow.
- Optional progress bar that fades after 2 seconds.
- Button icon changes to check mark.
- Avoid loud animation.

Framer Motion example behavior:

```text
initial: opacity 0, y 12, scale 0.96
animate: opacity 1, y 0, scale 1
exit: opacity 0, y 8, scale 0.98
duration: 0.18-0.25s
```

## FR-009 — Skill Docs CTA

Add section:

Headline:

```text
Use the prompts with the Marcatching Skill System.
```

Body:

```text
For best output, paste these skill files into your AI workspace before running any prompt from this library.
```

Buttons:

1. Download `skill-marcatching.md`
2. Download `skill.copywritting-marcatching.md`
3. Read the setup guide

Expected file paths:

```text
/public/skills/skill-marcatching.md
/public/skills/skill.copywritting-marcatching.md
```

Download URLs:

```text
/skills/skill-marcatching.md
/skills/skill.copywritting-marcatching.md
```

## FR-010 — Empty State

When no prompt matches search:

Title:

```text
No prompt found.
```

Body:

```text
Try another keyword like trust, landing page, urgency, premium, or audience.
```

Button:

```text
Reset filters
```

## FR-011 — Mobile Behavior

- Search bar full width.
- Category chips horizontally scrollable.
- Prompt grid becomes 1 column.
- Modal becomes bottom sheet or full-screen drawer.
- Copy button sticky at bottom of drawer.
- Text must remain readable.
- Code block must scroll horizontally if needed.

---

# 14. Data Requirements

## Data Source

Use:

```text
marcatching_emotional_prompt_library_bank_v1.md
```

Extract each prompt from:

```text
## [Category] Prompt XX: [Prompt Name]
```

Each prompt has:

- Best Used For
- Full Prompt
- Rules
- Optional context

## Recommended Data File

Create:

```text
/src/data/promptLibrary.ts
```

## TypeScript Type

```ts
export type PromptCategory =
  | "trust"
  | "urgency"
  | "premium-perception"
  | "identity-signaling"
  | "loss-aversion"
  | "cognitive-ease"
  | "belonging"
  | "relief";

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
```

## Example Data Object

```ts
export const promptLibrary: PromptItem[] = [
  {
    id: "trust-barrier-diagnostic",
    title: "Trust Barrier Diagnostic",
    category: "trust",
    categoryLabel: "Trust",
    promptNumber: 1,
    psychologicalJob:
      "Reduce perceived risk by diagnosing why the audience may hesitate before taking action.",
    bestUsedFor: [
      "Landing page",
      "Sales page",
      "Product page",
      "Course page",
      "Cold audience ads",
      "Email nurture",
    ],
    shortDescription:
      "Diagnose audience hesitation and build copy that makes the next step feel safe.",
    tags: ["trust", "risk reduction", "landing page", "cold audience"],
    recommendedOrder: 1,
    fullPrompt: `Kamu adalah Marcatching marketing strategist yang memahami consumer psychology dan trust-building copywriting.

Tugasmu adalah mendiagnosis hambatan trust dari audiens sebelum membuat copy...`,
  },
];
```

## Data Import Rule

Do not summarize the full prompt. The `fullPrompt` field must contain the exact full prompt from the prompt bank.

---

# 15. Technical Requirements

## Recommended Stack

Use the current Marcatching stack if already defined.

If the project uses Next.js, implement with:

- Next.js App Router
- TypeScript
- Tailwind CSS
- Framer Motion
- Lucide React icons
- Existing Marcatching navbar/footer components
- Existing design tokens if available

If the project does not use Next.js, adapt to the existing stack and preserve the same behavior.

## Suggested File Structure

```text
/app/prompt-library/page.tsx
/components/prompt-library/PromptLibraryHero.tsx
/components/prompt-library/PromptSearch.tsx
/components/prompt-library/CategoryFilter.tsx
/components/prompt-library/PromptCard.tsx
/components/prompt-library/PromptDetailDrawer.tsx
/components/prompt-library/CopyPromptButton.tsx
/components/prompt-library/PromptCopiedToast.tsx
/components/prompt-library/HowToUsePromptLibrary.tsx
/components/prompt-library/SkillDocsCTA.tsx
/components/prompt-library/PromptLibraryFAQ.tsx
/src/data/promptLibrary.ts
/src/data/promptCategories.ts
/public/skills/skill-marcatching.md
/public/skills/skill.copywritting-marcatching.md
```

## State Management

Use local React state.

State needed:

```ts
const [searchQuery, setSearchQuery] = useState("");
const [selectedCategory, setSelectedCategory] = useState<PromptCategory | "all">("all");
const [sortBy, setSortBy] = useState<"recommended" | "category" | "az" | "za">("recommended");
const [selectedPrompt, setSelectedPrompt] = useState<PromptItem | null>(null);
const [copiedPromptId, setCopiedPromptId] = useState<string | null>(null);
```

## Search Logic

```ts
const filteredPrompts = promptLibrary
  .filter((prompt) => {
    const matchesCategory =
      selectedCategory === "all" || prompt.category === selectedCategory;

    const query = searchQuery.toLowerCase().trim();

    const searchableText = [
      prompt.title,
      prompt.categoryLabel,
      prompt.psychologicalJob,
      prompt.shortDescription,
      prompt.fullPrompt,
      prompt.tags.join(" "),
      prompt.bestUsedFor.join(" "),
    ]
      .join(" ")
      .toLowerCase();

    const matchesSearch = !query || searchableText.includes(query);

    return matchesCategory && matchesSearch;
  })
  .sort(sortPrompts);
```

## Copy Logic

```ts
async function copyPrompt(prompt: PromptItem) {
  await navigator.clipboard.writeText(prompt.fullPrompt);
  setCopiedPromptId(prompt.id);

  setTimeout(() => {
    setCopiedPromptId(null);
  }, 1800);
}
```

Fallback:

```ts
function fallbackCopy(text: string) {
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "absolute";
  textarea.style.left = "-9999px";
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand("copy");
  document.body.removeChild(textarea);
}
```

---

# 16. SEO Requirements

## Metadata

Title:

```text
Marcatching Prompt Library | 80 AI Marketing Prompts Based on Consumer Psychology
```

Description:

```text
Explore 80 AI marketing prompts built on consumer psychology. Search by trust, urgency, premium perception, identity signaling, loss aversion, cognitive ease, belonging, and relief.
```

Open Graph:

```ts
openGraph: {
  title: "Marcatching Prompt Library",
  description:
    "80 AI marketing prompts built to make AI think like a strategist before it writes.",
  url: "https://www.marcatching.com/prompt-library",
  siteName: "Marcatching",
  type: "website",
}
```

## Page H1

```text
80 AI Marketing Prompts Built on Consumer Psychology.
```

---

# 17. Analytics Events

If analytics exists, track:

```text
prompt_library_view
prompt_search_used
prompt_category_selected
prompt_card_opened
prompt_copied
skill_doc_downloaded
how_to_use_clicked
```

Event payload example:

```ts
{
  prompt_id: prompt.id,
  prompt_title: prompt.title,
  category: prompt.category,
}
```

---

# 18. Accessibility Requirements

- Search input must have label.
- Buttons must have accessible names.
- Modal/drawer must trap focus.
- ESC closes modal.
- Toast must not steal focus.
- Category chips must be keyboard navigable.
- Contrast must pass WCAG AA.
- Prompt code blocks must be readable.
- Copy button must provide screen-reader feedback.

ARIA example:

```tsx
<button aria-label={`Copy prompt: ${prompt.title}`}>
  Copy Prompt
</button>
```

---

# 19. Performance Requirements

- Page must load fast with static data.
- No backend call required for V1.
- Prompt list can be static.
- Search should happen client-side.
- Avoid heavy animation.
- Lazy-load modal content if needed.
- Keep bundle light.

Target:

```text
LCP < 2.5s
CLS < 0.1
INP < 200ms
```

---

# 20. Acceptance Criteria

The page is accepted when:

1. `/prompt-library` works.
2. All 80 prompts are available.
3. All 8 categories show 10 prompts each.
4. Search works across title, prompt content, category, use case, and tags.
5. Category filter works.
6. Sort works.
7. Prompt detail modal/drawer works.
8. Copy Prompt copies the exact full prompt.
9. “Prompt copied” animation appears after copy.
10. Skill docs CTA is visible.
11. Page is responsive on mobile.
12. Visual style matches Marcatching dark premium style.
13. No fake data, no missing prompt category.
14. No broken download links.
15. SEO metadata exists.
16. Accessibility basics work.
17. No console errors.

---

# 21. FAQ Copy

## Question 1
**Do I need the skill files to use these prompts?**

Answer:
For best results, yes. The prompt works better when your AI workspace already understands the Marcatching system through `skill-marcatching.md` and `skill.copywritting-marcatching.md`.

## Question 2
**Can I use these prompts in ChatGPT, Claude, Codex, or Antigravity?**

Answer:
Yes. Copy the prompt, paste it into your AI workspace, then add your brand context. The prompt is designed to guide AI to analyze audience psychology before writing.

## Question 3
**Why are the prompts organized by emotion, not platform?**

Answer:
Because good marketing does not start from platform. It starts from the psychological job: trust, urgency, perception, identity, loss, clarity, belonging, or relief.

## Question 4
**Can I edit the prompts?**

Answer:
Yes. Treat each prompt as a thinking system. Keep the analysis structure, then adjust the product, audience, channel, proof, and constraints.

---

# 22. Antigravity Build Prompts

Use these prompts in Antigravity to generate the landing page.

---

## Prompt 1 — Master Build Prompt

```text
You are an expert full-stack product engineer and UI designer working on the Marcatching website.

Build a new landing page at:

/prompt-library

Goal:
Create a dark, premium, Marcatching-style prompt library page that displays 80 AI marketing prompts based on consumer psychology.

The page is not a generic prompt directory. It is a marketing intelligence library. It must feel sharp, calm, premium, editorial, and strategic.

Use the existing Marcatching website style, layout language, typography, navbar, footer, and design tokens if available. If design tokens are not available, use a dark premium visual direction:
- background #030407
- elevated surface #0D1118
- subtle glass cards
- thin borders rgba(255,255,255,0.10)
- text primary #F4F4F5
- text secondary #A1A1AA
- accent #5FB7B0
- subtle teal glow
- minimal animation
- premium editorial typography

Core headline:
80 AI Marketing Prompts Built on Consumer Psychology.

Subheadline:
A curated prompt library for marketers, founders, and creators who want sharper copy, stronger funnels, and better audience understanding.

Signature line:
Most prompts ask AI to write. Strategic prompts ask AI to think.

Required features:
1. Hero section.
2. Search bar.
3. Category filter chips with counts.
4. Sort dropdown.
5. Prompt card grid.
6. Prompt detail modal or right-side drawer.
7. Copy Prompt button on every card and inside detail modal.
8. Animated “Prompt copied” toast after copying.
9. How to Use section explaining:
   - Insert skill-marcatching.md
   - Insert skill.copywritting-marcatching.md
   - Copy a prompt
   - Paste into AI workspace with brand context
10. Skill docs CTA buttons:
   - Download skill-marcatching.md from /skills/skill-marcatching.md
   - Download skill.copywritting-marcatching.md from /skills/skill.copywritting-marcatching.md
11. FAQ section.
12. Fully responsive mobile design.
13. SEO metadata.

Data:
Create a static data file:
src/data/promptLibrary.ts

Prompt type:
type PromptCategory =
  | "trust"
  | "urgency"
  | "premium-perception"
  | "identity-signaling"
  | "loss-aversion"
  | "cognitive-ease"
  | "belonging"
  | "relief";

type PromptItem = {
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

Use all 80 prompts from marcatching_emotional_prompt_library_bank_v1.md.
Each prompt must preserve the exact Full Prompt code block as fullPrompt.
Do not summarize or shorten the prompt text in fullPrompt.

Categories:
- Trust: 10 prompts
- Urgency: 10 prompts
- Premium Perception: 10 prompts
- Identity Signaling: 10 prompts
- Loss Aversion: 10 prompts
- Cognitive Ease: 10 prompts
- Belonging: 10 prompts
- Relief: 10 prompts

Search:
Search across title, categoryLabel, psychologicalJob, shortDescription, fullPrompt, tags, and bestUsedFor.

Copy behavior:
Clicking Copy Prompt must copy prompt.fullPrompt to clipboard.
Show animated toast:
Title: Prompt copied
Description: Paste it into your AI workspace with the Marcatching skill files.
Button state changes to Copied for 1.8 seconds.

Animation:
Use Framer Motion if available.
Toast:
initial { opacity: 0, y: 12, scale: 0.96 }
animate { opacity: 1, y: 0, scale: 1 }
exit { opacity: 0, y: 8, scale: 0.98 }
duration 0.2s

Acceptance:
- /prompt-library works.
- All 80 prompts render.
- Each category count is correct.
- Search works.
- Filter works.
- Sort works.
- Copy works.
- Prompt copied animation appears.
- Mobile layout is clean.
- No console errors.
- Visual matches the dark premium Marcatching website.
```

---

## Prompt 2 — Data Extraction Prompt

```text
Read the file marcatching_emotional_prompt_library_bank_v1.md and extract all prompts into a TypeScript data file:

src/data/promptLibrary.ts

Extraction rules:
1. Each category starts with:
   # Category X: Prompt for [Category Name]

2. Each prompt starts with:
   ## [Category] Prompt XX: [Prompt Name]

3. Extract:
   - title from the heading after the number
   - category
   - promptNumber
   - bestUsedFor from the “### Best Used For” section
   - fullPrompt from the code block under “### Full Prompt”
   - psychologicalJob from the category psychological job section if available
   - shortDescription based on the prompt purpose
   - tags based on use case and category

4. Preserve the exact full prompt text inside the code block.
5. Do not shorten fullPrompt.
6. Generate stable kebab-case ids.
7. Confirm that the final array contains exactly 80 prompts.
8. Confirm every category contains exactly 10 prompts.

Also create:
src/data/promptCategories.ts

with category metadata:
- id
- name
- description
- count
- accent
- recommendedOrder
```

---

## Prompt 3 — UI Polish Prompt

```text
Polish the /prompt-library page UI so it feels like Marcatching.com.

Design direction:
Dark premium marketing intelligence.
Not SaaS generic.
Not colorful prompt marketplace.
Not childish AI tool page.

Hero:
- Large editorial headline
- Subtle radial glow
- Dark background
- Thin border cards
- Minimal stats
- Signature line as small supporting text

Prompt cards:
- Dark elevated surface
- Thin border
- Category badge
- Strong title
- Short description
- Best used for tags
- View Prompt and Copy Prompt actions
- Hover state with subtle glow and 2px lift

Prompt detail drawer:
- Right-side drawer on desktop
- Full-screen or bottom sheet on mobile
- Full prompt in readable code block
- Sticky Copy Prompt button
- Close with ESC

Toast:
- “Prompt copied”
- Check icon
- Teal glow
- Smooth fade and slide animation
- No loud confetti or gimmicky animation

Typography:
- Use existing site font tokens
- If unavailable, use clean sans for body and editorial display for headings
- Code block uses mono font

Spacing:
- Generous whitespace
- Grid max width around 1200px
- Cards have consistent height
- Section spacing 96px desktop, 56px mobile

Make sure the page looks premium, strategic, and consistent with the Marcatching brand.
```

---

## Prompt 4 — Interaction QA Prompt

```text
Audit the /prompt-library page interaction and fix any issues.

Check:
1. Search returns correct prompts.
2. Category filters return exactly 10 prompts per category.
3. Sort dropdown works.
4. Copy Prompt copies the exact fullPrompt, not the preview.
5. “Prompt copied” toast appears and disappears smoothly.
6. Copy button state returns to default after 1.8 seconds.
7. Prompt detail drawer opens and closes correctly.
8. ESC closes drawer.
9. Mobile drawer is usable.
10. Empty state appears when search has no results.
11. Skill doc download buttons point to:
    /skills/skill-marcatching.md
    /skills/skill.copywritting-marcatching.md
12. No hydration errors.
13. No console errors.
14. Page is accessible by keyboard.
15. Page remains fast with all 80 prompts.

After fixing, summarize what changed.
```

---

## Prompt 5 — SEO and Metadata Prompt

```text
Add SEO metadata for /prompt-library.

Title:
Marcatching Prompt Library | 80 AI Marketing Prompts Based on Consumer Psychology

Description:
Explore 80 AI marketing prompts built on consumer psychology. Search by trust, urgency, premium perception, identity signaling, loss aversion, cognitive ease, belonging, and relief.

Open Graph:
title: Marcatching Prompt Library
description: 80 AI marketing prompts built to make AI think like a strategist before it writes.
url: https://www.marcatching.com/prompt-library
siteName: Marcatching
type: website

Also add structured page copy that reinforces:
- AI should not be used only to write faster.
- AI should be used to think sharper.
- Most prompts ask AI to write. Strategic prompts ask AI to think.

Make sure there is only one H1:
80 AI Marketing Prompts Built on Consumer Psychology.
```

---

## Prompt 6 — Final Build Verification Prompt

```text
Do a final product verification for /prompt-library.

Verify against these acceptance criteria:
1. Route works at /prompt-library.
2. All 80 prompts exist.
3. All 8 categories exist.
4. Each category has exactly 10 prompts.
5. Search works across title, category, prompt text, tags, and best used for.
6. Filter works.
7. Sort works.
8. Prompt detail drawer works.
9. Copy Prompt copies exact full prompt.
10. Prompt copied animation works.
11. Skill docs CTA links work.
12. Responsive mobile layout is clean.
13. SEO metadata exists.
14. Accessibility basics are handled.
15. No console errors.
16. Visual style is dark, premium, and aligned with Marcatching.com.

If anything is missing, fix it.
Then provide a concise summary of final implementation.
```

---

# 23. Future V2 Ideas

V2 can include:

1. Favorite prompts.
2. Recently copied prompts.
3. Prompt customization form.
4. User can choose output type before copying.
5. Prompt preview examples.
6. AI-powered prompt recommender.
7. Member-only prompt categories.
8. Prompt Library Pro gated access.
9. Download as Notion template.
10. Copy prompt with brand context template.
11. Prompt usage analytics.
12. Account-based saved prompt collections.

---

# 24. Final Product Principle

This page should not feel like a toolbox.

It should feel like a thinking room.

Marcatching is not giving users more prompts.

Marcatching is giving them a better way to make AI understand people before writing for them.

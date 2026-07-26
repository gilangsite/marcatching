export type WorkspaceSection =
  | 'overview'
  | 'audience'
  | 'revenue'
  | 'content'
  | 'calendar'
  | 'memory'
  | 'conversion'
  | 'experiments'
  | 'metrics'
  | 'deliverables'

export type AudienceDimension = {
  id: string
  label: string
  prompt: string
  insight: string
  evidence: string
  score: number
}

export type ContentIP = {
  id: string
  name: string
  role: string
  format: string
  hook: string
  value: string
  cta: string
  status: 'Ready' | 'Draft'
}

export type CalendarItem = {
  id: string
  week: number
  day: string
  title: string
  contentIp: string
  format: string
  cta: string
  status: 'Idea' | 'Draft' | 'Ready' | 'Published'
}

export type Experiment = {
  id: string
  name: string
  hypothesis: string
  control: string
  variant: string
  metric: string
  result: string
  decision: 'Running' | 'Keep' | 'Iterate' | 'Kill'
}

export type Deliverable = {
  id: string
  code: string
  name: string
  description: string
  status: 'Not started' | 'In progress' | 'Review' | 'Approved'
}

export type WorkspaceData = {
  creatorName: string
  businessType: string
  primaryGoal: string
  activePhase: number
  audience: AudienceDimension[]
  revenue: {
    buyer: string
    whyNow: string
    offer: string
    proof: string
    path: string
    price: string
  }
  contentIps: ContentIP[]
  calendar: CalendarItem[]
  memory: {
    voice: string
    audienceFacts: string
    redLines: string
    qualityGate: string
  }
  conversion: {
    awareness: string
    profile: string
    lead: string
    nurture: string
    close: string
  }
  experiments: Experiment[]
  metrics: Array<{
    label: string
    baseline: number
    current: number
    target: number
    suffix: string
  }>
  deliverables: Deliverable[]
}

export const workspaceSections: Array<{
  id: WorkspaceSection
  label: string
  description: string
}> = [
  { id: 'overview', label: 'Overview', description: 'Progress, next action, dan review' },
  { id: 'audience', label: 'Audience OS', description: 'Enam dimensi psikologi audiens' },
  { id: 'revenue', label: 'Revenue Thesis', description: 'Buyer, offer, proof, dan revenue path' },
  { id: 'content', label: 'Content IP', description: 'Tiga seri konten yang repeatable' },
  { id: 'calendar', label: '30-Day Map', description: 'Prioritas eksekusi dan status produksi' },
  { id: 'memory', label: 'AI Memory', description: 'Konteks tetap untuk kualitas output AI' },
  { id: 'conversion', label: 'Conversion Map', description: 'Jalur dari perhatian menuju transaksi' },
  { id: 'experiments', label: 'Experiments', description: 'Hipotesis, variasi, dan keputusan' },
  { id: 'metrics', label: 'Metrics', description: 'Baseline, signal, dan revenue proxy' },
  { id: 'deliverables', label: 'Deliverables', description: 'Sembilan output Creator Revenue OS' },
]

export const programPhases = [
  { name: 'Diagnose', timing: 'Day 1–3', output: 'Baseline + Audience OS' },
  { name: 'Revenue Thesis', timing: 'Day 4–6', output: 'Monetization path' },
  { name: 'Content OS', timing: 'Day 7–11', output: '3 Content IPs' },
  { name: 'Conversion', timing: 'Day 12–15', output: 'CTA + lead path' },
  { name: 'Activation', timing: 'Day 16–21', output: '6 assets + review' },
]

export const defaultWorkspaceData: WorkspaceData = {
  creatorName: 'Creator Workspace',
  businessType: 'Knowledge creator',
  primaryGoal: 'Mengubah konten edukasi menjadi qualified leads',
  activePhase: 2,
  audience: [
    {
      id: 'pain',
      label: 'Pain',
      prompt: 'Masalah apa yang paling sering mereka keluhkan?',
      insight: 'Konten sudah konsisten, tetapi tidak menghasilkan percakapan penjualan.',
      evidence: 'Komentar, DM, dan hasil audit konten',
      score: 78,
    },
    {
      id: 'desire',
      label: 'Desire',
      prompt: 'Hasil apa yang ingin terasa nyata bagi mereka?',
      insight: 'Punya sistem konten yang bisa diulang tanpa kehilangan gaya personal.',
      evidence: 'Pertanyaan saat discovery call',
      score: 72,
    },
    {
      id: 'fear',
      label: 'Fear',
      prompt: 'Risiko apa yang membuat mereka menunda?',
      insight: 'Takut terlihat terlalu menjual dan kehilangan kepercayaan audiens.',
      evidence: 'Objection log',
      score: 64,
    },
    {
      id: 'status',
      label: 'Status',
      prompt: 'Mereka ingin dikenal sebagai siapa?',
      insight: 'Praktisi yang punya sudut pandang, bukan akun tips generik.',
      evidence: 'Bio, caption, dan aspirasi brand',
      score: 70,
    },
    {
      id: 'friction',
      label: 'Friction',
      prompt: 'Apa yang membuat keputusan terasa berat?',
      insight: 'Belum ada offer yang cukup jelas untuk dipromosikan berulang kali.',
      evidence: 'Audit CTA dan landing path',
      score: 58,
    },
    {
      id: 'trigger',
      label: 'Trigger',
      prompt: 'Momen apa yang mendorong mereka bertindak?',
      insight: 'Saat views stabil tetapi tidak ada DM, lead, atau penjualan yang masuk.',
      evidence: 'Performance review 30 hari',
      score: 76,
    },
  ],
  revenue: {
    buyer: 'Knowledge creator dan founder-led brand dengan audiens awal',
    whyNow: 'Sudah memproduksi konten, tetapi belum memiliki sistem untuk mengubah perhatian menjadi lead.',
    offer: 'Creator Revenue Sprint — implementasi sistem konten-to-revenue selama 21 hari.',
    proof: 'Audit before/after, enam aset terbit, perubahan CTA response, dan qualified lead.',
    path: 'Konten → profile → diagnostic → WhatsApp → fit call → payment',
    price: 'Rp1.490.000 founding cohort',
  },
  contentIps: [
    {
      id: 'content-doctor',
      name: 'Content Doctor',
      role: 'Mendemonstrasikan kemampuan diagnosis',
      format: 'Public teardown 45–60 detik',
      hook: 'Kontennya rapi. Tapi tidak ada alasan untuk membeli.',
      value: 'Menunjukkan satu bottleneck dan tiga perbaikan paling bernilai.',
      cta: 'Ketik “OS” untuk mini-audit.',
      status: 'Ready',
    },
    {
      id: 'audience-lab',
      name: 'Audience OS Lab',
      role: 'Membuat metode Marcatching terlihat',
      format: 'Satu signal → angle → CTA',
      hook: 'Satu komentar ini lebih berguna dari 10 prompt viral.',
      value: 'Mengubah bukti audiens menjadi arah konten yang spesifik.',
      cta: 'Simpan lalu coba ke satu komentar audiensmu.',
      status: 'Ready',
    },
    {
      id: 'build-with-me',
      name: 'Build With Me',
      role: 'Membangun trust melalui proses',
      format: 'Sprint diary / carousel',
      hook: 'Day 6: kami membuang 70% ide kontennya.',
      value: 'Memperlihatkan keputusan, batasan, dan progress program.',
      cta: 'Lihat blueprint lengkap di profile.',
      status: 'Draft',
    },
  ],
  calendar: [
    { id: 'c1', week: 1, day: 'Mon', title: 'Kenapa views bukan masalah utamanya', contentIp: 'Content Doctor', format: 'Short video', cta: 'Comment OS', status: 'Published' },
    { id: 'c2', week: 1, day: 'Wed', title: 'Membaca pain dari satu komentar', contentIp: 'Audience OS Lab', format: 'Carousel', cta: 'Save', status: 'Ready' },
    { id: 'c3', week: 1, day: 'Fri', title: 'Day 3: baseline yang mengubah arah', contentIp: 'Build With Me', format: 'Short video', cta: 'View blueprint', status: 'Draft' },
    { id: 'c4', week: 2, day: 'Mon', title: 'CTA yang membuat audiens diam', contentIp: 'Content Doctor', format: 'Short video', cta: 'Comment OS', status: 'Ready' },
    { id: 'c5', week: 2, day: 'Wed', title: 'Desire bukan daftar benefit', contentIp: 'Audience OS Lab', format: 'Carousel', cta: 'Save', status: 'Idea' },
    { id: 'c6', week: 2, day: 'Fri', title: 'Menyederhanakan satu revenue path', contentIp: 'Build With Me', format: 'Carousel', cta: 'Start audit', status: 'Idea' },
    { id: 'c7', week: 3, day: 'Mon', title: 'Offer bagus yang tidak pernah terlihat', contentIp: 'Content Doctor', format: 'Short video', cta: 'Comment OS', status: 'Idea' },
    { id: 'c8', week: 3, day: 'Wed', title: 'Status signal dalam konten edukasi', contentIp: 'Audience OS Lab', format: 'Carousel', cta: 'Share', status: 'Idea' },
    { id: 'c9', week: 3, day: 'Fri', title: 'Tiga Content IP, bukan 30 ide acak', contentIp: 'Build With Me', format: 'Short video', cta: 'View method', status: 'Idea' },
    { id: 'c10', week: 4, day: 'Mon', title: 'Profile visit tinggi, DM tetap kosong', contentIp: 'Content Doctor', format: 'Short video', cta: 'Start audit', status: 'Idea' },
    { id: 'c11', week: 4, day: 'Wed', title: 'Friction yang tidak terlihat di bio', contentIp: 'Audience OS Lab', format: 'Carousel', cta: 'Save', status: 'Idea' },
    { id: 'c12', week: 4, day: 'Fri', title: 'Apa yang berubah setelah 21 hari', contentIp: 'Build With Me', format: 'Case pulse', cta: 'Apply', status: 'Idea' },
  ],
  memory: {
    voice: 'Tajam, tenang, observasional, dan berbasis bukti. Hindari gaya guru yang serba tahu. Gunakan Bahasa Indonesia natural dengan istilah Inggris hanya ketika lebih presisi.',
    audienceFacts: 'Audiens sudah aktif membuat konten, memiliki keahlian atau offer, dan lelah dengan tips viral yang tidak terhubung ke revenue. Mereka membutuhkan sistem yang sederhana dan bisa diulang.',
    redLines: 'Jangan menjanjikan viral, follower growth, atau revenue pasti. Jangan membuat urgency palsu. Jangan menyebut data sebagai fakta bila masih berupa hipotesis.',
    qualityGate: 'Setiap output harus punya: satu signal audiens, satu ketegangan yang spesifik, satu insight yang dapat dieksekusi, satu CTA yang sesuai intent, dan tidak ada klaim tanpa bukti.',
  },
  conversion: {
    awareness: 'Content Doctor / Audience OS Lab',
    profile: 'Positioning + pinned proof',
    lead: '5-minute Creator Revenue Audit',
    nurture: 'Result page + WhatsApp follow-up',
    close: '15-minute fit call → founding sprint',
  },
  experiments: [
    {
      id: 'e1',
      name: 'CTA keyword vs profile link',
      hypothesis: 'CTA keyword menghasilkan lebih banyak qualified conversation dibanding link langsung.',
      control: 'Lihat link di bio',
      variant: 'Ketik “OS” untuk mini-audit',
      metric: 'Qualified DM per 1.000 views',
      result: 'Menunggu 6 aset terbit',
      decision: 'Running',
    },
    {
      id: 'e2',
      name: 'Proof-first hook',
      hypothesis: 'Membuka dengan diagnosis nyata meningkatkan retention 3 detik.',
      control: 'Tips membangun konten yang convert',
      variant: 'Views-nya bukan masalah. Jalur setelah views yang hilang.',
      metric: '3-second hold rate',
      result: 'Belum dimulai',
      decision: 'Iterate',
    },
  ],
  metrics: [
    { label: 'Posts / week', baseline: 2, current: 4, target: 5, suffix: '' },
    { label: 'Median views', baseline: 1100, current: 1780, target: 2500, suffix: '' },
    { label: 'Profile actions', baseline: 18, current: 42, target: 60, suffix: '' },
    { label: 'Qualified leads', baseline: 0, current: 3, target: 8, suffix: '' },
    { label: 'Production time', baseline: 180, current: 105, target: 75, suffix: ' min' },
  ],
  deliverables: [
    { id: 'd1', code: '01', name: 'Baseline Scorecard', description: '30 post, median views, profile action, dan revenue path.', status: 'Approved' },
    { id: 'd2', code: '02', name: 'Audience OS', description: 'Pain, desire, fear, status, friction, trigger + evidence.', status: 'Review' },
    { id: 'd3', code: '03', name: 'Revenue Thesis', description: 'Buyer, why now, core offer, proof, dan monetization lane.', status: 'In progress' },
    { id: 'd4', code: '04', name: 'Content IP Playbook', description: 'Tiga signature series, hooks, rules, dan CTA role.', status: 'In progress' },
    { id: 'd5', code: '05', name: '30-Day Content Map', description: '30 angle, 12 prioritas, dan enam launch assets.', status: 'Not started' },
    { id: 'd6', code: '06', name: 'AI Creator Memory', description: 'Voice, audience facts, red lines, dan quality gate.', status: 'Review' },
    { id: 'd7', code: '07', name: 'Conversion Map', description: 'Primary CTA, lead destination, nurture, dan close step.', status: 'Not started' },
    { id: 'd8', code: '08', name: 'Experiment Log', description: 'Hypothesis, control, variant, metric, dan decision.', status: 'In progress' },
    { id: 'd9', code: '09', name: 'Case Study Pack', description: 'Before, intervention, result, quote, dan permission.', status: 'Not started' },
  ],
}

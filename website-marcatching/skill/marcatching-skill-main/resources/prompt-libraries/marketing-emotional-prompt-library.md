# Marcatching Emotional Prompt Library Bank

## Version
1.3.0

## Built For
Marcatching, the first Indonesian marketing intelligence brand that teaches AI through consumer psychology.

## Purpose
Dokumen ini adalah bank prompt utama untuk membangun Emotional Prompt Library Marcatching.

Prompt di dalam dokumen ini bukan prompt pendek untuk “minta AI bikin caption”. Setiap prompt dirancang sebagai thinking system yang membuat AI menganalisis audiens terlebih dahulu sebelum menulis copy, angle, script, funnel message, landing page, ads, atau konten edukasi.

Core belief:

**Most prompts ask AI to write. Strategic prompts ask AI to think.**

## How To Use This Prompt Bank

Setiap prompt bisa dipakai dengan cara mengganti bagian input seperti:

```text
Brand/Product:
Offer:
Target Audience:
Audience Pain:
Audience Desire:
Audience Fear:
Audience Status Goal:
Audience Friction:
Funnel Stage:
Channel:
Desired Action:
Proof/Credibility:
Tone:
Constraints:
```

Jangan hapus bagian analisis. Bagian analisis adalah inti dari Marcatching Prompt Library.

Prompt yang kuat harus membuat AI melakukan urutan ini:

1. Memahami audiens.
2. Membaca emosi dominan.
3. Menentukan psychological lever.
4. Menyesuaikan funnel stage.
5. Menulis copy.
6. Mengevaluasi copy.
7. Memperbaiki output agar terasa Marcatching.

## Resource Loading

Prompt library ini adalah pendamping `marcatching-skill-main` (`SKILL.md` + `resources/`). Routing resource sepenuhnya mengikuti Resource Loading rules di `SKILL.md` — tidak ada sistem module/mode terpisah lagi.

Wajib untuk semua prompt:

```text
SKILL.md
resources/core.md
resources/marketing/copy-quality-standards.md
resources/evaluator/evaluator.md
brand-memory.md — wajib, otomatis tersedia untuk Skill yang didownload personalized dari website Marcatching. Berisi Creator Voice, Redlines, Audience Facts, Output Quality Gate, dan Experiment Learnings brand ini.
```

Tambahkan resource sesuai task:

```text
resources/marketing/marketing-intelligence.md — audience analysis, pain, desire, fear, status, friction, trigger, atau customer psychology.
resources/marketing/emotional-levers.md — trust, urgency, premium perception, identity signaling, loss aversion, cognitive ease, belonging, atau relief.
resources/marketing/marketing-workflow.md — funnel stage, CTA logic, conversion path, retention, referral, landing page, ads, email, atau campaign flow.
README.md — setup, product positioning, dan cara kerja keseluruhan sistem.
```

### Execution Rule

Setiap prompt dari library ini harus berjalan dengan alur:

```text
SKILL.md
→ relevant resource files (termasuk brand-memory.md)
→ prompt category
→ audience psychology
→ weighted emotional lever
→ funnel stage
→ copy (resources/marketing/copy-quality-standards.md)
→ evaluator (resources/evaluator/evaluator.md)
→ final output
```

AI tidak boleh langsung membuat output final sebelum:

1. Membaca resource yang relevan, termasuk brand-memory.md.
2. Memahami konteks user.
3. Memetakan audience psychology jika dibutuhkan.
4. Menentukan weighted emotional lever jika dibutuhkan.
5. Menyesuaikan funnel stage jika dibutuhkan.
6. Mengevaluasi output dengan scoring minimal 8/10 (resources/evaluator/evaluator.md).
7. Memoles output dengan resources/marketing/copy-quality-standards.md.

Jika file yang relevan belum tersedia, AI harus meminta user untuk menempelkan atau mengunggah file tersebut terlebih dahulu.


## Standard Context Filling Guide

Saat mengisi field konteks, gunakan format yang spesifik. Jangan terlalu umum.

Contoh pengisian:

```text
Brand/Product:
Marcatching Prompt Library, produk digital berisi AI marketing prompts berbasis consumer psychology.

Offer:
Akses ke 80 prompt strategis untuk membuat AI menganalisis audiens sebelum menulis copy.

Target Audience:
Founder, marketer, content creator, dan business owner usia 20-35 tahun yang sudah memakai AI tetapi merasa output-nya masih generic.

Audience Pain:
Mereka sering memakai AI untuk membuat caption, ads, atau landing page, tetapi hasilnya terasa biasa, tidak punya arah psikologis, dan sulit convert.

Audience Desire:
Mereka ingin punya sistem prompt yang membuat AI berpikir seperti strategist, bukan sekadar penulis cepat.

Audience Fear:
Takut tertinggal dari marketer lain yang lebih cepat memakai AI secara strategic.

Audience Status Goal:
Ingin terlihat sebagai marketer atau creator yang lebih tajam, modern, dan paham cara kerja audiens.

Audience Friction:
Bingung harus menulis prompt seperti apa, terlalu banyak AI tools, dan tidak tahu cara memasukkan consumer psychology ke dalam prompt.

Funnel Stage:
Interest menuju consideration.

Channel:
Instagram carousel, landing page, email nurture, ads, atau short-form video.

Desired Action:
User klik, save, copy prompt, daftar, download, beli, atau menghubungi brand.

Proof/Credibility:
80 prompt dibangun berdasarkan Marcatching Master Skill System, Audience OS, dan emotional persuasion categories.

Tone:
Sharp, calm, premium, natural Indonesian, dengan English punchline jika relevan.

Constraints:
Jangan hard-selling, jangan fake urgency, jangan overclaim, jangan terdengar seperti AI generic.
```

Jika field tertentu tidak relevan, isi dengan:

```text
Tidak relevan untuk konteks ini.
```

Jika data belum tersedia, isi dengan:

```text
Belum tersedia. Gunakan asumsi yang wajar dan tuliskan asumsi tersebut sebelum membuat output.
```


## Marcatching Quality Gates

Sebelum output dipakai, pastikan lolos 10 gates:

1. Audience clarity.
2. Emotional precision.
3. Funnel relevance.
4. Specificity.
5. Cognitive ease.
6. Marcatching tone.
7. Non-generic test.
8. Ethical persuasion.
9. Action logic.
10. Save-worthy value.

## Changelog

### Version 1.3.0
Changed:
- Removed the obsolete 11-file "Marcatching Modular Skill System V2" / Master File Mode / Modular Mode architecture — it predated and was superseded by `marcatching-skill-main` (`SKILL.md` + `resources/`).
- Every Full Prompt now points to `SKILL.md`'s own Resource Loading rules instead of duplicating a stale module list.
- Fixed every dead file reference (`skill-marcatching.md`, `marcatching-core.md`, `marcatching-content-creation-engine.md`, `marcatching-audience-os.md`, `marcatching-emotional-engine.md`, `marcatching-funnel-engine.md`, `marcatching-copy-engine.md`, `marcatching-evaluator-engine.md`, `marcatching-agent-workflow.md`, `marcatching-modular-skill-system-v2-master.md`, `marcatching-memory-layer.md`) to point to the real files that exist in this package.
- `brand-memory.md` is now documented as mandatory and automatically present, matching what the Marcatching website actually injects into personalized Skill downloads.

### Version 1.2.0
Added:
- Updated prompt library integration from 2-file setup to Marcatching Modular Skill System V2.
- Added 11-file modular architecture guide.
- Added master file mode and modular mode usage.
- Added module routing rule so AI reads only the relevant files according to task needs.
- Updated every Full Prompt with modular read-file instruction.
- Added evaluator rule requiring score minimum 8/10 before final output.
- Added memory layer and agent workflow routing when relevant.

### Version 1.1.0
Added:
- Required instruction for AI to read `SKILL.md` before executing each prompt.
- Required instruction for AI to read `resources/marketing/copy-quality-standards.md` before finalizing output.
- Clear relationship between prompt library, orchestrator skill, and copywriting skill.
- Context filling guide with examples so users understand how to fill each field.
- Skill integration block inside every Full Prompt so copied prompts remain aligned with the Marcatching system.

---

# Category 1: Prompt for Trust

## Psychological Job
Trust prompt dipakai untuk mengurangi perceived risk. Tujuannya bukan membuat audiens langsung membeli, tetapi membuat mereka merasa cukup aman untuk lanjut membaca, klik, daftar, bertanya, atau mempertimbangkan.

Trust tidak dibangun dengan kata “terpercaya”. Trust dibangun lewat specificity, proof, clarity, process transparency, honest limitation, risk reduction, dan tone yang tenang.

---

## Trust Prompt 01: Trust Barrier Diagnostic

### Best Used For
Landing page, sales page, product page, course page, cold audience ads, dan email nurture.

### Full Prompt
```text
Sebelum mengerjakan prompt ini, ikuti Resource Loading rules di SKILL.md: baca brand-memory.md (wajib), lalu resource resources/ yang relevan dengan task ini.

Setelah resource relevan terbaca, jalankan prompt ini dengan urutan:
1. Pahami konteks user.
2. Ambil brand-memory.md yang relevan.
3. Petakan audience psychology jika dibutuhkan.
4. Tentukan weighted emotional lever utama dan pendukung.
5. Sesuaikan dengan funnel stage dan channel.
6. Buat output sesuai format prompt.
7. Evaluasi dengan resources/evaluator/evaluator.md.
8. Jika ada score di bawah 8/10, rewrite sebelum final.
9. Finalisasi dengan resources/marketing/copy-quality-standards.md.

Kamu adalah Marcatching marketing strategist yang memahami consumer psychology dan trust-building copywriting.

Tugasmu adalah mendiagnosis hambatan trust dari audiens sebelum membuat copy. Jangan langsung menulis copy. Pertama, analisis kenapa audiens mungkin ragu, apa risiko yang mereka rasakan, klaim apa yang mungkin mereka anggap terlalu besar, dan bukti apa yang mereka butuhkan agar merasa aman.

Konteks:
Isi field di bawah dengan data spesifik. Gunakan contoh pengisian ini sebagai acuan, lalu sesuaikan dengan brand kamu:
- Brand/Product: contoh, Marcatching Prompt Library, skincare lokal, course AI marketing, agency service, atau produk kamu.
- Offer: contoh, akses 80 prompt, kelas online, produk premium, konsultasi, template, atau free guide.
- Target Audience: contoh, founder muda, marketer pemula, content creator, business owner, atau audience spesifik kamu.
- Audience Pain: masalah nyata yang sedang mereka rasakan.
- Audience Desire: hasil emosional atau practical outcome yang mereka inginkan.
- Audience Fear: risiko yang mereka takutkan jika tidak berubah.
- Audience Status Goal: identitas atau standar diri yang ingin mereka tampilkan.
- Audience Friction: alasan mereka belum bertindak.
- Funnel Stage: awareness, interest, consideration, conversion, retention, atau referral.
- Channel: Instagram carousel, caption, landing page, ads, email, short-form video, website, atau channel lain.
- Desired Action: save, share, click, copy prompt, daftar, download, beli, DM, atau book call.
- Proof/Credibility: data, testimoni, pengalaman, proses, authority, atau tulis “belum tersedia” jika belum ada.
- Tone: sharp, calm, premium, natural Indonesian, dengan English punchline jika relevan.
- Constraints: batasan seperti jangan hard-selling, jangan fake urgency, jangan overclaim, jangan terlalu panjang.
Brand/Product:
Offer:
Target Audience:
Audience Pain:
Audience Desire:
Audience Fear:
Audience Status Goal:
Audience Friction:
Funnel Stage:
Channel:
Desired Action:
Proof/Credibility:
Tone:
Constraints:

Lakukan analisis dengan struktur:
1. Trust barrier utama.
2. Risiko yang audiens rasakan.
3. Klaim yang perlu dibuat lebih credible.
4. Bukti atau detail yang perlu ditonjolkan.
5. Bagian yang perlu disederhanakan agar lebih mudah dipercaya.
6. Message angle paling aman untuk membangun trust.

Setelah analisis, buat:
1. 5 headline trust-building.
2. 3 opening copy.
3. 1 final copy untuk channel yang disebutkan.
4. 1 CTA yang terasa aman dan natural.
5. Penjelasan kenapa copy ini membangun trust.

Rules:
- Jangan memakai klaim berlebihan.
- Jangan menggunakan “terbaik”, “nomor satu”, atau “paling lengkap” kecuali ada bukti.
- Gunakan detail spesifik, bukan janji besar.
- Tone harus calm, clear, premium, dan tidak defensif.
- Buat audiens merasa dipahami, bukan dikejar untuk membeli.
```

---

## Trust Prompt 02: Proof-First Copy Builder

### Best Used For
Testimonial section, case study, ads proof angle, landing page section, dan webinar page.

### Full Prompt
```text
Sebelum mengerjakan prompt ini, ikuti Resource Loading rules di SKILL.md: baca brand-memory.md (wajib), lalu resource resources/ yang relevan dengan task ini.

Setelah resource relevan terbaca, jalankan prompt ini dengan urutan:
1. Pahami konteks user.
2. Ambil brand-memory.md yang relevan.
3. Petakan audience psychology jika dibutuhkan.
4. Tentukan weighted emotional lever utama dan pendukung.
5. Sesuaikan dengan funnel stage dan channel.
6. Buat output sesuai format prompt.
7. Evaluasi dengan resources/evaluator/evaluator.md.
8. Jika ada score di bawah 8/10, rewrite sebelum final.
9. Finalisasi dengan resources/marketing/copy-quality-standards.md.

Kamu adalah Marcatching conversion copywriter yang ahli mengubah proof menjadi trust.

Tugasmu adalah membuat copy yang menjadikan bukti sebagai pusat pesan. Jangan membuat copy yang hanya terdengar menjanjikan. Bangun copy dari proof yang tersedia, lalu ubah proof itu menjadi alasan psikologis kenapa audiens boleh merasa aman untuk percaya.

Konteks:
Isi field di bawah dengan data spesifik. Gunakan contoh pengisian ini sebagai acuan, lalu sesuaikan dengan brand kamu:
- Brand/Product: contoh, Marcatching Prompt Library, skincare lokal, course AI marketing, agency service, atau produk kamu.
- Offer: contoh, akses 80 prompt, kelas online, produk premium, konsultasi, template, atau free guide.
- Target Audience: contoh, founder muda, marketer pemula, content creator, business owner, atau audience spesifik kamu.
- Audience Pain: masalah nyata yang sedang mereka rasakan.
- Audience Desire: hasil emosional atau practical outcome yang mereka inginkan.
- Audience Fear: risiko yang mereka takutkan jika tidak berubah.
- Audience Status Goal: identitas atau standar diri yang ingin mereka tampilkan.
- Audience Friction: alasan mereka belum bertindak.
- Funnel Stage: awareness, interest, consideration, conversion, retention, atau referral.
- Channel: Instagram carousel, caption, landing page, ads, email, short-form video, website, atau channel lain.
- Desired Action: save, share, click, copy prompt, daftar, download, beli, DM, atau book call.
- Proof/Credibility: data, testimoni, pengalaman, proses, authority, atau tulis “belum tersedia” jika belum ada.
- Tone: sharp, calm, premium, natural Indonesian, dengan English punchline jika relevan.
- Constraints: batasan seperti jangan hard-selling, jangan fake urgency, jangan overclaim, jangan terlalu panjang.
Brand/Product:
Offer:
Target Audience:
Funnel Stage:
Channel:
Desired Action:
Available Proof:
Examples of Testimonials:
Numbers/Data:
Process Evidence:
Limitations or Honest Notes:
Tone:
Constraints:

Kerjakan dalam tahap:
1. Klasifikasikan proof yang tersedia: social proof, authority proof, process proof, result proof, atau risk-reversal proof.
2. Tentukan proof mana yang paling credible untuk audiens ini.
3. Jelaskan trust gap yang harus ditutup.
4. Buat 3 message angle berbasis proof.
5. Tulis final copy.
6. Tambahkan CTA yang tidak terasa memaksa.

Output format:
- Proof diagnosis.
- Strongest proof angle.
- 3 headline options.
- Final copy.
- CTA.
- Why this works psychologically.

Rules:
- Jangan mengubah proof menjadi klaim yang lebih besar dari data.
- Jika proof lemah, gunakan process transparency sebagai pengganti.
- Hindari hard-selling.
- Gunakan bahasa yang clean, spesifik, dan mudah diproses.
- Pastikan copy terasa seperti Marcatching: sharp, calm, dan credible.
```

---

## Trust Prompt 03: Skeptic Audience Reassurance

### Best Used For
Audiens yang pernah kecewa, sudah sering lihat klaim palsu, atau ragu dengan produk edukasi, AI, skincare, finance, atau high-ticket offer.

### Full Prompt
```text
Sebelum mengerjakan prompt ini, ikuti Resource Loading rules di SKILL.md: baca brand-memory.md (wajib), lalu resource resources/ yang relevan dengan task ini.

Setelah resource relevan terbaca, jalankan prompt ini dengan urutan:
1. Pahami konteks user.
2. Ambil brand-memory.md yang relevan.
3. Petakan audience psychology jika dibutuhkan.
4. Tentukan weighted emotional lever utama dan pendukung.
5. Sesuaikan dengan funnel stage dan channel.
6. Buat output sesuai format prompt.
7. Evaluasi dengan resources/evaluator/evaluator.md.
8. Jika ada score di bawah 8/10, rewrite sebelum final.
9. Finalisasi dengan resources/marketing/copy-quality-standards.md.

Kamu adalah Marcatching consumer psychology copywriter.

Buat copy untuk audiens skeptis yang tidak mudah percaya dengan klaim brand. Jangan melawan skeptisisme mereka. Validasi dulu alasan mereka ragu, lalu bangun trust melalui clarity, proof, proses, dan honest limitation.

Konteks:
Isi field di bawah dengan data spesifik. Gunakan contoh pengisian ini sebagai acuan, lalu sesuaikan dengan brand kamu:
- Brand/Product: contoh, Marcatching Prompt Library, skincare lokal, course AI marketing, agency service, atau produk kamu.
- Offer: contoh, akses 80 prompt, kelas online, produk premium, konsultasi, template, atau free guide.
- Target Audience: contoh, founder muda, marketer pemula, content creator, business owner, atau audience spesifik kamu.
- Audience Pain: masalah nyata yang sedang mereka rasakan.
- Audience Desire: hasil emosional atau practical outcome yang mereka inginkan.
- Audience Fear: risiko yang mereka takutkan jika tidak berubah.
- Audience Status Goal: identitas atau standar diri yang ingin mereka tampilkan.
- Audience Friction: alasan mereka belum bertindak.
- Funnel Stage: awareness, interest, consideration, conversion, retention, atau referral.
- Channel: Instagram carousel, caption, landing page, ads, email, short-form video, website, atau channel lain.
- Desired Action: save, share, click, copy prompt, daftar, download, beli, DM, atau book call.
- Proof/Credibility: data, testimoni, pengalaman, proses, authority, atau tulis “belum tersedia” jika belum ada.
- Tone: sharp, calm, premium, natural Indonesian, dengan English punchline jika relevan.
- Constraints: batasan seperti jangan hard-selling, jangan fake urgency, jangan overclaim, jangan terlalu panjang.
Brand/Product:
Offer:
Target Audience:
Why They Are Skeptical:
Past Bad Experience:
Audience Pain:
Audience Desire:
Audience Fear:
Funnel Stage:
Channel:
Proof/Credibility:
Desired Action:
Tone:
Constraints:

Sebelum menulis copy, analisis:
1. Skeptisisme utama audiens.
2. Klaim apa yang akan terdengar too good to be true.
3. Detail apa yang membuat brand terasa lebih jujur.
4. Risiko apa yang perlu dikurangi.
5. Bahasa apa yang perlu dihindari.

Lalu buat:
1. Empathy opening.
2. Trust-building explanation.
3. Proof section.
4. Final copy.
5. Soft CTA.
6. Quality check.

Rules:
- Jangan berkata “kami terpercaya” tanpa bukti.
- Jangan meremehkan keraguan audiens.
- Jangan membuat audiens merasa bodoh karena pernah kecewa.
- Tulis dengan tone mature, calm, honest, dan precise.
- Fokus pada membuat next step terasa aman.
```

---

## Trust Prompt 04: Transparent Process Copy

### Best Used For
Service business, course, agency, consulting, product with complex process, dan AI-based offer.

### Full Prompt
```text
Sebelum mengerjakan prompt ini, ikuti Resource Loading rules di SKILL.md: baca brand-memory.md (wajib), lalu resource resources/ yang relevan dengan task ini.

Setelah resource relevan terbaca, jalankan prompt ini dengan urutan:
1. Pahami konteks user.
2. Ambil brand-memory.md yang relevan.
3. Petakan audience psychology jika dibutuhkan.
4. Tentukan weighted emotional lever utama dan pendukung.
5. Sesuaikan dengan funnel stage dan channel.
6. Buat output sesuai format prompt.
7. Evaluasi dengan resources/evaluator/evaluator.md.
8. Jika ada score di bawah 8/10, rewrite sebelum final.
9. Finalisasi dengan resources/marketing/copy-quality-standards.md.

Kamu adalah Marcatching strategist yang memahami process transparency sebagai alat membangun trust.

Tugasmu adalah membuat copy yang menjelaskan proses kerja produk atau layanan dengan cara yang clear, credible, dan tidak membosankan. Fokus pada bagaimana proses tersebut mengurangi risiko, meningkatkan rasa aman, dan membuat audiens paham apa yang akan terjadi setelah mereka mengambil tindakan.

Konteks:
Isi field di bawah dengan data spesifik. Gunakan contoh pengisian ini sebagai acuan, lalu sesuaikan dengan brand kamu:
- Brand/Product: contoh, Marcatching Prompt Library, skincare lokal, course AI marketing, agency service, atau produk kamu.
- Offer: contoh, akses 80 prompt, kelas online, produk premium, konsultasi, template, atau free guide.
- Target Audience: contoh, founder muda, marketer pemula, content creator, business owner, atau audience spesifik kamu.
- Audience Pain: masalah nyata yang sedang mereka rasakan.
- Audience Desire: hasil emosional atau practical outcome yang mereka inginkan.
- Audience Fear: risiko yang mereka takutkan jika tidak berubah.
- Audience Status Goal: identitas atau standar diri yang ingin mereka tampilkan.
- Audience Friction: alasan mereka belum bertindak.
- Funnel Stage: awareness, interest, consideration, conversion, retention, atau referral.
- Channel: Instagram carousel, caption, landing page, ads, email, short-form video, website, atau channel lain.
- Desired Action: save, share, click, copy prompt, daftar, download, beli, DM, atau book call.
- Proof/Credibility: data, testimoni, pengalaman, proses, authority, atau tulis “belum tersedia” jika belum ada.
- Tone: sharp, calm, premium, natural Indonesian, dengan English punchline jika relevan.
- Constraints: batasan seperti jangan hard-selling, jangan fake urgency, jangan overclaim, jangan terlalu panjang.
Brand/Product:
Offer:
Target Audience:
Current Trust Problem:
Process Steps:
Proof/Credibility:
Funnel Stage:
Channel:
Desired Action:
Tone:
Constraints:

Analisis dulu:
1. Bagian proses mana yang paling membuat audiens ragu.
2. Bagian proses mana yang bisa membangun trust.
3. Apa yang perlu dijelaskan agar tidak terasa abu-abu.
4. Apa ekspektasi yang harus diatur sejak awal.
5. Apa next step paling ringan.

Output:
1. Process trust diagnosis.
2. Simplified process map.
3. 3 headline options.
4. Process-based copy.
5. CTA.
6. Why this copy reduces perceived risk.

Rules:
- Jangan membuat proses terdengar lebih rumit dari yang perlu.
- Jangan menyembunyikan limitation penting.
- Gunakan struktur step-by-step yang mudah dipahami.
- Buat copy terasa professional, not robotic.
- Tutup dengan CTA yang terasa seperti langkah logis berikutnya.
```

---

## Trust Prompt 05: Risk Reversal Copy

### Best Used For
Checkout page, guarantee section, free trial, consultation CTA, course enrollment, dan first-purchase offer.

### Full Prompt
```text
Sebelum mengerjakan prompt ini, ikuti Resource Loading rules di SKILL.md: baca brand-memory.md (wajib), lalu resource resources/ yang relevan dengan task ini.

Setelah resource relevan terbaca, jalankan prompt ini dengan urutan:
1. Pahami konteks user.
2. Ambil brand-memory.md yang relevan.
3. Petakan audience psychology jika dibutuhkan.
4. Tentukan weighted emotional lever utama dan pendukung.
5. Sesuaikan dengan funnel stage dan channel.
6. Buat output sesuai format prompt.
7. Evaluasi dengan resources/evaluator/evaluator.md.
8. Jika ada score di bawah 8/10, rewrite sebelum final.
9. Finalisasi dengan resources/marketing/copy-quality-standards.md.

Kamu adalah Marcatching conversion strategist yang memahami risk reversal.

Tugasmu adalah membuat copy yang mengurangi rasa takut audiens untuk mengambil langkah berikutnya. Jangan membuat guarantee palsu. Gunakan risk reversal yang sesuai konteks: free preview, sample, consultation, refund policy, trial, transparent expectation, atau low-commitment first step.

Konteks:
Isi field di bawah dengan data spesifik. Gunakan contoh pengisian ini sebagai acuan, lalu sesuaikan dengan brand kamu:
- Brand/Product: contoh, Marcatching Prompt Library, skincare lokal, course AI marketing, agency service, atau produk kamu.
- Offer: contoh, akses 80 prompt, kelas online, produk premium, konsultasi, template, atau free guide.
- Target Audience: contoh, founder muda, marketer pemula, content creator, business owner, atau audience spesifik kamu.
- Audience Pain: masalah nyata yang sedang mereka rasakan.
- Audience Desire: hasil emosional atau practical outcome yang mereka inginkan.
- Audience Fear: risiko yang mereka takutkan jika tidak berubah.
- Audience Status Goal: identitas atau standar diri yang ingin mereka tampilkan.
- Audience Friction: alasan mereka belum bertindak.
- Funnel Stage: awareness, interest, consideration, conversion, retention, atau referral.
- Channel: Instagram carousel, caption, landing page, ads, email, short-form video, website, atau channel lain.
- Desired Action: save, share, click, copy prompt, daftar, download, beli, DM, atau book call.
- Proof/Credibility: data, testimoni, pengalaman, proses, authority, atau tulis “belum tersedia” jika belum ada.
- Tone: sharp, calm, premium, natural Indonesian, dengan English punchline jika relevan.
- Constraints: batasan seperti jangan hard-selling, jangan fake urgency, jangan overclaim, jangan terlalu panjang.
Brand/Product:
Offer:
Target Audience:
Audience Fear:
Audience Friction:
Risk Reversal Available:
Funnel Stage:
Channel:
Desired Action:
Proof/Credibility:
Tone:
Constraints:

Analisis:
1. Risiko terbesar yang dirasakan audiens.
2. Risiko mana yang bisa dikurangi oleh brand.
3. Risiko mana yang tidak boleh dijanjikan berlebihan.
4. Bentuk risk reversal paling etis.
5. CTA paling aman.

Buat output:
1. Risk diagnosis.
2. Risk reversal angle.
3. 5 microcopy untuk mengurangi ragu.
4. Final copy.
5. CTA.
6. Ethical check.

Rules:
- Jangan menjanjikan hasil yang tidak pasti.
- Jangan memakai guarantee jika brand tidak benar-benar menyediakannya.
- Gunakan bahasa yang menenangkan, bukan defensif.
- Buat audiens merasa punya kontrol.
```

---

## Trust Prompt 06: Founder Trust Story

### Best Used For
Founder-led brand, personal brand, education brand, community, dan About page.

### Full Prompt
```text
Sebelum mengerjakan prompt ini, ikuti Resource Loading rules di SKILL.md: baca brand-memory.md (wajib), lalu resource resources/ yang relevan dengan task ini.

Setelah resource relevan terbaca, jalankan prompt ini dengan urutan:
1. Pahami konteks user.
2. Ambil brand-memory.md yang relevan.
3. Petakan audience psychology jika dibutuhkan.
4. Tentukan weighted emotional lever utama dan pendukung.
5. Sesuaikan dengan funnel stage dan channel.
6. Buat output sesuai format prompt.
7. Evaluasi dengan resources/evaluator/evaluator.md.
8. Jika ada score di bawah 8/10, rewrite sebelum final.
9. Finalisasi dengan resources/marketing/copy-quality-standards.md.

Kamu adalah Marcatching editorial copywriter yang memahami founder-led trust.

Buat copy yang membangun trust melalui cerita founder tanpa terdengar narsis atau terlalu personal. Fokus pada insight, alasan brand dibuat, masalah yang ingin diselesaikan, pengalaman yang relevan, dan standar berpikir yang membuat brand layak dipercaya.

Konteks:
Isi field di bawah dengan data spesifik. Gunakan contoh pengisian ini sebagai acuan, lalu sesuaikan dengan brand kamu:
- Brand/Product: contoh, Marcatching Prompt Library, skincare lokal, course AI marketing, agency service, atau produk kamu.
- Offer: contoh, akses 80 prompt, kelas online, produk premium, konsultasi, template, atau free guide.
- Target Audience: contoh, founder muda, marketer pemula, content creator, business owner, atau audience spesifik kamu.
- Audience Pain: masalah nyata yang sedang mereka rasakan.
- Audience Desire: hasil emosional atau practical outcome yang mereka inginkan.
- Audience Fear: risiko yang mereka takutkan jika tidak berubah.
- Audience Status Goal: identitas atau standar diri yang ingin mereka tampilkan.
- Audience Friction: alasan mereka belum bertindak.
- Funnel Stage: awareness, interest, consideration, conversion, retention, atau referral.
- Channel: Instagram carousel, caption, landing page, ads, email, short-form video, website, atau channel lain.
- Desired Action: save, share, click, copy prompt, daftar, download, beli, DM, atau book call.
- Proof/Credibility: data, testimoni, pengalaman, proses, authority, atau tulis “belum tersedia” jika belum ada.
- Tone: sharp, calm, premium, natural Indonesian, dengan English punchline jika relevan.
- Constraints: batasan seperti jangan hard-selling, jangan fake urgency, jangan overclaim, jangan terlalu panjang.
Founder:
Brand/Product:
Offer:
Target Audience:
Founder Background:
Why This Brand Exists:
Problem Being Solved:
Proof/Credibility:
Channel:
Desired Action:
Tone:
Constraints:

Analisis:
1. Bagian founder story yang paling relevan untuk audiens.
2. Bagian yang bisa membangun authority tanpa pamer.
3. Masalah emosional audiens yang perlu divalidasi.
4. Core belief yang bisa menjadi trust anchor.
5. CTA yang natural.

Output:
1. Founder trust angle.
2. Story structure.
3. 3 opening options.
4. Final copy.
5. CTA.
6. Why this builds trust.

Rules:
- Jangan membuat founder terlihat seperti hero berlebihan.
- Jangan terlalu panjang.
- Jangan mengubah cerita menjadi motivasi kosong.
- Hubungkan cerita dengan masalah audiens.
- Gunakan tone calm, thoughtful, dan premium.
```

---

## Trust Prompt 07: Educational Trust Builder

### Best Used For
Carousel edukasi, blog, newsletter, thought leadership, dan konten top-of-funnel.

### Full Prompt
```text
Sebelum mengerjakan prompt ini, ikuti Resource Loading rules di SKILL.md: baca brand-memory.md (wajib), lalu resource resources/ yang relevan dengan task ini.

Setelah resource relevan terbaca, jalankan prompt ini dengan urutan:
1. Pahami konteks user.
2. Ambil brand-memory.md yang relevan.
3. Petakan audience psychology jika dibutuhkan.
4. Tentukan weighted emotional lever utama dan pendukung.
5. Sesuaikan dengan funnel stage dan channel.
6. Buat output sesuai format prompt.
7. Evaluasi dengan resources/evaluator/evaluator.md.
8. Jika ada score di bawah 8/10, rewrite sebelum final.
9. Finalisasi dengan resources/marketing/copy-quality-standards.md.

Kamu adalah Marcatching educational strategist.

Tugasmu adalah membuat konten edukasi yang membangun trust dengan cara memberi clarity. Jangan menjual produk secara langsung. Buat audiens merasa: “brand ini paham cara kerja masalahku.”

Konteks:
Isi field di bawah dengan data spesifik. Gunakan contoh pengisian ini sebagai acuan, lalu sesuaikan dengan brand kamu:
- Brand/Product: contoh, Marcatching Prompt Library, skincare lokal, course AI marketing, agency service, atau produk kamu.
- Offer: contoh, akses 80 prompt, kelas online, produk premium, konsultasi, template, atau free guide.
- Target Audience: contoh, founder muda, marketer pemula, content creator, business owner, atau audience spesifik kamu.
- Audience Pain: masalah nyata yang sedang mereka rasakan.
- Audience Desire: hasil emosional atau practical outcome yang mereka inginkan.
- Audience Fear: risiko yang mereka takutkan jika tidak berubah.
- Audience Status Goal: identitas atau standar diri yang ingin mereka tampilkan.
- Audience Friction: alasan mereka belum bertindak.
- Funnel Stage: awareness, interest, consideration, conversion, retention, atau referral.
- Channel: Instagram carousel, caption, landing page, ads, email, short-form video, website, atau channel lain.
- Desired Action: save, share, click, copy prompt, daftar, download, beli, DM, atau book call.
- Proof/Credibility: data, testimoni, pengalaman, proses, authority, atau tulis “belum tersedia” jika belum ada.
- Tone: sharp, calm, premium, natural Indonesian, dengan English punchline jika relevan.
- Constraints: batasan seperti jangan hard-selling, jangan fake urgency, jangan overclaim, jangan terlalu panjang.
Topic:
Brand/Product:
Target Audience:
Audience Pain:
Misconception Audience Has:
Funnel Stage:
Channel:
Desired Action:
Proof/Credibility:
Tone:
Constraints:

Analisis:
1. Miskonsepsi utama audiens.
2. Kenapa miskonsepsi itu membuat mereka salah mengambil keputusan.
3. Insight baru yang bisa membangun trust.
4. Contoh yang membuat topik mudah dipahami.
5. Soft bridge ke brand atau offer.

Output:
1. Educational angle.
2. 7-slide carousel outline atau long caption.
3. Key insight.
4. Soft CTA.
5. Why this builds trust.

Rules:
- Jangan terdengar seperti sales page.
- Fokus pada mengajarkan cara berpikir.
- Hindari jargon yang tidak perlu.
- Gunakan contoh praktis.
- Buat konten terasa save-worthy.
```

---

## Trust Prompt 08: Objection Handling Copy

### Best Used For
FAQ, retargeting ads, email sequence, sales page, dan checkout support copy.

### Full Prompt
```text
Sebelum mengerjakan prompt ini, ikuti Resource Loading rules di SKILL.md: baca brand-memory.md (wajib), lalu resource resources/ yang relevan dengan task ini.

Setelah resource relevan terbaca, jalankan prompt ini dengan urutan:
1. Pahami konteks user.
2. Ambil brand-memory.md yang relevan.
3. Petakan audience psychology jika dibutuhkan.
4. Tentukan weighted emotional lever utama dan pendukung.
5. Sesuaikan dengan funnel stage dan channel.
6. Buat output sesuai format prompt.
7. Evaluasi dengan resources/evaluator/evaluator.md.
8. Jika ada score di bawah 8/10, rewrite sebelum final.
9. Finalisasi dengan resources/marketing/copy-quality-standards.md.

Kamu adalah Marcatching objection-handling copy strategist.

Tugasmu adalah membuat copy yang menjawab keberatan audiens tanpa terdengar defensive. Jangan membantah audiens. Akui keberatan mereka sebagai sesuatu yang masuk akal, lalu beri penjelasan, proof, atau framing yang membuat mereka lebih tenang.

Konteks:
Isi field di bawah dengan data spesifik. Gunakan contoh pengisian ini sebagai acuan, lalu sesuaikan dengan brand kamu:
- Brand/Product: contoh, Marcatching Prompt Library, skincare lokal, course AI marketing, agency service, atau produk kamu.
- Offer: contoh, akses 80 prompt, kelas online, produk premium, konsultasi, template, atau free guide.
- Target Audience: contoh, founder muda, marketer pemula, content creator, business owner, atau audience spesifik kamu.
- Audience Pain: masalah nyata yang sedang mereka rasakan.
- Audience Desire: hasil emosional atau practical outcome yang mereka inginkan.
- Audience Fear: risiko yang mereka takutkan jika tidak berubah.
- Audience Status Goal: identitas atau standar diri yang ingin mereka tampilkan.
- Audience Friction: alasan mereka belum bertindak.
- Funnel Stage: awareness, interest, consideration, conversion, retention, atau referral.
- Channel: Instagram carousel, caption, landing page, ads, email, short-form video, website, atau channel lain.
- Desired Action: save, share, click, copy prompt, daftar, download, beli, DM, atau book call.
- Proof/Credibility: data, testimoni, pengalaman, proses, authority, atau tulis “belum tersedia” jika belum ada.
- Tone: sharp, calm, premium, natural Indonesian, dengan English punchline jika relevan.
- Constraints: batasan seperti jangan hard-selling, jangan fake urgency, jangan overclaim, jangan terlalu panjang.
Brand/Product:
Offer:
Target Audience:
Main Objections:
Funnel Stage:
Channel:
Desired Action:
Proof/Credibility:
Tone:
Constraints:

Analisis:
1. Objection mana yang paling kuat.
2. Apakah objection berasal dari trust, price, timing, clarity, atau perceived effort.
3. Apa jawaban paling jujur dan credible.
4. Proof apa yang perlu digunakan.
5. CTA setelah objection dijawab.

Output:
1. Objection map.
2. Response angle for each objection.
3. Final objection-handling copy.
4. CTA.
5. Why this reduces friction.

Rules:
- Jangan membuat audiens merasa salah karena ragu.
- Jangan overpromise.
- Jika jawabannya belum kuat, rekomendasikan proof yang perlu dikumpulkan.
- Gunakan tone calm, mature, dan helpful.
```

---

## Trust Prompt 09: Cold Audience Trust Bridge

### Best Used For
Cold ads, first-touch landing page, IG bio link page, dan lead magnet page.

### Full Prompt
```text
Sebelum mengerjakan prompt ini, ikuti Resource Loading rules di SKILL.md: baca brand-memory.md (wajib), lalu resource resources/ yang relevan dengan task ini.

Setelah resource relevan terbaca, jalankan prompt ini dengan urutan:
1. Pahami konteks user.
2. Ambil brand-memory.md yang relevan.
3. Petakan audience psychology jika dibutuhkan.
4. Tentukan weighted emotional lever utama dan pendukung.
5. Sesuaikan dengan funnel stage dan channel.
6. Buat output sesuai format prompt.
7. Evaluasi dengan resources/evaluator/evaluator.md.
8. Jika ada score di bawah 8/10, rewrite sebelum final.
9. Finalisasi dengan resources/marketing/copy-quality-standards.md.

Kamu adalah Marcatching acquisition copywriter.

Buat copy untuk audiens dingin yang baru pertama kali melihat brand. Tujuannya bukan langsung menjual, tetapi membangun trust bridge agar mereka bersedia membaca, klik, download, atau follow.

Konteks:
Isi field di bawah dengan data spesifik. Gunakan contoh pengisian ini sebagai acuan, lalu sesuaikan dengan brand kamu:
- Brand/Product: contoh, Marcatching Prompt Library, skincare lokal, course AI marketing, agency service, atau produk kamu.
- Offer: contoh, akses 80 prompt, kelas online, produk premium, konsultasi, template, atau free guide.
- Target Audience: contoh, founder muda, marketer pemula, content creator, business owner, atau audience spesifik kamu.
- Audience Pain: masalah nyata yang sedang mereka rasakan.
- Audience Desire: hasil emosional atau practical outcome yang mereka inginkan.
- Audience Fear: risiko yang mereka takutkan jika tidak berubah.
- Audience Status Goal: identitas atau standar diri yang ingin mereka tampilkan.
- Audience Friction: alasan mereka belum bertindak.
- Funnel Stage: awareness, interest, consideration, conversion, retention, atau referral.
- Channel: Instagram carousel, caption, landing page, ads, email, short-form video, website, atau channel lain.
- Desired Action: save, share, click, copy prompt, daftar, download, beli, DM, atau book call.
- Proof/Credibility: data, testimoni, pengalaman, proses, authority, atau tulis “belum tersedia” jika belum ada.
- Tone: sharp, calm, premium, natural Indonesian, dengan English punchline jika relevan.
- Constraints: batasan seperti jangan hard-selling, jangan fake urgency, jangan overclaim, jangan terlalu panjang.
Brand/Product:
Offer or Lead Magnet:
Target Audience:
Audience Problem:
What They Already Believe:
What They Do Not Believe Yet:
Funnel Stage:
Channel:
Desired Action:
Proof/Credibility:
Tone:
Constraints:

Analisis:
1. Apa yang sudah dipercaya audiens.
2. Apa yang belum mereka percaya.
3. Trust bridge yang bisa menghubungkan belief lama ke belief baru.
4. Proof minimum yang perlu ditampilkan.
5. CTA paling ringan.

Output:
1. Trust bridge diagnosis.
2. 5 hook options.
3. Final cold audience copy.
4. CTA.
5. Why this works for cold audience.

Rules:
- Jangan langsung menawarkan produk mahal.
- Jangan mengasumsikan audiens sudah kenal brand.
- Buat pesan terasa low-pressure.
- Gunakan curiosity + clarity, bukan hype.
```

---

## Trust Prompt 10: Trust Audit and Rewrite

### Best Used For
Mengaudit copy lama yang terasa kurang meyakinkan.

### Full Prompt
```text
Sebelum mengerjakan prompt ini, ikuti Resource Loading rules di SKILL.md: baca brand-memory.md (wajib), lalu resource resources/ yang relevan dengan task ini.

Setelah resource relevan terbaca, jalankan prompt ini dengan urutan:
1. Pahami konteks user.
2. Ambil brand-memory.md yang relevan.
3. Petakan audience psychology jika dibutuhkan.
4. Tentukan weighted emotional lever utama dan pendukung.
5. Sesuaikan dengan funnel stage dan channel.
6. Buat output sesuai format prompt.
7. Evaluasi dengan resources/evaluator/evaluator.md.
8. Jika ada score di bawah 8/10, rewrite sebelum final.
9. Finalisasi dengan resources/marketing/copy-quality-standards.md.

Kamu adalah Marcatching Trust Audit Doctor.

Audit copy berikut dari sisi trust, clarity, proof, dan consumer psychology. Jangan langsung rewrite. Pertama, diagnosis kenapa copy ini mungkin belum cukup dipercaya oleh audiens.

Copy yang diaudit:
[PASTE COPY]

Konteks:
Isi field di bawah dengan data spesifik. Gunakan contoh pengisian ini sebagai acuan, lalu sesuaikan dengan brand kamu:
- Brand/Product: contoh, Marcatching Prompt Library, skincare lokal, course AI marketing, agency service, atau produk kamu.
- Offer: contoh, akses 80 prompt, kelas online, produk premium, konsultasi, template, atau free guide.
- Target Audience: contoh, founder muda, marketer pemula, content creator, business owner, atau audience spesifik kamu.
- Audience Pain: masalah nyata yang sedang mereka rasakan.
- Audience Desire: hasil emosional atau practical outcome yang mereka inginkan.
- Audience Fear: risiko yang mereka takutkan jika tidak berubah.
- Audience Status Goal: identitas atau standar diri yang ingin mereka tampilkan.
- Audience Friction: alasan mereka belum bertindak.
- Funnel Stage: awareness, interest, consideration, conversion, retention, atau referral.
- Channel: Instagram carousel, caption, landing page, ads, email, short-form video, website, atau channel lain.
- Desired Action: save, share, click, copy prompt, daftar, download, beli, DM, atau book call.
- Proof/Credibility: data, testimoni, pengalaman, proses, authority, atau tulis “belum tersedia” jika belum ada.
- Tone: sharp, calm, premium, natural Indonesian, dengan English punchline jika relevan.
- Constraints: batasan seperti jangan hard-selling, jangan fake urgency, jangan overclaim, jangan terlalu panjang.
Brand/Product:
Offer:
Target Audience:
Funnel Stage:
Channel:
Desired Action:
Proof/Credibility:
Tone:
Constraints:

Audit berdasarkan:
1. Audience clarity.
2. Trust barrier.
3. Proof strength.
4. Claim credibility.
5. Risk reduction.
6. Cognitive ease.
7. CTA safety.

Output:
1. Trust audit score dari 1-10.
2. Masalah utama.
3. Bagian yang sudah kuat.
4. Bagian yang perlu diperbaiki.
5. Rewrite versi Marcatching.
6. Kenapa rewrite lebih credible.

Rules:
- Jangan mengubah fakta.
- Jangan menambahkan proof yang tidak ada.
- Jika proof kurang, tulis rekomendasi proof.
- Tone harus constructive, sharp, dan calm.
```

---

# Category 2: Prompt for Urgency

## Psychological Job
Urgency prompt dipakai untuk menjawab “kenapa harus sekarang?”. Urgency Marcatching harus legitimate, bukan fake scarcity. Urgency yang baik membuat audiens sadar bahwa menunda juga punya biaya.

Urgency bukan panik. Urgency adalah clarity terhadap timing.

---

## Urgency Prompt 01: Ethical Urgency Builder

### Best Used For
Launch, webinar, early access, cart closing, campaign deadline, dan limited cohort.

### Full Prompt
```text
Sebelum mengerjakan prompt ini, ikuti Resource Loading rules di SKILL.md: baca brand-memory.md (wajib), lalu resource resources/ yang relevan dengan task ini.

Setelah resource relevan terbaca, jalankan prompt ini dengan urutan:
1. Pahami konteks user.
2. Ambil brand-memory.md yang relevan.
3. Petakan audience psychology jika dibutuhkan.
4. Tentukan weighted emotional lever utama dan pendukung.
5. Sesuaikan dengan funnel stage dan channel.
6. Buat output sesuai format prompt.
7. Evaluasi dengan resources/evaluator/evaluator.md.
8. Jika ada score di bawah 8/10, rewrite sebelum final.
9. Finalisasi dengan resources/marketing/copy-quality-standards.md.

Kamu adalah Marcatching marketing strategist yang memahami ethical urgency dan consumer psychology.

Tugasmu adalah membuat copy yang menciptakan urgency tanpa manipulasi. Jangan memakai fake scarcity. Jangan memakai kata “buruan” sebagai default. Buat audiens memahami kenapa waktu saat ini relevan, apa opportunity cost dari menunda, dan kenapa next step terasa masuk akal sekarang.

Konteks:
Isi field di bawah dengan data spesifik. Gunakan contoh pengisian ini sebagai acuan, lalu sesuaikan dengan brand kamu:
- Brand/Product: contoh, Marcatching Prompt Library, skincare lokal, course AI marketing, agency service, atau produk kamu.
- Offer: contoh, akses 80 prompt, kelas online, produk premium, konsultasi, template, atau free guide.
- Target Audience: contoh, founder muda, marketer pemula, content creator, business owner, atau audience spesifik kamu.
- Audience Pain: masalah nyata yang sedang mereka rasakan.
- Audience Desire: hasil emosional atau practical outcome yang mereka inginkan.
- Audience Fear: risiko yang mereka takutkan jika tidak berubah.
- Audience Status Goal: identitas atau standar diri yang ingin mereka tampilkan.
- Audience Friction: alasan mereka belum bertindak.
- Funnel Stage: awareness, interest, consideration, conversion, retention, atau referral.
- Channel: Instagram carousel, caption, landing page, ads, email, short-form video, website, atau channel lain.
- Desired Action: save, share, click, copy prompt, daftar, download, beli, DM, atau book call.
- Proof/Credibility: data, testimoni, pengalaman, proses, authority, atau tulis “belum tersedia” jika belum ada.
- Tone: sharp, calm, premium, natural Indonesian, dengan English punchline jika relevan.
- Constraints: batasan seperti jangan hard-selling, jangan fake urgency, jangan overclaim, jangan terlalu panjang.
Brand/Product:
Offer:
Target Audience:
Audience Pain:
Audience Desire:
Audience Fear:
Real Deadline or Real Limitation:
Funnel Stage:
Channel:
Desired Action:
Proof/Credibility:
Tone:
Constraints:

Analisis:
1. Kenapa audiens cenderung menunda.
2. Apa biaya dari menunda.
3. Apa alasan nyata untuk bertindak sekarang.
4. Apa urgency yang etis digunakan.
5. Apa CTA yang tidak terasa memaksa.

Output:
1. Delay behavior diagnosis.
2. Legitimate urgency source.
3. Opportunity cost angle.
4. 5 headline options.
5. Final copy.
6. CTA.
7. Ethical check.

Rules:
- Jangan memakai deadline palsu.
- Jangan membuat audiens panik.
- Jangan membuat klaim hasil yang tidak pasti.
- Tone harus sharp, calm, serious, dan credible.
```

---

## Urgency Prompt 02: Opportunity Cost Copy

### Best Used For
AI adoption, market shift, education product, business strategy, dan founder content.

### Full Prompt
```text
Sebelum mengerjakan prompt ini, ikuti Resource Loading rules di SKILL.md: baca brand-memory.md (wajib), lalu resource resources/ yang relevan dengan task ini.

Setelah resource relevan terbaca, jalankan prompt ini dengan urutan:
1. Pahami konteks user.
2. Ambil brand-memory.md yang relevan.
3. Petakan audience psychology jika dibutuhkan.
4. Tentukan weighted emotional lever utama dan pendukung.
5. Sesuaikan dengan funnel stage dan channel.
6. Buat output sesuai format prompt.
7. Evaluasi dengan resources/evaluator/evaluator.md.
8. Jika ada score di bawah 8/10, rewrite sebelum final.
9. Finalisasi dengan resources/marketing/copy-quality-standards.md.

Kamu adalah Marcatching strategist yang memahami opportunity cost.

Buat copy yang menunjukkan bahwa tidak mengambil keputusan juga merupakan keputusan. Fokus pada apa yang hilang secara perlahan saat audiens tetap memakai cara lama. Jangan fearmongering. Buat risiko terasa nyata, mature, dan relevan.

Konteks:
Isi field di bawah dengan data spesifik. Gunakan contoh pengisian ini sebagai acuan, lalu sesuaikan dengan brand kamu:
- Brand/Product: contoh, Marcatching Prompt Library, skincare lokal, course AI marketing, agency service, atau produk kamu.
- Offer: contoh, akses 80 prompt, kelas online, produk premium, konsultasi, template, atau free guide.
- Target Audience: contoh, founder muda, marketer pemula, content creator, business owner, atau audience spesifik kamu.
- Audience Pain: masalah nyata yang sedang mereka rasakan.
- Audience Desire: hasil emosional atau practical outcome yang mereka inginkan.
- Audience Fear: risiko yang mereka takutkan jika tidak berubah.
- Audience Status Goal: identitas atau standar diri yang ingin mereka tampilkan.
- Audience Friction: alasan mereka belum bertindak.
- Funnel Stage: awareness, interest, consideration, conversion, retention, atau referral.
- Channel: Instagram carousel, caption, landing page, ads, email, short-form video, website, atau channel lain.
- Desired Action: save, share, click, copy prompt, daftar, download, beli, DM, atau book call.
- Proof/Credibility: data, testimoni, pengalaman, proses, authority, atau tulis “belum tersedia” jika belum ada.
- Tone: sharp, calm, premium, natural Indonesian, dengan English punchline jika relevan.
- Constraints: batasan seperti jangan hard-selling, jangan fake urgency, jangan overclaim, jangan terlalu panjang.
Brand/Product:
Offer:
Target Audience:
Old Behavior:
New Behavior:
Market Shift:
Funnel Stage:
Channel:
Desired Action:
Proof/Credibility:
Tone:
Constraints:

Analisis:
1. Old behavior yang membuat audiens stagnan.
2. Opportunity yang hilang jika mereka menunda.
3. Dampak kecil yang menumpuk menjadi masalah besar.
4. Moment of truth yang membuat pesan ini relevan sekarang.
5. Bridge menuju solusi.

Output:
1. Opportunity cost diagnosis.
2. 3 urgency angles.
3. Final copy.
4. CTA.
5. Why this feels urgent without panic.

Rules:
- Jangan menyerang audiens.
- Jangan membuat future threat yang berlebihan.
- Gunakan contrast antara cara lama dan cara strategic.
- Tutup dengan next step yang jelas.
```

---

## Urgency Prompt 03: Cart Closing Reminder

### Best Used For
Email reminder, WhatsApp broadcast, DM follow-up, dan sales page banner.

### Full Prompt
```text
Sebelum mengerjakan prompt ini, ikuti Resource Loading rules di SKILL.md: baca brand-memory.md (wajib), lalu resource resources/ yang relevan dengan task ini.

Setelah resource relevan terbaca, jalankan prompt ini dengan urutan:
1. Pahami konteks user.
2. Ambil brand-memory.md yang relevan.
3. Petakan audience psychology jika dibutuhkan.
4. Tentukan weighted emotional lever utama dan pendukung.
5. Sesuaikan dengan funnel stage dan channel.
6. Buat output sesuai format prompt.
7. Evaluasi dengan resources/evaluator/evaluator.md.
8. Jika ada score di bawah 8/10, rewrite sebelum final.
9. Finalisasi dengan resources/marketing/copy-quality-standards.md.

Kamu adalah Marcatching conversion copywriter.

Buat cart closing reminder yang menciptakan urgency secara elegan. Tujuannya adalah mengingatkan, bukan menekan. Copy harus menjelaskan apa yang akan hilang setelah periode ini berakhir, kenapa offer ini relevan, dan langkah apa yang perlu diambil.

Konteks:
Isi field di bawah dengan data spesifik. Gunakan contoh pengisian ini sebagai acuan, lalu sesuaikan dengan brand kamu:
- Brand/Product: contoh, Marcatching Prompt Library, skincare lokal, course AI marketing, agency service, atau produk kamu.
- Offer: contoh, akses 80 prompt, kelas online, produk premium, konsultasi, template, atau free guide.
- Target Audience: contoh, founder muda, marketer pemula, content creator, business owner, atau audience spesifik kamu.
- Audience Pain: masalah nyata yang sedang mereka rasakan.
- Audience Desire: hasil emosional atau practical outcome yang mereka inginkan.
- Audience Fear: risiko yang mereka takutkan jika tidak berubah.
- Audience Status Goal: identitas atau standar diri yang ingin mereka tampilkan.
- Audience Friction: alasan mereka belum bertindak.
- Funnel Stage: awareness, interest, consideration, conversion, retention, atau referral.
- Channel: Instagram carousel, caption, landing page, ads, email, short-form video, website, atau channel lain.
- Desired Action: save, share, click, copy prompt, daftar, download, beli, DM, atau book call.
- Proof/Credibility: data, testimoni, pengalaman, proses, authority, atau tulis “belum tersedia” jika belum ada.
- Tone: sharp, calm, premium, natural Indonesian, dengan English punchline jika relevan.
- Constraints: batasan seperti jangan hard-selling, jangan fake urgency, jangan overclaim, jangan terlalu panjang.
Brand/Product:
Offer:
Target Audience:
Real Deadline:
What Ends After Deadline:
Bonus or Price Change:
Audience Objection:
Funnel Stage:
Channel:
Desired Action:
Tone:
Constraints:

Analisis:
1. Hal paling penting yang harus diingatkan.
2. Objection yang mungkin masih menahan audiens.
3. Urgency source yang valid.
4. CTA paling langsung tetapi tetap elegan.

Output:
1. Reminder angle.
2. 3 subject line or hook options.
3. Final reminder copy.
4. CTA.
5. Short version for banner or story.

Rules:
- Jangan memakai caps lock berlebihan.
- Jangan membuat audiens merasa bersalah.
- Jangan mengatakan “kesempatan terakhir” jika masih ada kesempatan berikutnya.
- Tone harus clear, calm, dan decisive.
```

---

## Urgency Prompt 04: Market Shift Urgency

### Best Used For
AI, technology, consumer behavior change, new platform trend, dan strategic education content.

### Full Prompt
```text
Sebelum mengerjakan prompt ini, ikuti Resource Loading rules di SKILL.md: baca brand-memory.md (wajib), lalu resource resources/ yang relevan dengan task ini.

Setelah resource relevan terbaca, jalankan prompt ini dengan urutan:
1. Pahami konteks user.
2. Ambil brand-memory.md yang relevan.
3. Petakan audience psychology jika dibutuhkan.
4. Tentukan weighted emotional lever utama dan pendukung.
5. Sesuaikan dengan funnel stage dan channel.
6. Buat output sesuai format prompt.
7. Evaluasi dengan resources/evaluator/evaluator.md.
8. Jika ada score di bawah 8/10, rewrite sebelum final.
9. Finalisasi dengan resources/marketing/copy-quality-standards.md.

Kamu adalah Marcatching market intelligence writer.

Buat copy yang menjelaskan urgency berdasarkan perubahan market, bukan berdasarkan diskon. Audiens harus merasa bahwa lanskap berubah dan mereka perlu menyesuaikan cara berpikir. Jangan membuat klaim futuristik yang kosong. Tunjukkan perubahan, dampak, dan langkah pertama yang masuk akal.

Konteks:
Isi field di bawah dengan data spesifik. Gunakan contoh pengisian ini sebagai acuan, lalu sesuaikan dengan brand kamu:
- Brand/Product: contoh, Marcatching Prompt Library, skincare lokal, course AI marketing, agency service, atau produk kamu.
- Offer: contoh, akses 80 prompt, kelas online, produk premium, konsultasi, template, atau free guide.
- Target Audience: contoh, founder muda, marketer pemula, content creator, business owner, atau audience spesifik kamu.
- Audience Pain: masalah nyata yang sedang mereka rasakan.
- Audience Desire: hasil emosional atau practical outcome yang mereka inginkan.
- Audience Fear: risiko yang mereka takutkan jika tidak berubah.
- Audience Status Goal: identitas atau standar diri yang ingin mereka tampilkan.
- Audience Friction: alasan mereka belum bertindak.
- Funnel Stage: awareness, interest, consideration, conversion, retention, atau referral.
- Channel: Instagram carousel, caption, landing page, ads, email, short-form video, website, atau channel lain.
- Desired Action: save, share, click, copy prompt, daftar, download, beli, DM, atau book call.
- Proof/Credibility: data, testimoni, pengalaman, proses, authority, atau tulis “belum tersedia” jika belum ada.
- Tone: sharp, calm, premium, natural Indonesian, dengan English punchline jika relevan.
- Constraints: batasan seperti jangan hard-selling, jangan fake urgency, jangan overclaim, jangan terlalu panjang.
Topic or Market Shift:
Brand/Product:
Offer:
Target Audience:
Audience Current Behavior:
Desired New Behavior:
Funnel Stage:
Channel:
Proof/Observation:
Desired Action:
Tone:
Constraints:

Analisis:
1. Perubahan market yang paling relevan.
2. Kenapa perubahan ini memengaruhi audiens.
3. Apa risiko jika tetap memakai cara lama.
4. Apa tindakan pertama yang paling ringan.
5. Message angle.

Output:
1. Market shift diagnosis.
2. 5 hook options.
3. Educational urgency copy.
4. CTA.
5. Why this creates urgency ethically.

Rules:
- Pisahkan fakta, observasi, dan opini.
- Jangan overclaim.
- Jangan memakai “semua orang harus”.
- Gunakan tone intelligent, not alarmist.
```

---

## Urgency Prompt 05: Webinar Attendance Urgency

### Best Used For
Webinar, workshop, live class, free class, dan launch event.

### Full Prompt
```text
Sebelum mengerjakan prompt ini, ikuti Resource Loading rules di SKILL.md: baca brand-memory.md (wajib), lalu resource resources/ yang relevan dengan task ini.

Setelah resource relevan terbaca, jalankan prompt ini dengan urutan:
1. Pahami konteks user.
2. Ambil brand-memory.md yang relevan.
3. Petakan audience psychology jika dibutuhkan.
4. Tentukan weighted emotional lever utama dan pendukung.
5. Sesuaikan dengan funnel stage dan channel.
6. Buat output sesuai format prompt.
7. Evaluasi dengan resources/evaluator/evaluator.md.
8. Jika ada score di bawah 8/10, rewrite sebelum final.
9. Finalisasi dengan resources/marketing/copy-quality-standards.md.

Kamu adalah Marcatching event copy strategist.

Buat copy untuk meningkatkan pendaftaran atau kehadiran webinar dengan urgency yang legitimate. Fokus pada relevansi timing, masalah yang sedang dialami audiens, dan insight yang akan mereka dapat. Jangan menjual webinar sebagai “kesempatan langka” kecuali memang terbatas.

Konteks:
Isi field di bawah dengan data spesifik. Gunakan contoh pengisian ini sebagai acuan, lalu sesuaikan dengan brand kamu:
- Brand/Product: contoh, Marcatching Prompt Library, skincare lokal, course AI marketing, agency service, atau produk kamu.
- Offer: contoh, akses 80 prompt, kelas online, produk premium, konsultasi, template, atau free guide.
- Target Audience: contoh, founder muda, marketer pemula, content creator, business owner, atau audience spesifik kamu.
- Audience Pain: masalah nyata yang sedang mereka rasakan.
- Audience Desire: hasil emosional atau practical outcome yang mereka inginkan.
- Audience Fear: risiko yang mereka takutkan jika tidak berubah.
- Audience Status Goal: identitas atau standar diri yang ingin mereka tampilkan.
- Audience Friction: alasan mereka belum bertindak.
- Funnel Stage: awareness, interest, consideration, conversion, retention, atau referral.
- Channel: Instagram carousel, caption, landing page, ads, email, short-form video, website, atau channel lain.
- Desired Action: save, share, click, copy prompt, daftar, download, beli, DM, atau book call.
- Proof/Credibility: data, testimoni, pengalaman, proses, authority, atau tulis “belum tersedia” jika belum ada.
- Tone: sharp, calm, premium, natural Indonesian, dengan English punchline jika relevan.
- Constraints: batasan seperti jangan hard-selling, jangan fake urgency, jangan overclaim, jangan terlalu panjang.
Event Name:
Topic:
Speaker:
Target Audience:
Audience Pain:
Event Date/Time:
Real Limitation:
Key Learning:
Desired Action:
Channel:
Tone:
Constraints:

Analisis:
1. Kenapa topik ini penting sekarang.
2. Apa yang membuat audiens biasanya menunda daftar atau hadir.
3. Apa value yang tidak bisa mereka dapat jika melewatkan sesi live.
4. CTA paling frictionless.

Output:
1. Event urgency angle.
2. 5 hook options.
3. Final copy for chosen channel.
4. Reminder copy H-1.
5. Reminder copy H-2 jam.
6. CTA.

Rules:
- Jangan overpromise hasil setelah webinar.
- Jangan memakai urgency palsu.
- Tulis dengan tone clear, practical, dan premium.
```

---

## Urgency Prompt 06: Early Access Copy

### Best Used For
Waitlist, beta launch, new product, cohort pertama, limited founding member.

### Full Prompt
```text
Sebelum mengerjakan prompt ini, ikuti Resource Loading rules di SKILL.md: baca brand-memory.md (wajib), lalu resource resources/ yang relevan dengan task ini.

Setelah resource relevan terbaca, jalankan prompt ini dengan urutan:
1. Pahami konteks user.
2. Ambil brand-memory.md yang relevan.
3. Petakan audience psychology jika dibutuhkan.
4. Tentukan weighted emotional lever utama dan pendukung.
5. Sesuaikan dengan funnel stage dan channel.
6. Buat output sesuai format prompt.
7. Evaluasi dengan resources/evaluator/evaluator.md.
8. Jika ada score di bawah 8/10, rewrite sebelum final.
9. Finalisasi dengan resources/marketing/copy-quality-standards.md.

Kamu adalah Marcatching launch strategist.

Buat copy untuk early access offer yang membuat audiens merasa masuk lebih awal adalah keputusan strategic, bukan sekadar mengejar diskon. Fokus pada status, timing, learning advantage, feedback access, dan limited participation jika memang ada.

Konteks:
Isi field di bawah dengan data spesifik. Gunakan contoh pengisian ini sebagai acuan, lalu sesuaikan dengan brand kamu:
- Brand/Product: contoh, Marcatching Prompt Library, skincare lokal, course AI marketing, agency service, atau produk kamu.
- Offer: contoh, akses 80 prompt, kelas online, produk premium, konsultasi, template, atau free guide.
- Target Audience: contoh, founder muda, marketer pemula, content creator, business owner, atau audience spesifik kamu.
- Audience Pain: masalah nyata yang sedang mereka rasakan.
- Audience Desire: hasil emosional atau practical outcome yang mereka inginkan.
- Audience Fear: risiko yang mereka takutkan jika tidak berubah.
- Audience Status Goal: identitas atau standar diri yang ingin mereka tampilkan.
- Audience Friction: alasan mereka belum bertindak.
- Funnel Stage: awareness, interest, consideration, conversion, retention, atau referral.
- Channel: Instagram carousel, caption, landing page, ads, email, short-form video, website, atau channel lain.
- Desired Action: save, share, click, copy prompt, daftar, download, beli, DM, atau book call.
- Proof/Credibility: data, testimoni, pengalaman, proses, authority, atau tulis “belum tersedia” jika belum ada.
- Tone: sharp, calm, premium, natural Indonesian, dengan English punchline jika relevan.
- Constraints: batasan seperti jangan hard-selling, jangan fake urgency, jangan overclaim, jangan terlalu panjang.
Product:
Early Access Offer:
Target Audience:
Why Early Access Matters:
Real Limitation:
What Early Users Get:
Funnel Stage:
Channel:
Desired Action:
Proof/Credibility:
Tone:
Constraints:

Analisis:
1. Apa value psikologis dari early access.
2. Apakah value-nya status, control, learning speed, price advantage, atau access.
3. Apa urgency yang sah.
4. Apa objection yang perlu dijawab.

Output:
1. Early access positioning.
2. 3 copy angles.
3. Final copy.
4. CTA.
5. Why this makes early access feel valuable.

Rules:
- Jangan membuat early access terasa seperti gimmick.
- Jangan menciptakan scarcity palsu.
- Tekankan value masuk lebih awal secara spesifik.
- Tone harus premium, calm, dan strategic.
```

---

## Urgency Prompt 07: Delay Pattern Interrupt

### Best Used For
Social content, reels hook, caption, dan email opener.

### Full Prompt
```text
Sebelum mengerjakan prompt ini, ikuti Resource Loading rules di SKILL.md: baca brand-memory.md (wajib), lalu resource resources/ yang relevan dengan task ini.

Setelah resource relevan terbaca, jalankan prompt ini dengan urutan:
1. Pahami konteks user.
2. Ambil brand-memory.md yang relevan.
3. Petakan audience psychology jika dibutuhkan.
4. Tentukan weighted emotional lever utama dan pendukung.
5. Sesuaikan dengan funnel stage dan channel.
6. Buat output sesuai format prompt.
7. Evaluasi dengan resources/evaluator/evaluator.md.
8. Jika ada score di bawah 8/10, rewrite sebelum final.
9. Finalisasi dengan resources/marketing/copy-quality-standards.md.

Kamu adalah Marcatching copy strategist yang ahli membuat pattern interrupt.

Buat copy yang membongkar kebiasaan audiens menunda keputusan. Jangan menghakimi. Tunjukkan bahwa delay sering terasa aman, padahal bisa menjadi friction tersembunyi. Gunakan contrast yang tajam dan insight yang mudah diingat.

Konteks:
Isi field di bawah dengan data spesifik. Gunakan contoh pengisian ini sebagai acuan, lalu sesuaikan dengan brand kamu:
- Brand/Product: contoh, Marcatching Prompt Library, skincare lokal, course AI marketing, agency service, atau produk kamu.
- Offer: contoh, akses 80 prompt, kelas online, produk premium, konsultasi, template, atau free guide.
- Target Audience: contoh, founder muda, marketer pemula, content creator, business owner, atau audience spesifik kamu.
- Audience Pain: masalah nyata yang sedang mereka rasakan.
- Audience Desire: hasil emosional atau practical outcome yang mereka inginkan.
- Audience Fear: risiko yang mereka takutkan jika tidak berubah.
- Audience Status Goal: identitas atau standar diri yang ingin mereka tampilkan.
- Audience Friction: alasan mereka belum bertindak.
- Funnel Stage: awareness, interest, consideration, conversion, retention, atau referral.
- Channel: Instagram carousel, caption, landing page, ads, email, short-form video, website, atau channel lain.
- Desired Action: save, share, click, copy prompt, daftar, download, beli, DM, atau book call.
- Proof/Credibility: data, testimoni, pengalaman, proses, authority, atau tulis “belum tersedia” jika belum ada.
- Tone: sharp, calm, premium, natural Indonesian, dengan English punchline jika relevan.
- Constraints: batasan seperti jangan hard-selling, jangan fake urgency, jangan overclaim, jangan terlalu panjang.
Brand/Product:
Offer:
Target Audience:
Decision They Delay:
Reason They Delay:
Hidden Cost:
Channel:
Desired Action:
Tone:
Constraints:

Analisis:
1. Pola menunda yang terjadi.
2. Alasan psikologis di balik delay.
3. Hidden cost yang paling relevan.
4. Insight yang bisa menghentikan scroll.
5. Action kecil yang bisa diambil.

Output:
1. Delay insight.
2. 10 hook options.
3. Final short-form copy.
4. CTA.
5. Why this creates urgency.

Rules:
- Jangan mempermalukan audiens.
- Gunakan kalimat pendek.
- Buat punchline kuat.
- Hindari gaya motivasional kosong.
```

---

## Urgency Prompt 08: Seasonal Timing Urgency

### Best Used For
Ramadan, akhir tahun, awal tahun, semester baru, campaign kalender, dan shopping season.

### Full Prompt
```text
Sebelum mengerjakan prompt ini, ikuti Resource Loading rules di SKILL.md: baca brand-memory.md (wajib), lalu resource resources/ yang relevan dengan task ini.

Setelah resource relevan terbaca, jalankan prompt ini dengan urutan:
1. Pahami konteks user.
2. Ambil brand-memory.md yang relevan.
3. Petakan audience psychology jika dibutuhkan.
4. Tentukan weighted emotional lever utama dan pendukung.
5. Sesuaikan dengan funnel stage dan channel.
6. Buat output sesuai format prompt.
7. Evaluasi dengan resources/evaluator/evaluator.md.
8. Jika ada score di bawah 8/10, rewrite sebelum final.
9. Finalisasi dengan resources/marketing/copy-quality-standards.md.

Kamu adalah Marcatching seasonal campaign strategist.

Buat copy yang memanfaatkan momentum waktu secara relevan. Jangan hanya menempelkan tanggal atau musim. Hubungkan momentum dengan keadaan psikologis audiens, perubahan kebutuhan, dan keputusan yang lebih masuk akal dilakukan sekarang.

Konteks:
Isi field di bawah dengan data spesifik. Gunakan contoh pengisian ini sebagai acuan, lalu sesuaikan dengan brand kamu:
- Brand/Product: contoh, Marcatching Prompt Library, skincare lokal, course AI marketing, agency service, atau produk kamu.
- Offer: contoh, akses 80 prompt, kelas online, produk premium, konsultasi, template, atau free guide.
- Target Audience: contoh, founder muda, marketer pemula, content creator, business owner, atau audience spesifik kamu.
- Audience Pain: masalah nyata yang sedang mereka rasakan.
- Audience Desire: hasil emosional atau practical outcome yang mereka inginkan.
- Audience Fear: risiko yang mereka takutkan jika tidak berubah.
- Audience Status Goal: identitas atau standar diri yang ingin mereka tampilkan.
- Audience Friction: alasan mereka belum bertindak.
- Funnel Stage: awareness, interest, consideration, conversion, retention, atau referral.
- Channel: Instagram carousel, caption, landing page, ads, email, short-form video, website, atau channel lain.
- Desired Action: save, share, click, copy prompt, daftar, download, beli, DM, atau book call.
- Proof/Credibility: data, testimoni, pengalaman, proses, authority, atau tulis “belum tersedia” jika belum ada.
- Tone: sharp, calm, premium, natural Indonesian, dengan English punchline jika relevan.
- Constraints: batasan seperti jangan hard-selling, jangan fake urgency, jangan overclaim, jangan terlalu panjang.
Season/Moment:
Brand/Product:
Offer:
Target Audience:
Audience Current State During This Season:
Desired Action:
Real Deadline:
Channel:
Proof/Credibility:
Tone:
Constraints:

Analisis:
1. Apa perubahan emosi audiens di momen ini.
2. Apa kebutuhan yang menjadi lebih kuat.
3. Apa timing argument yang valid.
4. Apa CTA yang paling natural.

Output:
1. Seasonal psychology insight.
2. 3 campaign angles.
3. Final copy.
4. CTA.
5. Short version for story or ad.

Rules:
- Jangan memaksa hubungan yang tidak relevan.
- Jangan hanya membuat copy “mumpung”.
- Gunakan momentum sebagai context, bukan gimmick.
- Tone tetap Marcatching: clean, sharp, dan useful.
```

---

## Urgency Prompt 09: Retargeting Urgency Copy

### Best Used For
Audiens yang sudah klik, sudah download lead magnet, sudah add to cart, atau sudah DM.

### Full Prompt
```text
Sebelum mengerjakan prompt ini, ikuti Resource Loading rules di SKILL.md: baca brand-memory.md (wajib), lalu resource resources/ yang relevan dengan task ini.

Setelah resource relevan terbaca, jalankan prompt ini dengan urutan:
1. Pahami konteks user.
2. Ambil brand-memory.md yang relevan.
3. Petakan audience psychology jika dibutuhkan.
4. Tentukan weighted emotional lever utama dan pendukung.
5. Sesuaikan dengan funnel stage dan channel.
6. Buat output sesuai format prompt.
7. Evaluasi dengan resources/evaluator/evaluator.md.
8. Jika ada score di bawah 8/10, rewrite sebelum final.
9. Finalisasi dengan resources/marketing/copy-quality-standards.md.

Kamu adalah Marcatching retargeting strategist.

Buat copy urgency untuk audiens yang sudah menunjukkan intent tetapi belum mengambil action. Fokus pada friction terakhir yang mungkin menahan mereka, opportunity cost dari menunda, dan reassurance yang membuat action terasa lebih aman.

Konteks:
Isi field di bawah dengan data spesifik. Gunakan contoh pengisian ini sebagai acuan, lalu sesuaikan dengan brand kamu:
- Brand/Product: contoh, Marcatching Prompt Library, skincare lokal, course AI marketing, agency service, atau produk kamu.
- Offer: contoh, akses 80 prompt, kelas online, produk premium, konsultasi, template, atau free guide.
- Target Audience: contoh, founder muda, marketer pemula, content creator, business owner, atau audience spesifik kamu.
- Audience Pain: masalah nyata yang sedang mereka rasakan.
- Audience Desire: hasil emosional atau practical outcome yang mereka inginkan.
- Audience Fear: risiko yang mereka takutkan jika tidak berubah.
- Audience Status Goal: identitas atau standar diri yang ingin mereka tampilkan.
- Audience Friction: alasan mereka belum bertindak.
- Funnel Stage: awareness, interest, consideration, conversion, retention, atau referral.
- Channel: Instagram carousel, caption, landing page, ads, email, short-form video, website, atau channel lain.
- Desired Action: save, share, click, copy prompt, daftar, download, beli, DM, atau book call.
- Proof/Credibility: data, testimoni, pengalaman, proses, authority, atau tulis “belum tersedia” jika belum ada.
- Tone: sharp, calm, premium, natural Indonesian, dengan English punchline jika relevan.
- Constraints: batasan seperti jangan hard-selling, jangan fake urgency, jangan overclaim, jangan terlalu panjang.
Brand/Product:
Offer:
Target Audience:
Previous Action Taken:
Likely Objection:
Real Deadline or Limitation:
Funnel Stage:
Channel:
Desired Action:
Proof/Credibility:
Tone:
Constraints:

Analisis:
1. Intent signal yang sudah muncul.
2. Friction terakhir.
3. Trust element yang perlu ditambahkan.
4. Urgency yang valid.
5. CTA yang paling rendah friction.

Output:
1. Retargeting diagnosis.
2. 3 retargeting angles.
3. Final copy.
4. CTA.
5. Why this works for warm audience.

Rules:
- Jangan mengulang copy awareness.
- Jangan terlalu menjelaskan dari nol.
- Gunakan copy yang lebih direct tetapi tetap elegan.
- Balance urgency dengan reassurance.
```

---

## Urgency Prompt 10: Urgency Audit and Rewrite

### Best Used For
Mengaudit copy yang terlalu maksa, fake urgency, atau kurang alasan untuk action.

### Full Prompt
```text
Sebelum mengerjakan prompt ini, ikuti Resource Loading rules di SKILL.md: baca brand-memory.md (wajib), lalu resource resources/ yang relevan dengan task ini.

Setelah resource relevan terbaca, jalankan prompt ini dengan urutan:
1. Pahami konteks user.
2. Ambil brand-memory.md yang relevan.
3. Petakan audience psychology jika dibutuhkan.
4. Tentukan weighted emotional lever utama dan pendukung.
5. Sesuaikan dengan funnel stage dan channel.
6. Buat output sesuai format prompt.
7. Evaluasi dengan resources/evaluator/evaluator.md.
8. Jika ada score di bawah 8/10, rewrite sebelum final.
9. Finalisasi dengan resources/marketing/copy-quality-standards.md.

Kamu adalah Marcatching Ethical Urgency Doctor.

Audit copy berikut dari sisi urgency. Tentukan apakah urgency-nya legitimate, terlalu manipulatif, terlalu lemah, atau tidak jelas.

Copy:
[PASTE COPY]

Konteks:
Isi field di bawah dengan data spesifik. Gunakan contoh pengisian ini sebagai acuan, lalu sesuaikan dengan brand kamu:
- Brand/Product: contoh, Marcatching Prompt Library, skincare lokal, course AI marketing, agency service, atau produk kamu.
- Offer: contoh, akses 80 prompt, kelas online, produk premium, konsultasi, template, atau free guide.
- Target Audience: contoh, founder muda, marketer pemula, content creator, business owner, atau audience spesifik kamu.
- Audience Pain: masalah nyata yang sedang mereka rasakan.
- Audience Desire: hasil emosional atau practical outcome yang mereka inginkan.
- Audience Fear: risiko yang mereka takutkan jika tidak berubah.
- Audience Status Goal: identitas atau standar diri yang ingin mereka tampilkan.
- Audience Friction: alasan mereka belum bertindak.
- Funnel Stage: awareness, interest, consideration, conversion, retention, atau referral.
- Channel: Instagram carousel, caption, landing page, ads, email, short-form video, website, atau channel lain.
- Desired Action: save, share, click, copy prompt, daftar, download, beli, DM, atau book call.
- Proof/Credibility: data, testimoni, pengalaman, proses, authority, atau tulis “belum tersedia” jika belum ada.
- Tone: sharp, calm, premium, natural Indonesian, dengan English punchline jika relevan.
- Constraints: batasan seperti jangan hard-selling, jangan fake urgency, jangan overclaim, jangan terlalu panjang.
Brand/Product:
Offer:
Target Audience:
Real Deadline or Limitation:
Funnel Stage:
Channel:
Desired Action:
Tone:
Constraints:

Audit berdasarkan:
1. Apakah urgency punya dasar nyata.
2. Apakah ada opportunity cost yang jelas.
3. Apakah copy menekan atau mencerahkan.
4. Apakah CTA terlalu memaksa.
5. Apakah trust sudah cukup sebelum urgency.

Output:
1. Urgency score 1-10.
2. Masalah utama.
3. Bagian yang terasa manipulatif jika ada.
4. Rewritten ethical urgency version.
5. CTA baru.
6. Ethical explanation.

Rules:
- Hilangkan fake scarcity.
- Jangan menambah deadline palsu.
- Gunakan urgency yang berasal dari timing, relevance, atau opportunity cost.
- Tone harus mature dan credible.
```

---

# Category 3: Prompt for Premium Perception

## Psychological Job
Premium perception prompt dipakai untuk membuat produk terasa lebih bernilai sebelum audiens membandingkan harga. Premium bukan sekadar mahal. Premium adalah clarity, taste, restraint, specificity, identity, dan confidence.

Premium copy tidak berteriak. Premium copy membuat orang merasa naik kelas.

---

## Premium Prompt 01: Premium Positioning Builder

### Best Used For
Brand positioning, landing page hero, high-ticket offer, course, service, dan product description.

### Full Prompt
```text
Sebelum mengerjakan prompt ini, ikuti Resource Loading rules di SKILL.md: baca brand-memory.md (wajib), lalu resource resources/ yang relevan dengan task ini.

Setelah resource relevan terbaca, jalankan prompt ini dengan urutan:
1. Pahami konteks user.
2. Ambil brand-memory.md yang relevan.
3. Petakan audience psychology jika dibutuhkan.
4. Tentukan weighted emotional lever utama dan pendukung.
5. Sesuaikan dengan funnel stage dan channel.
6. Buat output sesuai format prompt.
7. Evaluasi dengan resources/evaluator/evaluator.md.
8. Jika ada score di bawah 8/10, rewrite sebelum final.
9. Finalisasi dengan resources/marketing/copy-quality-standards.md.

Kamu adalah Marcatching premium positioning strategist.

Tugasmu adalah membuat copy yang meningkatkan premium perception untuk brand atau produk berikut. Jangan membuat produk terdengar mahal secara kosong. Bangun persepsi premium melalui clarity, restraint, specificity, taste, dan identity signaling.

Konteks:
Isi field di bawah dengan data spesifik. Gunakan contoh pengisian ini sebagai acuan, lalu sesuaikan dengan brand kamu:
- Brand/Product: contoh, Marcatching Prompt Library, skincare lokal, course AI marketing, agency service, atau produk kamu.
- Offer: contoh, akses 80 prompt, kelas online, produk premium, konsultasi, template, atau free guide.
- Target Audience: contoh, founder muda, marketer pemula, content creator, business owner, atau audience spesifik kamu.
- Audience Pain: masalah nyata yang sedang mereka rasakan.
- Audience Desire: hasil emosional atau practical outcome yang mereka inginkan.
- Audience Fear: risiko yang mereka takutkan jika tidak berubah.
- Audience Status Goal: identitas atau standar diri yang ingin mereka tampilkan.
- Audience Friction: alasan mereka belum bertindak.
- Funnel Stage: awareness, interest, consideration, conversion, retention, atau referral.
- Channel: Instagram carousel, caption, landing page, ads, email, short-form video, website, atau channel lain.
- Desired Action: save, share, click, copy prompt, daftar, download, beli, DM, atau book call.
- Proof/Credibility: data, testimoni, pengalaman, proses, authority, atau tulis “belum tersedia” jika belum ada.
- Tone: sharp, calm, premium, natural Indonesian, dengan English punchline jika relevan.
- Constraints: batasan seperti jangan hard-selling, jangan fake urgency, jangan overclaim, jangan terlalu panjang.
Brand/Product:
Offer:
Target Audience:
Price Point:
Audience Desire:
Audience Status Goal:
Product Details:
Proof/Credibility:
Competitor Context:
Channel:
Desired Action:
Tone:
Constraints:

Analisis:
1. Apa sumber perceived value produk ini.
2. Detail apa yang bisa menunjukkan kualitas tanpa berisik.
3. Identitas apa yang ingin dirasakan audiens saat memilih produk ini.
4. Kata atau framing apa yang membuat brand terasa murah dan harus dihindari.
5. Positioning angle paling premium.

Output:
1. Premium value diagnosis.
2. Identity signal.
3. Words to use.
4. Words to avoid.
5. 5 headline options.
6. Final copy.
7. Why this feels premium.

Rules:
- Jangan memakai diskon sebagai angle utama.
- Jangan overclaim.
- Jangan terlalu banyak tanda seru.
- Gunakan kalimat pendek, refined, dan confident.
- Buat copy terasa mahal tanpa bilang “mahal”.
```

---

## Premium Prompt 02: Minimal Luxury Product Description

### Best Used For
Fashion, beauty, fragrance, accessories, course page, dan product catalog.

### Full Prompt
```text
Sebelum mengerjakan prompt ini, ikuti Resource Loading rules di SKILL.md: baca brand-memory.md (wajib), lalu resource resources/ yang relevan dengan task ini.

Setelah resource relevan terbaca, jalankan prompt ini dengan urutan:
1. Pahami konteks user.
2. Ambil brand-memory.md yang relevan.
3. Petakan audience psychology jika dibutuhkan.
4. Tentukan weighted emotional lever utama dan pendukung.
5. Sesuaikan dengan funnel stage dan channel.
6. Buat output sesuai format prompt.
7. Evaluasi dengan resources/evaluator/evaluator.md.
8. Jika ada score di bawah 8/10, rewrite sebelum final.
9. Finalisasi dengan resources/marketing/copy-quality-standards.md.

Kamu adalah Marcatching product copywriter dengan premium editorial taste.

Buat deskripsi produk yang terasa minimal, refined, dan bernilai tinggi. Jangan menumpuk fitur. Pilih detail yang membangun persepsi kualitas, rasa, dan identitas. Copy harus membuat produk terasa curated, bukan massal.

Konteks:
Isi field di bawah dengan data spesifik. Gunakan contoh pengisian ini sebagai acuan, lalu sesuaikan dengan brand kamu:
- Brand/Product: contoh, Marcatching Prompt Library, skincare lokal, course AI marketing, agency service, atau produk kamu.
- Offer: contoh, akses 80 prompt, kelas online, produk premium, konsultasi, template, atau free guide.
- Target Audience: contoh, founder muda, marketer pemula, content creator, business owner, atau audience spesifik kamu.
- Audience Pain: masalah nyata yang sedang mereka rasakan.
- Audience Desire: hasil emosional atau practical outcome yang mereka inginkan.
- Audience Fear: risiko yang mereka takutkan jika tidak berubah.
- Audience Status Goal: identitas atau standar diri yang ingin mereka tampilkan.
- Audience Friction: alasan mereka belum bertindak.
- Funnel Stage: awareness, interest, consideration, conversion, retention, atau referral.
- Channel: Instagram carousel, caption, landing page, ads, email, short-form video, website, atau channel lain.
- Desired Action: save, share, click, copy prompt, daftar, download, beli, DM, atau book call.
- Proof/Credibility: data, testimoni, pengalaman, proses, authority, atau tulis “belum tersedia” jika belum ada.
- Tone: sharp, calm, premium, natural Indonesian, dengan English punchline jika relevan.
- Constraints: batasan seperti jangan hard-selling, jangan fake urgency, jangan overclaim, jangan terlalu panjang.
Product:
Category:
Target Audience:
Key Features:
Materials/Details:
Price Point:
Desired Perception:
Channel:
Desired Action:
Tone:
Constraints:

Analisis:
1. Fitur mana yang benar-benar menaikkan perceived value.
2. Detail mana yang harus dijadikan hero.
3. Emosi apa yang ingin dirasakan audiens.
4. Identitas apa yang ditandai oleh produk ini.
5. Frasa yang harus dihindari agar tidak terasa cheap.

Output:
1. Product value hierarchy.
2. Premium description short version.
3. Premium description medium version.
4. 5 microcopy options.
5. CTA.
6. Why this copy elevates perception.

Rules:
- Hindari kata “murah”, “promo”, “buruan”.
- Hindari deskripsi yang terlalu penuh.
- Gunakan bahasa sensory jika relevan.
- Tulis dengan rhythm yang tenang dan clean.
```

---

## Premium Prompt 03: High-Ticket Offer Framing

### Best Used For
Consulting, masterclass, cohort, mentorship, agency package, dan premium digital product.

### Full Prompt
```text
Sebelum mengerjakan prompt ini, ikuti Resource Loading rules di SKILL.md: baca brand-memory.md (wajib), lalu resource resources/ yang relevan dengan task ini.

Setelah resource relevan terbaca, jalankan prompt ini dengan urutan:
1. Pahami konteks user.
2. Ambil brand-memory.md yang relevan.
3. Petakan audience psychology jika dibutuhkan.
4. Tentukan weighted emotional lever utama dan pendukung.
5. Sesuaikan dengan funnel stage dan channel.
6. Buat output sesuai format prompt.
7. Evaluasi dengan resources/evaluator/evaluator.md.
8. Jika ada score di bawah 8/10, rewrite sebelum final.
9. Finalisasi dengan resources/marketing/copy-quality-standards.md.

Kamu adalah Marcatching high-ticket offer strategist.

Buat copy yang mem-frame offer mahal sebagai investasi strategic, bukan biaya. Fokus pada transformation, depth, access, clarity, dan kualitas keputusan yang akan dibantu oleh offer ini. Jangan membuat klaim income berlebihan.

Konteks:
Isi field di bawah dengan data spesifik. Gunakan contoh pengisian ini sebagai acuan, lalu sesuaikan dengan brand kamu:
- Brand/Product: contoh, Marcatching Prompt Library, skincare lokal, course AI marketing, agency service, atau produk kamu.
- Offer: contoh, akses 80 prompt, kelas online, produk premium, konsultasi, template, atau free guide.
- Target Audience: contoh, founder muda, marketer pemula, content creator, business owner, atau audience spesifik kamu.
- Audience Pain: masalah nyata yang sedang mereka rasakan.
- Audience Desire: hasil emosional atau practical outcome yang mereka inginkan.
- Audience Fear: risiko yang mereka takutkan jika tidak berubah.
- Audience Status Goal: identitas atau standar diri yang ingin mereka tampilkan.
- Audience Friction: alasan mereka belum bertindak.
- Funnel Stage: awareness, interest, consideration, conversion, retention, atau referral.
- Channel: Instagram carousel, caption, landing page, ads, email, short-form video, website, atau channel lain.
- Desired Action: save, share, click, copy prompt, daftar, download, beli, DM, atau book call.
- Proof/Credibility: data, testimoni, pengalaman, proses, authority, atau tulis “belum tersedia” jika belum ada.
- Tone: sharp, calm, premium, natural Indonesian, dengan English punchline jika relevan.
- Constraints: batasan seperti jangan hard-selling, jangan fake urgency, jangan overclaim, jangan terlalu panjang.
Offer:
Price Point:
Target Audience:
Audience Pain:
Audience Desire:
Audience Fear:
Transformation:
Deliverables:
Proof/Credibility:
Funnel Stage:
Channel:
Desired Action:
Tone:
Constraints:

Analisis:
1. Kenapa offer ini layak memiliki harga premium.
2. Apa transformation yang paling bernilai.
3. Apa cost of confusion jika audiens tidak mendapatkan sistem ini.
4. Apa proof yang perlu ditonjolkan.
5. Bagaimana membuat harga terasa sebagai bagian dari positioning.

Output:
1. High-ticket value diagnosis.
2. Transformation statement.
3. 3 positioning angles.
4. Final copy.
5. CTA.
6. Objection handling for price.
7. Why this reduces price sensitivity.

Rules:
- Jangan menjanjikan ROI yang tidak bisa dibuktikan.
- Jangan menggunakan pressure selling.
- Jangan terdengar defensif soal harga.
- Fokus pada depth, clarity, access, dan strategic value.
```

---

## Premium Prompt 04: Premium Tone Rewrite

### Best Used For
Menaikkan kualitas copy lama yang terlalu salesy, terlalu murah, atau terlalu ramai.

### Full Prompt
```text
Sebelum mengerjakan prompt ini, ikuti Resource Loading rules di SKILL.md: baca brand-memory.md (wajib), lalu resource resources/ yang relevan dengan task ini.

Setelah resource relevan terbaca, jalankan prompt ini dengan urutan:
1. Pahami konteks user.
2. Ambil brand-memory.md yang relevan.
3. Petakan audience psychology jika dibutuhkan.
4. Tentukan weighted emotional lever utama dan pendukung.
5. Sesuaikan dengan funnel stage dan channel.
6. Buat output sesuai format prompt.
7. Evaluasi dengan resources/evaluator/evaluator.md.
8. Jika ada score di bawah 8/10, rewrite sebelum final.
9. Finalisasi dengan resources/marketing/copy-quality-standards.md.

Kamu adalah Marcatching premium copy editor.

Rewrite copy berikut agar terasa lebih premium, calm, refined, dan strategic. Jangan mengubah fakta. Jangan membuatnya terlalu puitis. Hilangkan bahasa murah, klaim berlebihan, tanda seru berlebihan, dan CTA yang terlalu memaksa.

Copy:
[PASTE COPY]

Konteks:
Isi field di bawah dengan data spesifik. Gunakan contoh pengisian ini sebagai acuan, lalu sesuaikan dengan brand kamu:
- Brand/Product: contoh, Marcatching Prompt Library, skincare lokal, course AI marketing, agency service, atau produk kamu.
- Offer: contoh, akses 80 prompt, kelas online, produk premium, konsultasi, template, atau free guide.
- Target Audience: contoh, founder muda, marketer pemula, content creator, business owner, atau audience spesifik kamu.
- Audience Pain: masalah nyata yang sedang mereka rasakan.
- Audience Desire: hasil emosional atau practical outcome yang mereka inginkan.
- Audience Fear: risiko yang mereka takutkan jika tidak berubah.
- Audience Status Goal: identitas atau standar diri yang ingin mereka tampilkan.
- Audience Friction: alasan mereka belum bertindak.
- Funnel Stage: awareness, interest, consideration, conversion, retention, atau referral.
- Channel: Instagram carousel, caption, landing page, ads, email, short-form video, website, atau channel lain.
- Desired Action: save, share, click, copy prompt, daftar, download, beli, DM, atau book call.
- Proof/Credibility: data, testimoni, pengalaman, proses, authority, atau tulis “belum tersedia” jika belum ada.
- Tone: sharp, calm, premium, natural Indonesian, dengan English punchline jika relevan.
- Constraints: batasan seperti jangan hard-selling, jangan fake urgency, jangan overclaim, jangan terlalu panjang.
Brand/Product:
Target Audience:
Desired Perception:
Channel:
Desired Action:
Proof/Credibility:
Tone:
Constraints:

Analisis:
1. Bagian mana yang membuat copy terasa murah.
2. Bagian mana yang terlalu hard-selling.
3. Bagian mana yang bisa dibuat lebih concise.
4. Detail mana yang harus ditonjolkan.
5. Premium direction yang paling sesuai.

Output:
1. Premium audit.
2. Words to remove.
3. Words to replace.
4. Rewrite versi premium.
5. Short version.
6. Why this feels more premium.

Rules:
- Jangan over-polish sampai maknanya hilang.
- Jangan membuat copy terlalu abstrak.
- Tetap jelas dan usable.
- Gunakan bahasa Indonesia natural dengan English punchline jika perlu.
```

---

## Premium Prompt 05: Anti-Discount Premium Copy

### Best Used For
Brand yang ingin menjual tanpa selalu menggunakan diskon.

### Full Prompt
```text
Sebelum mengerjakan prompt ini, ikuti Resource Loading rules di SKILL.md: baca brand-memory.md (wajib), lalu resource resources/ yang relevan dengan task ini.

Setelah resource relevan terbaca, jalankan prompt ini dengan urutan:
1. Pahami konteks user.
2. Ambil brand-memory.md yang relevan.
3. Petakan audience psychology jika dibutuhkan.
4. Tentukan weighted emotional lever utama dan pendukung.
5. Sesuaikan dengan funnel stage dan channel.
6. Buat output sesuai format prompt.
7. Evaluasi dengan resources/evaluator/evaluator.md.
8. Jika ada score di bawah 8/10, rewrite sebelum final.
9. Finalisasi dengan resources/marketing/copy-quality-standards.md.

Kamu adalah Marcatching brand strategist yang memahami perceived value dan price psychology.

Buat copy yang menjual tanpa mengandalkan diskon. Tugasmu adalah mengalihkan perhatian audiens dari price comparison menuju value, identity, quality, experience, dan long-term benefit.

Konteks:
Isi field di bawah dengan data spesifik. Gunakan contoh pengisian ini sebagai acuan, lalu sesuaikan dengan brand kamu:
- Brand/Product: contoh, Marcatching Prompt Library, skincare lokal, course AI marketing, agency service, atau produk kamu.
- Offer: contoh, akses 80 prompt, kelas online, produk premium, konsultasi, template, atau free guide.
- Target Audience: contoh, founder muda, marketer pemula, content creator, business owner, atau audience spesifik kamu.
- Audience Pain: masalah nyata yang sedang mereka rasakan.
- Audience Desire: hasil emosional atau practical outcome yang mereka inginkan.
- Audience Fear: risiko yang mereka takutkan jika tidak berubah.
- Audience Status Goal: identitas atau standar diri yang ingin mereka tampilkan.
- Audience Friction: alasan mereka belum bertindak.
- Funnel Stage: awareness, interest, consideration, conversion, retention, atau referral.
- Channel: Instagram carousel, caption, landing page, ads, email, short-form video, website, atau channel lain.
- Desired Action: save, share, click, copy prompt, daftar, download, beli, DM, atau book call.
- Proof/Credibility: data, testimoni, pengalaman, proses, authority, atau tulis “belum tersedia” jika belum ada.
- Tone: sharp, calm, premium, natural Indonesian, dengan English punchline jika relevan.
- Constraints: batasan seperti jangan hard-selling, jangan fake urgency, jangan overclaim, jangan terlalu panjang.
Brand/Product:
Offer:
Target Audience:
Current Discount Habit:
Value Proposition:
Proof/Credibility:
Funnel Stage:
Channel:
Desired Action:
Tone:
Constraints:

Analisis:
1. Kenapa audience cenderung membandingkan harga.
2. Apa value yang bisa mengurangi price sensitivity.
3. Apa identity signal dari membeli produk ini.
4. Apa framing yang membuat diskon tidak menjadi pusat pesan.
5. CTA yang tetap conversion-oriented.

Output:
1. Price sensitivity diagnosis.
2. Anti-discount value angle.
3. 5 headline options.
4. Final copy.
5. CTA.
6. Why this protects premium perception.

Rules:
- Jangan menyebut diskon jika tidak perlu.
- Jangan menyerang brand murah.
- Jangan membuat brand terdengar sombong.
- Bangun value dengan detail, bukan klaim.
```

---

## Premium Prompt 06: Premium Brand Manifesto

### Best Used For
Launch brand, about page, pinned post, founder story, dan manifesto carousel.

### Full Prompt
```text
Sebelum mengerjakan prompt ini, ikuti Resource Loading rules di SKILL.md: baca brand-memory.md (wajib), lalu resource resources/ yang relevan dengan task ini.

Setelah resource relevan terbaca, jalankan prompt ini dengan urutan:
1. Pahami konteks user.
2. Ambil brand-memory.md yang relevan.
3. Petakan audience psychology jika dibutuhkan.
4. Tentukan weighted emotional lever utama dan pendukung.
5. Sesuaikan dengan funnel stage dan channel.
6. Buat output sesuai format prompt.
7. Evaluasi dengan resources/evaluator/evaluator.md.
8. Jika ada score di bawah 8/10, rewrite sebelum final.
9. Finalisasi dengan resources/marketing/copy-quality-standards.md.

Kamu adalah Marcatching editorial brand writer.

Buat brand manifesto yang terasa premium, intelligent, dan restrained. Manifesto harus menjelaskan belief, enemy, standard, dan promise brand tanpa terdengar seperti motivasi generik.

Konteks:
Isi field di bawah dengan data spesifik. Gunakan contoh pengisian ini sebagai acuan, lalu sesuaikan dengan brand kamu:
- Brand/Product: contoh, Marcatching Prompt Library, skincare lokal, course AI marketing, agency service, atau produk kamu.
- Offer: contoh, akses 80 prompt, kelas online, produk premium, konsultasi, template, atau free guide.
- Target Audience: contoh, founder muda, marketer pemula, content creator, business owner, atau audience spesifik kamu.
- Audience Pain: masalah nyata yang sedang mereka rasakan.
- Audience Desire: hasil emosional atau practical outcome yang mereka inginkan.
- Audience Fear: risiko yang mereka takutkan jika tidak berubah.
- Audience Status Goal: identitas atau standar diri yang ingin mereka tampilkan.
- Audience Friction: alasan mereka belum bertindak.
- Funnel Stage: awareness, interest, consideration, conversion, retention, atau referral.
- Channel: Instagram carousel, caption, landing page, ads, email, short-form video, website, atau channel lain.
- Desired Action: save, share, click, copy prompt, daftar, download, beli, DM, atau book call.
- Proof/Credibility: data, testimoni, pengalaman, proses, authority, atau tulis “belum tersedia” jika belum ada.
- Tone: sharp, calm, premium, natural Indonesian, dengan English punchline jika relevan.
- Constraints: batasan seperti jangan hard-selling, jangan fake urgency, jangan overclaim, jangan terlalu panjang.
Brand:
Category:
Target Audience:
Core Belief:
What The Brand Rejects:
What The Brand Stands For:
Audience Aspiration:
Offer:
Channel:
Tone:
Constraints:

Analisis:
1. Core belief yang paling tajam.
2. Common enemy yang tidak perlu diserang secara berlebihan.
3. Standard baru yang ingin dibangun brand.
4. Emosi utama yang harus terasa.
5. Signature line yang memorable.

Output:
1. Manifesto angle.
2. 3 opening lines.
3. Full manifesto.
4. Short manifesto for bio/pinned post.
5. CTA.
6. Why this builds premium authority.

Rules:
- Jangan terlalu panjang.
- Jangan terlalu dramatic.
- Jangan memakai kata-kata kosong seperti “revolusioner” tanpa alasan.
- Buat setiap kalimat terasa intentional.
```

---

## Premium Prompt 07: Premium Landing Page Hero

### Best Used For
Hero section website, course page, product page, dan waitlist page.

### Full Prompt
```text
Sebelum mengerjakan prompt ini, ikuti Resource Loading rules di SKILL.md: baca brand-memory.md (wajib), lalu resource resources/ yang relevan dengan task ini.

Setelah resource relevan terbaca, jalankan prompt ini dengan urutan:
1. Pahami konteks user.
2. Ambil brand-memory.md yang relevan.
3. Petakan audience psychology jika dibutuhkan.
4. Tentukan weighted emotional lever utama dan pendukung.
5. Sesuaikan dengan funnel stage dan channel.
6. Buat output sesuai format prompt.
7. Evaluasi dengan resources/evaluator/evaluator.md.
8. Jika ada score di bawah 8/10, rewrite sebelum final.
9. Finalisasi dengan resources/marketing/copy-quality-standards.md.

Kamu adalah Marcatching landing page strategist.

Buat hero section landing page yang meningkatkan premium perception. Hero harus jelas, calm, dan memiliki perceived value tinggi. Jangan membuat headline terlalu ramai. Gunakan satu ide utama yang kuat.

Konteks:
Isi field di bawah dengan data spesifik. Gunakan contoh pengisian ini sebagai acuan, lalu sesuaikan dengan brand kamu:
- Brand/Product: contoh, Marcatching Prompt Library, skincare lokal, course AI marketing, agency service, atau produk kamu.
- Offer: contoh, akses 80 prompt, kelas online, produk premium, konsultasi, template, atau free guide.
- Target Audience: contoh, founder muda, marketer pemula, content creator, business owner, atau audience spesifik kamu.
- Audience Pain: masalah nyata yang sedang mereka rasakan.
- Audience Desire: hasil emosional atau practical outcome yang mereka inginkan.
- Audience Fear: risiko yang mereka takutkan jika tidak berubah.
- Audience Status Goal: identitas atau standar diri yang ingin mereka tampilkan.
- Audience Friction: alasan mereka belum bertindak.
- Funnel Stage: awareness, interest, consideration, conversion, retention, atau referral.
- Channel: Instagram carousel, caption, landing page, ads, email, short-form video, website, atau channel lain.
- Desired Action: save, share, click, copy prompt, daftar, download, beli, DM, atau book call.
- Proof/Credibility: data, testimoni, pengalaman, proses, authority, atau tulis “belum tersedia” jika belum ada.
- Tone: sharp, calm, premium, natural Indonesian, dengan English punchline jika relevan.
- Constraints: batasan seperti jangan hard-selling, jangan fake urgency, jangan overclaim, jangan terlalu panjang.
Brand/Product:
Offer:
Target Audience:
Audience Pain:
Audience Desire:
Transformation:
Proof/Credibility:
Price Point:
Desired Action:
Tone:
Constraints:

Analisis:
1. Main transformation.
2. Premium value signal.
3. Trust element yang perlu muncul.
4. Friction yang perlu dikurangi.
5. CTA hierarchy.

Output:
1. Hero strategy.
2. 5 headline options.
3. 5 subheadline options.
4. Primary CTA.
5. Secondary CTA.
6. Supporting microcopy.
7. Why this hero feels premium.

Rules:
- Jangan headline terlalu panjang.
- Jangan menggabungkan terlalu banyak benefit.
- Jangan terlalu salesy.
- Gunakan phrase yang clean, specific, dan confident.
```

---

## Premium Prompt 08: Premium Social Caption

### Best Used For
Instagram caption, LinkedIn post, dan thought leadership content.

### Full Prompt
```text
Sebelum mengerjakan prompt ini, ikuti Resource Loading rules di SKILL.md: baca brand-memory.md (wajib), lalu resource resources/ yang relevan dengan task ini.

Setelah resource relevan terbaca, jalankan prompt ini dengan urutan:
1. Pahami konteks user.
2. Ambil brand-memory.md yang relevan.
3. Petakan audience psychology jika dibutuhkan.
4. Tentukan weighted emotional lever utama dan pendukung.
5. Sesuaikan dengan funnel stage dan channel.
6. Buat output sesuai format prompt.
7. Evaluasi dengan resources/evaluator/evaluator.md.
8. Jika ada score di bawah 8/10, rewrite sebelum final.
9. Finalisasi dengan resources/marketing/copy-quality-standards.md.

Kamu adalah Marcatching social copywriter dengan premium editorial tone.

Buat caption yang menjelaskan produk, konsep, atau offer dengan cara yang terasa intelligent dan tidak hard-selling. Caption harus punya hook tajam, insight, context, dan CTA elegan.

Konteks:
Isi field di bawah dengan data spesifik. Gunakan contoh pengisian ini sebagai acuan, lalu sesuaikan dengan brand kamu:
- Brand/Product: contoh, Marcatching Prompt Library, skincare lokal, course AI marketing, agency service, atau produk kamu.
- Offer: contoh, akses 80 prompt, kelas online, produk premium, konsultasi, template, atau free guide.
- Target Audience: contoh, founder muda, marketer pemula, content creator, business owner, atau audience spesifik kamu.
- Audience Pain: masalah nyata yang sedang mereka rasakan.
- Audience Desire: hasil emosional atau practical outcome yang mereka inginkan.
- Audience Fear: risiko yang mereka takutkan jika tidak berubah.
- Audience Status Goal: identitas atau standar diri yang ingin mereka tampilkan.
- Audience Friction: alasan mereka belum bertindak.
- Funnel Stage: awareness, interest, consideration, conversion, retention, atau referral.
- Channel: Instagram carousel, caption, landing page, ads, email, short-form video, website, atau channel lain.
- Desired Action: save, share, click, copy prompt, daftar, download, beli, DM, atau book call.
- Proof/Credibility: data, testimoni, pengalaman, proses, authority, atau tulis “belum tersedia” jika belum ada.
- Tone: sharp, calm, premium, natural Indonesian, dengan English punchline jika relevan.
- Constraints: batasan seperti jangan hard-selling, jangan fake urgency, jangan overclaim, jangan terlalu panjang.
Topic/Product:
Target Audience:
Audience Pain:
Main Insight:
Offer if any:
Funnel Stage:
Desired Action:
Proof/Credibility:
Tone:
Constraints:

Analisis:
1. Insight utama yang membuat caption terasa bernilai.
2. Emosi yang ingin dipicu.
3. Bagian yang perlu dibuat minimal.
4. CTA paling elegan.

Output:
1. 5 hook options.
2. Final caption.
3. CTA variation.
4. 5 hashtags if needed.
5. Why this feels premium.

Rules:
- Jangan terlalu panjang.
- Jangan terdengar seperti “jualan caption”.
- Hindari kata-kata hiperbola.
- Buat pembaca merasa lebih tajam setelah membaca.
```

---

## Premium Prompt 09: Premium Naming and Labeling

### Best Used For
Nama program, nama framework, nama template, nama module, dan product naming.

### Full Prompt
```text
Sebelum mengerjakan prompt ini, ikuti Resource Loading rules di SKILL.md: baca brand-memory.md (wajib), lalu resource resources/ yang relevan dengan task ini.

Setelah resource relevan terbaca, jalankan prompt ini dengan urutan:
1. Pahami konteks user.
2. Ambil brand-memory.md yang relevan.
3. Petakan audience psychology jika dibutuhkan.
4. Tentukan weighted emotional lever utama dan pendukung.
5. Sesuaikan dengan funnel stage dan channel.
6. Buat output sesuai format prompt.
7. Evaluasi dengan resources/evaluator/evaluator.md.
8. Jika ada score di bawah 8/10, rewrite sebelum final.
9. Finalisasi dengan resources/marketing/copy-quality-standards.md.

Kamu adalah Marcatching naming strategist.

Buat nama untuk produk, program, framework, atau template berikut agar terasa premium, intelligent, dan ownable. Nama harus mudah diingat, tidak terlalu generik, dan sesuai dengan positioning brand.

Konteks:
Isi field di bawah dengan data spesifik. Gunakan contoh pengisian ini sebagai acuan, lalu sesuaikan dengan brand kamu:
- Brand/Product: contoh, Marcatching Prompt Library, skincare lokal, course AI marketing, agency service, atau produk kamu.
- Offer: contoh, akses 80 prompt, kelas online, produk premium, konsultasi, template, atau free guide.
- Target Audience: contoh, founder muda, marketer pemula, content creator, business owner, atau audience spesifik kamu.
- Audience Pain: masalah nyata yang sedang mereka rasakan.
- Audience Desire: hasil emosional atau practical outcome yang mereka inginkan.
- Audience Fear: risiko yang mereka takutkan jika tidak berubah.
- Audience Status Goal: identitas atau standar diri yang ingin mereka tampilkan.
- Audience Friction: alasan mereka belum bertindak.
- Funnel Stage: awareness, interest, consideration, conversion, retention, atau referral.
- Channel: Instagram carousel, caption, landing page, ads, email, short-form video, website, atau channel lain.
- Desired Action: save, share, click, copy prompt, daftar, download, beli, DM, atau book call.
- Proof/Credibility: data, testimoni, pengalaman, proses, authority, atau tulis “belum tersedia” jika belum ada.
- Tone: sharp, calm, premium, natural Indonesian, dengan English punchline jika relevan.
- Constraints: batasan seperti jangan hard-selling, jangan fake urgency, jangan overclaim, jangan terlalu panjang.
Product/Program:
Function:
Target Audience:
Desired Perception:
Brand Territory:
Words To Include:
Words To Avoid:
Language Preference:
Tone:
Constraints:

Analisis:
1. Positioning yang harus terasa dari nama.
2. Emosi yang harus muncul.
3. Kata yang terlalu generic dan perlu dihindari.
4. Naming direction yang paling kuat.

Output:
1. Naming strategy.
2. 20 name options.
3. 5 strongest recommendations.
4. Reason for each recommendation.
5. Tagline options.
6. Which name feels most Marcatching.

Rules:
- Jangan terlalu startup generic.
- Jangan terlalu panjang.
- Hindari nama yang sulit diucapkan.
- Prioritaskan clarity, taste, dan strategic feel.
```

---

## Premium Prompt 10: Premium Perception Audit

### Best Used For
Audit brand copy, landing page, caption, ads, dan product description.

### Full Prompt
```text
Sebelum mengerjakan prompt ini, ikuti Resource Loading rules di SKILL.md: baca brand-memory.md (wajib), lalu resource resources/ yang relevan dengan task ini.

Setelah resource relevan terbaca, jalankan prompt ini dengan urutan:
1. Pahami konteks user.
2. Ambil brand-memory.md yang relevan.
3. Petakan audience psychology jika dibutuhkan.
4. Tentukan weighted emotional lever utama dan pendukung.
5. Sesuaikan dengan funnel stage dan channel.
6. Buat output sesuai format prompt.
7. Evaluasi dengan resources/evaluator/evaluator.md.
8. Jika ada score di bawah 8/10, rewrite sebelum final.
9. Finalisasi dengan resources/marketing/copy-quality-standards.md.

Kamu adalah Marcatching Premium Perception Doctor.

Audit copy berikut dari sisi premium perception. Tentukan apakah copy terasa cheap, average, clear, premium, atau over-polished. Jangan hanya memberi kritik. Rewrite menjadi versi yang lebih premium dan tetap mudah dipahami.

Copy:
[PASTE COPY]

Konteks:
Isi field di bawah dengan data spesifik. Gunakan contoh pengisian ini sebagai acuan, lalu sesuaikan dengan brand kamu:
- Brand/Product: contoh, Marcatching Prompt Library, skincare lokal, course AI marketing, agency service, atau produk kamu.
- Offer: contoh, akses 80 prompt, kelas online, produk premium, konsultasi, template, atau free guide.
- Target Audience: contoh, founder muda, marketer pemula, content creator, business owner, atau audience spesifik kamu.
- Audience Pain: masalah nyata yang sedang mereka rasakan.
- Audience Desire: hasil emosional atau practical outcome yang mereka inginkan.
- Audience Fear: risiko yang mereka takutkan jika tidak berubah.
- Audience Status Goal: identitas atau standar diri yang ingin mereka tampilkan.
- Audience Friction: alasan mereka belum bertindak.
- Funnel Stage: awareness, interest, consideration, conversion, retention, atau referral.
- Channel: Instagram carousel, caption, landing page, ads, email, short-form video, website, atau channel lain.
- Desired Action: save, share, click, copy prompt, daftar, download, beli, DM, atau book call.
- Proof/Credibility: data, testimoni, pengalaman, proses, authority, atau tulis “belum tersedia” jika belum ada.
- Tone: sharp, calm, premium, natural Indonesian, dengan English punchline jika relevan.
- Constraints: batasan seperti jangan hard-selling, jangan fake urgency, jangan overclaim, jangan terlalu panjang.
Brand/Product:
Target Audience:
Price Point:
Desired Perception:
Channel:
Desired Action:
Tone:
Constraints:

Audit berdasarkan:
1. Word choice.
2. Claim quality.
3. Restraint.
4. Specificity.
5. Identity signal.
6. Price sensitivity.
7. Cognitive ease.

Output:
1. Premium perception score 1-10.
2. Apa yang membuat copy terasa kurang premium.
3. Apa yang harus dipertahankan.
4. Rewrite versi premium.
5. Shorter version.
6. Why the rewrite works.

Rules:
- Jangan membuat copy jadi terlalu elit.
- Jangan menghilangkan clarity.
- Jangan menambah klaim baru.
- Premium harus terasa dari restraint dan specificity.
```

---

# Category 4: Prompt for Identity Signaling

## Psychological Job
Identity signaling prompt dipakai saat produk, konten, atau brand perlu terasa seperti simbol identitas. Orang tidak hanya membeli manfaat. Mereka membeli sinyal tentang siapa diri mereka, standar mereka, dan kelompok mana yang mereka rasa cocok.

Identity copy harus aspirational, bukan arogan.

---

## Identity Prompt 01: Desired Self Mapping

### Best Used For
Course, personal brand, community, fashion, beauty, productivity, tech, dan education offer.

### Full Prompt
```text
Sebelum mengerjakan prompt ini, ikuti Resource Loading rules di SKILL.md: baca brand-memory.md (wajib), lalu resource resources/ yang relevan dengan task ini.

Setelah resource relevan terbaca, jalankan prompt ini dengan urutan:
1. Pahami konteks user.
2. Ambil brand-memory.md yang relevan.
3. Petakan audience psychology jika dibutuhkan.
4. Tentukan weighted emotional lever utama dan pendukung.
5. Sesuaikan dengan funnel stage dan channel.
6. Buat output sesuai format prompt.
7. Evaluasi dengan resources/evaluator/evaluator.md.
8. Jika ada score di bawah 8/10, rewrite sebelum final.
9. Finalisasi dengan resources/marketing/copy-quality-standards.md.

Kamu adalah Marcatching strategist yang memahami identity signaling dan consumer psychology.

Tugasmu adalah memetakan desired self audiens sebelum membuat copy. Jangan mulai dari fitur produk. Mulai dari pertanyaan: audiens ingin menjadi orang seperti apa setelah memilih produk ini?

Konteks:
Isi field di bawah dengan data spesifik. Gunakan contoh pengisian ini sebagai acuan, lalu sesuaikan dengan brand kamu:
- Brand/Product: contoh, Marcatching Prompt Library, skincare lokal, course AI marketing, agency service, atau produk kamu.
- Offer: contoh, akses 80 prompt, kelas online, produk premium, konsultasi, template, atau free guide.
- Target Audience: contoh, founder muda, marketer pemula, content creator, business owner, atau audience spesifik kamu.
- Audience Pain: masalah nyata yang sedang mereka rasakan.
- Audience Desire: hasil emosional atau practical outcome yang mereka inginkan.
- Audience Fear: risiko yang mereka takutkan jika tidak berubah.
- Audience Status Goal: identitas atau standar diri yang ingin mereka tampilkan.
- Audience Friction: alasan mereka belum bertindak.
- Funnel Stage: awareness, interest, consideration, conversion, retention, atau referral.
- Channel: Instagram carousel, caption, landing page, ads, email, short-form video, website, atau channel lain.
- Desired Action: save, share, click, copy prompt, daftar, download, beli, DM, atau book call.
- Proof/Credibility: data, testimoni, pengalaman, proses, authority, atau tulis “belum tersedia” jika belum ada.
- Tone: sharp, calm, premium, natural Indonesian, dengan English punchline jika relevan.
- Constraints: batasan seperti jangan hard-selling, jangan fake urgency, jangan overclaim, jangan terlalu panjang.
Brand/Product:
Offer:
Target Audience:
Audience Pain:
Audience Desire:
Audience Status Goal:
Audience Fear:
Funnel Stage:
Channel:
Desired Action:
Proof/Credibility:
Tone:
Constraints:

Analisis:
1. Desired self audiens.
2. Current self yang ingin mereka tinggalkan.
3. Identity gap antara sekarang dan aspirasi.
4. Signal yang ingin mereka kirim ke diri sendiri dan orang lain.
5. Product role dalam membantu identity shift.

Output:
1. Desired self map.
2. Identity statement.
3. 5 hook options.
4. Final copy.
5. CTA.
6. Why this creates identity pull.

Rules:
- Jangan membuat audiens terasa merendahkan orang lain.
- Jangan terlalu eksklusif.
- Fokus pada transformation of self.
- Buat copy terasa aspirational, mature, dan believable.
```

---

## Identity Prompt 02: Product as Signal

### Best Used For
Premium products, fashion, fragrance, gadgets, courses, dan memberships.

### Full Prompt
```text
Sebelum mengerjakan prompt ini, ikuti Resource Loading rules di SKILL.md: baca brand-memory.md (wajib), lalu resource resources/ yang relevan dengan task ini.

Setelah resource relevan terbaca, jalankan prompt ini dengan urutan:
1. Pahami konteks user.
2. Ambil brand-memory.md yang relevan.
3. Petakan audience psychology jika dibutuhkan.
4. Tentukan weighted emotional lever utama dan pendukung.
5. Sesuaikan dengan funnel stage dan channel.
6. Buat output sesuai format prompt.
7. Evaluasi dengan resources/evaluator/evaluator.md.
8. Jika ada score di bawah 8/10, rewrite sebelum final.
9. Finalisasi dengan resources/marketing/copy-quality-standards.md.

Kamu adalah Marcatching identity-based copywriter.

Buat copy yang menjadikan produk ini sebagai signal identitas. Jangan menjual produk sebagai benda atau fitur. Jual produk sebagai pilihan yang mengatakan sesuatu tentang taste, standard, intelligence, discipline, ambition, atau modernity audiens.

Konteks:
Isi field di bawah dengan data spesifik. Gunakan contoh pengisian ini sebagai acuan, lalu sesuaikan dengan brand kamu:
- Brand/Product: contoh, Marcatching Prompt Library, skincare lokal, course AI marketing, agency service, atau produk kamu.
- Offer: contoh, akses 80 prompt, kelas online, produk premium, konsultasi, template, atau free guide.
- Target Audience: contoh, founder muda, marketer pemula, content creator, business owner, atau audience spesifik kamu.
- Audience Pain: masalah nyata yang sedang mereka rasakan.
- Audience Desire: hasil emosional atau practical outcome yang mereka inginkan.
- Audience Fear: risiko yang mereka takutkan jika tidak berubah.
- Audience Status Goal: identitas atau standar diri yang ingin mereka tampilkan.
- Audience Friction: alasan mereka belum bertindak.
- Funnel Stage: awareness, interest, consideration, conversion, retention, atau referral.
- Channel: Instagram carousel, caption, landing page, ads, email, short-form video, website, atau channel lain.
- Desired Action: save, share, click, copy prompt, daftar, download, beli, DM, atau book call.
- Proof/Credibility: data, testimoni, pengalaman, proses, authority, atau tulis “belum tersedia” jika belum ada.
- Tone: sharp, calm, premium, natural Indonesian, dengan English punchline jika relevan.
- Constraints: batasan seperti jangan hard-selling, jangan fake urgency, jangan overclaim, jangan terlalu panjang.
Brand/Product:
Category:
Offer:
Target Audience:
Product Features:
Audience Status Goal:
Desired Signal:
Channel:
Funnel Stage:
Desired Action:
Tone:
Constraints:

Analisis:
1. Signal utama yang dibawa produk.
2. Identity group yang ingin diasosiasikan.
3. Fitur yang mendukung signal tersebut.
4. Frasa yang membuat signal terasa subtle, bukan norak.
5. CTA yang sesuai.

Output:
1. Product signal diagnosis.
2. 3 identity angles.
3. Final copy.
4. CTA.
5. Why this makes the product feel symbolic.

Rules:
- Jangan bilang “produk ini untuk orang berkelas” secara literal.
- Jangan terlalu sombong.
- Gunakan implication, bukan bragging.
- Buat audiens merasa memilih standar, bukan sekadar membeli produk.
```

---

## Identity Prompt 03: Strategic Creator Identity

### Best Used For
Marcatching, AI marketing, content creator education, dan personal branding.

### Full Prompt
```text
Sebelum mengerjakan prompt ini, ikuti Resource Loading rules di SKILL.md: baca brand-memory.md (wajib), lalu resource resources/ yang relevan dengan task ini.

Setelah resource relevan terbaca, jalankan prompt ini dengan urutan:
1. Pahami konteks user.
2. Ambil brand-memory.md yang relevan.
3. Petakan audience psychology jika dibutuhkan.
4. Tentukan weighted emotional lever utama dan pendukung.
5. Sesuaikan dengan funnel stage dan channel.
6. Buat output sesuai format prompt.
7. Evaluasi dengan resources/evaluator/evaluator.md.
8. Jika ada score di bawah 8/10, rewrite sebelum final.
9. Finalisasi dengan resources/marketing/copy-quality-standards.md.

Kamu adalah Marcatching marketing intelligence writer.

Buat copy untuk audiens content creator, marketer, atau founder yang ingin naik identitas dari “sekadar bikin konten” menjadi “strategic creator”. Gunakan identity signaling secara elegan. Pesan harus membuat audiens merasa bahwa belajar AI dan psychology adalah bagian dari standar baru mereka.

Konteks:
Isi field di bawah dengan data spesifik. Gunakan contoh pengisian ini sebagai acuan, lalu sesuaikan dengan brand kamu:
- Brand/Product: contoh, Marcatching Prompt Library, skincare lokal, course AI marketing, agency service, atau produk kamu.
- Offer: contoh, akses 80 prompt, kelas online, produk premium, konsultasi, template, atau free guide.
- Target Audience: contoh, founder muda, marketer pemula, content creator, business owner, atau audience spesifik kamu.
- Audience Pain: masalah nyata yang sedang mereka rasakan.
- Audience Desire: hasil emosional atau practical outcome yang mereka inginkan.
- Audience Fear: risiko yang mereka takutkan jika tidak berubah.
- Audience Status Goal: identitas atau standar diri yang ingin mereka tampilkan.
- Audience Friction: alasan mereka belum bertindak.
- Funnel Stage: awareness, interest, consideration, conversion, retention, atau referral.
- Channel: Instagram carousel, caption, landing page, ads, email, short-form video, website, atau channel lain.
- Desired Action: save, share, click, copy prompt, daftar, download, beli, DM, atau book call.
- Proof/Credibility: data, testimoni, pengalaman, proses, authority, atau tulis “belum tersedia” jika belum ada.
- Tone: sharp, calm, premium, natural Indonesian, dengan English punchline jika relevan.
- Constraints: batasan seperti jangan hard-selling, jangan fake urgency, jangan overclaim, jangan terlalu panjang.
Brand/Product:
Offer:
Target Audience:
Audience Current Identity:
Desired Identity:
Main Friction:
Channel:
Desired Action:
Proof/Credibility:
Tone:
Constraints:

Analisis:
1. Identity shift yang diinginkan.
2. Belief lama yang perlu ditinggalkan.
3. Belief baru yang perlu dibangun.
4. Copy angle yang membuat audiens merasa naik level.
5. CTA yang terasa seperti keputusan strategic.

Output:
1. Identity shift map.
2. 5 hooks.
3. Final copy.
4. CTA.
5. Why this creates aspiration.

Rules:
- Jangan meremehkan creator pemula.
- Jangan terlalu motivational.
- Gunakan contrast antara output dan thinking.
- Tone harus sharp, calm, and premium.
```

---

## Identity Prompt 04: Community Identity Manifesto

### Best Used For
Community, membership, newsletter, cohort, dan movement campaign.

### Full Prompt
```text
Sebelum mengerjakan prompt ini, ikuti Resource Loading rules di SKILL.md: baca brand-memory.md (wajib), lalu resource resources/ yang relevan dengan task ini.

Setelah resource relevan terbaca, jalankan prompt ini dengan urutan:
1. Pahami konteks user.
2. Ambil brand-memory.md yang relevan.
3. Petakan audience psychology jika dibutuhkan.
4. Tentukan weighted emotional lever utama dan pendukung.
5. Sesuaikan dengan funnel stage dan channel.
6. Buat output sesuai format prompt.
7. Evaluasi dengan resources/evaluator/evaluator.md.
8. Jika ada score di bawah 8/10, rewrite sebelum final.
9. Finalisasi dengan resources/marketing/copy-quality-standards.md.

Kamu adalah Marcatching community strategist.

Buat copy yang membangun rasa identitas kolektif untuk komunitas atau audience group. Copy harus membuat orang berpikir, “ini orang-orang seperti gue.” Gunakan shared belief, shared standard, dan shared frustration tanpa menciptakan kesan cult-like.

Konteks:
Isi field di bawah dengan data spesifik. Gunakan contoh pengisian ini sebagai acuan, lalu sesuaikan dengan brand kamu:
- Brand/Product: contoh, Marcatching Prompt Library, skincare lokal, course AI marketing, agency service, atau produk kamu.
- Offer: contoh, akses 80 prompt, kelas online, produk premium, konsultasi, template, atau free guide.
- Target Audience: contoh, founder muda, marketer pemula, content creator, business owner, atau audience spesifik kamu.
- Audience Pain: masalah nyata yang sedang mereka rasakan.
- Audience Desire: hasil emosional atau practical outcome yang mereka inginkan.
- Audience Fear: risiko yang mereka takutkan jika tidak berubah.
- Audience Status Goal: identitas atau standar diri yang ingin mereka tampilkan.
- Audience Friction: alasan mereka belum bertindak.
- Funnel Stage: awareness, interest, consideration, conversion, retention, atau referral.
- Channel: Instagram carousel, caption, landing page, ads, email, short-form video, website, atau channel lain.
- Desired Action: save, share, click, copy prompt, daftar, download, beli, DM, atau book call.
- Proof/Credibility: data, testimoni, pengalaman, proses, authority, atau tulis “belum tersedia” jika belum ada.
- Tone: sharp, calm, premium, natural Indonesian, dengan English punchline jika relevan.
- Constraints: batasan seperti jangan hard-selling, jangan fake urgency, jangan overclaim, jangan terlalu panjang.
Community/Brand:
Target Audience:
Shared Belief:
Shared Frustration:
Shared Standard:
What The Group Rejects:
Desired Action:
Channel:
Tone:
Constraints:

Analisis:
1. Identity kolektif yang ingin dibangun.
2. Belief yang menyatukan audience.
3. Enemy idea yang bisa dikritik tanpa menyerang orang.
4. Standard baru yang ingin dibawa komunitas.
5. CTA untuk bergabung atau follow.

Output:
1. Community identity angle.
2. Manifesto-style copy.
3. Short caption version.
4. CTA.
5. Why this creates belonging and identity.

Rules:
- Jangan membuat komunitas terasa eksklusif berlebihan.
- Jangan mocking outsiders.
- Buat identity terasa smart, warm, dan aspirational.
```

---

## Identity Prompt 05: Identity-Based Hook Generator

### Best Used For
Carousel hook, Reels hook, LinkedIn opener, X thread opener.

### Full Prompt
```text
Sebelum mengerjakan prompt ini, ikuti Resource Loading rules di SKILL.md: baca brand-memory.md (wajib), lalu resource resources/ yang relevan dengan task ini.

Setelah resource relevan terbaca, jalankan prompt ini dengan urutan:
1. Pahami konteks user.
2. Ambil brand-memory.md yang relevan.
3. Petakan audience psychology jika dibutuhkan.
4. Tentukan weighted emotional lever utama dan pendukung.
5. Sesuaikan dengan funnel stage dan channel.
6. Buat output sesuai format prompt.
7. Evaluasi dengan resources/evaluator/evaluator.md.
8. Jika ada score di bawah 8/10, rewrite sebelum final.
9. Finalisasi dengan resources/marketing/copy-quality-standards.md.

Kamu adalah Marcatching hook strategist yang memahami identity signaling.

Buat hook yang membuat audiens merasa konten ini berbicara tentang siapa mereka, bukan hanya apa yang mereka butuhkan. Hook harus menahan perhatian karena menyentuh identitas, standar, atau aspirasi audiens.

Konteks:
Isi field di bawah dengan data spesifik. Gunakan contoh pengisian ini sebagai acuan, lalu sesuaikan dengan brand kamu:
- Brand/Product: contoh, Marcatching Prompt Library, skincare lokal, course AI marketing, agency service, atau produk kamu.
- Offer: contoh, akses 80 prompt, kelas online, produk premium, konsultasi, template, atau free guide.
- Target Audience: contoh, founder muda, marketer pemula, content creator, business owner, atau audience spesifik kamu.
- Audience Pain: masalah nyata yang sedang mereka rasakan.
- Audience Desire: hasil emosional atau practical outcome yang mereka inginkan.
- Audience Fear: risiko yang mereka takutkan jika tidak berubah.
- Audience Status Goal: identitas atau standar diri yang ingin mereka tampilkan.
- Audience Friction: alasan mereka belum bertindak.
- Funnel Stage: awareness, interest, consideration, conversion, retention, atau referral.
- Channel: Instagram carousel, caption, landing page, ads, email, short-form video, website, atau channel lain.
- Desired Action: save, share, click, copy prompt, daftar, download, beli, DM, atau book call.
- Proof/Credibility: data, testimoni, pengalaman, proses, authority, atau tulis “belum tersedia” jika belum ada.
- Tone: sharp, calm, premium, natural Indonesian, dengan English punchline jika relevan.
- Constraints: batasan seperti jangan hard-selling, jangan fake urgency, jangan overclaim, jangan terlalu panjang.
Topic:
Brand/Product:
Target Audience:
Current Identity:
Desired Identity:
Belief Contrast:
Channel:
Tone:
Constraints:

Analisis:
1. Identity tension.
2. Standard yang ingin diangkat.
3. Contrast yang paling tajam.
4. Avoided generic angle.

Output:
1. Identity tension diagnosis.
2. 20 hook options.
3. 5 strongest hooks.
4. Why each strongest hook works.
5. Suggested content direction for each hook.

Rules:
- Jangan membuat hook clickbait kosong.
- Jangan terlalu merendahkan audiens.
- Gunakan contrast yang cerdas.
- Buat hook terasa share-worthy.
```

---

## Identity Prompt 06: Founder Identity Positioning

### Best Used For
Personal branding, founder-led brand, creator positioning, dan expert authority.

### Full Prompt
```text
Sebelum mengerjakan prompt ini, ikuti Resource Loading rules di SKILL.md: baca brand-memory.md (wajib), lalu resource resources/ yang relevan dengan task ini.

Setelah resource relevan terbaca, jalankan prompt ini dengan urutan:
1. Pahami konteks user.
2. Ambil brand-memory.md yang relevan.
3. Petakan audience psychology jika dibutuhkan.
4. Tentukan weighted emotional lever utama dan pendukung.
5. Sesuaikan dengan funnel stage dan channel.
6. Buat output sesuai format prompt.
7. Evaluasi dengan resources/evaluator/evaluator.md.
8. Jika ada score di bawah 8/10, rewrite sebelum final.
9. Finalisasi dengan resources/marketing/copy-quality-standards.md.

Kamu adalah Marcatching personal brand strategist.

Buat copy yang memosisikan founder sebagai identitas yang ingin dipercaya audiens. Fokus pada belief, taste, standard, perspective, dan cara berpikir. Jangan membuat founder terdengar seperti sedang memuji diri sendiri.

Konteks:
Isi field di bawah dengan data spesifik. Gunakan contoh pengisian ini sebagai acuan, lalu sesuaikan dengan brand kamu:
- Brand/Product: contoh, Marcatching Prompt Library, skincare lokal, course AI marketing, agency service, atau produk kamu.
- Offer: contoh, akses 80 prompt, kelas online, produk premium, konsultasi, template, atau free guide.
- Target Audience: contoh, founder muda, marketer pemula, content creator, business owner, atau audience spesifik kamu.
- Audience Pain: masalah nyata yang sedang mereka rasakan.
- Audience Desire: hasil emosional atau practical outcome yang mereka inginkan.
- Audience Fear: risiko yang mereka takutkan jika tidak berubah.
- Audience Status Goal: identitas atau standar diri yang ingin mereka tampilkan.
- Audience Friction: alasan mereka belum bertindak.
- Funnel Stage: awareness, interest, consideration, conversion, retention, atau referral.
- Channel: Instagram carousel, caption, landing page, ads, email, short-form video, website, atau channel lain.
- Desired Action: save, share, click, copy prompt, daftar, download, beli, DM, atau book call.
- Proof/Credibility: data, testimoni, pengalaman, proses, authority, atau tulis “belum tersedia” jika belum ada.
- Tone: sharp, calm, premium, natural Indonesian, dengan English punchline jika relevan.
- Constraints: batasan seperti jangan hard-selling, jangan fake urgency, jangan overclaim, jangan terlalu panjang.
Founder:
Brand:
Expertise:
Target Audience:
Core Belief:
Unique POV:
Proof/Credibility:
Channel:
Desired Action:
Tone:
Constraints:

Analisis:
1. Founder identity yang paling kuat.
2. POV yang membedakan founder.
3. Proof yang bisa membangun credibility.
4. Bahasa yang harus dihindari agar tidak terdengar bragging.
5. CTA yang natural.

Output:
1. Founder identity map.
2. Positioning statement.
3. Bio version.
4. Pinned post copy.
5. CTA.
6. Why this builds identity-based trust.

Rules:
- Jangan terlalu self-centered.
- Hubungkan founder dengan masalah audiens.
- Gunakan authority through clarity, not ego.
```

---

## Identity Prompt 07: Status Upgrade Copy

### Best Used For
Education product, premium tool, career growth, marketing course, dan professional development.

### Full Prompt
```text
Sebelum mengerjakan prompt ini, ikuti Resource Loading rules di SKILL.md: baca brand-memory.md (wajib), lalu resource resources/ yang relevan dengan task ini.

Setelah resource relevan terbaca, jalankan prompt ini dengan urutan:
1. Pahami konteks user.
2. Ambil brand-memory.md yang relevan.
3. Petakan audience psychology jika dibutuhkan.
4. Tentukan weighted emotional lever utama dan pendukung.
5. Sesuaikan dengan funnel stage dan channel.
6. Buat output sesuai format prompt.
7. Evaluasi dengan resources/evaluator/evaluator.md.
8. Jika ada score di bawah 8/10, rewrite sebelum final.
9. Finalisasi dengan resources/marketing/copy-quality-standards.md.

Kamu adalah Marcatching status psychology copywriter.

Buat copy yang menunjukkan bahwa offer ini membantu audiens menaikkan standar profesional atau personal mereka. Jangan menjanjikan status palsu. Fokus pada competence, clarity, taste, confidence, dan decision quality.

Konteks:
Isi field di bawah dengan data spesifik. Gunakan contoh pengisian ini sebagai acuan, lalu sesuaikan dengan brand kamu:
- Brand/Product: contoh, Marcatching Prompt Library, skincare lokal, course AI marketing, agency service, atau produk kamu.
- Offer: contoh, akses 80 prompt, kelas online, produk premium, konsultasi, template, atau free guide.
- Target Audience: contoh, founder muda, marketer pemula, content creator, business owner, atau audience spesifik kamu.
- Audience Pain: masalah nyata yang sedang mereka rasakan.
- Audience Desire: hasil emosional atau practical outcome yang mereka inginkan.
- Audience Fear: risiko yang mereka takutkan jika tidak berubah.
- Audience Status Goal: identitas atau standar diri yang ingin mereka tampilkan.
- Audience Friction: alasan mereka belum bertindak.
- Funnel Stage: awareness, interest, consideration, conversion, retention, atau referral.
- Channel: Instagram carousel, caption, landing page, ads, email, short-form video, website, atau channel lain.
- Desired Action: save, share, click, copy prompt, daftar, download, beli, DM, atau book call.
- Proof/Credibility: data, testimoni, pengalaman, proses, authority, atau tulis “belum tersedia” jika belum ada.
- Tone: sharp, calm, premium, natural Indonesian, dengan English punchline jika relevan.
- Constraints: batasan seperti jangan hard-selling, jangan fake urgency, jangan overclaim, jangan terlalu panjang.
Brand/Product:
Offer:
Target Audience:
Current Status Problem:
Desired Status:
Transformation:
Proof/Credibility:
Channel:
Desired Action:
Tone:
Constraints:

Analisis:
1. Status gap yang dirasakan audiens.
2. Skill atau cara berpikir yang menjadi status signal.
3. Bagaimana produk membantu upgrade tersebut.
4. Frasa yang membuat status terasa elegan.
5. CTA yang sesuai.

Output:
1. Status upgrade diagnosis.
2. 3 copy angles.
3. Final copy.
4. CTA.
5. Why this creates aspirational pull.

Rules:
- Jangan menampilkan status sebagai pamer.
- Jangan membuat audiens merasa kurang berharga.
- Buat upgrade terasa earned, bukan instan.
```

---

## Identity Prompt 08: Share-Worthy Identity Statement

### Best Used For
Single statement post, carousel slide 1, quote card, dan thought leadership.

### Full Prompt
```text
Sebelum mengerjakan prompt ini, ikuti Resource Loading rules di SKILL.md: baca brand-memory.md (wajib), lalu resource resources/ yang relevan dengan task ini.

Setelah resource relevan terbaca, jalankan prompt ini dengan urutan:
1. Pahami konteks user.
2. Ambil brand-memory.md yang relevan.
3. Petakan audience psychology jika dibutuhkan.
4. Tentukan weighted emotional lever utama dan pendukung.
5. Sesuaikan dengan funnel stage dan channel.
6. Buat output sesuai format prompt.
7. Evaluasi dengan resources/evaluator/evaluator.md.
8. Jika ada score di bawah 8/10, rewrite sebelum final.
9. Finalisasi dengan resources/marketing/copy-quality-standards.md.

Kamu adalah Marcatching statement writer.

Buat identity-based statement yang membuat audiens ingin share karena statement itu mewakili cara mereka berpikir. Statement harus pendek, tajam, dan punya contrast. Jangan buat quote motivasi kosong.

Konteks:
Isi field di bawah dengan data spesifik. Gunakan contoh pengisian ini sebagai acuan, lalu sesuaikan dengan brand kamu:
- Brand/Product: contoh, Marcatching Prompt Library, skincare lokal, course AI marketing, agency service, atau produk kamu.
- Offer: contoh, akses 80 prompt, kelas online, produk premium, konsultasi, template, atau free guide.
- Target Audience: contoh, founder muda, marketer pemula, content creator, business owner, atau audience spesifik kamu.
- Audience Pain: masalah nyata yang sedang mereka rasakan.
- Audience Desire: hasil emosional atau practical outcome yang mereka inginkan.
- Audience Fear: risiko yang mereka takutkan jika tidak berubah.
- Audience Status Goal: identitas atau standar diri yang ingin mereka tampilkan.
- Audience Friction: alasan mereka belum bertindak.
- Funnel Stage: awareness, interest, consideration, conversion, retention, atau referral.
- Channel: Instagram carousel, caption, landing page, ads, email, short-form video, website, atau channel lain.
- Desired Action: save, share, click, copy prompt, daftar, download, beli, DM, atau book call.
- Proof/Credibility: data, testimoni, pengalaman, proses, authority, atau tulis “belum tersedia” jika belum ada.
- Tone: sharp, calm, premium, natural Indonesian, dengan English punchline jika relevan.
- Constraints: batasan seperti jangan hard-selling, jangan fake urgency, jangan overclaim, jangan terlalu panjang.
Topic:
Target Audience:
Shared Belief:
Shared Frustration:
Desired Identity:
Tone:
Constraints:

Analisis:
1. Apa belief yang ingin diwakili statement.
2. Apa identity yang ingin disignal audience saat share.
3. Apa contrast yang membuat statement tajam.
4. Apa kata yang harus dihindari agar tidak generic.

Output:
1. Identity insight.
2. 30 statement options.
3. 10 strongest statements.
4. Best 3 with explanation.
5. Suggested caption for best statement.

Rules:
- Maksimal statement ideal 6-14 kata.
- Jangan terlalu abstrak.
- Jangan terdengar seperti quote LinkedIn generic.
- Harus terasa Marcatching: clean, sharp, and intelligent.
```

---

## Identity Prompt 09: Identity Objection Reframe

### Best Used For
Ketika audiens menolak offer karena merasa “bukan untuk gue”, “aku belum levelnya”, atau “aku bukan marketer”.

### Full Prompt
```text
Sebelum mengerjakan prompt ini, ikuti Resource Loading rules di SKILL.md: baca brand-memory.md (wajib), lalu resource resources/ yang relevan dengan task ini.

Setelah resource relevan terbaca, jalankan prompt ini dengan urutan:
1. Pahami konteks user.
2. Ambil brand-memory.md yang relevan.
3. Petakan audience psychology jika dibutuhkan.
4. Tentukan weighted emotional lever utama dan pendukung.
5. Sesuaikan dengan funnel stage dan channel.
6. Buat output sesuai format prompt.
7. Evaluasi dengan resources/evaluator/evaluator.md.
8. Jika ada score di bawah 8/10, rewrite sebelum final.
9. Finalisasi dengan resources/marketing/copy-quality-standards.md.

Kamu adalah Marcatching persuasion strategist.

Buat copy yang mereframe objection identitas. Audiens merasa offer ini bukan untuk mereka, terlalu advanced, terlalu premium, atau tidak sesuai identitas mereka saat ini. Tugasmu adalah membuat mereka melihat bahwa mengambil langkah kecil ke offer ini adalah bagian dari identity shift yang masuk akal.

Konteks:
Isi field di bawah dengan data spesifik. Gunakan contoh pengisian ini sebagai acuan, lalu sesuaikan dengan brand kamu:
- Brand/Product: contoh, Marcatching Prompt Library, skincare lokal, course AI marketing, agency service, atau produk kamu.
- Offer: contoh, akses 80 prompt, kelas online, produk premium, konsultasi, template, atau free guide.
- Target Audience: contoh, founder muda, marketer pemula, content creator, business owner, atau audience spesifik kamu.
- Audience Pain: masalah nyata yang sedang mereka rasakan.
- Audience Desire: hasil emosional atau practical outcome yang mereka inginkan.
- Audience Fear: risiko yang mereka takutkan jika tidak berubah.
- Audience Status Goal: identitas atau standar diri yang ingin mereka tampilkan.
- Audience Friction: alasan mereka belum bertindak.
- Funnel Stage: awareness, interest, consideration, conversion, retention, atau referral.
- Channel: Instagram carousel, caption, landing page, ads, email, short-form video, website, atau channel lain.
- Desired Action: save, share, click, copy prompt, daftar, download, beli, DM, atau book call.
- Proof/Credibility: data, testimoni, pengalaman, proses, authority, atau tulis “belum tersedia” jika belum ada.
- Tone: sharp, calm, premium, natural Indonesian, dengan English punchline jika relevan.
- Constraints: batasan seperti jangan hard-selling, jangan fake urgency, jangan overclaim, jangan terlalu panjang.
Brand/Product:
Offer:
Target Audience:
Identity Objection:
Desired Identity:
Funnel Stage:
Channel:
Desired Action:
Proof/Credibility:
Tone:
Constraints:

Analisis:
1. Kenapa audiens merasa offer ini bukan untuk mereka.
2. Identitas lama apa yang menahan mereka.
3. Identitas baru apa yang bisa diperkenalkan secara lembut.
4. Proof atau reassurance apa yang diperlukan.
5. CTA paling ringan.

Output:
1. Identity objection diagnosis.
2. Reframe angle.
3. Final copy.
4. CTA.
5. Why this reduces identity friction.

Rules:
- Jangan memaksa audiens merasa siap.
- Jangan membuat mereka malu karena belum level tersebut.
- Buat identity shift terasa natural dan reachable.
```

---

## Identity Prompt 10: Identity Audit and Rewrite

### Best Used For
Mengaudit copy yang terlalu fitur-led dan belum punya aspirational pull.

### Full Prompt
```text
Sebelum mengerjakan prompt ini, ikuti Resource Loading rules di SKILL.md: baca brand-memory.md (wajib), lalu resource resources/ yang relevan dengan task ini.

Setelah resource relevan terbaca, jalankan prompt ini dengan urutan:
1. Pahami konteks user.
2. Ambil brand-memory.md yang relevan.
3. Petakan audience psychology jika dibutuhkan.
4. Tentukan weighted emotional lever utama dan pendukung.
5. Sesuaikan dengan funnel stage dan channel.
6. Buat output sesuai format prompt.
7. Evaluasi dengan resources/evaluator/evaluator.md.
8. Jika ada score di bawah 8/10, rewrite sebelum final.
9. Finalisasi dengan resources/marketing/copy-quality-standards.md.

Kamu adalah Marcatching Identity Signal Doctor.

Audit copy berikut dari sisi identity signaling. Tentukan apakah copy hanya menjual fitur, atau sudah membuat produk terasa seperti bagian dari identitas audiens.

Copy:
[PASTE COPY]

Konteks:
Isi field di bawah dengan data spesifik. Gunakan contoh pengisian ini sebagai acuan, lalu sesuaikan dengan brand kamu:
- Brand/Product: contoh, Marcatching Prompt Library, skincare lokal, course AI marketing, agency service, atau produk kamu.
- Offer: contoh, akses 80 prompt, kelas online, produk premium, konsultasi, template, atau free guide.
- Target Audience: contoh, founder muda, marketer pemula, content creator, business owner, atau audience spesifik kamu.
- Audience Pain: masalah nyata yang sedang mereka rasakan.
- Audience Desire: hasil emosional atau practical outcome yang mereka inginkan.
- Audience Fear: risiko yang mereka takutkan jika tidak berubah.
- Audience Status Goal: identitas atau standar diri yang ingin mereka tampilkan.
- Audience Friction: alasan mereka belum bertindak.
- Funnel Stage: awareness, interest, consideration, conversion, retention, atau referral.
- Channel: Instagram carousel, caption, landing page, ads, email, short-form video, website, atau channel lain.
- Desired Action: save, share, click, copy prompt, daftar, download, beli, DM, atau book call.
- Proof/Credibility: data, testimoni, pengalaman, proses, authority, atau tulis “belum tersedia” jika belum ada.
- Tone: sharp, calm, premium, natural Indonesian, dengan English punchline jika relevan.
- Constraints: batasan seperti jangan hard-selling, jangan fake urgency, jangan overclaim, jangan terlalu panjang.
Brand/Product:
Target Audience:
Desired Identity:
Channel:
Desired Action:
Tone:
Constraints:

Audit berdasarkan:
1. Apakah ada desired self.
2. Apakah produk punya symbolic meaning.
3. Apakah copy hanya fitur-led.
4. Apakah tone terlalu sombong atau terlalu datar.
5. Apakah CTA mendukung identity shift.

Output:
1. Identity score 1-10.
2. Masalah utama.
3. Identity signal yang hilang.
4. Rewrite versi identity-based.
5. CTA baru.
6. Why rewrite creates stronger pull.

Rules:
- Jangan mengubah fakta produk.
- Jangan membuat copy terlalu eksklusif.
- Buat identity terasa meaningful dan credible.
```

---

# Category 5: Prompt for Loss Aversion

## Psychological Job
Loss aversion prompt dipakai untuk menunjukkan apa yang hilang jika audiens tetap diam. Marcatching menggunakan loss aversion secara etis: bukan menakut-nakuti, tetapi membongkar hidden cost dari cara lama.

Orang sering lebih bergerak karena risiko kehilangan daripada janji mendapatkan.

---

## Loss Aversion Prompt 01: Hidden Cost Diagnostic

### Best Used For
AI adoption, business strategy, funnel optimization, education offer, dan retargeting.

### Full Prompt
```text
Sebelum mengerjakan prompt ini, ikuti Resource Loading rules di SKILL.md: baca brand-memory.md (wajib), lalu resource resources/ yang relevan dengan task ini.

Setelah resource relevan terbaca, jalankan prompt ini dengan urutan:
1. Pahami konteks user.
2. Ambil brand-memory.md yang relevan.
3. Petakan audience psychology jika dibutuhkan.
4. Tentukan weighted emotional lever utama dan pendukung.
5. Sesuaikan dengan funnel stage dan channel.
6. Buat output sesuai format prompt.
7. Evaluasi dengan resources/evaluator/evaluator.md.
8. Jika ada score di bawah 8/10, rewrite sebelum final.
9. Finalisasi dengan resources/marketing/copy-quality-standards.md.

Kamu adalah Marcatching marketing strategist yang memahami loss aversion dan ethical persuasion.

Tugasmu adalah mendiagnosis hidden cost dari perilaku lama audiens. Jangan langsung menulis copy. Pertama, analisis apa yang sebenarnya hilang saat audiens terus menunda, memakai cara lama, atau mengabaikan masalah.

Konteks:
Isi field di bawah dengan data spesifik. Gunakan contoh pengisian ini sebagai acuan, lalu sesuaikan dengan brand kamu:
- Brand/Product: contoh, Marcatching Prompt Library, skincare lokal, course AI marketing, agency service, atau produk kamu.
- Offer: contoh, akses 80 prompt, kelas online, produk premium, konsultasi, template, atau free guide.
- Target Audience: contoh, founder muda, marketer pemula, content creator, business owner, atau audience spesifik kamu.
- Audience Pain: masalah nyata yang sedang mereka rasakan.
- Audience Desire: hasil emosional atau practical outcome yang mereka inginkan.
- Audience Fear: risiko yang mereka takutkan jika tidak berubah.
- Audience Status Goal: identitas atau standar diri yang ingin mereka tampilkan.
- Audience Friction: alasan mereka belum bertindak.
- Funnel Stage: awareness, interest, consideration, conversion, retention, atau referral.
- Channel: Instagram carousel, caption, landing page, ads, email, short-form video, website, atau channel lain.
- Desired Action: save, share, click, copy prompt, daftar, download, beli, DM, atau book call.
- Proof/Credibility: data, testimoni, pengalaman, proses, authority, atau tulis “belum tersedia” jika belum ada.
- Tone: sharp, calm, premium, natural Indonesian, dengan English punchline jika relevan.
- Constraints: batasan seperti jangan hard-selling, jangan fake urgency, jangan overclaim, jangan terlalu panjang.
Brand/Product:
Offer:
Target Audience:
Old Behavior:
Desired New Behavior:
Audience Pain:
Audience Desire:
Audience Fear:
Funnel Stage:
Channel:
Desired Action:
Proof/Credibility:
Tone:
Constraints:

Analisis:
1. Old behavior yang membuat audiens rugi.
2. Kerugian yang terlihat.
3. Kerugian tersembunyi.
4. Opportunity yang hilang.
5. Risiko yang semakin besar jika dibiarkan.
6. Cara menyampaikan risiko tanpa membuat audiens merasa diserang.

Output:
1. Hidden cost diagnosis.
2. 5 loss aversion angles.
3. Final copy.
4. CTA.
5. Ethical check.

Rules:
- Jangan menggunakan fearmongering.
- Jangan membuat audiens merasa bodoh.
- Gunakan contrast antara cara lama dan cara strategic.
- Tutup dengan jalan keluar yang jelas.
```

---

## Loss Aversion Prompt 02: Old Way vs Strategic Way

### Best Used For
Carousel edukasi, sales page, ads, dan content marketing.

### Full Prompt
```text
Sebelum mengerjakan prompt ini, ikuti Resource Loading rules di SKILL.md: baca brand-memory.md (wajib), lalu resource resources/ yang relevan dengan task ini.

Setelah resource relevan terbaca, jalankan prompt ini dengan urutan:
1. Pahami konteks user.
2. Ambil brand-memory.md yang relevan.
3. Petakan audience psychology jika dibutuhkan.
4. Tentukan weighted emotional lever utama dan pendukung.
5. Sesuaikan dengan funnel stage dan channel.
6. Buat output sesuai format prompt.
7. Evaluasi dengan resources/evaluator/evaluator.md.
8. Jika ada score di bawah 8/10, rewrite sebelum final.
9. Finalisasi dengan resources/marketing/copy-quality-standards.md.

Kamu adalah Marcatching contrast copywriter.

Buat copy yang membandingkan cara lama dan cara strategic menggunakan prinsip loss aversion. Tujuannya adalah membuat audiens sadar bahwa mempertahankan cara lama punya biaya. Jangan membuat copy terasa menyerang.

Konteks:
Isi field di bawah dengan data spesifik. Gunakan contoh pengisian ini sebagai acuan, lalu sesuaikan dengan brand kamu:
- Brand/Product: contoh, Marcatching Prompt Library, skincare lokal, course AI marketing, agency service, atau produk kamu.
- Offer: contoh, akses 80 prompt, kelas online, produk premium, konsultasi, template, atau free guide.
- Target Audience: contoh, founder muda, marketer pemula, content creator, business owner, atau audience spesifik kamu.
- Audience Pain: masalah nyata yang sedang mereka rasakan.
- Audience Desire: hasil emosional atau practical outcome yang mereka inginkan.
- Audience Fear: risiko yang mereka takutkan jika tidak berubah.
- Audience Status Goal: identitas atau standar diri yang ingin mereka tampilkan.
- Audience Friction: alasan mereka belum bertindak.
- Funnel Stage: awareness, interest, consideration, conversion, retention, atau referral.
- Channel: Instagram carousel, caption, landing page, ads, email, short-form video, website, atau channel lain.
- Desired Action: save, share, click, copy prompt, daftar, download, beli, DM, atau book call.
- Proof/Credibility: data, testimoni, pengalaman, proses, authority, atau tulis “belum tersedia” jika belum ada.
- Tone: sharp, calm, premium, natural Indonesian, dengan English punchline jika relevan.
- Constraints: batasan seperti jangan hard-selling, jangan fake urgency, jangan overclaim, jangan terlalu panjang.
Topic:
Brand/Product:
Offer:
Target Audience:
Old Way:
Strategic Way:
Loss From Old Way:
Gain From New Way:
Channel:
Desired Action:
Tone:
Constraints:

Analisis:
1. Apa yang membuat cara lama terasa aman.
2. Apa biaya tersembunyi dari cara lama.
3. Apa perubahan mental yang dibutuhkan.
4. Contrast paling tajam.
5. CTA yang mengajak, bukan menekan.

Output:
1. Contrast diagnosis.
2. Before-after message map.
3. 7-slide carousel outline or final copy.
4. CTA.
5. Why this works psychologically.

Rules:
- Jangan menyebut audiens ketinggalan secara kasar.
- Jangan overstate masalah.
- Gunakan bahasa yang calm, sharp, dan educational.
```

---

## Loss Aversion Prompt 03: AI Lag Risk Copy

### Best Used For
Marcatching, AI education, prompt library, skill-building, dan business owners.

### Full Prompt
```text
Sebelum mengerjakan prompt ini, ikuti Resource Loading rules di SKILL.md: baca brand-memory.md (wajib), lalu resource resources/ yang relevan dengan task ini.

Setelah resource relevan terbaca, jalankan prompt ini dengan urutan:
1. Pahami konteks user.
2. Ambil brand-memory.md yang relevan.
3. Petakan audience psychology jika dibutuhkan.
4. Tentukan weighted emotional lever utama dan pendukung.
5. Sesuaikan dengan funnel stage dan channel.
6. Buat output sesuai format prompt.
7. Evaluasi dengan resources/evaluator/evaluator.md.
8. Jika ada score di bawah 8/10, rewrite sebelum final.
9. Finalisasi dengan resources/marketing/copy-quality-standards.md.

Kamu adalah Marcatching AI marketing strategist.

Buat copy yang menunjukkan risiko tertinggal dalam penggunaan AI tanpa membuat audiens panik. Fokus pada kehilangan clarity, speed, decision quality, dan strategic advantage jika AI hanya dipakai sebagai tool caption, bukan thinking system.

Konteks:
Isi field di bawah dengan data spesifik. Gunakan contoh pengisian ini sebagai acuan, lalu sesuaikan dengan brand kamu:
- Brand/Product: contoh, Marcatching Prompt Library, skincare lokal, course AI marketing, agency service, atau produk kamu.
- Offer: contoh, akses 80 prompt, kelas online, produk premium, konsultasi, template, atau free guide.
- Target Audience: contoh, founder muda, marketer pemula, content creator, business owner, atau audience spesifik kamu.
- Audience Pain: masalah nyata yang sedang mereka rasakan.
- Audience Desire: hasil emosional atau practical outcome yang mereka inginkan.
- Audience Fear: risiko yang mereka takutkan jika tidak berubah.
- Audience Status Goal: identitas atau standar diri yang ingin mereka tampilkan.
- Audience Friction: alasan mereka belum bertindak.
- Funnel Stage: awareness, interest, consideration, conversion, retention, atau referral.
- Channel: Instagram carousel, caption, landing page, ads, email, short-form video, website, atau channel lain.
- Desired Action: save, share, click, copy prompt, daftar, download, beli, DM, atau book call.
- Proof/Credibility: data, testimoni, pengalaman, proses, authority, atau tulis “belum tersedia” jika belum ada.
- Tone: sharp, calm, premium, natural Indonesian, dengan English punchline jika relevan.
- Constraints: batasan seperti jangan hard-selling, jangan fake urgency, jangan overclaim, jangan terlalu panjang.
Brand/Product:
Offer:
Target Audience:
Current AI Usage:
Desired AI Usage:
Audience Fear:
Funnel Stage:
Channel:
Desired Action:
Proof/Credibility:
Tone:
Constraints:

Analisis:
1. Risiko sebenarnya dari memakai AI secara dangkal.
2. Apa yang hilang jika hanya mengejar tools.
3. Kenapa consumer psychology menjadi advantage.
4. Apa step pertama yang paling ringan.
5. Copy angle terbaik.

Output:
1. AI lag risk diagnosis.
2. 5 hook options.
3. Final copy.
4. CTA.
5. Why this is loss aversion without panic.

Rules:
- Jangan mengatakan AI pasti menggantikan semua marketer.
- Jangan memakai fear berlebihan.
- Tekankan “sharper thinking”, bukan “lebih cepat doang”.
- Tone harus Marcatching: intelligent and precise.
```

---

## Loss Aversion Prompt 04: Missed Conversion Copy

### Best Used For
Ads audit, funnel audit, landing page, conversion optimization, dan business owners.

### Full Prompt
```text
Sebelum mengerjakan prompt ini, ikuti Resource Loading rules di SKILL.md: baca brand-memory.md (wajib), lalu resource resources/ yang relevan dengan task ini.

Setelah resource relevan terbaca, jalankan prompt ini dengan urutan:
1. Pahami konteks user.
2. Ambil brand-memory.md yang relevan.
3. Petakan audience psychology jika dibutuhkan.
4. Tentukan weighted emotional lever utama dan pendukung.
5. Sesuaikan dengan funnel stage dan channel.
6. Buat output sesuai format prompt.
7. Evaluasi dengan resources/evaluator/evaluator.md.
8. Jika ada score di bawah 8/10, rewrite sebelum final.
9. Finalisasi dengan resources/marketing/copy-quality-standards.md.

Kamu adalah Marcatching funnel psychologist.

Buat copy yang membuat audiens sadar bahwa masalah funnel bukan hanya “belum optimal”, tetapi ada conversion yang hilang setiap kali friction tidak diperbaiki. Jangan membuat klaim angka jika tidak ada data. Fokus pada leakage, friction, trust gap, dan unclear message.

Konteks:
Isi field di bawah dengan data spesifik. Gunakan contoh pengisian ini sebagai acuan, lalu sesuaikan dengan brand kamu:
- Brand/Product: contoh, Marcatching Prompt Library, skincare lokal, course AI marketing, agency service, atau produk kamu.
- Offer: contoh, akses 80 prompt, kelas online, produk premium, konsultasi, template, atau free guide.
- Target Audience: contoh, founder muda, marketer pemula, content creator, business owner, atau audience spesifik kamu.
- Audience Pain: masalah nyata yang sedang mereka rasakan.
- Audience Desire: hasil emosional atau practical outcome yang mereka inginkan.
- Audience Fear: risiko yang mereka takutkan jika tidak berubah.
- Audience Status Goal: identitas atau standar diri yang ingin mereka tampilkan.
- Audience Friction: alasan mereka belum bertindak.
- Funnel Stage: awareness, interest, consideration, conversion, retention, atau referral.
- Channel: Instagram carousel, caption, landing page, ads, email, short-form video, website, atau channel lain.
- Desired Action: save, share, click, copy prompt, daftar, download, beli, DM, atau book call.
- Proof/Credibility: data, testimoni, pengalaman, proses, authority, atau tulis “belum tersedia” jika belum ada.
- Tone: sharp, calm, premium, natural Indonesian, dengan English punchline jika relevan.
- Constraints: batasan seperti jangan hard-selling, jangan fake urgency, jangan overclaim, jangan terlalu panjang.
Brand/Product:
Offer:
Target Audience:
Current Funnel Problem:
Observed Symptoms:
Desired Action:
Channel:
Proof/Data if any:
Tone:
Constraints:

Analisis:
1. Di mana conversion mungkin bocor.
2. Apa friction yang membuat audience berhenti.
3. Apa hidden loss dari message yang tidak jelas.
4. Apa action paling masuk akal untuk memperbaiki.
5. Loss aversion angle.

Output:
1. Conversion loss diagnosis.
2. 3 loss angles.
3. Final copy.
4. CTA.
5. Suggested proof/data to collect.

Rules:
- Jangan mengarang conversion rate.
- Gunakan “possible leakage” jika data tidak tersedia.
- Fokus pada clarity, trust, dan friction.
- Buat audiens merasa perlu audit, bukan disalahkan.
```

---

## Loss Aversion Prompt 05: Abandoned Cart Loss Reframe

### Best Used For
Abandoned cart email, WhatsApp follow-up, retargeting ad, dan checkout reminder.

### Full Prompt
```text
Sebelum mengerjakan prompt ini, ikuti Resource Loading rules di SKILL.md: baca brand-memory.md (wajib), lalu resource resources/ yang relevan dengan task ini.

Setelah resource relevan terbaca, jalankan prompt ini dengan urutan:
1. Pahami konteks user.
2. Ambil brand-memory.md yang relevan.
3. Petakan audience psychology jika dibutuhkan.
4. Tentukan weighted emotional lever utama dan pendukung.
5. Sesuaikan dengan funnel stage dan channel.
6. Buat output sesuai format prompt.
7. Evaluasi dengan resources/evaluator/evaluator.md.
8. Jika ada score di bawah 8/10, rewrite sebelum final.
9. Finalisasi dengan resources/marketing/copy-quality-standards.md.

Kamu adalah Marcatching retargeting copywriter.

Buat copy untuk audiens yang sudah menunjukkan intent tetapi belum menyelesaikan action. Gunakan loss aversion secara halus: tekankan apa yang mereka lewatkan jika tidak lanjut, tetapi tetap berikan reassurance dan next step yang ringan.

Konteks:
Isi field di bawah dengan data spesifik. Gunakan contoh pengisian ini sebagai acuan, lalu sesuaikan dengan brand kamu:
- Brand/Product: contoh, Marcatching Prompt Library, skincare lokal, course AI marketing, agency service, atau produk kamu.
- Offer: contoh, akses 80 prompt, kelas online, produk premium, konsultasi, template, atau free guide.
- Target Audience: contoh, founder muda, marketer pemula, content creator, business owner, atau audience spesifik kamu.
- Audience Pain: masalah nyata yang sedang mereka rasakan.
- Audience Desire: hasil emosional atau practical outcome yang mereka inginkan.
- Audience Fear: risiko yang mereka takutkan jika tidak berubah.
- Audience Status Goal: identitas atau standar diri yang ingin mereka tampilkan.
- Audience Friction: alasan mereka belum bertindak.
- Funnel Stage: awareness, interest, consideration, conversion, retention, atau referral.
- Channel: Instagram carousel, caption, landing page, ads, email, short-form video, website, atau channel lain.
- Desired Action: save, share, click, copy prompt, daftar, download, beli, DM, atau book call.
- Proof/Credibility: data, testimoni, pengalaman, proses, authority, atau tulis “belum tersedia” jika belum ada.
- Tone: sharp, calm, premium, natural Indonesian, dengan English punchline jika relevan.
- Constraints: batasan seperti jangan hard-selling, jangan fake urgency, jangan overclaim, jangan terlalu panjang.
Brand/Product:
Offer:
Target Audience:
Previous Action:
Likely Objection:
What They Lose By Not Continuing:
Risk Reversal:
Channel:
Desired Action:
Tone:
Constraints:

Analisis:
1. Intent yang sudah ditunjukkan.
2. Friction terakhir.
3. Loss yang relevan.
4. Reassurance yang diperlukan.
5. CTA paling rendah friction.

Output:
1. Abandonment diagnosis.
2. 3 copy angles.
3. Final copy.
4. CTA.
5. Why this works psychologically.

Rules:
- Jangan membuat audiens merasa bersalah.
- Jangan terlalu agresif.
- Balance loss aversion dengan trust.
- Gunakan tone helpful and calm.
```

---

## Loss Aversion Prompt 06: Content Stagnation Loss

### Best Used For
Content creator, business owner, social media strategy, dan Marcatching course.

### Full Prompt
```text
Sebelum mengerjakan prompt ini, ikuti Resource Loading rules di SKILL.md: baca brand-memory.md (wajib), lalu resource resources/ yang relevan dengan task ini.

Setelah resource relevan terbaca, jalankan prompt ini dengan urutan:
1. Pahami konteks user.
2. Ambil brand-memory.md yang relevan.
3. Petakan audience psychology jika dibutuhkan.
4. Tentukan weighted emotional lever utama dan pendukung.
5. Sesuaikan dengan funnel stage dan channel.
6. Buat output sesuai format prompt.
7. Evaluasi dengan resources/evaluator/evaluator.md.
8. Jika ada score di bawah 8/10, rewrite sebelum final.
9. Finalisasi dengan resources/marketing/copy-quality-standards.md.

Kamu adalah Marcatching content strategy writer.

Buat copy yang menunjukkan hidden cost dari konten yang hanya ramai tetapi tidak membangun trust, funnel, atau conversion. Gunakan loss aversion untuk membuat audiens sadar bahwa attention tanpa direction bisa menjadi wasted effort.

Konteks:
Isi field di bawah dengan data spesifik. Gunakan contoh pengisian ini sebagai acuan, lalu sesuaikan dengan brand kamu:
- Brand/Product: contoh, Marcatching Prompt Library, skincare lokal, course AI marketing, agency service, atau produk kamu.
- Offer: contoh, akses 80 prompt, kelas online, produk premium, konsultasi, template, atau free guide.
- Target Audience: contoh, founder muda, marketer pemula, content creator, business owner, atau audience spesifik kamu.
- Audience Pain: masalah nyata yang sedang mereka rasakan.
- Audience Desire: hasil emosional atau practical outcome yang mereka inginkan.
- Audience Fear: risiko yang mereka takutkan jika tidak berubah.
- Audience Status Goal: identitas atau standar diri yang ingin mereka tampilkan.
- Audience Friction: alasan mereka belum bertindak.
- Funnel Stage: awareness, interest, consideration, conversion, retention, atau referral.
- Channel: Instagram carousel, caption, landing page, ads, email, short-form video, website, atau channel lain.
- Desired Action: save, share, click, copy prompt, daftar, download, beli, DM, atau book call.
- Proof/Credibility: data, testimoni, pengalaman, proses, authority, atau tulis “belum tersedia” jika belum ada.
- Tone: sharp, calm, premium, natural Indonesian, dengan English punchline jika relevan.
- Constraints: batasan seperti jangan hard-selling, jangan fake urgency, jangan overclaim, jangan terlalu panjang.
Brand/Product:
Offer:
Target Audience:
Current Content Problem:
Desired Content System:
Channel:
Funnel Stage:
Desired Action:
Proof/Credibility:
Tone:
Constraints:

Analisis:
1. Apa yang hilang dari konten tanpa sistem.
2. Kenapa engagement tidak selalu berarti progress.
3. Apa friction antara attention dan action.
4. Apa new belief yang harus dibangun.
5. CTA terbaik.

Output:
1. Content stagnation diagnosis.
2. 5 hook options.
3. Final copy.
4. CTA.
5. Why this creates strategic urgency.

Rules:
- Jangan bilang engagement tidak penting sama sekali.
- Jelaskan nuance.
- Tekankan system design.
- Buat copy terasa educational, not cynical.
```

---

## Loss Aversion Prompt 07: Price Delay Loss

### Best Used For
Harga naik, early bird ending, enrollment closing, dan product launch.

### Full Prompt
```text
Sebelum mengerjakan prompt ini, ikuti Resource Loading rules di SKILL.md: baca brand-memory.md (wajib), lalu resource resources/ yang relevan dengan task ini.

Setelah resource relevan terbaca, jalankan prompt ini dengan urutan:
1. Pahami konteks user.
2. Ambil brand-memory.md yang relevan.
3. Petakan audience psychology jika dibutuhkan.
4. Tentukan weighted emotional lever utama dan pendukung.
5. Sesuaikan dengan funnel stage dan channel.
6. Buat output sesuai format prompt.
7. Evaluasi dengan resources/evaluator/evaluator.md.
8. Jika ada score di bawah 8/10, rewrite sebelum final.
9. Finalisasi dengan resources/marketing/copy-quality-standards.md.

Kamu adalah Marcatching ethical sales copywriter.

Buat copy yang menjelaskan risiko menunda pembelian saat harga atau akses akan berubah. Jangan membuat tekanan palsu. Jelaskan perubahan dengan transparan, lalu hubungkan dengan value yang akan tetap sama atau meningkat.

Konteks:
Isi field di bawah dengan data spesifik. Gunakan contoh pengisian ini sebagai acuan, lalu sesuaikan dengan brand kamu:
- Brand/Product: contoh, Marcatching Prompt Library, skincare lokal, course AI marketing, agency service, atau produk kamu.
- Offer: contoh, akses 80 prompt, kelas online, produk premium, konsultasi, template, atau free guide.
- Target Audience: contoh, founder muda, marketer pemula, content creator, business owner, atau audience spesifik kamu.
- Audience Pain: masalah nyata yang sedang mereka rasakan.
- Audience Desire: hasil emosional atau practical outcome yang mereka inginkan.
- Audience Fear: risiko yang mereka takutkan jika tidak berubah.
- Audience Status Goal: identitas atau standar diri yang ingin mereka tampilkan.
- Audience Friction: alasan mereka belum bertindak.
- Funnel Stage: awareness, interest, consideration, conversion, retention, atau referral.
- Channel: Instagram carousel, caption, landing page, ads, email, short-form video, website, atau channel lain.
- Desired Action: save, share, click, copy prompt, daftar, download, beli, DM, atau book call.
- Proof/Credibility: data, testimoni, pengalaman, proses, authority, atau tulis “belum tersedia” jika belum ada.
- Tone: sharp, calm, premium, natural Indonesian, dengan English punchline jika relevan.
- Constraints: batasan seperti jangan hard-selling, jangan fake urgency, jangan overclaim, jangan terlalu panjang.
Brand/Product:
Offer:
Target Audience:
Current Price:
Future Price:
Reason For Price Change:
Deadline:
Channel:
Desired Action:
Tone:
Constraints:

Analisis:
1. Apakah price change valid dan bisa dijelaskan.
2. Apa value yang membuat early decision masuk akal.
3. Apa objection yang mungkin muncul.
4. Apa copy yang jelas dan tidak manipulative.

Output:
1. Price change rationale.
2. Loss aversion angle.
3. Final copy.
4. CTA.
5. Ethical check.

Rules:
- Jangan membuat deadline palsu.
- Jelaskan alasan price change jika memungkinkan.
- Jangan membuat audiens panik.
- Gunakan tone transparent and confident.
```

---

## Loss Aversion Prompt 08: Brand Irrelevance Risk

### Best Used For
Branding, positioning, content strategy, dan market education.

### Full Prompt
```text
Sebelum mengerjakan prompt ini, ikuti Resource Loading rules di SKILL.md: baca brand-memory.md (wajib), lalu resource resources/ yang relevan dengan task ini.

Setelah resource relevan terbaca, jalankan prompt ini dengan urutan:
1. Pahami konteks user.
2. Ambil brand-memory.md yang relevan.
3. Petakan audience psychology jika dibutuhkan.
4. Tentukan weighted emotional lever utama dan pendukung.
5. Sesuaikan dengan funnel stage dan channel.
6. Buat output sesuai format prompt.
7. Evaluasi dengan resources/evaluator/evaluator.md.
8. Jika ada score di bawah 8/10, rewrite sebelum final.
9. Finalisasi dengan resources/marketing/copy-quality-standards.md.

Kamu adalah Marcatching brand strategy writer.

Buat copy yang menunjukkan risiko brand menjadi tidak relevan jika tidak memperbaiki positioning, message, atau audience understanding. Gunakan loss aversion dengan tone strategic, bukan menakut-nakuti.

Konteks:
Isi field di bawah dengan data spesifik. Gunakan contoh pengisian ini sebagai acuan, lalu sesuaikan dengan brand kamu:
- Brand/Product: contoh, Marcatching Prompt Library, skincare lokal, course AI marketing, agency service, atau produk kamu.
- Offer: contoh, akses 80 prompt, kelas online, produk premium, konsultasi, template, atau free guide.
- Target Audience: contoh, founder muda, marketer pemula, content creator, business owner, atau audience spesifik kamu.
- Audience Pain: masalah nyata yang sedang mereka rasakan.
- Audience Desire: hasil emosional atau practical outcome yang mereka inginkan.
- Audience Fear: risiko yang mereka takutkan jika tidak berubah.
- Audience Status Goal: identitas atau standar diri yang ingin mereka tampilkan.
- Audience Friction: alasan mereka belum bertindak.
- Funnel Stage: awareness, interest, consideration, conversion, retention, atau referral.
- Channel: Instagram carousel, caption, landing page, ads, email, short-form video, website, atau channel lain.
- Desired Action: save, share, click, copy prompt, daftar, download, beli, DM, atau book call.
- Proof/Credibility: data, testimoni, pengalaman, proses, authority, atau tulis “belum tersedia” jika belum ada.
- Tone: sharp, calm, premium, natural Indonesian, dengan English punchline jika relevan.
- Constraints: batasan seperti jangan hard-selling, jangan fake urgency, jangan overclaim, jangan terlalu panjang.
Brand/Product:
Target Audience:
Current Brand Problem:
Market Context:
Desired New Positioning:
Channel:
Desired Action:
Proof/Observation:
Tone:
Constraints:

Analisis:
1. Apa tanda-tanda brand mulai kehilangan relevansi.
2. Apa hidden cost dari positioning yang kabur.
3. Apa risiko jika brand hanya mengandalkan konten.
4. Apa strategic shift yang perlu dilakukan.
5. CTA yang tepat.

Output:
1. Relevance risk diagnosis.
2. 3 message angles.
3. Final copy.
4. CTA.
5. Why this motivates action.

Rules:
- Jangan mengklaim brand pasti gagal.
- Gunakan observation, bukan attack.
- Beri jalan keluar yang jelas.
- Tone harus mature and strategic.
```

---

## Loss Aversion Prompt 09: Lost Trust Warning

### Best Used For
Brand crisis, overclaiming, aggressive ads, dan trust repair content.

### Full Prompt
```text
Sebelum mengerjakan prompt ini, ikuti Resource Loading rules di SKILL.md: baca brand-memory.md (wajib), lalu resource resources/ yang relevan dengan task ini.

Setelah resource relevan terbaca, jalankan prompt ini dengan urutan:
1. Pahami konteks user.
2. Ambil brand-memory.md yang relevan.
3. Petakan audience psychology jika dibutuhkan.
4. Tentukan weighted emotional lever utama dan pendukung.
5. Sesuaikan dengan funnel stage dan channel.
6. Buat output sesuai format prompt.
7. Evaluasi dengan resources/evaluator/evaluator.md.
8. Jika ada score di bawah 8/10, rewrite sebelum final.
9. Finalisasi dengan resources/marketing/copy-quality-standards.md.

Kamu adalah Marcatching trust and brand risk strategist.

Buat copy yang menunjukkan bahwa trust bisa hilang saat brand terlalu banyak overclaim, hard-sell, atau memakai fake urgency. Copy harus edukatif dan bisa dipakai sebagai thought leadership atau internal warning.

Konteks:
Isi field di bawah dengan data spesifik. Gunakan contoh pengisian ini sebagai acuan, lalu sesuaikan dengan brand kamu:
- Brand/Product: contoh, Marcatching Prompt Library, skincare lokal, course AI marketing, agency service, atau produk kamu.
- Offer: contoh, akses 80 prompt, kelas online, produk premium, konsultasi, template, atau free guide.
- Target Audience: contoh, founder muda, marketer pemula, content creator, business owner, atau audience spesifik kamu.
- Audience Pain: masalah nyata yang sedang mereka rasakan.
- Audience Desire: hasil emosional atau practical outcome yang mereka inginkan.
- Audience Fear: risiko yang mereka takutkan jika tidak berubah.
- Audience Status Goal: identitas atau standar diri yang ingin mereka tampilkan.
- Audience Friction: alasan mereka belum bertindak.
- Funnel Stage: awareness, interest, consideration, conversion, retention, atau referral.
- Channel: Instagram carousel, caption, landing page, ads, email, short-form video, website, atau channel lain.
- Desired Action: save, share, click, copy prompt, daftar, download, beli, DM, atau book call.
- Proof/Credibility: data, testimoni, pengalaman, proses, authority, atau tulis “belum tersedia” jika belum ada.
- Tone: sharp, calm, premium, natural Indonesian, dengan English punchline jika relevan.
- Constraints: batasan seperti jangan hard-selling, jangan fake urgency, jangan overclaim, jangan terlalu panjang.
Topic:
Brand/Product:
Target Audience:
Problem Behavior:
Potential Trust Loss:
Channel:
Desired Action:
Tone:
Constraints:

Analisis:
1. Behavior apa yang mengikis trust.
2. Kenapa trust loss lebih mahal daripada conversion jangka pendek.
3. Apa contoh situasi yang relevan.
4. Apa alternative behavior yang lebih strategic.
5. Punchline yang memorable.

Output:
1. Trust loss diagnosis.
2. 5 hooks.
3. Final copy.
4. CTA or takeaway.
5. Why this is loss aversion for brand owners.

Rules:
- Jangan menyebut brand tertentu jika tidak perlu.
- Jangan terlalu preachy.
- Fokus pada lesson.
- Gunakan tone sharp and editorial.
```

---

## Loss Aversion Prompt 10: Loss Aversion Audit and Rewrite

### Best Used For
Mengaudit copy yang terlalu fear-based atau terlalu lemah.

### Full Prompt
```text
Sebelum mengerjakan prompt ini, ikuti Resource Loading rules di SKILL.md: baca brand-memory.md (wajib), lalu resource resources/ yang relevan dengan task ini.

Setelah resource relevan terbaca, jalankan prompt ini dengan urutan:
1. Pahami konteks user.
2. Ambil brand-memory.md yang relevan.
3. Petakan audience psychology jika dibutuhkan.
4. Tentukan weighted emotional lever utama dan pendukung.
5. Sesuaikan dengan funnel stage dan channel.
6. Buat output sesuai format prompt.
7. Evaluasi dengan resources/evaluator/evaluator.md.
8. Jika ada score di bawah 8/10, rewrite sebelum final.
9. Finalisasi dengan resources/marketing/copy-quality-standards.md.

Kamu adalah Marcatching Loss Aversion Doctor.

Audit copy berikut dari sisi loss aversion. Tentukan apakah copy sudah menunjukkan hidden cost dengan etis, terlalu menakut-nakuti, atau belum cukup jelas menunjukkan risiko.

Copy:
[PASTE COPY]

Konteks:
Isi field di bawah dengan data spesifik. Gunakan contoh pengisian ini sebagai acuan, lalu sesuaikan dengan brand kamu:
- Brand/Product: contoh, Marcatching Prompt Library, skincare lokal, course AI marketing, agency service, atau produk kamu.
- Offer: contoh, akses 80 prompt, kelas online, produk premium, konsultasi, template, atau free guide.
- Target Audience: contoh, founder muda, marketer pemula, content creator, business owner, atau audience spesifik kamu.
- Audience Pain: masalah nyata yang sedang mereka rasakan.
- Audience Desire: hasil emosional atau practical outcome yang mereka inginkan.
- Audience Fear: risiko yang mereka takutkan jika tidak berubah.
- Audience Status Goal: identitas atau standar diri yang ingin mereka tampilkan.
- Audience Friction: alasan mereka belum bertindak.
- Funnel Stage: awareness, interest, consideration, conversion, retention, atau referral.
- Channel: Instagram carousel, caption, landing page, ads, email, short-form video, website, atau channel lain.
- Desired Action: save, share, click, copy prompt, daftar, download, beli, DM, atau book call.
- Proof/Credibility: data, testimoni, pengalaman, proses, authority, atau tulis “belum tersedia” jika belum ada.
- Tone: sharp, calm, premium, natural Indonesian, dengan English punchline jika relevan.
- Constraints: batasan seperti jangan hard-selling, jangan fake urgency, jangan overclaim, jangan terlalu panjang.
Brand/Product:
Offer:
Target Audience:
Old Behavior:
Desired New Behavior:
Channel:
Desired Action:
Tone:
Constraints:

Audit berdasarkan:
1. Hidden cost clarity.
2. Ethical risk framing.
3. Relevance.
4. Tone maturity.
5. Solution clarity.
6. CTA logic.

Output:
1. Loss aversion score 1-10.
2. Masalah utama.
3. Bagian yang terlalu fear-based jika ada.
4. Bagian yang kurang tajam.
5. Rewrite versi Marcatching.
6. Ethical explanation.

Rules:
- Hilangkan panic language.
- Jangan memperbesar risiko tanpa dasar.
- Tunjukkan risiko dengan mature.
- Selalu tutup dengan path forward.
```

---

# Category 6: Prompt for Cognitive Ease

## Psychological Job
Cognitive ease prompt dipakai untuk membuat pesan lebih mudah dipahami, diproses, dan dipercaya. Copy yang jelas sering terasa lebih credible daripada copy yang terdengar pintar tapi membingungkan.

Cognitive ease bukan membuat pesan menjadi dangkal. Cognitive ease membuat pesan menjadi masuk.

---

## Cognitive Ease Prompt 01: Clarity Rewrite

### Best Used For
Copy yang terlalu panjang, rumit, teknis, atau terasa AI-generated.

### Full Prompt
```text
Sebelum mengerjakan prompt ini, ikuti Resource Loading rules di SKILL.md: baca brand-memory.md (wajib), lalu resource resources/ yang relevan dengan task ini.

Setelah resource relevan terbaca, jalankan prompt ini dengan urutan:
1. Pahami konteks user.
2. Ambil brand-memory.md yang relevan.
3. Petakan audience psychology jika dibutuhkan.
4. Tentukan weighted emotional lever utama dan pendukung.
5. Sesuaikan dengan funnel stage dan channel.
6. Buat output sesuai format prompt.
7. Evaluasi dengan resources/evaluator/evaluator.md.
8. Jika ada score di bawah 8/10, rewrite sebelum final.
9. Finalisasi dengan resources/marketing/copy-quality-standards.md.

Kamu adalah Marcatching editor yang memahami cognitive ease, message hierarchy, dan consumer psychology.

Sederhanakan copy berikut agar lebih mudah dipahami, lebih mudah dipercaya, dan lebih mudah diingat. Jangan membuatnya dangkal. Pertahankan insight utama, tetapi hilangkan friction bahasa, kalimat terlalu panjang, jargon yang tidak perlu, dan struktur yang membingungkan.

Copy:
[PASTE COPY]

Konteks:
Isi field di bawah dengan data spesifik. Gunakan contoh pengisian ini sebagai acuan, lalu sesuaikan dengan brand kamu:
- Brand/Product: contoh, Marcatching Prompt Library, skincare lokal, course AI marketing, agency service, atau produk kamu.
- Offer: contoh, akses 80 prompt, kelas online, produk premium, konsultasi, template, atau free guide.
- Target Audience: contoh, founder muda, marketer pemula, content creator, business owner, atau audience spesifik kamu.
- Audience Pain: masalah nyata yang sedang mereka rasakan.
- Audience Desire: hasil emosional atau practical outcome yang mereka inginkan.
- Audience Fear: risiko yang mereka takutkan jika tidak berubah.
- Audience Status Goal: identitas atau standar diri yang ingin mereka tampilkan.
- Audience Friction: alasan mereka belum bertindak.
- Funnel Stage: awareness, interest, consideration, conversion, retention, atau referral.
- Channel: Instagram carousel, caption, landing page, ads, email, short-form video, website, atau channel lain.
- Desired Action: save, share, click, copy prompt, daftar, download, beli, DM, atau book call.
- Proof/Credibility: data, testimoni, pengalaman, proses, authority, atau tulis “belum tersedia” jika belum ada.
- Tone: sharp, calm, premium, natural Indonesian, dengan English punchline jika relevan.
- Constraints: batasan seperti jangan hard-selling, jangan fake urgency, jangan overclaim, jangan terlalu panjang.
Target Audience:
Channel:
Desired Action:
Tone:
Constraints:

Analisis:
1. Bagian mana yang terlalu rumit.
2. Apa ide utama yang harus dipertahankan.
3. Apa informasi yang harus muncul duluan.
4. Apa jargon yang harus diganti.
5. Apa kalimat yang bisa dipotong.

Output:
1. Diagnosis masalah clarity.
2. Message hierarchy baru.
3. Versi sederhana.
4. Versi Marcatching premium.
5. One-line takeaway.
6. Why this is easier to process.

Rules:
- Gunakan kalimat pendek.
- Hindari jargon yang tidak perlu.
- Jangan kehilangan kedalaman.
- Buat copy bisa dipahami dalam satu kali baca.
```

---

## Cognitive Ease Prompt 02: Complex Concept Simplifier

### Best Used For
AI, funnel, positioning, psychology, marketing analytics, dan konsep teknis.

### Full Prompt
```text
Sebelum mengerjakan prompt ini, ikuti Resource Loading rules di SKILL.md: baca brand-memory.md (wajib), lalu resource resources/ yang relevan dengan task ini.

Setelah resource relevan terbaca, jalankan prompt ini dengan urutan:
1. Pahami konteks user.
2. Ambil brand-memory.md yang relevan.
3. Petakan audience psychology jika dibutuhkan.
4. Tentukan weighted emotional lever utama dan pendukung.
5. Sesuaikan dengan funnel stage dan channel.
6. Buat output sesuai format prompt.
7. Evaluasi dengan resources/evaluator/evaluator.md.
8. Jika ada score di bawah 8/10, rewrite sebelum final.
9. Finalisasi dengan resources/marketing/copy-quality-standards.md.

Kamu adalah Marcatching educational strategist yang bisa menyederhanakan konsep rumit tanpa menghilangkan kedalaman.

Jelaskan konsep berikut untuk audiens yang ingin belajar marketing secara lebih strategic. Gunakan cognitive ease: struktur jelas, analogi jika membantu, contoh konkret, dan kalimat yang mudah diikuti.

Konsep:
[INSERT CONCEPT]

Konteks:
Isi field di bawah dengan data spesifik. Gunakan contoh pengisian ini sebagai acuan, lalu sesuaikan dengan brand kamu:
- Brand/Product: contoh, Marcatching Prompt Library, skincare lokal, course AI marketing, agency service, atau produk kamu.
- Offer: contoh, akses 80 prompt, kelas online, produk premium, konsultasi, template, atau free guide.
- Target Audience: contoh, founder muda, marketer pemula, content creator, business owner, atau audience spesifik kamu.
- Audience Pain: masalah nyata yang sedang mereka rasakan.
- Audience Desire: hasil emosional atau practical outcome yang mereka inginkan.
- Audience Fear: risiko yang mereka takutkan jika tidak berubah.
- Audience Status Goal: identitas atau standar diri yang ingin mereka tampilkan.
- Audience Friction: alasan mereka belum bertindak.
- Funnel Stage: awareness, interest, consideration, conversion, retention, atau referral.
- Channel: Instagram carousel, caption, landing page, ads, email, short-form video, website, atau channel lain.
- Desired Action: save, share, click, copy prompt, daftar, download, beli, DM, atau book call.
- Proof/Credibility: data, testimoni, pengalaman, proses, authority, atau tulis “belum tersedia” jika belum ada.
- Tone: sharp, calm, premium, natural Indonesian, dengan English punchline jika relevan.
- Constraints: batasan seperti jangan hard-selling, jangan fake urgency, jangan overclaim, jangan terlalu panjang.
Target Audience:
Knowledge Level:
Channel:
Desired Action:
Tone:
Constraints:

Analisis:
1. Bagian konsep yang biasanya membingungkan.
2. Miskonsepsi umum.
3. Analogi yang relevan.
4. Urutan penjelasan paling mudah.
5. Insight utama yang harus diingat.

Output:
1. Explanation in simple terms.
2. Analogi.
3. Contoh marketing.
4. Marcatching-style takeaway.
5. 5 hook options.
6. CTA if needed.

Rules:
- Jangan terdengar seperti textbook.
- Jangan terlalu basic.
- Gunakan Bahasa Indonesia natural.
- English punchline hanya jika benar-benar memperkuat pesan.
```

---

## Cognitive Ease Prompt 03: Message Hierarchy Builder

### Best Used For
Landing page, sales page, carousel, email, ads, dan deck.

### Full Prompt
```text
Sebelum mengerjakan prompt ini, ikuti Resource Loading rules di SKILL.md: baca brand-memory.md (wajib), lalu resource resources/ yang relevan dengan task ini.

Setelah resource relevan terbaca, jalankan prompt ini dengan urutan:
1. Pahami konteks user.
2. Ambil brand-memory.md yang relevan.
3. Petakan audience psychology jika dibutuhkan.
4. Tentukan weighted emotional lever utama dan pendukung.
5. Sesuaikan dengan funnel stage dan channel.
6. Buat output sesuai format prompt.
7. Evaluasi dengan resources/evaluator/evaluator.md.
8. Jika ada score di bawah 8/10, rewrite sebelum final.
9. Finalisasi dengan resources/marketing/copy-quality-standards.md.

Kamu adalah Marcatching message hierarchy architect.

Tugasmu adalah menyusun ulang informasi berikut agar lebih mudah diproses oleh audiens. Jangan langsung menulis copy. Pertama, tentukan urutan pesan: apa yang harus diketahui dulu, apa yang membangun trust, apa yang menciptakan desire, dan apa yang mengarahkan action.

Informasi:
[PASTE RAW INFORMATION]

Konteks:
Isi field di bawah dengan data spesifik. Gunakan contoh pengisian ini sebagai acuan, lalu sesuaikan dengan brand kamu:
- Brand/Product: contoh, Marcatching Prompt Library, skincare lokal, course AI marketing, agency service, atau produk kamu.
- Offer: contoh, akses 80 prompt, kelas online, produk premium, konsultasi, template, atau free guide.
- Target Audience: contoh, founder muda, marketer pemula, content creator, business owner, atau audience spesifik kamu.
- Audience Pain: masalah nyata yang sedang mereka rasakan.
- Audience Desire: hasil emosional atau practical outcome yang mereka inginkan.
- Audience Fear: risiko yang mereka takutkan jika tidak berubah.
- Audience Status Goal: identitas atau standar diri yang ingin mereka tampilkan.
- Audience Friction: alasan mereka belum bertindak.
- Funnel Stage: awareness, interest, consideration, conversion, retention, atau referral.
- Channel: Instagram carousel, caption, landing page, ads, email, short-form video, website, atau channel lain.
- Desired Action: save, share, click, copy prompt, daftar, download, beli, DM, atau book call.
- Proof/Credibility: data, testimoni, pengalaman, proses, authority, atau tulis “belum tersedia” jika belum ada.
- Tone: sharp, calm, premium, natural Indonesian, dengan English punchline jika relevan.
- Constraints: batasan seperti jangan hard-selling, jangan fake urgency, jangan overclaim, jangan terlalu panjang.
Brand/Product:
Target Audience:
Funnel Stage:
Channel:
Desired Action:
Tone:
Constraints:

Analisis:
1. Pesan utama.
2. Pesan pendukung.
3. Informasi yang terlalu cepat muncul.
4. Informasi yang perlu dipindah ke akhir.
5. Friction yang muncul dari urutan lama.

Output:
1. Message hierarchy baru.
2. Section order.
3. Final copy berdasarkan hierarchy baru.
4. CTA.
5. Why this is easier to process.

Rules:
- Satu section hanya punya satu job.
- Jangan menumpuk semua benefit di awal.
- Prioritaskan clarity over completeness.
- Buat alur terasa natural.
```

---

## Cognitive Ease Prompt 04: One Idea Per Slide Carousel

### Best Used For
Instagram carousel edukasi dan lead magnet preview.

### Full Prompt
```text
Sebelum mengerjakan prompt ini, ikuti Resource Loading rules di SKILL.md: baca brand-memory.md (wajib), lalu resource resources/ yang relevan dengan task ini.

Setelah resource relevan terbaca, jalankan prompt ini dengan urutan:
1. Pahami konteks user.
2. Ambil brand-memory.md yang relevan.
3. Petakan audience psychology jika dibutuhkan.
4. Tentukan weighted emotional lever utama dan pendukung.
5. Sesuaikan dengan funnel stage dan channel.
6. Buat output sesuai format prompt.
7. Evaluasi dengan resources/evaluator/evaluator.md.
8. Jika ada score di bawah 8/10, rewrite sebelum final.
9. Finalisasi dengan resources/marketing/copy-quality-standards.md.

Kamu adalah Marcatching carousel strategist.

Ubah topik berikut menjadi carousel yang sangat mudah dipahami dengan prinsip one idea per slide. Setiap slide harus punya satu fungsi psikologis: hook, context, tension, breakdown, example, insight, CTA.

Topik:
[INSERT TOPIC]

Konteks:
Isi field di bawah dengan data spesifik. Gunakan contoh pengisian ini sebagai acuan, lalu sesuaikan dengan brand kamu:
- Brand/Product: contoh, Marcatching Prompt Library, skincare lokal, course AI marketing, agency service, atau produk kamu.
- Offer: contoh, akses 80 prompt, kelas online, produk premium, konsultasi, template, atau free guide.
- Target Audience: contoh, founder muda, marketer pemula, content creator, business owner, atau audience spesifik kamu.
- Audience Pain: masalah nyata yang sedang mereka rasakan.
- Audience Desire: hasil emosional atau practical outcome yang mereka inginkan.
- Audience Fear: risiko yang mereka takutkan jika tidak berubah.
- Audience Status Goal: identitas atau standar diri yang ingin mereka tampilkan.
- Audience Friction: alasan mereka belum bertindak.
- Funnel Stage: awareness, interest, consideration, conversion, retention, atau referral.
- Channel: Instagram carousel, caption, landing page, ads, email, short-form video, website, atau channel lain.
- Desired Action: save, share, click, copy prompt, daftar, download, beli, DM, atau book call.
- Proof/Credibility: data, testimoni, pengalaman, proses, authority, atau tulis “belum tersedia” jika belum ada.
- Tone: sharp, calm, premium, natural Indonesian, dengan English punchline jika relevan.
- Constraints: batasan seperti jangan hard-selling, jangan fake urgency, jangan overclaim, jangan terlalu panjang.
Brand/Product:
Target Audience:
Audience Pain:
Main Insight:
Funnel Stage:
Desired Action:
Tone:
Constraints:

Analisis:
1. Ide utama carousel.
2. Tension yang menahan attention.
3. Urutan slide paling mudah diproses.
4. Contoh yang membuat konsep lebih konkret.
5. Punchline yang memorable.

Output:
1. Carousel strategy.
2. Slide 1 sampai 7.
3. Caption pendukung.
4. CTA.
5. Why this carousel has cognitive ease.

Rules:
- Satu slide satu ide.
- Jangan membuat slide penuh teks.
- Hindari jargon yang tidak perlu.
- Gunakan contrast untuk membuat pesan mudah diingat.
```

---

## Cognitive Ease Prompt 05: Jargon Detox

### Best Used For
Copy yang terlalu akademik, terlalu corporate, atau terlalu penuh istilah teknis.

### Full Prompt
```text
Sebelum mengerjakan prompt ini, ikuti Resource Loading rules di SKILL.md: baca brand-memory.md (wajib), lalu resource resources/ yang relevan dengan task ini.

Setelah resource relevan terbaca, jalankan prompt ini dengan urutan:
1. Pahami konteks user.
2. Ambil brand-memory.md yang relevan.
3. Petakan audience psychology jika dibutuhkan.
4. Tentukan weighted emotional lever utama dan pendukung.
5. Sesuaikan dengan funnel stage dan channel.
6. Buat output sesuai format prompt.
7. Evaluasi dengan resources/evaluator/evaluator.md.
8. Jika ada score di bawah 8/10, rewrite sebelum final.
9. Finalisasi dengan resources/marketing/copy-quality-standards.md.

Kamu adalah Marcatching clarity editor.

Detoks copy berikut dari jargon yang tidak perlu. Ubah menjadi bahasa yang lebih manusiawi, jelas, dan tetap intelligent. Jangan menghapus istilah penting jika memang diperlukan. Jelaskan istilah penting dengan cara yang mudah dipahami.

Copy:
[PASTE COPY]

Konteks:
Isi field di bawah dengan data spesifik. Gunakan contoh pengisian ini sebagai acuan, lalu sesuaikan dengan brand kamu:
- Brand/Product: contoh, Marcatching Prompt Library, skincare lokal, course AI marketing, agency service, atau produk kamu.
- Offer: contoh, akses 80 prompt, kelas online, produk premium, konsultasi, template, atau free guide.
- Target Audience: contoh, founder muda, marketer pemula, content creator, business owner, atau audience spesifik kamu.
- Audience Pain: masalah nyata yang sedang mereka rasakan.
- Audience Desire: hasil emosional atau practical outcome yang mereka inginkan.
- Audience Fear: risiko yang mereka takutkan jika tidak berubah.
- Audience Status Goal: identitas atau standar diri yang ingin mereka tampilkan.
- Audience Friction: alasan mereka belum bertindak.
- Funnel Stage: awareness, interest, consideration, conversion, retention, atau referral.
- Channel: Instagram carousel, caption, landing page, ads, email, short-form video, website, atau channel lain.
- Desired Action: save, share, click, copy prompt, daftar, download, beli, DM, atau book call.
- Proof/Credibility: data, testimoni, pengalaman, proses, authority, atau tulis “belum tersedia” jika belum ada.
- Tone: sharp, calm, premium, natural Indonesian, dengan English punchline jika relevan.
- Constraints: batasan seperti jangan hard-selling, jangan fake urgency, jangan overclaim, jangan terlalu panjang.
Target Audience:
Channel:
Knowledge Level:
Desired Action:
Tone:
Constraints:

Analisis:
1. Jargon yang membuat copy berat.
2. Jargon yang perlu dipertahankan.
3. Istilah yang perlu dijelaskan.
4. Kalimat yang perlu dipotong.
5. Versi bahasa yang lebih natural.

Output:
1. Jargon audit.
2. Replacement word list.
3. Rewrite versi clear.
4. Rewrite versi Marcatching.
5. One-line takeaway.

Rules:
- Jangan membuat copy terlalu santai.
- Jangan menghilangkan presisi.
- Buat pembaca merasa “oh, ternyata gampang dipahami”.
```

---

## Cognitive Ease Prompt 06: Landing Page Clarity Audit

### Best Used For
Hero page, course page, product page, landing page, dan checkout page.

### Full Prompt
```text
Sebelum mengerjakan prompt ini, ikuti Resource Loading rules di SKILL.md: baca brand-memory.md (wajib), lalu resource resources/ yang relevan dengan task ini.

Setelah resource relevan terbaca, jalankan prompt ini dengan urutan:
1. Pahami konteks user.
2. Ambil brand-memory.md yang relevan.
3. Petakan audience psychology jika dibutuhkan.
4. Tentukan weighted emotional lever utama dan pendukung.
5. Sesuaikan dengan funnel stage dan channel.
6. Buat output sesuai format prompt.
7. Evaluasi dengan resources/evaluator/evaluator.md.
8. Jika ada score di bawah 8/10, rewrite sebelum final.
9. Finalisasi dengan resources/marketing/copy-quality-standards.md.

Kamu adalah Marcatching landing page clarity auditor.

Audit landing page copy berikut dari sisi cognitive ease. Tentukan apakah audiens bisa memahami offer, value, proof, dan next step dalam waktu singkat.

Copy:
[PASTE LANDING PAGE COPY]

Konteks:
Isi field di bawah dengan data spesifik. Gunakan contoh pengisian ini sebagai acuan, lalu sesuaikan dengan brand kamu:
- Brand/Product: contoh, Marcatching Prompt Library, skincare lokal, course AI marketing, agency service, atau produk kamu.
- Offer: contoh, akses 80 prompt, kelas online, produk premium, konsultasi, template, atau free guide.
- Target Audience: contoh, founder muda, marketer pemula, content creator, business owner, atau audience spesifik kamu.
- Audience Pain: masalah nyata yang sedang mereka rasakan.
- Audience Desire: hasil emosional atau practical outcome yang mereka inginkan.
- Audience Fear: risiko yang mereka takutkan jika tidak berubah.
- Audience Status Goal: identitas atau standar diri yang ingin mereka tampilkan.
- Audience Friction: alasan mereka belum bertindak.
- Funnel Stage: awareness, interest, consideration, conversion, retention, atau referral.
- Channel: Instagram carousel, caption, landing page, ads, email, short-form video, website, atau channel lain.
- Desired Action: save, share, click, copy prompt, daftar, download, beli, DM, atau book call.
- Proof/Credibility: data, testimoni, pengalaman, proses, authority, atau tulis “belum tersedia” jika belum ada.
- Tone: sharp, calm, premium, natural Indonesian, dengan English punchline jika relevan.
- Constraints: batasan seperti jangan hard-selling, jangan fake urgency, jangan overclaim, jangan terlalu panjang.
Brand/Product:
Offer:
Target Audience:
Funnel Stage:
Desired Action:
Price Point:
Proof/Credibility:
Tone:
Constraints:

Audit berdasarkan:
1. Offer clarity.
2. Audience relevance.
3. Message hierarchy.
4. Benefit specificity.
5. Proof placement.
6. CTA clarity.
7. Cognitive load.

Output:
1. Clarity score 1-10.
2. Bagian yang membingungkan.
3. Bagian yang sudah clear.
4. Revised message hierarchy.
5. Rewrite hero section.
6. Rewrite CTA section.
7. Why this improves cognitive ease.

Rules:
- Jangan menambah klaim baru.
- Jangan membuat copy terlalu panjang.
- Prioritaskan clear before clever.
```

---

## Cognitive Ease Prompt 07: TLI5 Marketing Explanation

### Best Used For
Konten edukasi, reels script, caption, dan course intro.

### Full Prompt
```text
Sebelum mengerjakan prompt ini, ikuti Resource Loading rules di SKILL.md: baca brand-memory.md (wajib), lalu resource resources/ yang relevan dengan task ini.

Setelah resource relevan terbaca, jalankan prompt ini dengan urutan:
1. Pahami konteks user.
2. Ambil brand-memory.md yang relevan.
3. Petakan audience psychology jika dibutuhkan.
4. Tentukan weighted emotional lever utama dan pendukung.
5. Sesuaikan dengan funnel stage dan channel.
6. Buat output sesuai format prompt.
7. Evaluasi dengan resources/evaluator/evaluator.md.
8. Jika ada score di bawah 8/10, rewrite sebelum final.
9. Finalisasi dengan resources/marketing/copy-quality-standards.md.

Kamu adalah Marcatching educator yang bisa menjelaskan konsep marketing dengan gaya TLI5, tetapi tetap terasa smart dan tidak kekanak-kanakan.

Jelaskan topik berikut dengan analogi yang dekat dengan kehidupan sehari-hari. Setelah itu, naikkan penjelasan ke level strategic agar tetap sesuai dengan Marcatching.

Topik:
[INSERT TOPIC]

Konteks:
Isi field di bawah dengan data spesifik. Gunakan contoh pengisian ini sebagai acuan, lalu sesuaikan dengan brand kamu:
- Brand/Product: contoh, Marcatching Prompt Library, skincare lokal, course AI marketing, agency service, atau produk kamu.
- Offer: contoh, akses 80 prompt, kelas online, produk premium, konsultasi, template, atau free guide.
- Target Audience: contoh, founder muda, marketer pemula, content creator, business owner, atau audience spesifik kamu.
- Audience Pain: masalah nyata yang sedang mereka rasakan.
- Audience Desire: hasil emosional atau practical outcome yang mereka inginkan.
- Audience Fear: risiko yang mereka takutkan jika tidak berubah.
- Audience Status Goal: identitas atau standar diri yang ingin mereka tampilkan.
- Audience Friction: alasan mereka belum bertindak.
- Funnel Stage: awareness, interest, consideration, conversion, retention, atau referral.
- Channel: Instagram carousel, caption, landing page, ads, email, short-form video, website, atau channel lain.
- Desired Action: save, share, click, copy prompt, daftar, download, beli, DM, atau book call.
- Proof/Credibility: data, testimoni, pengalaman, proses, authority, atau tulis “belum tersedia” jika belum ada.
- Tone: sharp, calm, premium, natural Indonesian, dengan English punchline jika relevan.
- Constraints: batasan seperti jangan hard-selling, jangan fake urgency, jangan overclaim, jangan terlalu panjang.
Target Audience:
Channel:
Desired Action:
Tone:
Constraints:

Analisis:
1. Bagian yang perlu disederhanakan.
2. Analogi sehari-hari yang paling cocok.
3. Insight marketing yang harus tetap muncul.
4. Punchline yang mudah diingat.

Output:
1. TLI5 explanation.
2. Analogi.
3. Strategic explanation.
4. Example.
5. Marcatching takeaway.
6. CTA if needed.

Rules:
- Jangan terlalu childish.
- Jangan pakai analogi yang terlalu jauh.
- Buat orang awam paham, tapi marketer tetap merasa dapat insight.
```

---

## Cognitive Ease Prompt 08: CTA Clarity Builder

### Best Used For
Landing page, email, caption, ads, dan checkout.

### Full Prompt
```text
Sebelum mengerjakan prompt ini, ikuti Resource Loading rules di SKILL.md: baca brand-memory.md (wajib), lalu resource resources/ yang relevan dengan task ini.

Setelah resource relevan terbaca, jalankan prompt ini dengan urutan:
1. Pahami konteks user.
2. Ambil brand-memory.md yang relevan.
3. Petakan audience psychology jika dibutuhkan.
4. Tentukan weighted emotional lever utama dan pendukung.
5. Sesuaikan dengan funnel stage dan channel.
6. Buat output sesuai format prompt.
7. Evaluasi dengan resources/evaluator/evaluator.md.
8. Jika ada score di bawah 8/10, rewrite sebelum final.
9. Finalisasi dengan resources/marketing/copy-quality-standards.md.

Kamu adalah Marcatching CTA strategist.

Buat CTA yang jelas, low-friction, dan terasa seperti langkah logis berikutnya. Jangan membuat CTA terlalu memaksa. Sesuaikan CTA dengan funnel stage dan emotional state audiens.

Konteks:
Isi field di bawah dengan data spesifik. Gunakan contoh pengisian ini sebagai acuan, lalu sesuaikan dengan brand kamu:
- Brand/Product: contoh, Marcatching Prompt Library, skincare lokal, course AI marketing, agency service, atau produk kamu.
- Offer: contoh, akses 80 prompt, kelas online, produk premium, konsultasi, template, atau free guide.
- Target Audience: contoh, founder muda, marketer pemula, content creator, business owner, atau audience spesifik kamu.
- Audience Pain: masalah nyata yang sedang mereka rasakan.
- Audience Desire: hasil emosional atau practical outcome yang mereka inginkan.
- Audience Fear: risiko yang mereka takutkan jika tidak berubah.
- Audience Status Goal: identitas atau standar diri yang ingin mereka tampilkan.
- Audience Friction: alasan mereka belum bertindak.
- Funnel Stage: awareness, interest, consideration, conversion, retention, atau referral.
- Channel: Instagram carousel, caption, landing page, ads, email, short-form video, website, atau channel lain.
- Desired Action: save, share, click, copy prompt, daftar, download, beli, DM, atau book call.
- Proof/Credibility: data, testimoni, pengalaman, proses, authority, atau tulis “belum tersedia” jika belum ada.
- Tone: sharp, calm, premium, natural Indonesian, dengan English punchline jika relevan.
- Constraints: batasan seperti jangan hard-selling, jangan fake urgency, jangan overclaim, jangan terlalu panjang.
Brand/Product:
Offer:
Target Audience:
Audience Friction:
Funnel Stage:
Channel:
Desired Action:
Risk Reversal:
Tone:
Constraints:

Analisis:
1. Apa yang membuat audiens ragu mengambil action.
2. Apakah CTA perlu soft, direct, atau reassuring.
3. Microcopy apa yang bisa mengurangi friction.
4. CTA mana yang paling sesuai dengan funnel stage.

Output:
1. CTA strategy.
2. 15 CTA options.
3. 5 supporting microcopy.
4. Best CTA recommendation.
5. Why it works psychologically.

Rules:
- Jangan memakai “klik sekarang” sebagai default.
- CTA harus spesifik.
- CTA harus terasa natural.
- Tambahkan reassurance jika audiens masih dingin.
```

---

## Cognitive Ease Prompt 09: Copy Compression

### Best Used For
Slide text, ad copy, headline, bio, website section, dan story.

### Full Prompt
```text
Sebelum mengerjakan prompt ini, ikuti Resource Loading rules di SKILL.md: baca brand-memory.md (wajib), lalu resource resources/ yang relevan dengan task ini.

Setelah resource relevan terbaca, jalankan prompt ini dengan urutan:
1. Pahami konteks user.
2. Ambil brand-memory.md yang relevan.
3. Petakan audience psychology jika dibutuhkan.
4. Tentukan weighted emotional lever utama dan pendukung.
5. Sesuaikan dengan funnel stage dan channel.
6. Buat output sesuai format prompt.
7. Evaluasi dengan resources/evaluator/evaluator.md.
8. Jika ada score di bawah 8/10, rewrite sebelum final.
9. Finalisasi dengan resources/marketing/copy-quality-standards.md.

Kamu adalah Marcatching compression editor.

Ringkas copy berikut tanpa kehilangan makna, emosi, dan strategic insight. Buat versi yang lebih pendek, lebih tajam, dan lebih mudah diingat.

Copy:
[PASTE COPY]

Konteks:
Isi field di bawah dengan data spesifik. Gunakan contoh pengisian ini sebagai acuan, lalu sesuaikan dengan brand kamu:
- Brand/Product: contoh, Marcatching Prompt Library, skincare lokal, course AI marketing, agency service, atau produk kamu.
- Offer: contoh, akses 80 prompt, kelas online, produk premium, konsultasi, template, atau free guide.
- Target Audience: contoh, founder muda, marketer pemula, content creator, business owner, atau audience spesifik kamu.
- Audience Pain: masalah nyata yang sedang mereka rasakan.
- Audience Desire: hasil emosional atau practical outcome yang mereka inginkan.
- Audience Fear: risiko yang mereka takutkan jika tidak berubah.
- Audience Status Goal: identitas atau standar diri yang ingin mereka tampilkan.
- Audience Friction: alasan mereka belum bertindak.
- Funnel Stage: awareness, interest, consideration, conversion, retention, atau referral.
- Channel: Instagram carousel, caption, landing page, ads, email, short-form video, website, atau channel lain.
- Desired Action: save, share, click, copy prompt, daftar, download, beli, DM, atau book call.
- Proof/Credibility: data, testimoni, pengalaman, proses, authority, atau tulis “belum tersedia” jika belum ada.
- Tone: sharp, calm, premium, natural Indonesian, dengan English punchline jika relevan.
- Constraints: batasan seperti jangan hard-selling, jangan fake urgency, jangan overclaim, jangan terlalu panjang.
Target Audience:
Channel:
Maximum Length:
Desired Action:
Tone:
Constraints:

Analisis:
1. Ide utama.
2. Bagian yang bisa dihapus.
3. Bagian yang harus dipertahankan.
4. Punchline paling kuat.
5. Struktur paling pendek yang tetap jelas.

Output:
1. Original insight.
2. 3 compressed versions.
3. Ultra-short version.
4. Punchline version.
5. Best recommendation.
6. Why this version works.

Rules:
- Jangan menghilangkan specificity.
- Jangan membuat copy terlalu abstrak.
- Potong repetition.
- Buat setiap kata punya fungsi.
```

---

## Cognitive Ease Prompt 10: Cognitive Ease Audit and Rewrite

### Best Used For
Audit copy secara umum dari clarity dan readability.

### Full Prompt
```text
Sebelum mengerjakan prompt ini, ikuti Resource Loading rules di SKILL.md: baca brand-memory.md (wajib), lalu resource resources/ yang relevan dengan task ini.

Setelah resource relevan terbaca, jalankan prompt ini dengan urutan:
1. Pahami konteks user.
2. Ambil brand-memory.md yang relevan.
3. Petakan audience psychology jika dibutuhkan.
4. Tentukan weighted emotional lever utama dan pendukung.
5. Sesuaikan dengan funnel stage dan channel.
6. Buat output sesuai format prompt.
7. Evaluasi dengan resources/evaluator/evaluator.md.
8. Jika ada score di bawah 8/10, rewrite sebelum final.
9. Finalisasi dengan resources/marketing/copy-quality-standards.md.

Kamu adalah Marcatching Cognitive Ease Doctor.

Audit copy berikut dari sisi kemudahan dipahami, message hierarchy, dan friction bahasa. Beri diagnosis dan rewrite agar copy lebih clear, credible, dan memorable.

Copy:
[PASTE COPY]

Konteks:
Isi field di bawah dengan data spesifik. Gunakan contoh pengisian ini sebagai acuan, lalu sesuaikan dengan brand kamu:
- Brand/Product: contoh, Marcatching Prompt Library, skincare lokal, course AI marketing, agency service, atau produk kamu.
- Offer: contoh, akses 80 prompt, kelas online, produk premium, konsultasi, template, atau free guide.
- Target Audience: contoh, founder muda, marketer pemula, content creator, business owner, atau audience spesifik kamu.
- Audience Pain: masalah nyata yang sedang mereka rasakan.
- Audience Desire: hasil emosional atau practical outcome yang mereka inginkan.
- Audience Fear: risiko yang mereka takutkan jika tidak berubah.
- Audience Status Goal: identitas atau standar diri yang ingin mereka tampilkan.
- Audience Friction: alasan mereka belum bertindak.
- Funnel Stage: awareness, interest, consideration, conversion, retention, atau referral.
- Channel: Instagram carousel, caption, landing page, ads, email, short-form video, website, atau channel lain.
- Desired Action: save, share, click, copy prompt, daftar, download, beli, DM, atau book call.
- Proof/Credibility: data, testimoni, pengalaman, proses, authority, atau tulis “belum tersedia” jika belum ada.
- Tone: sharp, calm, premium, natural Indonesian, dengan English punchline jika relevan.
- Constraints: batasan seperti jangan hard-selling, jangan fake urgency, jangan overclaim, jangan terlalu panjang.
Brand/Product:
Target Audience:
Channel:
Desired Action:
Tone:
Constraints:

Audit berdasarkan:
1. Main idea clarity.
2. Sentence length.
3. Jargon load.
4. Message order.
5. Specificity.
6. CTA clarity.
7. Memorability.

Output:
1. Cognitive ease score 1-10.
2. Main clarity problem.
3. Words or sentences to remove.
4. Rewrite versi simple.
5. Rewrite versi Marcatching premium.
6. One-line takeaway.
7. Why rewrite is easier to process.

Rules:
- Jangan membuat output dangkal.
- Jangan menghapus nuance penting.
- Buat copy bisa dibaca sekali dan langsung masuk.
```

---

# Category 7: Prompt for Belonging

## Psychological Job
Belonging prompt dipakai untuk membuat audiens merasa menjadi bagian dari kelompok, standar, cara berpikir, atau movement tertentu. Orang share konten yang mewakili kelompok mereka.

Belonging copy harus membuat audiens merasa seen, bukan dimanipulasi.

---

## Belonging Prompt 01: Shared Belief Builder

### Best Used For
Community, newsletter, follower growth, manifesto, dan educational brand.

### Full Prompt
```text
Sebelum mengerjakan prompt ini, ikuti Resource Loading rules di SKILL.md: baca brand-memory.md (wajib), lalu resource resources/ yang relevan dengan task ini.

Setelah resource relevan terbaca, jalankan prompt ini dengan urutan:
1. Pahami konteks user.
2. Ambil brand-memory.md yang relevan.
3. Petakan audience psychology jika dibutuhkan.
4. Tentukan weighted emotional lever utama dan pendukung.
5. Sesuaikan dengan funnel stage dan channel.
6. Buat output sesuai format prompt.
7. Evaluasi dengan resources/evaluator/evaluator.md.
8. Jika ada score di bawah 8/10, rewrite sebelum final.
9. Finalisasi dengan resources/marketing/copy-quality-standards.md.

Kamu adalah Marcatching community psychology strategist.

Buat copy yang dibangun dari shared belief audiens. Tujuannya adalah membuat mereka merasa “orang seperti gue berpikir seperti ini.” Jangan membuat copy terdengar seperti cult atau merendahkan kelompok lain.

Konteks:
Isi field di bawah dengan data spesifik. Gunakan contoh pengisian ini sebagai acuan, lalu sesuaikan dengan brand kamu:
- Brand/Product: contoh, Marcatching Prompt Library, skincare lokal, course AI marketing, agency service, atau produk kamu.
- Offer: contoh, akses 80 prompt, kelas online, produk premium, konsultasi, template, atau free guide.
- Target Audience: contoh, founder muda, marketer pemula, content creator, business owner, atau audience spesifik kamu.
- Audience Pain: masalah nyata yang sedang mereka rasakan.
- Audience Desire: hasil emosional atau practical outcome yang mereka inginkan.
- Audience Fear: risiko yang mereka takutkan jika tidak berubah.
- Audience Status Goal: identitas atau standar diri yang ingin mereka tampilkan.
- Audience Friction: alasan mereka belum bertindak.
- Funnel Stage: awareness, interest, consideration, conversion, retention, atau referral.
- Channel: Instagram carousel, caption, landing page, ads, email, short-form video, website, atau channel lain.
- Desired Action: save, share, click, copy prompt, daftar, download, beli, DM, atau book call.
- Proof/Credibility: data, testimoni, pengalaman, proses, authority, atau tulis “belum tersedia” jika belum ada.
- Tone: sharp, calm, premium, natural Indonesian, dengan English punchline jika relevan.
- Constraints: batasan seperti jangan hard-selling, jangan fake urgency, jangan overclaim, jangan terlalu panjang.
Brand/Community:
Target Audience:
Shared Belief:
Shared Frustration:
Shared Standard:
What The Audience Rejects:
Channel:
Desired Action:
Tone:
Constraints:

Analisis:
1. Belief yang menyatukan audiens.
2. Frustration yang mereka rasakan bersama.
3. Standard baru yang ingin mereka ikuti.
4. Bahasa yang membuat mereka merasa seen.
5. CTA yang natural.

Output:
1. Shared belief diagnosis.
2. 5 hook options.
3. Final copy.
4. CTA.
5. Why this creates belonging.

Rules:
- Jangan terlalu eksklusif.
- Jangan menyerang orang di luar kelompok.
- Gunakan tone smart, warm, dan confident.
- Buat audiens ingin share karena merasa terwakili.
```

---

## Belonging Prompt 02: People Like Us Framing

### Best Used For
Community post, membership page, brand manifesto, dan social caption.

### Full Prompt
```text
Sebelum mengerjakan prompt ini, ikuti Resource Loading rules di SKILL.md: baca brand-memory.md (wajib), lalu resource resources/ yang relevan dengan task ini.

Setelah resource relevan terbaca, jalankan prompt ini dengan urutan:
1. Pahami konteks user.
2. Ambil brand-memory.md yang relevan.
3. Petakan audience psychology jika dibutuhkan.
4. Tentukan weighted emotional lever utama dan pendukung.
5. Sesuaikan dengan funnel stage dan channel.
6. Buat output sesuai format prompt.
7. Evaluasi dengan resources/evaluator/evaluator.md.
8. Jika ada score di bawah 8/10, rewrite sebelum final.
9. Finalisasi dengan resources/marketing/copy-quality-standards.md.

Kamu adalah Marcatching identity-based community writer.

Gunakan framing “people like us do things like this” untuk membuat copy yang membangun belonging. Jangan menulis frasa itu secara literal jika terasa kaku. Terjemahkan menjadi copy yang natural, elegan, dan sesuai konteks Indonesia.

Konteks:
Isi field di bawah dengan data spesifik. Gunakan contoh pengisian ini sebagai acuan, lalu sesuaikan dengan brand kamu:
- Brand/Product: contoh, Marcatching Prompt Library, skincare lokal, course AI marketing, agency service, atau produk kamu.
- Offer: contoh, akses 80 prompt, kelas online, produk premium, konsultasi, template, atau free guide.
- Target Audience: contoh, founder muda, marketer pemula, content creator, business owner, atau audience spesifik kamu.
- Audience Pain: masalah nyata yang sedang mereka rasakan.
- Audience Desire: hasil emosional atau practical outcome yang mereka inginkan.
- Audience Fear: risiko yang mereka takutkan jika tidak berubah.
- Audience Status Goal: identitas atau standar diri yang ingin mereka tampilkan.
- Audience Friction: alasan mereka belum bertindak.
- Funnel Stage: awareness, interest, consideration, conversion, retention, atau referral.
- Channel: Instagram carousel, caption, landing page, ads, email, short-form video, website, atau channel lain.
- Desired Action: save, share, click, copy prompt, daftar, download, beli, DM, atau book call.
- Proof/Credibility: data, testimoni, pengalaman, proses, authority, atau tulis “belum tersedia” jika belum ada.
- Tone: sharp, calm, premium, natural Indonesian, dengan English punchline jika relevan.
- Constraints: batasan seperti jangan hard-selling, jangan fake urgency, jangan overclaim, jangan terlalu panjang.
Brand/Product:
Community or Audience:
Shared Behavior:
Shared Belief:
Desired Action:
Channel:
Tone:
Constraints:

Analisis:
1. Siapa “people like us” dalam konteks ini.
2. Perilaku apa yang menjadi signal kelompok.
3. Belief apa yang menjadi alasan perilaku itu.
4. Bagaimana membuat copy terasa inclusive.
5. CTA yang cocok.

Output:
1. Belonging frame.
2. 3 copy directions.
3. Final copy.
4. CTA.
5. Why this builds group identity.

Rules:
- Jangan membuat copy terasa cult-like.
- Jangan terlalu preachy.
- Jangan membuat audience terasa superior secara norak.
- Buat belonging terasa aspirational dan grounded.
```

---

## Belonging Prompt 03: Shared Frustration Hook

### Best Used For
Reels, carousel, quote post, X thread, dan LinkedIn post.

### Full Prompt
```text
Sebelum mengerjakan prompt ini, ikuti Resource Loading rules di SKILL.md: baca brand-memory.md (wajib), lalu resource resources/ yang relevan dengan task ini.

Setelah resource relevan terbaca, jalankan prompt ini dengan urutan:
1. Pahami konteks user.
2. Ambil brand-memory.md yang relevan.
3. Petakan audience psychology jika dibutuhkan.
4. Tentukan weighted emotional lever utama dan pendukung.
5. Sesuaikan dengan funnel stage dan channel.
6. Buat output sesuai format prompt.
7. Evaluasi dengan resources/evaluator/evaluator.md.
8. Jika ada score di bawah 8/10, rewrite sebelum final.
9. Finalisasi dengan resources/marketing/copy-quality-standards.md.

Kamu adalah Marcatching hook strategist.

Buat hook berdasarkan shared frustration audiens. Hook harus membuat audiens merasa “akhirnya ada yang ngomongin ini.” Setelah itu, arahkan frustration menjadi insight yang lebih strategic.

Konteks:
Isi field di bawah dengan data spesifik. Gunakan contoh pengisian ini sebagai acuan, lalu sesuaikan dengan brand kamu:
- Brand/Product: contoh, Marcatching Prompt Library, skincare lokal, course AI marketing, agency service, atau produk kamu.
- Offer: contoh, akses 80 prompt, kelas online, produk premium, konsultasi, template, atau free guide.
- Target Audience: contoh, founder muda, marketer pemula, content creator, business owner, atau audience spesifik kamu.
- Audience Pain: masalah nyata yang sedang mereka rasakan.
- Audience Desire: hasil emosional atau practical outcome yang mereka inginkan.
- Audience Fear: risiko yang mereka takutkan jika tidak berubah.
- Audience Status Goal: identitas atau standar diri yang ingin mereka tampilkan.
- Audience Friction: alasan mereka belum bertindak.
- Funnel Stage: awareness, interest, consideration, conversion, retention, atau referral.
- Channel: Instagram carousel, caption, landing page, ads, email, short-form video, website, atau channel lain.
- Desired Action: save, share, click, copy prompt, daftar, download, beli, DM, atau book call.
- Proof/Credibility: data, testimoni, pengalaman, proses, authority, atau tulis “belum tersedia” jika belum ada.
- Tone: sharp, calm, premium, natural Indonesian, dengan English punchline jika relevan.
- Constraints: batasan seperti jangan hard-selling, jangan fake urgency, jangan overclaim, jangan terlalu panjang.
Topic:
Target Audience:
Shared Frustration:
Misconception:
Desired Insight:
Channel:
Tone:
Constraints:

Analisis:
1. Frustration yang paling relatable.
2. Kenapa audiens jarang mengatakannya secara terbuka.
3. Insight yang bisa mengubah frustration menjadi clarity.
4. Hook yang paling share-worthy.

Output:
1. Shared frustration diagnosis.
2. 20 hook options.
3. 5 strongest hooks.
4. Content direction for each.
5. Final caption or script intro.

Rules:
- Jangan hanya mengeluh.
- Jangan sinis berlebihan.
- Ubah frustration menjadi pembelajaran.
- Tone harus sharp, not bitter.
```

---

## Belonging Prompt 04: Movement Manifesto

### Best Used For
Launch campaign, brand movement, community page, pinned post, dan manifesto carousel.

### Full Prompt
```text
Sebelum mengerjakan prompt ini, ikuti Resource Loading rules di SKILL.md: baca brand-memory.md (wajib), lalu resource resources/ yang relevan dengan task ini.

Setelah resource relevan terbaca, jalankan prompt ini dengan urutan:
1. Pahami konteks user.
2. Ambil brand-memory.md yang relevan.
3. Petakan audience psychology jika dibutuhkan.
4. Tentukan weighted emotional lever utama dan pendukung.
5. Sesuaikan dengan funnel stage dan channel.
6. Buat output sesuai format prompt.
7. Evaluasi dengan resources/evaluator/evaluator.md.
8. Jika ada score di bawah 8/10, rewrite sebelum final.
9. Finalisasi dengan resources/marketing/copy-quality-standards.md.

Kamu adalah Marcatching movement copywriter.

Buat manifesto yang membuat audiens merasa menjadi bagian dari movement. Manifesto harus punya belief, enemy idea, standard, dan invitation. Jangan terlalu dramatis. Jangan seperti deklarasi kosong.

Konteks:
Isi field di bawah dengan data spesifik. Gunakan contoh pengisian ini sebagai acuan, lalu sesuaikan dengan brand kamu:
- Brand/Product: contoh, Marcatching Prompt Library, skincare lokal, course AI marketing, agency service, atau produk kamu.
- Offer: contoh, akses 80 prompt, kelas online, produk premium, konsultasi, template, atau free guide.
- Target Audience: contoh, founder muda, marketer pemula, content creator, business owner, atau audience spesifik kamu.
- Audience Pain: masalah nyata yang sedang mereka rasakan.
- Audience Desire: hasil emosional atau practical outcome yang mereka inginkan.
- Audience Fear: risiko yang mereka takutkan jika tidak berubah.
- Audience Status Goal: identitas atau standar diri yang ingin mereka tampilkan.
- Audience Friction: alasan mereka belum bertindak.
- Funnel Stage: awareness, interest, consideration, conversion, retention, atau referral.
- Channel: Instagram carousel, caption, landing page, ads, email, short-form video, website, atau channel lain.
- Desired Action: save, share, click, copy prompt, daftar, download, beli, DM, atau book call.
- Proof/Credibility: data, testimoni, pengalaman, proses, authority, atau tulis “belum tersedia” jika belum ada.
- Tone: sharp, calm, premium, natural Indonesian, dengan English punchline jika relevan.
- Constraints: batasan seperti jangan hard-selling, jangan fake urgency, jangan overclaim, jangan terlalu panjang.
Movement/Brand:
Target Audience:
Core Belief:
Enemy Idea:
New Standard:
Desired Action:
Channel:
Tone:
Constraints:

Analisis:
1. Movement belief.
2. Apa yang dilawan, berupa idea bukan orang.
3. Standard baru yang ditawarkan.
4. Emosi dominan yang harus muncul.
5. CTA yang terasa seperti invitation.

Output:
1. Movement strategy.
2. Manifesto long version.
3. Manifesto short version.
4. 5 statement options.
5. CTA.
6. Why this creates belonging.

Rules:
- Jangan terlalu politis jika tidak relevan.
- Jangan membuat audience merasa harus fanatik.
- Buat message clean, confident, and memorable.
```

---

## Belonging Prompt 05: Community Onboarding Copy

### Best Used For
Welcome email, group onboarding, course community, newsletter welcome, dan membership.

### Full Prompt
```text
Sebelum mengerjakan prompt ini, ikuti Resource Loading rules di SKILL.md: baca brand-memory.md (wajib), lalu resource resources/ yang relevan dengan task ini.

Setelah resource relevan terbaca, jalankan prompt ini dengan urutan:
1. Pahami konteks user.
2. Ambil brand-memory.md yang relevan.
3. Petakan audience psychology jika dibutuhkan.
4. Tentukan weighted emotional lever utama dan pendukung.
5. Sesuaikan dengan funnel stage dan channel.
6. Buat output sesuai format prompt.
7. Evaluasi dengan resources/evaluator/evaluator.md.
8. Jika ada score di bawah 8/10, rewrite sebelum final.
9. Finalisasi dengan resources/marketing/copy-quality-standards.md.

Kamu adalah Marcatching onboarding strategist.

Buat copy onboarding yang membuat member baru merasa mereka masuk ke tempat yang tepat. Copy harus membangun belonging, menjelaskan standard komunitas, dan memberi next step pertama.

Konteks:
Isi field di bawah dengan data spesifik. Gunakan contoh pengisian ini sebagai acuan, lalu sesuaikan dengan brand kamu:
- Brand/Product: contoh, Marcatching Prompt Library, skincare lokal, course AI marketing, agency service, atau produk kamu.
- Offer: contoh, akses 80 prompt, kelas online, produk premium, konsultasi, template, atau free guide.
- Target Audience: contoh, founder muda, marketer pemula, content creator, business owner, atau audience spesifik kamu.
- Audience Pain: masalah nyata yang sedang mereka rasakan.
- Audience Desire: hasil emosional atau practical outcome yang mereka inginkan.
- Audience Fear: risiko yang mereka takutkan jika tidak berubah.
- Audience Status Goal: identitas atau standar diri yang ingin mereka tampilkan.
- Audience Friction: alasan mereka belum bertindak.
- Funnel Stage: awareness, interest, consideration, conversion, retention, atau referral.
- Channel: Instagram carousel, caption, landing page, ads, email, short-form video, website, atau channel lain.
- Desired Action: save, share, click, copy prompt, daftar, download, beli, DM, atau book call.
- Proof/Credibility: data, testimoni, pengalaman, proses, authority, atau tulis “belum tersedia” jika belum ada.
- Tone: sharp, calm, premium, natural Indonesian, dengan English punchline jika relevan.
- Constraints: batasan seperti jangan hard-selling, jangan fake urgency, jangan overclaim, jangan terlalu panjang.
Community/Product:
Target Audience:
Community Belief:
Member Pain:
Member Desire:
Rules or Standards:
First Action:
Channel:
Tone:
Constraints:

Analisis:
1. Perasaan member saat baru masuk.
2. Apa yang perlu mereka yakini.
3. Standard apa yang harus diperkenalkan.
4. Action pertama yang membuat mereka merasa terlibat.
5. Tone paling welcoming tetapi tetap premium.

Output:
1. Onboarding psychology.
2. Welcome copy.
3. Community standard section.
4. First action CTA.
5. Short pinned message.
6. Why this builds belonging.

Rules:
- Jangan terlalu formal.
- Jangan terlalu rame.
- Buat member merasa seen and guided.
- Gunakan tone warm, smart, and calm.
```

---

## Belonging Prompt 06: Shareable Tribe Statement

### Best Used For
Quote cards, single statement posts, carousel openers, dan community captions.

### Full Prompt
```text
Sebelum mengerjakan prompt ini, ikuti Resource Loading rules di SKILL.md: baca brand-memory.md (wajib), lalu resource resources/ yang relevan dengan task ini.

Setelah resource relevan terbaca, jalankan prompt ini dengan urutan:
1. Pahami konteks user.
2. Ambil brand-memory.md yang relevan.
3. Petakan audience psychology jika dibutuhkan.
4. Tentukan weighted emotional lever utama dan pendukung.
5. Sesuaikan dengan funnel stage dan channel.
6. Buat output sesuai format prompt.
7. Evaluasi dengan resources/evaluator/evaluator.md.
8. Jika ada score di bawah 8/10, rewrite sebelum final.
9. Finalisasi dengan resources/marketing/copy-quality-standards.md.

Kamu adalah Marcatching statement strategist.

Buat statement yang membuat audiens ingin share karena statement itu mewakili kelompok atau standar berpikir mereka. Statement harus singkat, clean, dan punya identity signal.

Konteks:
Isi field di bawah dengan data spesifik. Gunakan contoh pengisian ini sebagai acuan, lalu sesuaikan dengan brand kamu:
- Brand/Product: contoh, Marcatching Prompt Library, skincare lokal, course AI marketing, agency service, atau produk kamu.
- Offer: contoh, akses 80 prompt, kelas online, produk premium, konsultasi, template, atau free guide.
- Target Audience: contoh, founder muda, marketer pemula, content creator, business owner, atau audience spesifik kamu.
- Audience Pain: masalah nyata yang sedang mereka rasakan.
- Audience Desire: hasil emosional atau practical outcome yang mereka inginkan.
- Audience Fear: risiko yang mereka takutkan jika tidak berubah.
- Audience Status Goal: identitas atau standar diri yang ingin mereka tampilkan.
- Audience Friction: alasan mereka belum bertindak.
- Funnel Stage: awareness, interest, consideration, conversion, retention, atau referral.
- Channel: Instagram carousel, caption, landing page, ads, email, short-form video, website, atau channel lain.
- Desired Action: save, share, click, copy prompt, daftar, download, beli, DM, atau book call.
- Proof/Credibility: data, testimoni, pengalaman, proses, authority, atau tulis “belum tersedia” jika belum ada.
- Tone: sharp, calm, premium, natural Indonesian, dengan English punchline jika relevan.
- Constraints: batasan seperti jangan hard-selling, jangan fake urgency, jangan overclaim, jangan terlalu panjang.
Audience:
Shared Belief:
Shared Enemy Idea:
Desired Identity:
Topic:
Tone:
Constraints:

Analisis:
1. Identity yang ingin diwakili.
2. Belief yang paling kuat.
3. Contrast yang membuat statement tajam.
4. Words to avoid.

Output:
1. Statement strategy.
2. 30 statement options.
3. Top 10.
4. Best 3 with explanation.
5. Caption for best statement.

Rules:
- Jangan quote motivasional generik.
- Jangan terlalu abstrak.
- Buat statement terasa seperti “ini gue banget”.
- Maksimal 16 kata untuk top statements.
```

---

## Belonging Prompt 07: Founder to Audience Bridge

### Best Used For
Founder content, story post, newsletter, dan personal brand.

### Full Prompt
```text
Sebelum mengerjakan prompt ini, ikuti Resource Loading rules di SKILL.md: baca brand-memory.md (wajib), lalu resource resources/ yang relevan dengan task ini.

Setelah resource relevan terbaca, jalankan prompt ini dengan urutan:
1. Pahami konteks user.
2. Ambil brand-memory.md yang relevan.
3. Petakan audience psychology jika dibutuhkan.
4. Tentukan weighted emotional lever utama dan pendukung.
5. Sesuaikan dengan funnel stage dan channel.
6. Buat output sesuai format prompt.
7. Evaluasi dengan resources/evaluator/evaluator.md.
8. Jika ada score di bawah 8/10, rewrite sebelum final.
9. Finalisasi dengan resources/marketing/copy-quality-standards.md.

Kamu adalah Marcatching founder-led brand writer.

Buat copy yang menjembatani pengalaman founder dengan pengalaman audience sehingga muncul rasa belonging. Jangan membuat founder menjadi pusat cerita secara berlebihan. Gunakan cerita founder sebagai bukti bahwa brand memahami masalah audiens.

Konteks:
Isi field di bawah dengan data spesifik. Gunakan contoh pengisian ini sebagai acuan, lalu sesuaikan dengan brand kamu:
- Brand/Product: contoh, Marcatching Prompt Library, skincare lokal, course AI marketing, agency service, atau produk kamu.
- Offer: contoh, akses 80 prompt, kelas online, produk premium, konsultasi, template, atau free guide.
- Target Audience: contoh, founder muda, marketer pemula, content creator, business owner, atau audience spesifik kamu.
- Audience Pain: masalah nyata yang sedang mereka rasakan.
- Audience Desire: hasil emosional atau practical outcome yang mereka inginkan.
- Audience Fear: risiko yang mereka takutkan jika tidak berubah.
- Audience Status Goal: identitas atau standar diri yang ingin mereka tampilkan.
- Audience Friction: alasan mereka belum bertindak.
- Funnel Stage: awareness, interest, consideration, conversion, retention, atau referral.
- Channel: Instagram carousel, caption, landing page, ads, email, short-form video, website, atau channel lain.
- Desired Action: save, share, click, copy prompt, daftar, download, beli, DM, atau book call.
- Proof/Credibility: data, testimoni, pengalaman, proses, authority, atau tulis “belum tersedia” jika belum ada.
- Tone: sharp, calm, premium, natural Indonesian, dengan English punchline jika relevan.
- Constraints: batasan seperti jangan hard-selling, jangan fake urgency, jangan overclaim, jangan terlalu panjang.
Founder:
Brand:
Founder Experience:
Audience Pain:
Shared Belief:
Offer:
Channel:
Desired Action:
Tone:
Constraints:

Analisis:
1. Bagian pengalaman founder yang paling relevan.
2. Shared struggle antara founder dan audiens.
3. Belief yang muncul dari pengalaman itu.
4. Bridge menuju brand atau offer.
5. CTA natural.

Output:
1. Founder-audience bridge.
2. Final copy.
3. Short version.
4. CTA.
5. Why this creates belonging and trust.

Rules:
- Jangan terlalu personal jika tidak relevan.
- Jangan membuat story terlalu panjang.
- Fokus pada shared meaning.
- Tone harus human, calm, and strategic.
```

---

## Belonging Prompt 08: Comment Invitation Copy

### Best Used For
Engagement post, UGC, Prompt Clinic, AI Funnel Simulator, dan community building.

### Full Prompt
```text
Sebelum mengerjakan prompt ini, ikuti Resource Loading rules di SKILL.md: baca brand-memory.md (wajib), lalu resource resources/ yang relevan dengan task ini.

Setelah resource relevan terbaca, jalankan prompt ini dengan urutan:
1. Pahami konteks user.
2. Ambil brand-memory.md yang relevan.
3. Petakan audience psychology jika dibutuhkan.
4. Tentukan weighted emotional lever utama dan pendukung.
5. Sesuaikan dengan funnel stage dan channel.
6. Buat output sesuai format prompt.
7. Evaluasi dengan resources/evaluator/evaluator.md.
8. Jika ada score di bawah 8/10, rewrite sebelum final.
9. Finalisasi dengan resources/marketing/copy-quality-standards.md.

Kamu adalah Marcatching community engagement copywriter.

Buat copy yang mengundang audiens untuk comment atau submit sesuatu tanpa terasa seperti engagement bait murahan. Buat mereka merasa kontribusi mereka adalah bagian dari learning community.

Konteks:
Isi field di bawah dengan data spesifik. Gunakan contoh pengisian ini sebagai acuan, lalu sesuaikan dengan brand kamu:
- Brand/Product: contoh, Marcatching Prompt Library, skincare lokal, course AI marketing, agency service, atau produk kamu.
- Offer: contoh, akses 80 prompt, kelas online, produk premium, konsultasi, template, atau free guide.
- Target Audience: contoh, founder muda, marketer pemula, content creator, business owner, atau audience spesifik kamu.
- Audience Pain: masalah nyata yang sedang mereka rasakan.
- Audience Desire: hasil emosional atau practical outcome yang mereka inginkan.
- Audience Fear: risiko yang mereka takutkan jika tidak berubah.
- Audience Status Goal: identitas atau standar diri yang ingin mereka tampilkan.
- Audience Friction: alasan mereka belum bertindak.
- Funnel Stage: awareness, interest, consideration, conversion, retention, atau referral.
- Channel: Instagram carousel, caption, landing page, ads, email, short-form video, website, atau channel lain.
- Desired Action: save, share, click, copy prompt, daftar, download, beli, DM, atau book call.
- Proof/Credibility: data, testimoni, pengalaman, proses, authority, atau tulis “belum tersedia” jika belum ada.
- Tone: sharp, calm, premium, natural Indonesian, dengan English punchline jika relevan.
- Constraints: batasan seperti jangan hard-selling, jangan fake urgency, jangan overclaim, jangan terlalu panjang.
Content Series:
Audience:
What They Should Submit:
Why It Helps Them:
Why It Helps The Community:
Channel:
Tone:
Constraints:

Analisis:
1. Motivasi audiens untuk ikut comment.
2. Friction yang membuat mereka enggan submit.
3. Belonging angle yang membuat mereka merasa aman ikut.
4. CTA paling natural.

Output:
1. Engagement psychology.
2. 10 comment CTA options.
3. Final caption section.
4. Story version.
5. Why this avoids cheap engagement bait.

Rules:
- Jangan memakai “komen dong”.
- Jangan memohon engagement.
- Buat comment terasa seperti langkah belajar.
- Tone harus inviting and intelligent.
```

---

## Belonging Prompt 09: Belonging Through Standards

### Best Used For
Premium community, expert content, education brand, dan professional audience.

### Full Prompt
```text
Sebelum mengerjakan prompt ini, ikuti Resource Loading rules di SKILL.md: baca brand-memory.md (wajib), lalu resource resources/ yang relevan dengan task ini.

Setelah resource relevan terbaca, jalankan prompt ini dengan urutan:
1. Pahami konteks user.
2. Ambil brand-memory.md yang relevan.
3. Petakan audience psychology jika dibutuhkan.
4. Tentukan weighted emotional lever utama dan pendukung.
5. Sesuaikan dengan funnel stage dan channel.
6. Buat output sesuai format prompt.
7. Evaluasi dengan resources/evaluator/evaluator.md.
8. Jika ada score di bawah 8/10, rewrite sebelum final.
9. Finalisasi dengan resources/marketing/copy-quality-standards.md.

Kamu adalah Marcatching standards-based community strategist.

Buat copy yang membangun belonging melalui shared standard, bukan sekadar shared interest. Copy harus membuat audiens merasa bergabung dengan orang-orang yang punya cara berpikir lebih tajam.

Konteks:
Isi field di bawah dengan data spesifik. Gunakan contoh pengisian ini sebagai acuan, lalu sesuaikan dengan brand kamu:
- Brand/Product: contoh, Marcatching Prompt Library, skincare lokal, course AI marketing, agency service, atau produk kamu.
- Offer: contoh, akses 80 prompt, kelas online, produk premium, konsultasi, template, atau free guide.
- Target Audience: contoh, founder muda, marketer pemula, content creator, business owner, atau audience spesifik kamu.
- Audience Pain: masalah nyata yang sedang mereka rasakan.
- Audience Desire: hasil emosional atau practical outcome yang mereka inginkan.
- Audience Fear: risiko yang mereka takutkan jika tidak berubah.
- Audience Status Goal: identitas atau standar diri yang ingin mereka tampilkan.
- Audience Friction: alasan mereka belum bertindak.
- Funnel Stage: awareness, interest, consideration, conversion, retention, atau referral.
- Channel: Instagram carousel, caption, landing page, ads, email, short-form video, website, atau channel lain.
- Desired Action: save, share, click, copy prompt, daftar, download, beli, DM, atau book call.
- Proof/Credibility: data, testimoni, pengalaman, proses, authority, atau tulis “belum tersedia” jika belum ada.
- Tone: sharp, calm, premium, natural Indonesian, dengan English punchline jika relevan.
- Constraints: batasan seperti jangan hard-selling, jangan fake urgency, jangan overclaim, jangan terlalu panjang.
Brand/Community:
Target Audience:
Shared Standard:
Old Standard:
New Standard:
Desired Action:
Channel:
Tone:
Constraints:

Analisis:
1. Standard lama yang ingin ditinggalkan.
2. Standard baru yang ingin dibangun.
3. Kenapa audience ingin diasosiasikan dengan standard ini.
4. Copy angle yang paling mature.
5. CTA.

Output:
1. Standard shift map.
2. 5 hook options.
3. Final copy.
4. CTA.
5. Why this creates premium belonging.

Rules:
- Jangan membuat audience terasa elit norak.
- Jangan merendahkan pemula.
- Buat standard terasa aspirational and learnable.
```

---

## Belonging Prompt 10: Belonging Audit and Rewrite

### Best Used For
Audit community copy, membership page, caption, dan manifesto.

### Full Prompt
```text
Sebelum mengerjakan prompt ini, ikuti Resource Loading rules di SKILL.md: baca brand-memory.md (wajib), lalu resource resources/ yang relevan dengan task ini.

Setelah resource relevan terbaca, jalankan prompt ini dengan urutan:
1. Pahami konteks user.
2. Ambil brand-memory.md yang relevan.
3. Petakan audience psychology jika dibutuhkan.
4. Tentukan weighted emotional lever utama dan pendukung.
5. Sesuaikan dengan funnel stage dan channel.
6. Buat output sesuai format prompt.
7. Evaluasi dengan resources/evaluator/evaluator.md.
8. Jika ada score di bawah 8/10, rewrite sebelum final.
9. Finalisasi dengan resources/marketing/copy-quality-standards.md.

Kamu adalah Marcatching Belonging Copy Doctor.

Audit copy berikut dari sisi belonging. Tentukan apakah copy membuat audiens merasa seen, included, dan represented, atau justru terasa generic, terlalu eksklusif, atau terlalu salesy.

Copy:
[PASTE COPY]

Konteks:
Isi field di bawah dengan data spesifik. Gunakan contoh pengisian ini sebagai acuan, lalu sesuaikan dengan brand kamu:
- Brand/Product: contoh, Marcatching Prompt Library, skincare lokal, course AI marketing, agency service, atau produk kamu.
- Offer: contoh, akses 80 prompt, kelas online, produk premium, konsultasi, template, atau free guide.
- Target Audience: contoh, founder muda, marketer pemula, content creator, business owner, atau audience spesifik kamu.
- Audience Pain: masalah nyata yang sedang mereka rasakan.
- Audience Desire: hasil emosional atau practical outcome yang mereka inginkan.
- Audience Fear: risiko yang mereka takutkan jika tidak berubah.
- Audience Status Goal: identitas atau standar diri yang ingin mereka tampilkan.
- Audience Friction: alasan mereka belum bertindak.
- Funnel Stage: awareness, interest, consideration, conversion, retention, atau referral.
- Channel: Instagram carousel, caption, landing page, ads, email, short-form video, website, atau channel lain.
- Desired Action: save, share, click, copy prompt, daftar, download, beli, DM, atau book call.
- Proof/Credibility: data, testimoni, pengalaman, proses, authority, atau tulis “belum tersedia” jika belum ada.
- Tone: sharp, calm, premium, natural Indonesian, dengan English punchline jika relevan.
- Constraints: batasan seperti jangan hard-selling, jangan fake urgency, jangan overclaim, jangan terlalu panjang.
Brand/Community:
Target Audience:
Shared Belief:
Desired Action:
Channel:
Tone:
Constraints:

Audit berdasarkan:
1. Shared belief clarity.
2. Shared frustration.
3. Identity signal.
4. Inclusiveness.
5. Tone maturity.
6. CTA invitation.

Output:
1. Belonging score 1-10.
2. Masalah utama.
3. Bagian yang sudah kuat.
4. Rewrite versi belonging-based.
5. CTA baru.
6. Why rewrite creates stronger belonging.

Rules:
- Jangan membuat community terasa cult-like.
- Jangan terlalu eksklusif.
- Jangan pakai engagement bait.
- Buat audiens merasa seen and guided.
```

---

# Category 8: Prompt for Relief

## Psychological Job
Relief prompt dipakai untuk audiens yang overwhelmed, bingung, takut salah, atau merasa tertinggal. Relief membuat masalah terasa lebih bisa dipegang. Relief copy memvalidasi dulu, lalu memberi jalan keluar.

Relief bukan melemahkan urgency. Relief mengurangi chaos agar audiens bisa bergerak.

---

## Relief Prompt 01: Overwhelm Diagnostic

### Best Used For
AI education, beginner audience, course intro, lead magnet, dan onboarding.

### Full Prompt
```text
Sebelum mengerjakan prompt ini, ikuti Resource Loading rules di SKILL.md: baca brand-memory.md (wajib), lalu resource resources/ yang relevan dengan task ini.

Setelah resource relevan terbaca, jalankan prompt ini dengan urutan:
1. Pahami konteks user.
2. Ambil brand-memory.md yang relevan.
3. Petakan audience psychology jika dibutuhkan.
4. Tentukan weighted emotional lever utama dan pendukung.
5. Sesuaikan dengan funnel stage dan channel.
6. Buat output sesuai format prompt.
7. Evaluasi dengan resources/evaluator/evaluator.md.
8. Jika ada score di bawah 8/10, rewrite sebelum final.
9. Finalisasi dengan resources/marketing/copy-quality-standards.md.

Kamu adalah Marcatching copy strategist yang memahami relief, overwhelm, dan consumer psychology.

Tugasmu adalah mendiagnosis kenapa audiens merasa overwhelmed, lalu membuat copy yang membuat masalah terasa lebih jelas dan manageable. Jangan membuat audiens merasa tertinggal atau bodoh.

Konteks:
Isi field di bawah dengan data spesifik. Gunakan contoh pengisian ini sebagai acuan, lalu sesuaikan dengan brand kamu:
- Brand/Product: contoh, Marcatching Prompt Library, skincare lokal, course AI marketing, agency service, atau produk kamu.
- Offer: contoh, akses 80 prompt, kelas online, produk premium, konsultasi, template, atau free guide.
- Target Audience: contoh, founder muda, marketer pemula, content creator, business owner, atau audience spesifik kamu.
- Audience Pain: masalah nyata yang sedang mereka rasakan.
- Audience Desire: hasil emosional atau practical outcome yang mereka inginkan.
- Audience Fear: risiko yang mereka takutkan jika tidak berubah.
- Audience Status Goal: identitas atau standar diri yang ingin mereka tampilkan.
- Audience Friction: alasan mereka belum bertindak.
- Funnel Stage: awareness, interest, consideration, conversion, retention, atau referral.
- Channel: Instagram carousel, caption, landing page, ads, email, short-form video, website, atau channel lain.
- Desired Action: save, share, click, copy prompt, daftar, download, beli, DM, atau book call.
- Proof/Credibility: data, testimoni, pengalaman, proses, authority, atau tulis “belum tersedia” jika belum ada.
- Tone: sharp, calm, premium, natural Indonesian, dengan English punchline jika relevan.
- Constraints: batasan seperti jangan hard-selling, jangan fake urgency, jangan overclaim, jangan terlalu panjang.
Brand/Product:
Offer:
Target Audience:
Main Overwhelm:
Audience Pain:
Audience Desire:
Audience Fear:
Audience Friction:
Funnel Stage:
Channel:
Desired Action:
Tone:
Constraints:

Analisis:
1. Apa yang membuat audiens overwhelmed.
2. Kesalahan umum yang membuat masalah terasa lebih berat.
3. Apa yang sebenarnya perlu mereka lakukan pertama.
4. Simplifikasi apa yang memberi rasa lega.
5. Copy angle yang membuat audiens merasa seen.

Output:
1. Overwhelm diagnosis.
2. Relief angle.
3. 5 hook options.
4. Final copy.
5. CTA.
6. Why this creates relief.

Rules:
- Jangan menggurui.
- Jangan terlalu motivational.
- Validasi dulu, lalu arahkan.
- Buat solusi terasa ringan, jelas, dan masuk akal.
```

---

## Relief Prompt 02: You Don’t Need More Tools Copy

### Best Used For
AI marketing, Marcatching, prompt library, dan education content.

### Full Prompt
```text
Sebelum mengerjakan prompt ini, ikuti Resource Loading rules di SKILL.md: baca brand-memory.md (wajib), lalu resource resources/ yang relevan dengan task ini.

Setelah resource relevan terbaca, jalankan prompt ini dengan urutan:
1. Pahami konteks user.
2. Ambil brand-memory.md yang relevan.
3. Petakan audience psychology jika dibutuhkan.
4. Tentukan weighted emotional lever utama dan pendukung.
5. Sesuaikan dengan funnel stage dan channel.
6. Buat output sesuai format prompt.
7. Evaluasi dengan resources/evaluator/evaluator.md.
8. Jika ada score di bawah 8/10, rewrite sebelum final.
9. Finalisasi dengan resources/marketing/copy-quality-standards.md.

Kamu adalah Marcatching AI psychology writer.

Buat copy dengan angle: audiens tidak butuh lebih banyak tools, mereka butuh sistem berpikir yang membuat tools bekerja. Gunakan relief untuk mengurangi tekanan karena terlalu banyak pilihan AI tools.

Konteks:
Isi field di bawah dengan data spesifik. Gunakan contoh pengisian ini sebagai acuan, lalu sesuaikan dengan brand kamu:
- Brand/Product: contoh, Marcatching Prompt Library, skincare lokal, course AI marketing, agency service, atau produk kamu.
- Offer: contoh, akses 80 prompt, kelas online, produk premium, konsultasi, template, atau free guide.
- Target Audience: contoh, founder muda, marketer pemula, content creator, business owner, atau audience spesifik kamu.
- Audience Pain: masalah nyata yang sedang mereka rasakan.
- Audience Desire: hasil emosional atau practical outcome yang mereka inginkan.
- Audience Fear: risiko yang mereka takutkan jika tidak berubah.
- Audience Status Goal: identitas atau standar diri yang ingin mereka tampilkan.
- Audience Friction: alasan mereka belum bertindak.
- Funnel Stage: awareness, interest, consideration, conversion, retention, atau referral.
- Channel: Instagram carousel, caption, landing page, ads, email, short-form video, website, atau channel lain.
- Desired Action: save, share, click, copy prompt, daftar, download, beli, DM, atau book call.
- Proof/Credibility: data, testimoni, pengalaman, proses, authority, atau tulis “belum tersedia” jika belum ada.
- Tone: sharp, calm, premium, natural Indonesian, dengan English punchline jika relevan.
- Constraints: batasan seperti jangan hard-selling, jangan fake urgency, jangan overclaim, jangan terlalu panjang.
Brand/Product:
Offer:
Target Audience:
Tool Overwhelm:
Desired New Belief:
Funnel Stage:
Channel:
Desired Action:
Proof/Credibility:
Tone:
Constraints:

Analisis:
1. Kenapa terlalu banyak tools membuat audiens stuck.
2. Apa belief lama yang perlu dilepas.
3. Apa belief baru yang memberi relief.
4. Bagaimana Audience OS atau consumer psychology bisa menjadi solusi.
5. CTA yang ringan.

Output:
1. Tool overwhelm diagnosis.
2. Relief message.
3. 5 hook options.
4. Final copy.
5. CTA.
6. Why this reduces overwhelm.

Rules:
- Jangan anti-tools.
- Jelaskan bahwa tools berguna jika arah berpikirnya jelas.
- Gunakan tone calm, smart, and reassuring.
```

---

## Relief Prompt 03: Beginner-Friendly Reassurance

### Best Used For
Beginner course, free guide, first email, onboarding, dan learning page.

### Full Prompt
```text
Sebelum mengerjakan prompt ini, ikuti Resource Loading rules di SKILL.md: baca brand-memory.md (wajib), lalu resource resources/ yang relevan dengan task ini.

Setelah resource relevan terbaca, jalankan prompt ini dengan urutan:
1. Pahami konteks user.
2. Ambil brand-memory.md yang relevan.
3. Petakan audience psychology jika dibutuhkan.
4. Tentukan weighted emotional lever utama dan pendukung.
5. Sesuaikan dengan funnel stage dan channel.
6. Buat output sesuai format prompt.
7. Evaluasi dengan resources/evaluator/evaluator.md.
8. Jika ada score di bawah 8/10, rewrite sebelum final.
9. Finalisasi dengan resources/marketing/copy-quality-standards.md.

Kamu adalah Marcatching educational copywriter.

Buat copy untuk pemula yang merasa belum cukup pintar, belum punya pengalaman, atau takut mulai. Tujuan copy adalah memberi reassurance tanpa merendahkan. Buat mereka merasa langkah pertama itu jelas dan reachable.

Konteks:
Isi field di bawah dengan data spesifik. Gunakan contoh pengisian ini sebagai acuan, lalu sesuaikan dengan brand kamu:
- Brand/Product: contoh, Marcatching Prompt Library, skincare lokal, course AI marketing, agency service, atau produk kamu.
- Offer: contoh, akses 80 prompt, kelas online, produk premium, konsultasi, template, atau free guide.
- Target Audience: contoh, founder muda, marketer pemula, content creator, business owner, atau audience spesifik kamu.
- Audience Pain: masalah nyata yang sedang mereka rasakan.
- Audience Desire: hasil emosional atau practical outcome yang mereka inginkan.
- Audience Fear: risiko yang mereka takutkan jika tidak berubah.
- Audience Status Goal: identitas atau standar diri yang ingin mereka tampilkan.
- Audience Friction: alasan mereka belum bertindak.
- Funnel Stage: awareness, interest, consideration, conversion, retention, atau referral.
- Channel: Instagram carousel, caption, landing page, ads, email, short-form video, website, atau channel lain.
- Desired Action: save, share, click, copy prompt, daftar, download, beli, DM, atau book call.
- Proof/Credibility: data, testimoni, pengalaman, proses, authority, atau tulis “belum tersedia” jika belum ada.
- Tone: sharp, calm, premium, natural Indonesian, dengan English punchline jika relevan.
- Constraints: batasan seperti jangan hard-selling, jangan fake urgency, jangan overclaim, jangan terlalu panjang.
Brand/Product:
Offer:
Target Audience:
Beginner Fear:
Desired Action:
First Step:
Channel:
Proof/Credibility:
Tone:
Constraints:

Analisis:
1. Ketakutan pemula yang paling mungkin.
2. Apa yang membuat mereka menunda.
3. Apa first step yang paling ringan.
4. Apa reassurance yang credible.
5. Apa CTA yang tidak menekan.

Output:
1. Beginner anxiety diagnosis.
2. Reassurance angle.
3. Final copy.
4. CTA.
5. Short microcopy version.
6. Why this creates relief.

Rules:
- Jangan bilang “mudah banget” jika tidak benar.
- Jangan membuat proses terasa instan.
- Buat belajar terasa terstruktur.
- Tone harus warm, calm, and intelligent.
```

---

## Relief Prompt 04: Chaos to System Copy

### Best Used For
Marcatching core message, strategy content, funnel product, dan AI Marketing System.

### Full Prompt
```text
Sebelum mengerjakan prompt ini, ikuti Resource Loading rules di SKILL.md: baca brand-memory.md (wajib), lalu resource resources/ yang relevan dengan task ini.

Setelah resource relevan terbaca, jalankan prompt ini dengan urutan:
1. Pahami konteks user.
2. Ambil brand-memory.md yang relevan.
3. Petakan audience psychology jika dibutuhkan.
4. Tentukan weighted emotional lever utama dan pendukung.
5. Sesuaikan dengan funnel stage dan channel.
6. Buat output sesuai format prompt.
7. Evaluasi dengan resources/evaluator/evaluator.md.
8. Jika ada score di bawah 8/10, rewrite sebelum final.
9. Finalisasi dengan resources/marketing/copy-quality-standards.md.

Kamu adalah Marcatching system design copywriter.

Buat copy yang mengubah rasa chaos menjadi rasa punya sistem. Audiens merasa konten, AI, funnel, dan marketing terlalu banyak bagian. Tugasmu adalah menunjukkan bahwa masalah bisa dibaca sebagai sistem yang lebih sederhana.

Konteks:
Isi field di bawah dengan data spesifik. Gunakan contoh pengisian ini sebagai acuan, lalu sesuaikan dengan brand kamu:
- Brand/Product: contoh, Marcatching Prompt Library, skincare lokal, course AI marketing, agency service, atau produk kamu.
- Offer: contoh, akses 80 prompt, kelas online, produk premium, konsultasi, template, atau free guide.
- Target Audience: contoh, founder muda, marketer pemula, content creator, business owner, atau audience spesifik kamu.
- Audience Pain: masalah nyata yang sedang mereka rasakan.
- Audience Desire: hasil emosional atau practical outcome yang mereka inginkan.
- Audience Fear: risiko yang mereka takutkan jika tidak berubah.
- Audience Status Goal: identitas atau standar diri yang ingin mereka tampilkan.
- Audience Friction: alasan mereka belum bertindak.
- Funnel Stage: awareness, interest, consideration, conversion, retention, atau referral.
- Channel: Instagram carousel, caption, landing page, ads, email, short-form video, website, atau channel lain.
- Desired Action: save, share, click, copy prompt, daftar, download, beli, DM, atau book call.
- Proof/Credibility: data, testimoni, pengalaman, proses, authority, atau tulis “belum tersedia” jika belum ada.
- Tone: sharp, calm, premium, natural Indonesian, dengan English punchline jika relevan.
- Constraints: batasan seperti jangan hard-selling, jangan fake urgency, jangan overclaim, jangan terlalu panjang.
Brand/Product:
Offer:
Target Audience:
Current Chaos:
Desired System:
Funnel Stage:
Channel:
Desired Action:
Proof/Credibility:
Tone:
Constraints:

Analisis:
1. Sumber chaos utama.
2. Bagian mana yang sebenarnya saling terhubung.
3. Framework sederhana yang bisa memberi clarity.
4. Emosi relief yang harus muncul.
5. CTA yang logis.

Output:
1. Chaos diagnosis.
2. System simplification.
3. 5 hook options.
4. Final copy.
5. CTA.
6. Why this creates relief and control.

Rules:
- Jangan overcomplicate framework.
- Jangan memakai terlalu banyak istilah.
- Gunakan contrast: chaos vs system.
- Tone harus clean, precise, and reassuring.
```

---

## Relief Prompt 05: Mistake Normalizer

### Best Used For
Prompt Clinic, Ads Doctor, educational content, dan beginner-friendly content.

### Full Prompt
```text
Sebelum mengerjakan prompt ini, ikuti Resource Loading rules di SKILL.md: baca brand-memory.md (wajib), lalu resource resources/ yang relevan dengan task ini.

Setelah resource relevan terbaca, jalankan prompt ini dengan urutan:
1. Pahami konteks user.
2. Ambil brand-memory.md yang relevan.
3. Petakan audience psychology jika dibutuhkan.
4. Tentukan weighted emotional lever utama dan pendukung.
5. Sesuaikan dengan funnel stage dan channel.
6. Buat output sesuai format prompt.
7. Evaluasi dengan resources/evaluator/evaluator.md.
8. Jika ada score di bawah 8/10, rewrite sebelum final.
9. Finalisasi dengan resources/marketing/copy-quality-standards.md.

Kamu adalah Marcatching educator yang memahami shame reduction dalam learning psychology.

Buat copy yang menormalisasi kesalahan audiens tanpa membiarkan mereka tetap stuck. Tujuannya adalah membuat mereka merasa kesalahan itu bisa diperbaiki dengan sistem yang lebih jelas.

Konteks:
Isi field di bawah dengan data spesifik. Gunakan contoh pengisian ini sebagai acuan, lalu sesuaikan dengan brand kamu:
- Brand/Product: contoh, Marcatching Prompt Library, skincare lokal, course AI marketing, agency service, atau produk kamu.
- Offer: contoh, akses 80 prompt, kelas online, produk premium, konsultasi, template, atau free guide.
- Target Audience: contoh, founder muda, marketer pemula, content creator, business owner, atau audience spesifik kamu.
- Audience Pain: masalah nyata yang sedang mereka rasakan.
- Audience Desire: hasil emosional atau practical outcome yang mereka inginkan.
- Audience Fear: risiko yang mereka takutkan jika tidak berubah.
- Audience Status Goal: identitas atau standar diri yang ingin mereka tampilkan.
- Audience Friction: alasan mereka belum bertindak.
- Funnel Stage: awareness, interest, consideration, conversion, retention, atau referral.
- Channel: Instagram carousel, caption, landing page, ads, email, short-form video, website, atau channel lain.
- Desired Action: save, share, click, copy prompt, daftar, download, beli, DM, atau book call.
- Proof/Credibility: data, testimoni, pengalaman, proses, authority, atau tulis “belum tersedia” jika belum ada.
- Tone: sharp, calm, premium, natural Indonesian, dengan English punchline jika relevan.
- Constraints: batasan seperti jangan hard-selling, jangan fake urgency, jangan overclaim, jangan terlalu panjang.
Topic/Mistake:
Brand/Product:
Target Audience:
Common Mistake:
Why It Happens:
Better Approach:
Channel:
Desired Action:
Tone:
Constraints:

Analisis:
1. Kesalahan umum yang perlu dinormalisasi.
2. Kenapa audiens melakukan kesalahan itu.
3. Apa insight yang membuat mereka merasa lega.
4. Apa langkah perbaikan yang clear.
5. CTA.

Output:
1. Mistake diagnosis.
2. Relief angle.
3. Final copy.
4. CTA.
5. Why this reduces shame and creates action.

Rules:
- Jangan mempermalukan audiens.
- Jangan terlalu lembek.
- Akui kesalahan, lalu beri path forward.
- Tone harus kind, smart, and constructive.
```

---

## Relief Prompt 06: First Step CTA

### Best Used For
Lead magnet, course signup, consultation, free trial, dan low-commitment action.

### Full Prompt
```text
Sebelum mengerjakan prompt ini, ikuti Resource Loading rules di SKILL.md: baca brand-memory.md (wajib), lalu resource resources/ yang relevan dengan task ini.

Setelah resource relevan terbaca, jalankan prompt ini dengan urutan:
1. Pahami konteks user.
2. Ambil brand-memory.md yang relevan.
3. Petakan audience psychology jika dibutuhkan.
4. Tentukan weighted emotional lever utama dan pendukung.
5. Sesuaikan dengan funnel stage dan channel.
6. Buat output sesuai format prompt.
7. Evaluasi dengan resources/evaluator/evaluator.md.
8. Jika ada score di bawah 8/10, rewrite sebelum final.
9. Finalisasi dengan resources/marketing/copy-quality-standards.md.

Kamu adalah Marcatching friction reduction strategist.

Buat CTA dan supporting copy yang membuat next step terasa ringan. Audiens merasa overwhelmed, jadi CTA tidak boleh terasa besar atau mengintimidasi. Fokus pada langkah pertama yang paling jelas.

Konteks:
Isi field di bawah dengan data spesifik. Gunakan contoh pengisian ini sebagai acuan, lalu sesuaikan dengan brand kamu:
- Brand/Product: contoh, Marcatching Prompt Library, skincare lokal, course AI marketing, agency service, atau produk kamu.
- Offer: contoh, akses 80 prompt, kelas online, produk premium, konsultasi, template, atau free guide.
- Target Audience: contoh, founder muda, marketer pemula, content creator, business owner, atau audience spesifik kamu.
- Audience Pain: masalah nyata yang sedang mereka rasakan.
- Audience Desire: hasil emosional atau practical outcome yang mereka inginkan.
- Audience Fear: risiko yang mereka takutkan jika tidak berubah.
- Audience Status Goal: identitas atau standar diri yang ingin mereka tampilkan.
- Audience Friction: alasan mereka belum bertindak.
- Funnel Stage: awareness, interest, consideration, conversion, retention, atau referral.
- Channel: Instagram carousel, caption, landing page, ads, email, short-form video, website, atau channel lain.
- Desired Action: save, share, click, copy prompt, daftar, download, beli, DM, atau book call.
- Proof/Credibility: data, testimoni, pengalaman, proses, authority, atau tulis “belum tersedia” jika belum ada.
- Tone: sharp, calm, premium, natural Indonesian, dengan English punchline jika relevan.
- Constraints: batasan seperti jangan hard-selling, jangan fake urgency, jangan overclaim, jangan terlalu panjang.
Brand/Product:
Offer:
Target Audience:
Audience Friction:
Desired Action:
Alternative Smaller Action:
Channel:
Risk Reversal:
Tone:
Constraints:

Analisis:
1. Apa yang membuat CTA terasa berat.
2. Apa action terkecil yang tetap meaningful.
3. Apa reassurance yang dibutuhkan.
4. Apa wording CTA paling ringan.
5. Supporting microcopy.

Output:
1. CTA friction diagnosis.
2. 15 low-friction CTA options.
3. 5 supporting microcopy.
4. Best CTA recommendation.
5. Why this creates relief.

Rules:
- Jangan memakai CTA yang terlalu agresif.
- Jangan terlalu banyak pilihan.
- Buat action terasa safe, simple, and clear.
```

---

## Relief Prompt 07: Email Nurture Relief

### Best Used For
Welcome email, nurture sequence, course onboarding, lead magnet delivery.

### Full Prompt
```text
Sebelum mengerjakan prompt ini, ikuti Resource Loading rules di SKILL.md: baca brand-memory.md (wajib), lalu resource resources/ yang relevan dengan task ini.

Setelah resource relevan terbaca, jalankan prompt ini dengan urutan:
1. Pahami konteks user.
2. Ambil brand-memory.md yang relevan.
3. Petakan audience psychology jika dibutuhkan.
4. Tentukan weighted emotional lever utama dan pendukung.
5. Sesuaikan dengan funnel stage dan channel.
6. Buat output sesuai format prompt.
7. Evaluasi dengan resources/evaluator/evaluator.md.
8. Jika ada score di bawah 8/10, rewrite sebelum final.
9. Finalisasi dengan resources/marketing/copy-quality-standards.md.

Kamu adalah Marcatching email copywriter.

Buat email nurture yang memberi rasa relief setelah audiens download, daftar, atau masuk ke sebuah program. Email harus membuat mereka merasa keputusan mereka benar, memberi clarity, dan mengarahkan langkah pertama.

Konteks:
Isi field di bawah dengan data spesifik. Gunakan contoh pengisian ini sebagai acuan, lalu sesuaikan dengan brand kamu:
- Brand/Product: contoh, Marcatching Prompt Library, skincare lokal, course AI marketing, agency service, atau produk kamu.
- Offer: contoh, akses 80 prompt, kelas online, produk premium, konsultasi, template, atau free guide.
- Target Audience: contoh, founder muda, marketer pemula, content creator, business owner, atau audience spesifik kamu.
- Audience Pain: masalah nyata yang sedang mereka rasakan.
- Audience Desire: hasil emosional atau practical outcome yang mereka inginkan.
- Audience Fear: risiko yang mereka takutkan jika tidak berubah.
- Audience Status Goal: identitas atau standar diri yang ingin mereka tampilkan.
- Audience Friction: alasan mereka belum bertindak.
- Funnel Stage: awareness, interest, consideration, conversion, retention, atau referral.
- Channel: Instagram carousel, caption, landing page, ads, email, short-form video, website, atau channel lain.
- Desired Action: save, share, click, copy prompt, daftar, download, beli, DM, atau book call.
- Proof/Credibility: data, testimoni, pengalaman, proses, authority, atau tulis “belum tersedia” jika belum ada.
- Tone: sharp, calm, premium, natural Indonesian, dengan English punchline jika relevan.
- Constraints: batasan seperti jangan hard-selling, jangan fake urgency, jangan overclaim, jangan terlalu panjang.
Brand/Product:
Offer:
Target Audience:
What They Just Did:
Main Overwhelm:
First Step:
Desired Action:
Tone:
Constraints:

Analisis:
1. Emosi audiens setelah mengambil action.
2. Keraguan yang mungkin muncul.
3. Reassurance yang perlu diberikan.
4. Langkah pertama paling jelas.
5. Bridge ke value berikutnya.

Output:
1. Email strategy.
2. Subject line options.
3. Email body.
4. CTA.
5. P.S. line.
6. Why this creates relief.

Rules:
- Jangan langsung upsell terlalu keras.
- Buat mereka merasa guided.
- Gunakan bahasa hangat tetapi tetap premium.
- Satu email satu tujuan.
```

---

## Relief Prompt 08: Relief-Based Lead Magnet Page

### Best Used For
Free PDF, prompt library, checklist, worksheet, dan template download page.

### Full Prompt
```text
Sebelum mengerjakan prompt ini, ikuti Resource Loading rules di SKILL.md: baca brand-memory.md (wajib), lalu resource resources/ yang relevan dengan task ini.

Setelah resource relevan terbaca, jalankan prompt ini dengan urutan:
1. Pahami konteks user.
2. Ambil brand-memory.md yang relevan.
3. Petakan audience psychology jika dibutuhkan.
4. Tentukan weighted emotional lever utama dan pendukung.
5. Sesuaikan dengan funnel stage dan channel.
6. Buat output sesuai format prompt.
7. Evaluasi dengan resources/evaluator/evaluator.md.
8. Jika ada score di bawah 8/10, rewrite sebelum final.
9. Finalisasi dengan resources/marketing/copy-quality-standards.md.

Kamu adalah Marcatching lead magnet strategist.

Buat landing page copy untuk lead magnet yang memberi rasa relief. Audiens harus merasa lead magnet ini membantu membuat masalah yang rumit menjadi lebih jelas, lebih ringan, dan lebih actionable.

Konteks:
Isi field di bawah dengan data spesifik. Gunakan contoh pengisian ini sebagai acuan, lalu sesuaikan dengan brand kamu:
- Brand/Product: contoh, Marcatching Prompt Library, skincare lokal, course AI marketing, agency service, atau produk kamu.
- Offer: contoh, akses 80 prompt, kelas online, produk premium, konsultasi, template, atau free guide.
- Target Audience: contoh, founder muda, marketer pemula, content creator, business owner, atau audience spesifik kamu.
- Audience Pain: masalah nyata yang sedang mereka rasakan.
- Audience Desire: hasil emosional atau practical outcome yang mereka inginkan.
- Audience Fear: risiko yang mereka takutkan jika tidak berubah.
- Audience Status Goal: identitas atau standar diri yang ingin mereka tampilkan.
- Audience Friction: alasan mereka belum bertindak.
- Funnel Stage: awareness, interest, consideration, conversion, retention, atau referral.
- Channel: Instagram carousel, caption, landing page, ads, email, short-form video, website, atau channel lain.
- Desired Action: save, share, click, copy prompt, daftar, download, beli, DM, atau book call.
- Proof/Credibility: data, testimoni, pengalaman, proses, authority, atau tulis “belum tersedia” jika belum ada.
- Tone: sharp, calm, premium, natural Indonesian, dengan English punchline jika relevan.
- Constraints: batasan seperti jangan hard-selling, jangan fake urgency, jangan overclaim, jangan terlalu panjang.
Lead Magnet:
Brand:
Target Audience:
Main Problem:
Main Overwhelm:
What The Lead Magnet Helps With:
Desired Action:
Proof/Credibility:
Tone:
Constraints:

Analisis:
1. Overwhelm utama audiens.
2. Apa yang lead magnet sederhanakan.
3. Apa quick win yang bisa dijanjikan secara etis.
4. Apa trust signal yang dibutuhkan.
5. CTA paling low-friction.

Output:
1. Lead magnet positioning.
2. Hero headline.
3. Subheadline.
4. Bullet benefits.
5. CTA.
6. Supporting microcopy.
7. Why this creates relief.

Rules:
- Jangan overpromise.
- Jangan membuat lead magnet terdengar terlalu lengkap jika tidak.
- Fokus pada clarity and first step.
- Tone harus calm, useful, and premium.
```

---

## Relief Prompt 09: Relief Script for Short Video

### Best Used For
TikTok, Reels, Shorts, dan educational video.

### Full Prompt
```text
Sebelum mengerjakan prompt ini, ikuti Resource Loading rules di SKILL.md: baca brand-memory.md (wajib), lalu resource resources/ yang relevan dengan task ini.

Setelah resource relevan terbaca, jalankan prompt ini dengan urutan:
1. Pahami konteks user.
2. Ambil brand-memory.md yang relevan.
3. Petakan audience psychology jika dibutuhkan.
4. Tentukan weighted emotional lever utama dan pendukung.
5. Sesuaikan dengan funnel stage dan channel.
6. Buat output sesuai format prompt.
7. Evaluasi dengan resources/evaluator/evaluator.md.
8. Jika ada score di bawah 8/10, rewrite sebelum final.
9. Finalisasi dengan resources/marketing/copy-quality-standards.md.

Kamu adalah Marcatching short-form video strategist.

Buat script video pendek yang memberi rasa relief terhadap masalah marketing atau AI yang membuat audiens overwhelmed. Video harus dimulai dengan pattern interrupt, lalu validasi masalah, beri simplifikasi, contoh, dan CTA.

Konteks:
Isi field di bawah dengan data spesifik. Gunakan contoh pengisian ini sebagai acuan, lalu sesuaikan dengan brand kamu:
- Brand/Product: contoh, Marcatching Prompt Library, skincare lokal, course AI marketing, agency service, atau produk kamu.
- Offer: contoh, akses 80 prompt, kelas online, produk premium, konsultasi, template, atau free guide.
- Target Audience: contoh, founder muda, marketer pemula, content creator, business owner, atau audience spesifik kamu.
- Audience Pain: masalah nyata yang sedang mereka rasakan.
- Audience Desire: hasil emosional atau practical outcome yang mereka inginkan.
- Audience Fear: risiko yang mereka takutkan jika tidak berubah.
- Audience Status Goal: identitas atau standar diri yang ingin mereka tampilkan.
- Audience Friction: alasan mereka belum bertindak.
- Funnel Stage: awareness, interest, consideration, conversion, retention, atau referral.
- Channel: Instagram carousel, caption, landing page, ads, email, short-form video, website, atau channel lain.
- Desired Action: save, share, click, copy prompt, daftar, download, beli, DM, atau book call.
- Proof/Credibility: data, testimoni, pengalaman, proses, authority, atau tulis “belum tersedia” jika belum ada.
- Tone: sharp, calm, premium, natural Indonesian, dengan English punchline jika relevan.
- Constraints: batasan seperti jangan hard-selling, jangan fake urgency, jangan overclaim, jangan terlalu panjang.
Topic:
Brand/Product:
Target Audience:
Main Overwhelm:
Simplified Insight:
Desired Action:
Duration:
Tone:
Constraints:

Analisis:
1. Hook yang membuat audiens merasa seen.
2. Validasi masalah.
3. Simplifikasi paling kuat.
4. Contoh konkret.
5. CTA natural.

Output:
1. Video concept.
2. Hook options.
3. Full script.
4. On-screen text.
5. Caption.
6. CTA.

Rules:
- Jangan terlalu panjang.
- Jangan menumpuk banyak poin.
- Satu video satu insight.
- Tone harus reassuring, sharp, and easy to follow.
```

---

## Relief Prompt 10: Relief Audit and Rewrite

### Best Used For
Audit copy yang terlalu menekan, terlalu menakutkan, atau membuat audiens makin bingung.

### Full Prompt
```text
Sebelum mengerjakan prompt ini, ikuti Resource Loading rules di SKILL.md: baca brand-memory.md (wajib), lalu resource resources/ yang relevan dengan task ini.

Setelah resource relevan terbaca, jalankan prompt ini dengan urutan:
1. Pahami konteks user.
2. Ambil brand-memory.md yang relevan.
3. Petakan audience psychology jika dibutuhkan.
4. Tentukan weighted emotional lever utama dan pendukung.
5. Sesuaikan dengan funnel stage dan channel.
6. Buat output sesuai format prompt.
7. Evaluasi dengan resources/evaluator/evaluator.md.
8. Jika ada score di bawah 8/10, rewrite sebelum final.
9. Finalisasi dengan resources/marketing/copy-quality-standards.md.

Kamu adalah Marcatching Relief Copy Doctor.

Audit copy berikut dari sisi relief. Tentukan apakah copy membuat audiens merasa dipahami dan punya jalan keluar, atau justru membuat mereka merasa tertekan, bingung, atau tertinggal.

Copy:
[PASTE COPY]

Konteks:
Isi field di bawah dengan data spesifik. Gunakan contoh pengisian ini sebagai acuan, lalu sesuaikan dengan brand kamu:
- Brand/Product: contoh, Marcatching Prompt Library, skincare lokal, course AI marketing, agency service, atau produk kamu.
- Offer: contoh, akses 80 prompt, kelas online, produk premium, konsultasi, template, atau free guide.
- Target Audience: contoh, founder muda, marketer pemula, content creator, business owner, atau audience spesifik kamu.
- Audience Pain: masalah nyata yang sedang mereka rasakan.
- Audience Desire: hasil emosional atau practical outcome yang mereka inginkan.
- Audience Fear: risiko yang mereka takutkan jika tidak berubah.
- Audience Status Goal: identitas atau standar diri yang ingin mereka tampilkan.
- Audience Friction: alasan mereka belum bertindak.
- Funnel Stage: awareness, interest, consideration, conversion, retention, atau referral.
- Channel: Instagram carousel, caption, landing page, ads, email, short-form video, website, atau channel lain.
- Desired Action: save, share, click, copy prompt, daftar, download, beli, DM, atau book call.
- Proof/Credibility: data, testimoni, pengalaman, proses, authority, atau tulis “belum tersedia” jika belum ada.
- Tone: sharp, calm, premium, natural Indonesian, dengan English punchline jika relevan.
- Constraints: batasan seperti jangan hard-selling, jangan fake urgency, jangan overclaim, jangan terlalu panjang.
Brand/Product:
Target Audience:
Main Overwhelm:
Channel:
Desired Action:
Tone:
Constraints:

Audit berdasarkan:
1. Empathy.
2. Clarity.
3. Overwhelm reduction.
4. First step clarity.
5. Tone warmth.
6. CTA friction.

Output:
1. Relief score 1-10.
2. Bagian yang membuat audience makin overwhelmed.
3. Bagian yang sudah membantu.
4. Rewrite versi relief-based.
5. CTA baru.
6. Why rewrite creates relief.

Rules:
- Jangan membuat copy terlalu soft sampai kehilangan direction.
- Jangan menghapus urgency jika masih valid.
- Validasi masalah, lalu arahkan ke step jelas.
- Tone harus empathetic, intelligent, and calm.
```

---

# Appendix: Recommended Product Structure

## Free Lead Magnet
**50 AI Marketing Prompts Based on Consumer Psychology**

Recommended content:
- 6 Trust prompts.
- 6 Urgency prompts.
- 6 Premium prompts.
- 6 Identity prompts.
- 6 Loss Aversion prompts.
- 6 Cognitive Ease prompts.
- 6 Belonging prompts.
- 6 Relief prompts.
- 2 bonus prompts: Audience OS and Prompt Clinic.

## Paid Product
**Emotional Prompt Library Pro**

Recommended content:
- All 80 prompts in this document.
- Audience OS worksheet.
- Prompt Clinic worksheet.
- AI Ads Doctor worksheet.
- Before-after examples.
- Notion dashboard.
- PDF edition.
- Prompt quality checklist.
- Category-based use case map.

## Suggested CTA
**Download the free prompt library. Learn how to make AI think like a strategist, not just write like a machine.**

---

# Final Marcatching Reminder

Do not use these prompts as shortcuts.

Use them as thinking systems.

The goal is not to create more output.

The goal is to make every output understand why people care, trust, desire, and decide.

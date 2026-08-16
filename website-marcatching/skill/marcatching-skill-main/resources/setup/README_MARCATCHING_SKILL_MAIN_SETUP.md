# README — Marcatching Skill Main User Setup

## If You Downloaded This Personalized From the Marcatching Website

`brand-memory.md` is already filled in and already sits inside this ZIP, next to `SKILL.md`. The skill reads it automatically — you do not need any of the manual steps below (no `brand-memory-template.md`, no renaming, no uploading to Project Knowledge). Skip straight to using the skill with the prompt library.

The rest of this guide describes the manual flow for a non-personalized/original ZIP, or for using this skill outside the Marcatching website.

## What This File Is

File ini adalah **instruksi setup**, bukan file yang harus diisi dengan data brand.

User tidak mengisi data brand di README ini.

User mengisi data brand di:

```text
brand-memory-template.md
```

Lalu setelah diisi, user bisa rename menjadi:

```text
brand-memory-profile.md
```

atau:

```text
brand-memory-[nama-brand].md
```

File brand memory yang sudah diisi inilah yang dipakai sebagai konteks utama supaya user tidak perlu mengetik ulang data brand setiap kali prompting.

---

# 1. File Yang Perlu Dipahami

## 1.1 Skill ZIP

```text
marcatching-skill-main-v1.1-claude-compliant.zip
```

Ini adalah skill utama.

Di Claude, user memanggilnya dengan:

```text
/marcatching-skill-main
```

Skill ini berisi sistem kerja AI: routing, marketing intelligence, content creation, brand memory, research safety, evaluator, dan resources lainnya.

User tidak perlu mengedit isi ZIP ini.

---

## 1.2 Brand Memory Template

```text
brand-memory-template.md
```

Ini adalah file yang harus diisi user.

Fungsinya untuk menyimpan konteks brand, offer, audience, voice, competitors, proof, dan usage notes.

User isi file ini sekali di awal, lalu gunakan sebagai default brand memory.

---

## 1.3 Brand Memory Skill Resource

```text
brand-memory.md
```

Ini bukan file yang diisi user.

Ini adalah resource/instruksi untuk AI tentang cara membaca, menyusun, dan memakai Brand Memory Profile.

User tidak perlu mengedit file ini.

---

## 1.4 Prompt Libraries

```text
marcatching-emotional-prompt-library_v1_2_skill-main-ready.md
marcatching-content-creation-prompt-library_v1_1_skill-main-ready.md
```

Ini adalah prompt bank.

User copy prompt dari sini setelah skill aktif dan brand memory tersedia.

---

# 2. Setup Flow Paling Benar

Gunakan flow ini agar sistem bekerja maksimal.

```text
Install Skill ZIP
→ Isi brand-memory-template.md
→ Rename hasil isi menjadi brand-memory-profile.md
→ Upload/simpan brand-memory-profile.md di workspace/project
→ Aktifkan /marcatching-skill-main
→ Minta AI memakai Brand Memory Profile sebagai konteks utama
→ Jalankan prompt library
```

---

# 3. Step-by-Step Setup

## Step 1 — Install Skill

Install file:

```text
marcatching-skill-main-v1.1-claude-compliant.zip
```

Setelah aktif, panggil skill dengan:

```text
/marcatching-skill-main
```

---

## Step 2 — Isi Brand Memory Template

Buka:

```text
brand-memory-template.md
```

Isi bagian berikut:

```text
Brand Snapshot
Offer
Audience
Voice
Competitors
Proof
Usage Notes
```

Setelah selesai, rename file menjadi:

```text
brand-memory-profile.md
```

atau gunakan nama brand:

```text
brand-memory-marcatching.md
brand-memory-medtools.md
brand-memory-brandname.md
```

---

## Step 3 — Simpan Brand Memory Agar Tidak Perlu Isi Berulang

Agar user tidak perlu mengetik ulang data brand setiap kali prompting, lakukan salah satu cara berikut.

### Option A — Claude Project / Workspace

Masukkan file yang sudah diisi ke Project Knowledge / project files.

Recommended file:

```text
brand-memory-profile.md
```

Lalu setiap kali mulai task, user cukup tulis:

```text
/marcatching-skill-main

Gunakan Brand Memory Profile yang tersedia di project sebagai konteks utama.
```

### Option B — Same Conversation

Upload atau paste `brand-memory-profile.md` sekali di awal conversation.

Lalu untuk request berikutnya dalam conversation yang sama, user cukup tulis:

```text
Gunakan Brand Memory Profile yang sudah saya berikan.
```

### Option C — User Maintains A Local Memory File

User menyimpan file `brand-memory-profile.md` di lokal.

Jika ada update brand, user edit file itu, lalu upload ulang ke workspace/project.

---

# 4. Important Limitation

Ini berlaku untuk manual setup flow di atas (ZIP non-personalized). Untuk ZIP yang didownload personalized dari website Marcatching, `brand-memory.md` SUDAH otomatis tersimpan di dalam file skill ZIP sejak awal — bagian ini tidak berlaku untuk kasus itu.

Untuk manual setup flow: brand memory tidak otomatis tersimpan di dalam file skill ZIP setelah skill diinstall.

Skill ZIP bersifat seperti sistem kerja.

Brand Memory Profile adalah data user yang harus disimpan sebagai project knowledge, uploaded file, atau context di workspace.

Jadi struktur yang benar:

```text
Skill ZIP = otak / operating system
Brand Memory Profile = data brand user
Prompt Library = task templates
```

Skill membaca Brand Memory Profile ketika tersedia.

---

# 5. Minimum Brand Memory Yang Wajib Diisi

Jika user ingin setup cepat, isi minimal:

```text
Brand Name:
Website:
Category:
One-line positioning:
Offer:
Target audience:
Audience pain:
Audience desire:
Audience friction:
Tone:
Words to avoid:
Proof:
Competitors:
Main goal:
```

Kalau bagian proof belum ada, tulis:

```text
Belum tersedia.
```

Jangan mengarang proof.

---

# 6. Optional Files Untuk Output Lebih Kuat

Brand Memory Profile adalah yang paling penting.

Selain itu, user bisa membuat file tambahan jika dibutuhkan.

## 6.1 Offer Memory

Gunakan jika user sedang menjual produk, kelas, jasa, bundle, campaign, atau launch.

File yang disarankan:

```text
offer-memory-[nama-offer].md
```

Isi:

```text
Offer name:
Offer type:
Price point:
Main promise:
Deliverables:
Unique mechanism:
Who it is for:
Who it is not for:
Proof:
Objections:
Risk reversal:
CTA:
```

Dipakai untuk:

```text
Landing page
Sales page
Ads
Launch campaign
Checkout copy
Offer positioning
Objection handling
```

---

## 6.2 Content Voice Profile

Gunakan jika user sering membuat konten sosial, script, carousel, caption, atau short-form video.

File yang disarankan:

```text
content-voice-profile.md
```

Isi:

```text
Tone:
Creator personality:
Speaking style:
Energy level:
Hook style:
Caption style:
Script style:
Words to use:
Words to avoid:
Good content examples:
Bad content examples:
Platform rules:
```

Dipakai untuk:

```text
TikTok/Reels/Shorts script
FYP content ideas
Carousel
Caption
POV content
UGC script
Content calendar
```

---

## 6.3 Source Bank

Gunakan jika user membuat konten edukasi yang factual, medis, legal, financial, data-driven, atau high-stakes.

File yang disarankan:

```text
source-bank.md
```

Isi:

```text
Trusted sources:
Official websites:
Guidelines:
Journals:
Books:
Internal docs:
Sources to avoid:
Claims allowed:
Claims that need source:
Claims to avoid:
Required disclaimer:
What AI must not say:
What needs expert review:
Last updated:
```

Dipakai untuk:

```text
Medical content
Health education
Scientific content
Finance/legal education
Statistical claims
Trend reports
News-based content
High-stakes educational content
```

---

# 7. Recommended Setup Levels

## Level 1 — Quick Start

Pakai ini untuk output cepat.

```text
/marcatching-skill-main
+ brand-memory-profile.md
+ selected prompt from prompt library
```

Cocok untuk:

```text
caption
basic copy
simple content ideas
simple scripts
```

---

## Level 2 — Better Output

Pakai ini untuk output yang lebih brand-specific.

```text
/marcatching-skill-main
+ brand-memory-profile.md
+ offer-memory.md
+ content-voice-profile.md
+ selected prompt from prompt library
```

Cocok untuk:

```text
landing page
ads
campaign
FYP scripts
content calendar
brand-specific copy
```

---

## Level 3 — High-Stakes Output

Pakai ini untuk konten yang butuh akurasi dan source safety.

```text
/marcatching-skill-main
+ brand-memory-profile.md
+ offer-memory.md
+ content-voice-profile.md
+ source-bank.md
+ selected prompt from prompt library
```

Cocok untuk:

```text
medical education
health content
financial/legal education
data-driven content
expert content
public-facing factual claims
```

---

# 8. How To Start A New Session

Jika brand memory sudah tersimpan di Project Knowledge atau sudah di-upload dalam conversation, user bisa mulai dengan format:

```text
/marcatching-skill-main

Gunakan Brand Memory Profile yang tersedia sebagai konteks utama.

Task:
[Buat copy / bikin script / analisis konten / audit copy / buat ide konten]

Prompt:
[Paste prompt dari prompt library]
```

Jika ada offer memory, content voice, atau source bank, tambahkan:

```text
Gunakan juga Offer Memory, Content Voice Profile, dan Source Bank yang tersedia jika relevan.
```

---

# 9. Example Setup Command

```text
/marcatching-skill-main

Ini adalah setup awal brand saya.

Saya sudah upload:
1. brand-memory-profile.md
2. offer-memory-main-product.md
3. content-voice-profile.md
4. source-bank.md jika diperlukan

Gunakan file-file tersebut sebagai default context untuk semua output marketing dan content creation saya.

Jika suatu task membutuhkan informasi yang belum tersedia di memory, tanyakan dulu atau jelaskan asumsi sebelum membuat final output.
```

---

# 10. Example Prompt After Setup

```text
/marcatching-skill-main

Gunakan Brand Memory Profile dan Content Voice Profile yang sudah tersedia.

Saya mau bikin script Reels untuk topik:
Kenapa prompt AI marketing sering terasa generic.

Goal:
Awareness dan save/share.

Platform:
Instagram Reels.

Gunakan prompt:
Storytelling and Scriptwriting Engine — TikTok/Reels Scriptwriter.
```

---

# 11. What User Should Not Do

Jangan isi data brand di README ini.

Jangan edit file skill ZIP hanya untuk memasukkan data brand.

Jangan menganggap `brand-memory.md` sebagai form yang harus diisi.

Jangan menggunakan prompt library tanpa skill aktif.

Jangan berharap output brand-specific kalau Brand Memory Profile kosong.

Jangan membuat konten medis/factual tanpa Source Bank atau sumber yang jelas.

Jangan upload 11 modular files lama jika sudah memakai Marcatching Skill Main v1.1.

---

# 12. Final Setup Summary

Setup paling ideal:

```text
1. Install marcatching-skill-main-v1.1-claude-compliant.zip
2. Isi brand-memory-template.md
3. Save hasilnya sebagai brand-memory-profile.md
4. Upload brand-memory-profile.md ke Project Knowledge / workspace
5. Optional: buat offer-memory.md
6. Optional: buat content-voice-profile.md
7. Optional: buat source-bank.md
8. Jalankan /marcatching-skill-main
9. Copy prompt dari prompt library
10. AI membuat output berdasarkan memory + skill + prompt
```

Prinsip utama:

```text
README = instruksi setup
brand-memory-template.md = file yang diisi user
brand-memory-profile.md = hasil isi yang disimpan sebagai memory
SKILL.md = sistem kerja AI
prompt library = template task
```

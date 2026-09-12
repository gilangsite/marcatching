# Content Creation

The admin dashboard has a **Content Creation** entry in the sidebar and the home menu. The editor is loaded on demand.

## Using the editor

1. Choose 9:16 (1080 × 1920), 1:1 (1080 × 1080), 16:9 (1920 × 1080), 3:5 (1080 × 1800), or 3:4 (1080 × 1440) from the Marcatching dropdown and create a project.
2. Upload a background template. Backgrounds fill the slide with a centered crop. You can also choose a plain background color.
3. Add text or supporting images. Edit text in the properties panel, or double-click text on the canvas to focus the text field. Choose Poppins, DM Sans, Palatino, or Classic (Times New Roman). Select part of a paragraph to open the inline popup and apply bold, italic, regular, font size, or color only to that selection. Ctrl/Cmd + B and Ctrl/Cmd + I work while editing. Poppins and DM Sans are self-hosted by Next.js. Palatino and Classic use system fonts with serif fallbacks.
4. Drag elements to move them. The handles at the middle-left and middle-right of selected text resize its box without changing the font size, which controls line wrapping. Drag the lower-right selection handle to scale the element and its font proportionally. Font size has a slider and a numeric field. Numeric fields apply on blur or Enter. Image width/height fields retain proportions. Text supports left, center, right, and justified alignment.
5. Use the six position controls to snap an element to the left, horizontal center, right, top, vertical center, or bottom of the slide. Use the layer list to select overlapping elements and Maju/Mundur to move one layer forward/backward. Delete/Backspace removes the selected element only when focus is outside a text field. Arrow keys move it 1 px; Shift + arrow moves it 10 px.
6. Add, duplicate, delete, or reorder slides. Duplicate selected elements with Ctrl/Cmd + D, copy/paste them with Ctrl/Cmd + C/V, change layers with Ctrl/Cmd + [ or ], and control zoom with Ctrl/Cmd +/−/0. If no element is selected, Ctrl/Cmd + D duplicates the current slide. Undo/redo covers these operations (last 50 editing snapshots). The Shortcut menu in the toolbar lists the available keys.
7. Zoom only the carousel preview from 25% to 250% using the minus/plus buttons, slider, numeric value, shortcuts, or a trackpad pinch gesture while the pointer is over the preview. Browser page zoom is not changed.
8. Click **Simpan** or Ctrl/Cmd + S to save to cloud. Unsaved work is automatically kept as a local browser draft, including when switching dashboard tabs. Newer local drafts reappear in the project list. Browser storage is not a cross-device backup; save to cloud before moving to another device. Concurrent cloud saves use last-write-wins.
9. **Download semua** generates a ZIP containing slide-01.png, slide-02.png, etc. in project order, at the exact pixel sizes above. The renderer is shared with the preview and waits for fonts and all images. A missing image fails the export instead of silently omitting it. Generated PNGs/ZIPs are not uploaded or stored on the server.

Limits: 40 slides/project, 60 elements/slide, 10,000 characters/text element, 8–400 px font sizes, 120-character project names, 2 MB project documents. Uploads accept PNG/JPEG/WebP up to 3 MB each; the editor rejects images exceeding 40 megapixels before upload. No background removal, filters, or effects.

## Storage

A private Supabase Storage bucket named `content-creation` is created on first use using the existing server-only service-role key. No new database table or migration is needed. The bucket contains:

- `projects/<project UUID>.json`: small, versioned documents containing plain text, styles, coordinates, slide order and asset references.
- `assets/<project UUID>/<asset UUID>.<extension>`: images when R2 is not configured.

All project and image reads/writes go through `/api/admin/content-creation` and `/api/admin/content-creation/assets`. Both use the existing admin-session check; the service key stays on the server. Uploaded files are checked against supported file signatures and MIME types. Arbitrary remote URLs, HTML, SVG and embedded image data are rejected by the document validator. Asset paths are restricted to their own project.

Removed/replaced images are retained until the entire project is deleted, so undo and local draft recovery can still reference them. Deleting a project also deletes all its uploaded assets. The list loads 25 projects at a time.

## Enable Cloudflare R2 for images

Create a private R2 bucket and a bucket-scoped Object Read & Write API token, then set these server environment variables (also listed in `.env.example`):

```
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=
```

Set all four or leave all four empty. Restart/redeploy after changing them. With all four set, new image uploads use R2 under `content-creation/<project UUID>/...`; JSON documents still use Supabase. Previously uploaded Supabase images remain readable. Do not remove the R2 credentials while projects reference R2 images. Switching provider does not automatically move existing images.

The private image proxy keeps preview and export on the same origin, so no public bucket, custom domain, or browser CORS configuration is required. This trades direct browser-to-R2 delivery for simpler authenticated access. Image downloads still pass through the application host. Reference: [Cloudflare R2 AWS SDK v3 setup](https://developers.cloudflare.com/r2/examples/aws/aws-sdk-js-v3/).

## Verification

```
npm run test:content
npx next typegen && npx tsc --noEmit
npx eslint app/admin/ContentCreationTab.tsx app/admin/content-creation lib/content-creation app/api/admin/content-creation tests/content-creation playwright.content.config.ts
npm run build
```

Optional integration test against the local development server:

```
npx playwright install chromium
npm run dev -- --port 3100
# In another terminal:
npm run test:content:e2e
```

The E2E suite is hardcoded to inside.localhost:3100. It uses the Supabase project from `.env.local`, creates a temporary admin session and disposable carousel/images, and removes only its own fixtures afterward. It checks API authorization, high-contrast library copy, mixed inline text formatting, text-width handles, preview-only trackpad zoom, custom dropdowns, justify and position alignment, shortcuts, editing, drag, layers, image uploads, undo, project persistence, all five ZIP output dimensions, and mobile overflow. Screenshots and failure details are written to `tmp/`.

R2 requires real R2 credentials for an integration test. The Supabase fallback does not verify an R2 account's capacity, quota, or billing plan.

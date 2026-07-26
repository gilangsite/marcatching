# Marcatching Learning OS — Frontend Architecture Handoff

Status: frontend complete, database integration intentionally pending.

## Scope

This phase restructures `course.marcatching.com` into a member workspace without
changing production database schemas. Existing Supabase authentication, course
access, materials, and learning progress remain active.

New Creator Revenue OS modules currently use a device-local draft adapter. This
lets the full interaction model be reviewed before database tables and RLS
policies are introduced.

## Route map

| Public URL on course subdomain | App route | Responsibility |
| --- | --- | --- |
| `/login` | `/course/login` | Member sign-in and first-time account activation |
| `/` | `/course` | Learning overview, progress, continue-learning, course library |
| `/{course-slug}` | `/course/[slug]` | Course reader, progress, video/PDF/download assets |
| `/workspace` | `/course/workspace` | Creator Revenue OS workspace |

The existing hostname rewrite in `proxy.ts` remains the source of truth for
mapping `course.marcatching.com` to `/course`.

## Shared frontend architecture

- `app/course/layout.tsx`
  - Guards all member routes except login.
  - Wraps authenticated pages with the shared member shell.
- `app/course/CourseShell.tsx`
  - Desktop and mobile navigation.
  - Account identity, support access, and logout.
  - One consistent shell for Learning and Creator Workspace.
- `app/course/page.tsx`
  - Uses existing production course data.
  - Calculates course count, material completion, and continue-learning state.
- `app/course/[slug]/page.tsx`
  - Uses existing product, enrollment, material, and progress data.
  - Preserves video, PDF, Markdown, ZIP, fullscreen reader, and completion flows.
- `app/course/workspace/WorkspaceClient.tsx`
  - Owns the interactive Creator Revenue OS frontend.
  - Uses a local adapter until the database phase.
- `app/course/workspaceData.ts`
  - Defines the frontend domain model and starter blueprint.

## Creator Revenue OS modules

| Module | Minimum user data represented |
| --- | --- |
| Overview | Active phase, next action, review point, overall completion |
| Audience OS | Pain, desire, fear, status, friction, trigger, evidence, confidence |
| Revenue Thesis | Buyer, why now, offer, proof, monetization path, price architecture |
| Content IP | Three repeatable series, job, format, hook, value, CTA |
| 30-Day Map | Week, day, asset, Content IP, format, CTA, production status |
| AI Creator Memory | Voice, audience facts, red lines, output quality gate |
| Conversion Map | Attention, profile, lead, nurture, close |
| Experiments | Hypothesis, control, variant, primary metric, result, decision |
| Metrics | Baseline, current snapshot, Day-21 target, progress |
| Deliverables | Nine required assets and approval status |

## Current data sources

These existing tables are still used by the Learning area:

- `course_access_emails`
- `products`
- `course_materials`
- `learning_progress`
- Supabase Auth users

No new database writes were added in this phase.

## Proposed database contract for the next phase

The backend should use normalized per-user or per-workspace records. Suggested
tables:

1. `course_member_profiles`
   - `user_id`, `display_name`, `email`, `avatar_url`, timestamps.
2. `creator_workspaces`
   - `id`, `user_id`, `program_type`, `creator_name`, `business_type`,
     `primary_goal`, `active_phase`, `started_at`, `review_at`.
3. `audience_os_dimensions`
   - `workspace_id`, `dimension`, `prompt`, `insight`, `evidence`, `score`.
4. `revenue_theses`
   - `workspace_id`, `buyer`, `why_now`, `offer`, `proof`, `path`, `price`,
     `status`, `approved_at`.
5. `content_ips`
   - `workspace_id`, `name`, `role`, `format`, `hook`, `value`, `cta`, `status`.
6. `content_calendar_items`
   - `workspace_id`, `week`, `publish_date`, `title`, `content_ip_id`, `format`,
     `cta`, `status`, `published_url`.
7. `creator_ai_memories`
   - `workspace_id`, `voice`, `audience_facts`, `red_lines`, `quality_gate`,
     `version`.
8. `conversion_maps`
   - `workspace_id`, `awareness`, `profile`, `lead`, `nurture`, `close`.
9. `creator_experiments`
   - `workspace_id`, `name`, `hypothesis`, `control`, `variant`, `metric`,
     `result`, `decision`.
10. `creator_metric_snapshots`
    - `workspace_id`, `metric_key`, `value`, `captured_at`, `snapshot_type`.
11. `program_deliverables`
    - `workspace_id`, `code`, `name`, `description`, `status`, `asset_url`,
      `approved_at`.

## Required security rules for backend phase

- Every workspace record must be owned by an authenticated `user_id`.
- Members can only read and update records belonging to their own workspace.
- Approval fields and program phase changes should be writable only by authorized
  Marcatching staff.
- Do not expose service-role keys in client components.
- Course enrollment and payment status must be verified server-side.
- Validate all status transitions and numeric scores server-side.
- Preserve an audit timestamp for approvals, metric snapshots, and experiment
  decisions.

## Adapter replacement plan

1. Keep the `WorkspaceData` frontend shape stable.
2. Add server-side repository functions that map database records into
   `WorkspaceData`.
3. Replace local hydration with a server load.
4. Replace each local mutation with a typed API/server action.
5. Add optimistic UI and rollback behavior.
6. Remove the `Frontend preview` indicator and local reset action after
   persistence and authorization tests pass.

## Acceptance gate before production release

- A member cannot access another member's workspace by changing an ID.
- All ten modules reload with identical persisted data.
- Approval-only fields reject member writes.
- Mobile navigation, login, course reader, and workspace modules remain usable.
- Existing course access and learning progress continue to work.
- Empty, loading, error, and first-time states are covered.

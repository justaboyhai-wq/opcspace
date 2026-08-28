# OPCSpace Repository Structure Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reorganize OPCSpace into clear prototype, documentation, frontend, mini-app, backend, and engineering-support boundaries without losing current product documentation changes.

**Architecture:** Preserve the monorepo and its independent build boundaries. Move frozen browser artifacts to `prototypes`, product documents to stable `docs` categories, leave formal source under `apps` and `services`, and remove obsolete delivery launchers from the repository root.

**Tech Stack:** Git, PowerShell, static HTML assets, Markdown, JSON

---

### Task 1: Freeze the approved design and protect working changes

**Files:**
- Create: `docs/architecture/2026-08-28-repository-structure-design.md`
- Create: `docs/plans/2026-08-28-repository-structure-implementation.md`

- [ ] **Step 1: Record the current dirty files**

Run: `git status --short`

Expected: the four untracked v0.2 PRD documents plus modified `README.md` and `docs/traceability/feature-matrix.md` are visible.

- [ ] **Step 2: Commit only the approved design and implementation plan**

Run: `git add docs/architecture/2026-08-28-repository-structure-design.md docs/plans/2026-08-28-repository-structure-implementation.md && git commit -m "docs: define repository structure cleanup"`

Expected: one documentation commit; pre-existing working changes remain unstaged.

### Task 2: Move frozen prototypes and documentation

**Files:**
- Move: `prd-demo/` to `prototypes/`
- Move: `index.html` to `prototypes/index.html`
- Create: `prototypes/README.md`
- Move: `docs/product/` to `docs/prd/`
- Move: `.planning/codebase/` to `docs/codebase/`
- Move: `docs/superpowers/plans/2026-08-28-opcspace-ruoyi-implementation.md` to `docs/plans/`
- Move: `docs/superpowers/specs/2026-08-28-opcspace-integrated-platform-design.md` to `docs/architecture/`

- [ ] **Step 1: Resolve and verify every source and destination path**

Run: `Resolve-Path prd-demo,docs/product,.planning/codebase,docs/superpowers/plans,docs/superpowers/specs`

Expected: every source resolves inside the repository; no destination exists in a way that would overwrite unrelated files.

- [ ] **Step 2: Perform history-preserving moves**

Use explicit repository-relative moves. Do not move or delete `apps`, `services`, `contracts`, `database`, `deploy`, or the current PRD contents.

- [ ] **Step 3: Add the prototype boundary README**

The README must state that `admin` and `mini` are frozen visual/requirement evidence, not maintainable product source, and that formal source lives in `apps` and `services`.

### Task 3: Remove obsolete delivery launchers

**Files:**
- Delete: `START-ALL.bat`, `START-MINI.bat`, `START-WEB.bat`, `STOP.bat`
- Delete: `start-all.command`, `stop.command`
- Delete: all Chinese duplicate launcher files in the root
- Delete: `README.txt`, `使用说明.txt`, `打开入口.html`
- Delete: `tools/serve.ps1`, `tools/stop.ps1`, stale `tools/*.pid`

- [ ] **Step 1: Verify deletion targets are repository-root delivery files**

Run: `Get-Item` with each explicit path and confirm all resolved paths begin with the repository absolute path.

Expected: only the approved launcher, duplicate instruction, and prototype runtime files are selected.

- [ ] **Step 2: Delete the approved targets**

Delete explicit files only. Remove `tools/` and empty `.planning/` or `docs/superpowers/` directories only after confirming they contain no remaining files.

### Task 4: Update prototype entry and all path references

**Files:**
- Modify: `prototypes/index.html`
- Modify: `prototypes/mini/index.html`
- Modify: `README.md`
- Modify: `workspace-baseline.json`
- Modify: `scripts/verify-baseline.ps1`
- Modify: Markdown under `docs/`

- [ ] **Step 1: Replace the launcher-based prototype entry**

Set the two links in `prototypes/index.html` to `./mini/` and `./admin/`, remove port numbers and shutdown instructions, and describe the pages as frozen evidence.

- [ ] **Step 2: Make mini prototype assets site-relative**

Change `/assets/index-MfHB7Usc.js` and `/assets/index-D4FIHBUm.css` to `./assets/...` in `prototypes/mini/index.html`.

- [ ] **Step 3: Update repository documentation and manifests**

Apply the approved old-to-new path mapping everywhere in tracked text. Update README usage instructions to distinguish formal source from frozen prototypes and remove launcher guidance.

- [ ] **Step 4: Align the earlier implementation plan directory tree**

Replace its obsolete `backend/packages/infra` recommendation with the approved `services/contracts/database/deploy` structure and retain its domain-module roadmap under `services/backend`.

### Task 5: Validate structure and prototype behavior

**Files:**
- Test: `scripts/verify-baseline.ps1`
- Test: `prototypes/index.html`
- Test: `prototypes/admin/index.html`
- Test: `prototypes/mini/index.html`

- [ ] **Step 1: Scan for stale paths and launcher references**

Run: `git grep -n -E "prd-demo|docs/product|docs/superpowers|START-ALL|START-MINI|START-WEB|STOP\\.bat|打开入口|使用说明|tools/serve"`

Expected: no matches in the reorganized tracked content except historical statements explicitly marked as obsolete, which should be removed if not necessary.

- [ ] **Step 2: Run baseline validation**

Run: `powershell -NoProfile -ExecutionPolicy Bypass -File scripts/verify-baseline.ps1`

Expected: success with all approved paths resolved.

- [ ] **Step 3: Serve prototypes temporarily and check HTTP responses**

Run a temporary standard static HTTP server rooted at `prototypes`, then request `/`, `/admin/`, `/mini/`, and both entry asset files.

Expected: every request returns HTTP 200 and both HTML titles identify the correct prototype.

- [ ] **Step 4: Review the final diff**

Run: `git status --short`, `git diff --check`, and `git diff --stat`.

Expected: moves are recognizable, approved deletions are present, no whitespace errors exist, and the four v0.2 PRD documents remain included.

### Task 6: Commit and publish

**Files:**
- Commit all approved repository-structure changes and preserved product-document updates.

- [ ] **Step 1: Commit the migration**

Run: `git add -A && git commit -m "refactor: clarify product repository structure"`

Expected: a migration commit containing moves, deletions, reference updates, and the preserved PRD changes.

- [ ] **Step 2: Push master**

Run: `git push origin master`

Expected: push succeeds without force.

- [ ] **Step 3: Verify remote state**

Run: `git fetch origin master` and compare `git rev-parse HEAD` with `git rev-parse origin/master`.

Expected: hashes are identical and `git status --short --branch` is clean and synchronized.


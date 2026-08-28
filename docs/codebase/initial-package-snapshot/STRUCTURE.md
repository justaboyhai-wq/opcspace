---
document: codebase-structure
mapped_at: 2026-08-28
last_mapped_commit: 1fd6a9f7c6ba8a68d301c0bad956ad513f4c4061
scope: repository filesystem and module boundaries
confidence: verified
---

# Structure

## Top-level layout

```text
E:\worktest\opcspace\
|-- index.html                    # chooser linking the two localhost applications
|-- README.txt / 使用说明.txt       # duplicate bilingual-named prototype instructions
|-- START-*.bat / 启动*.bat        # Windows launch entry points
|-- start-all.command / 启动全部.command
|-- STOP.bat / 关闭原型服务-STOP.bat
|-- stop.command / 关闭原型服务.command
|-- mini-program/                 # self-contained mobile/mini-program browser build
|-- web-admin/                    # self-contained desktop admin browser build
|-- tools/                        # static-server lifecycle scripts and runtime PID files
`-- .planning/codebase/           # generated codebase map documents
```

## Root files

- `index.html` is not an application shell. It is a static two-card launcher pointing to `http://localhost:18081/` and `http://localhost:18082/`.
- `README.txt` and `使用说明.txt` contain the same UTF-8 text and identify the package date and frozen source revisions.
- `START-ALL.bat` starts both PowerShell static servers and then opens the root chooser file.
- `START-MINI.bat` and `START-WEB.bat` start one application on ports 18081 and 18082 respectively.
- Chinese-named `.bat` files duplicate the English-named Windows entry points for delivery convenience.
- `start-all.command` is the macOS equivalent, but uses `python3 -m http.server` rather than `tools/serve.ps1`.
- `stop.command`, `STOP.bat` and their Chinese-named duplicates terminate processes whose IDs are recorded under `tools/`.
- There is no root build manifest, dependency lockfile, monorepo workspace file, CI configuration, Docker file, database migration, test directory, lint configuration or source-format configuration.

## `mini-program/`

```text
mini-program/
|-- index.html
`-- assets/
    |-- index-MfHB7Usc.js          # 347 KB minified React application and demo data
    |-- index-D4FIHBUm.css         # 106 KB complete mobile/device styling
    |-- roboto-latin-500-*.woff*   # bundled typography
    |-- iphone/
    |   |-- Bezel.png
    |   `-- Keyboard.png
    |-- status/
    |   |-- status-icons.svg
    |   `-- ios-status-icons.svg
    `-- hesheng/
        |-- lobby.png / architecture.png / auditorium.png
        |-- meeting-6.png / meeting-12.png
        |-- activity.png / activity-yoga.png
        |-- enterprise-banner.png / enterprise-team.png
        `-- *-pass.png
```

- `mini-program/index.html` owns only the `#root` mount and bundle/style links.
- `mini-program/assets/index-MfHB7Usc.js` currently collapses every original source concern into one file: React runtime, FlowStack navigation, screen registry, UI components, demo data, state transitions and application bootstrap.
- `mini-program/assets/index-D4FIHBUm.css` likewise collapses device simulation, shell, screens, cards, forms, overlays, animation and responsive styling.
- `mini-program/assets/iphone/` and `status/` are prototype-device chrome. They should not become product-domain assets in a real WeChat project.
- `mini-program/assets/hesheng/` contains mobile-only business illustrations and pass images. No admin file references this directory.
- The leading numeric screen IDs found in the bundle (`05-` through `38-`) reflect prototype flow inventory, not physical modules or stable API resources.

## `web-admin/`

```text
web-admin/
|-- index.html
`-- assets/
    |-- index-Col4iETK.js           # 820 KB minified SPA, seed records and reducers
    `-- index-M0Bc6DtH.css          # 71 KB complete desktop admin styling
```

- `web-admin/index.html` defines `#app`, `#overlay-root`, `#toast-root`, a skip link and metadata.
- `web-admin/assets/index-Col4iETK.js` is the entire admin runtime: seed data, page/role definitions, HTML renderers, global store, routing, action reducers, validation and bootstrap.
- `web-admin/assets/index-M0Bc6DtH.css` is the only style artifact; there are no source-level feature styles or design tokens to import independently.
- Admin page IDs are consistently `{domain}-{feature}` (for example `property-work-orders`, `engineering-assets`, `finance-bills`). Detail pages either have explicit IDs such as `property-work-order-detail` or render in drawer/modal overlays.
- The ten logical page groups recovered from definitions are `workspace`, `property`, `engineering`, `finance`, `leasing`, `operations`, `content`, `users`, `governance`, and `system`.
- These groups are logical boundaries only inside one minified bundle; there are no matching filesystem directories today.

## `tools/`

```text
tools/
|-- serve.ps1                     # localhost-only static server with SPA fallback
|-- stop.ps1                      # reads PID files and force-stops prototype servers
|-- mini.pid                      # untracked runtime artifact when mini server is active
`-- web.pid                       # untracked runtime artifact when admin server is active
```

- `tools/serve.ps1` accepts a root directory, port and PID file; it validates resolved paths stay under the selected site root.
- Unknown URLs are served the site's `index.html`, making hash or future path navigation resilient in the demo host.
- `mini.pid` and `web.pid` are runtime state, not source. They are currently untracked and should remain excluded from any product architecture.
- The two site roots are passed independently, which prevents one app from serving or importing the other's files by relative path.

## Current physical versus logical modules

| Concern | Physical location now | Logical boundary recovered |
|---|---|---|
| Mobile shell/navigation | `mini-program/assets/index-MfHB7Usc.js` | phone shell, root tabs, FlowStack, screen registry |
| Mobile business features | same single JS bundle | repair, finance, space/access, enterprise/leasing, content, AI/profile |
| Admin shell/navigation | `web-admin/assets/index-Col4iETK.js` | sidebar/topbar, hash router, role access, overlay/toast |
| Admin business features | same single JS bundle | 10 domain groups and 48 page definitions |
| Shared contracts | absent | only duplicated labels, IDs and implied workflows |
| Data/service layer | absent | embedded constants plus in-memory mutations |
| Hosting | `tools/` and launchers | independent localhost static sites |

## Dual-end reuse and isolation points

- Reuse: both ends model the same building/park domain and overlap on repair, billing, electricity, invoice, booking, visitor, parking, company/member, contract, notice, activity, service and AI concepts.
- Isolation: each application has its own `index.html`, hashed JS/CSS, origin/port, assets, navigation model, state container, presentation components and frozen source revision.
- Isolation: there is no `shared/`, `packages/`, generated SDK, schema file, API definition, design-system source or common localization catalog.
- Isolation: admin state changes cannot update mini-program state; shared status wording currently exists as duplicated bundle literals.
- Recommended future reuse boundary is contracts and domain semantics—not cross-platform UI: OpenAPI DTOs, status enums, event names, validation constraints and permission codes can be generated/shared, while admin and mini-program components remain platform-specific.

## Suggested source layout for reconstruction

The following is a target organization inferred from the current boundaries; it does not exist yet:

```text
apps/
|-- mini-program/                 # actual WeChat/uni-app/Taro source chosen by the team
`-- web-admin/                    # RuoYi-compatible admin frontend source
packages/
|-- api-contracts/                # generated DTOs and API clients
|-- domain-vocabulary/            # shared status/event/permission identifiers
`-- design-tokens/                # optional colors/spacing only, not platform widgets
backend/                          # RuoYi service and domain modules
docs/                             # PRD, API, state-machine and acceptance evidence
```

- Preserve domain-oriented feature directories inside each application rather than recreating one giant `assets/index-*.js` source module.
- Map admin domains to backend modules deliberately; do not infer a database table directly from every page or drawer.
- Keep cross-domain workflows (approval, automation, notification, audit and identity) as shared backend capabilities rather than duplicating them under every business module.
- Keep build output outside source review or in a dedicated release artifact; hashed bundles are deployment outputs and are unsuitable as the sole maintainable implementation.

## File-placement rules derived from the current package

- Prototype launch and static-host scripts belong under delivery tooling, not either application's business source.
- Mobile-only photos and pass images belong under the mobile app's asset boundary unless requirements establish a backend media catalog.
- Browser-only device chrome (`iphone/`, `status/`) belongs in prototype/demo tooling and should be omitted from production mini-program assets.
- Shared business status values must move to versioned contracts before either side implements real persistence.
- PID files, build hashes and runtime server state must never be treated as stable identifiers or committed business configuration.

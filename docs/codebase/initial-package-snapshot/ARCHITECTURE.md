---
document: codebase-architecture
mapped_at: 2026-08-28
last_mapped_commit: 1fd6a9f7c6ba8a68d301c0bad956ad513f4c4061
scope: frozen dual-end frontend prototype
confidence: build-artifact-grounded
---

# Architecture

## Repository baseline and evidence limits

- The checked-in repository is a distributable HTML prototype, not a frontend source workspace: there is no `package.json`, `src/`, TypeScript, Vue/uni-app project, source map, backend, database schema, or API client layer.
- `README.txt` records two independently frozen inputs: mini-program commit `0ae90c5` / tag `v1.0.0`, and Web admin commit `7e5c3c9` / tag `prototype-freeze-v1.0.1`; this repository packages both at current commit `1fd6a9f7c6ba8a68d301c0bad956ad513f4c4061`.
- Architecture below is recovered from executable entry files and readable minified bundles. Component and function names that were minified are described by behavior rather than presented as original source names.
- The directory named `mini-program/` is currently a React-powered browser simulation of an iPhone mini-program experience. It is not a WeChat Mini Program source tree: no `app.json`, WXML/WXSS, uni-app, or Taro sources are present.

## System topology

```text
index.html (prototype chooser)
  |-- http://localhost:18081/ -> mini-program/index.html
  |      -> assets/index-MfHB7Usc.js (React 19.2.8 SPA + embedded demo data)
  |      -> assets/index-D4FIHBUm.css + phone/status/business images
  |
  `-- http://localhost:18082/ -> web-admin/index.html
         -> assets/index-Col4iETK.js (vanilla DOM SPA + embedded demo data)
         -> assets/index-M0Bc6DtH.css

tools/serve.ps1 -> independent static hosts on ports 18081 and 18082
```

- `START-ALL.bat` starts two isolated static servers; the two applications do not import each other's bundle or call each other's origin.
- `tools/serve.ps1` is transport only: it serves files, applies `no-store`, blocks path traversal, and falls back to each application's `index.html` for unknown paths.
- There is no shared runtime process beyond the launcher. Restarting or refreshing a page resets all simulated edits because neither bundle uses `localStorage`, `sessionStorage`, IndexedDB, WebSocket, EventSource, XMLHttpRequest, or a business `fetch` call.
- The only `fetch` signature in each bundle belongs to Vite's module-preload polyfill, not application data access.

## Mini-program architecture

### Bootstrap and presentation shell

- `mini-program/index.html` mounts the application at `#root` and loads `/assets/index-MfHB7Usc.js` plus `/assets/index-D4FIHBUm.css`.
- The bundle embeds React `19.2.8` and calls `createRoot(document.getElementById("root")).render(...)`.
- The outer shell renders a simulated iPhone frame using `assets/iphone/Bezel.png`, status icons, a fixed device viewport, safe-area variables, and responsive scaling. This is a prototype presentation layer, not native mini-program lifecycle code.
- Four root destinations form the bottom navigation: `home` / 首页, `services` / 服务, `ai` / AI, and `profile` / 我的.

### Navigation and screen registry

- Navigation is an in-memory `FlowStack` implemented with React Context and hooks. Each screen entry has an `id`, optional header/footer, render function, and generated key.
- `push`, `pop`, and `replace` mutate the stack; leaving screens are retained briefly for a 300–340 ms horizontal transition. No browser route or deep-link contract exists for ordinary mini-program screens.
- A title-to-screen factory registry connects service labels to screens. Unknown entries fall back to a generated `todo-{title}` placeholder; aliases intentionally route several labels to the same factory.
- Examples of alias reuse include `账单中心` and `账单与发票`; `空间预订` and `空间预约`; `停车服务` and `停车缴费`; `企业服务代办` and `政策申报`; `租约与续租`、`合同管理` and `续租提醒`.
- Reusable presentation primitives recovered from the bundle include the phone/device shell, fixed toolbar/capsule, scrollable detail screens, fixed action footer, bottom sheet, cards, status tags, form inputs, lists, and Lucide SVG icons.

### Mini-program functional slices

- Root/AI: 首页、服务、AI 管家、AI 历史、AI 敏感操作草稿确认 and AI 产品/subscription views.
- Notice and customer service: `05-notice-center`, `36-contact-service`, `37-feedback`, `35-subscriptions`.
- Property service: `08-repair-submit`, `09-repair-progress`, `10-repair-evaluation`, `17-cleaning-green-booking`, `18-complaints`.
- Finance: `14-bills-center`, `15-bill-payment-invoice`, `15-invoice-application`, `16-electricity-recharge-analysis`, `31-corporate-transfer`, `33-payment-records`, `34-invoice-records`.
- Space/access/parking: `21-space-catalog`, `22-space-detail-slots`, `23-space-booking-pass`, `12-visitor-invite`, `13-visitor-pass`, `32-visitor-records`, `24-parking-services`.
- Enterprise/leasing: `19-lease-contract`, `20-move-flows`, `27-my-company`, `28-company-members`, `29-service-apply`, `30-service-progress`, `11-policy-services`.
- Content/community: `25-activity-center`, `26-activity-registration`, plus the profile/about screen `38-about`.

### Mini-program state and data flow

```text
embedded constants in index-MfHB7Usc.js
  -> root screen / title registry
  -> user event handler
  -> component-local useState or FlowStack Context update
  -> React rerender / bottom sheet / stack transition
  -> state disappears on refresh
```

- Business records, statuses, user/company examples, pricing, booking slots, notices, activities and images are compiled into the bundle.
- Form submission and workflow progression are simulations that update local component state. They do not create authoritative records or trigger management-side state.
- Static business imagery is isolated under `mini-program/assets/hesheng/`; this media is not consumed by `web-admin/`.

## Web admin architecture

### Bootstrap and rendering model

- `web-admin/index.html` provides three explicit mount regions: `#app` for the shell/page, `#overlay-root` for drawers/modals, and `#toast-root` for live status messages.
- `assets/index-Col4iETK.js` is a framework-free SPA at runtime: it builds escaped HTML strings, assigns `innerHTML`, and uses delegated document-level click/keyboard handlers.
- The shell is split into sidebar, top bar/breadcrumb, page-content region, overlays and toast. A render coordinator maps changed state keys to targeted shell, navigation, topbar, page, overlay or toast updates.
- Accessibility behavior is part of the architecture: skip link, ARIA tabs/tree/listbox, roving keyboard focus, modal/drawer focus trapping and restoration, `inert`/`aria-hidden`, and live toast output.

### Routing, authorization and roles

- Hash routing uses `#/page-id`; `#/dashboard-overview` is the default. Invalid or unauthorized routes redirect to the first accessible page.
- Page definitions combine `id`, title, domain module, allowed roles and description; page renderers are resolved through a page-id-to-renderer registry.
- The build contains 15 demo roles: `super`, `property`, `engineering`, `finance`, `leasing`, `content`, `service-desk`, `front-desk`, `security`, `housekeeping`, `inspection`, `contractor`, `duty`, `energy`, and `platform`.
- Authorization exists only in the browser prototype and must not be treated as a security boundary. A future backend must independently enforce tenant/data scope and operation permissions.

### Admin domain modules and pages

- Workspace (5): `dashboard-overview`, `dashboard-tasks`, `dashboard-analytics`, `dashboard-alerts`, `dashboard-oncall`.
- Property (4): `property-work-orders`, `property-work-order-detail`, `property-complaints`, `property-environment`.
- Engineering (4): `engineering-assets`, `engineering-asset-detail`, `engineering-inspections`, `engineering-alerts`.
- Finance (7): `finance-bills`, `finance-reconciliation`, `finance-invoices`, `finance-electricity`, `finance-hvac-overtime`, `finance-deposits`, `finance-statements`.
- Leasing (5): `leasing-tenants`, `leasing-contracts`, `leasing-renewals`, `leasing-decoration`, `leasing-contractors`.
- Operations (4): `operations-spaces`, `operations-bookings`, `operations-parking`, `operations-visitors`.
- Content (6): `content-notices`, `content-activities`, `content-enterprise-services`, `content-ai-subscriptions`, `content-feedback`, `content-banners`.
- Users (2): `users-accounts`, `users-privacy`.
- Governance (4): `governance-approvals`, `governance-service-desk`, `governance-ai-ops`, `governance-automation`.
- System (7): `system-accounts`, `system-roles`, `system-messages`, `system-audit`, `system-data-quality`, `system-config-publish`, `system-recharge-visibility`.

### Admin state, actions and data flow

- One cloned global in-memory state holds `roleId`, `pageId`, shared filters, drawer, modal, toast and `records`; `records.uiByPage[pageId]` stores filters, pagination, selected tabs, calendar month and other page-local UI state.
- A subscribe/set-state store publishes top-level changed keys. The render coordinator then replaces only affected DOM regions.
- UI elements encode commands through `data-action` and related `data-*` fields. A single delegated handler parses those commands, opens details/confirmations, validates forms, runs an action-specific reducer, updates record collections, and shows success/warning toast effects.
- Example cross-collection mutations are explicitly modeled in the prototype: an engineering alert can generate a work order; a service session can convert to a work order; recharge approval updates recharge records, electricity accounts and wallet transactions; AI sensitive drafts can be validated or taken over.
- All seed collections—work orders, alerts, assets, bills, invoices, companies, contracts, bookings, visitors, notices, approvals, service sessions, accounts, AI policies and automation executions—are compiled into `index-Col4iETK.js`.
- Refresh resets the role, records and simulated workflow results; there is no authentication session, API error/loading model, concurrency control or server-side audit trail.

## Relationship between the two ends

### Shared business semantics

- The same business capabilities appear from complementary perspectives: mini-program 报修 ↔ admin `property-work-orders`; 空间预约 ↔ `operations-bookings`; 访客邀请 ↔ `operations-visitors`; 账单/电费/发票 ↔ finance pages; 企业/合同/装修 ↔ leasing pages; 公告/活动/企业服务/AI subscriptions ↔ content pages.
- Admin also contains explicit bridge/governance pages for the consumer side: `users-accounts`, `users-privacy`, `system-config-publish`, and `system-recharge-visibility`.
- Shared identifiers and workflow vocabulary visible in both prototypes are candidates for future contracts, but no canonical shared schema exists in this repository.

### Current isolation and non-reuse

- The two bundles were frozen from different source commits and use different frontend architectures (React component tree versus custom DOM renderer/store).
- They share no JavaScript module, stylesheet, component library, runtime state, network client, authentication token, generated type, or static business image directory.
- A user-side simulated operation does not appear in the admin prototype, and an admin-side action does not change the mini-program view. Apparent synchronization text is a product promise, not implemented integration.
- Reuse today is conceptual only: labels, entities, statuses and user journeys. Future implementation should extract API/DTO/status contracts as the shared layer while keeping platform-specific UI components isolated.

## Architectural implications for a RuoYi-backed implementation

- Treat these bundles as executable requirements evidence, not as maintainable application source; recover or recreate source projects before feature development.
- Define canonical entities and status machines first for work order, asset/alert, bill/payment/invoice/recharge, enterprise/member/contract, booking/visitor/parking, notice/activity, approval and AI draft workflows.
- Place authorization, tenant/company data scope, workflow transitions, idempotency and audit logging in the RuoYi backend; browser role checks remain presentation guards only.
- Introduce explicit APIs between both clients and the backend, with a shared OpenAPI-generated contract package. Do not make either frontend consume the other's internal models.
- Preserve intentional platform separation: mini-program navigation/device APIs and admin table/overlay/permission UX should remain separate adapters over shared business contracts.

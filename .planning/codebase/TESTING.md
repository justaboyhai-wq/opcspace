---
last_mapped_commit: 1fd6a9f7c6ba8a68d301c0bad956ad513f4c4061
mapped_at: 2026-08-28
focus: quality
---

# Testing Patterns

**Analysis Date:** 2026-08-28

## Test Framework

**Runner:**

- Not detected：仓库没有 Jest、Vitest、Playwright、Cypress 或其他测试框架配置。
- Config: Not detected；根目录及 `mini-program/`、`web-admin/` 下均无测试配置文件。
- 依赖清单也未检测到：没有 `package.json`、lockfile 或可恢复测试依赖版本的构建清单。

**Assertion Library:**

- Not detected。

**Run Commands:**

```powershell
# 项目没有自动化测试命令；以下是现有 Windows 原型启动入口
.\START-ALL.bat
.\START-MINI.bat
.\START-WEB.bat
.\STOP.bat
```

```bash
# 项目没有自动化测试命令；以下是现有 macOS 原型启动/停止入口
./start-all.command
./stop.command
```

- 以上命令来自 `README.txt`，用于人工验收原型，不等价于单元测试或回归测试。
- `README.txt` 记录的人工访问地址为小程序 `http://localhost:18081/`、管理端 `http://localhost:18082/#/dashboard-overview`。

## Test File Organization

**Location:**

- Not detected：没有 `tests/`、`__tests__/`、`e2e/` 等测试目录。
- 没有与实现并置的 `*.test.*` 或 `*.spec.*` 文件。
- 当前仓库只有发布页面、压缩静态资源、演示图片和本地启停脚本，见 `mini-program/`、`web-admin/`、`tools/`。

**Naming:**

- Not applicable：当前提交不存在测试文件命名模式。

**Structure:**

```text
Not detected
```

## Test Structure

**Suite Organization:**

```text
Not detected: no describe/test/it suites are present in tracked project files.
```

**Patterns:**

- Setup pattern: Not detected。
- Teardown pattern: 只有运行脚本级清理；`tools/serve.ps1` 在 `finally` 中关闭监听并移除 PID 文件，`stop.command`/`tools/stop.ps1` 提供人工 teardown。
- Assertion pattern: Not detected；当前人工验证通过页面是否打开、交互反馈和 HTTP 可访问性判断。

## Current Verifiable Checks

- 两个发布 bundle 可用 `node --check` 做 JavaScript 语法检查：`mini-program/assets/index-MfHB7Usc.js`、`web-admin/assets/index-Col4iETK.js`。
- PowerShell AST 可无错误解析 `tools/serve.ps1`、`tools/stop.ps1`。
- `bash -n` 可无错误解析 `start-all.command`、`stop.command`。
- 入口 HTML 应验证引用资源存在：`mini-program/index.html` 指向 `/assets/index-MfHB7Usc.js` 与 `/assets/index-D4FIHBUm.css`；`web-admin/index.html` 指向 `./assets/index-Col4iETK.js` 与 `./assets/index-M0Bc6DtH.css`。
- 内容一致性应验证八组双语入口副本保持相同，包括 `README.txt`/`使用说明.txt`、`index.html`/`打开入口.html` 及六组启停脚本。
- 当前仓库未把这些检查封装为一键脚本，也没有在提交时自动执行。

## Mocking

**Framework:** Not detected。

**Patterns:**

```text
No test doubles, spies, module mocks, HTTP mocks, or fake timers are present.
```

**What to Mock:**

- 当前原型不连接真实后端；业务数据直接编入发布 bundle，见 `mini-program/assets/index-MfHB7Usc.js`、`web-admin/assets/index-Col4iETK.js`。
- 这些内嵌演示记录是运行态样例数据，不是测试框架管理的 mock。

**What NOT to Mock:**

- Not established：仓库没有测试边界或集成契约，无法从当前提交确认哪些依赖必须使用真实实现。

## Fixtures and Factories

**Test Data:**

```javascript
// 可观察的发布模式（压缩产物），不是可复用测试 fixture：
Object.freeze({ id, status, owner, date, ...fields })
```

- 管理端在 `web-admin/assets/index-Col4iETK.js` 中以数组映射和 `Object.freeze` 生成工单等演示记录。
- 小程序在 `mini-program/assets/index-MfHB7Usc.js` 中内嵌访客、空间、活动、服务等展示数据。
- `README.txt` 明确说明所有数据均为演示数据，不会提交到真实业务系统。

**Location:**

- 演示数据与 UI 逻辑一起编入两个 JS bundle；没有独立 fixture、factory、seed 或 JSON 数据目录。

## Coverage

**Requirements:** None enforced。

- 未检测到覆盖率阈值、覆盖率配置或历史报告。
- 由于源码缺失，即使对 bundle 执行浏览器测试，也无法获得有意义的源码行/分支覆盖率。

**View Coverage:**

```bash
# Not available: no coverage command or source map exists.
```

## Test Types

**Unit Tests:**

- Not used：没有针对组件、状态转换、校验函数、静态服务器或启动脚本的单元测试。
- 管理端 bundle 中能观察到状态转换与校验分支，但它们没有可定位到源码模块的测试，见 `web-admin/assets/index-Col4iETK.js`。

**Integration Tests:**

- Not used：没有验证 HTML 入口、静态资源、SPA 回退、PID 生命周期或端口冲突行为的自动化测试。
- `tools/serve.ps1` 包含路径越界 403、缺失文件回退 `index.html`、未知 MIME 回退 `application/octet-stream` 和异常 500 等可测行为，但当前没有对应测试。

**E2E Tests:**

- Not used：没有 Playwright/Cypress 配置、浏览器脚本、截图基线或可访问性扫描。
- 当前 E2E 仅是 `README.txt` 描述的人工启动和浏览器点击流程。

**Manual Acceptance:**

- 小程序端应从 `http://localhost:18081/` 打开，并检查访客、报修、账单、空间、活动、AI 管家等入口，功能范围证据见 `index.html`。
- 管理端应从 `http://localhost:18082/#/dashboard-overview` 打开，并检查运营总览、工单、企业、空间、账单、活动及系统管理，功能范围证据见 `index.html`。
- 双端应能同时启动，结束后 PID 文件应由 `STOP.bat`、`stop.command` 或服务器 `finally` 清理。
- 需要分别覆盖 Windows 10/11 和 macOS，因为两套启动机制分别依赖 PowerShell `HttpListener` 与 `python3 -m http.server`，见 `README.txt`、`tools/serve.ps1`、`start-all.command`。

## Common Patterns

**Async Testing:**

```text
Not detected: no asynchronous test utilities, polling helpers, or fake timers.
```

**Error Testing:**

```text
Not detected: error branches exist in launch/server/UI artifacts but have no automated assertions.
```

**Current error cases requiring manual checks:**

- 18081 或 18082 被占用时，`start-all.command` 应明确报错并返回非零状态。
- 请求路径解析到站点根之外时，`tools/serve.ps1` 应返回 403。
- 单个请求处理抛错时，`tools/serve.ps1` 应返回 500 且继续维持监听器生命周期。
- 管理端批量操作未选记录、无权限、非法日期或缺少必填字段时，应显示 warning toast，见 `web-admin/assets/index-Col4iETK.js`。
- 小程序反馈为空时不应提交，非空提交后应清空文本并显示成功状态，见 `mini-program/assets/index-MfHB7Usc.js`。

## CI and Quality Gates

- Not detected：没有 `.github/workflows/`、`.gitlab-ci.yml`、`azure-pipelines.yml` 或 `Jenkinsfile`。
- Not detected：没有 pre-commit hook、Husky、lint-staged 或提交信息校验配置。
- Not detected：没有构建命令，因此无法从本仓库重建 `mini-program/assets/` 或 `web-admin/assets/` 并校验产物可复现性。
- `README.txt` 记录了两个上游冻结点（小程序 `0ae90c5`、管理端 `7e5c3c9`），但当前仓库不含对应源码历史或自动验证关联。
- 当前质量结论只能覆盖“现有静态发布文件的解析和人工运行”，不能证明业务需求、浏览器兼容性、数据契约、权限或后端集成正确。

## Minimum Regression Matrix for Changes

| Change area | Required current-state check | Evidence path |
|---|---|---|
| HTML entry | 资源引用存在、语言/viewport 保持、页面可打开 | `mini-program/index.html`, `web-admin/index.html` |
| Windows launcher | PowerShell AST 解析、双端启动/停止、PID 清理 | `START-ALL.bat`, `tools/serve.ps1`, `tools/stop.ps1` |
| macOS launcher | `bash -n`、端口占用提示、双端启动/停止 | `start-all.command`, `stop.command` |
| JS bundle replacement | `node --check`、关键路由和交互人工回归 | `mini-program/assets/index-MfHB7Usc.js`, `web-admin/assets/index-Col4iETK.js` |
| Documentation/aliases | 中英文副本哈希一致、端口与 URL 同步 | `README.txt`, `使用说明.txt`, `index.html`, `打开入口.html` |
| Static server | 200/403/500、SPA fallback、MIME、Cache-Control | `tools/serve.ps1` |

---

*Testing analysis: 2026-08-28*

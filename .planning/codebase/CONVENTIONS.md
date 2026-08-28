---
last_mapped_commit: 1fd6a9f7c6ba8a68d301c0bad956ad513f4c4061
mapped_at: 2026-08-28
focus: quality
---

# Coding Conventions

**Analysis Date:** 2026-08-28

## Evidence Boundary

- 当前仓库是双端 HTML 交互原型的可运行发布包，不是可重建的前端源码仓库；证据见 `README.txt`、`mini-program/index.html`、`web-admin/index.html`。
- `mini-program/assets/index-MfHB7Usc.js` 与 `web-admin/assets/index-Col4iETK.js` 都是单行压缩 bundle，且仓库没有 source map；不能从压缩变量名反推作者的源码命名规范。
- 未检测到 `package.json`、锁文件、`tsconfig.json`、ESLint、Prettier、Stylelint、Biome 或构建配置，因此源码语言版本、编译选项和自动格式化规则均不可确认。
- 下列约定只描述当前提交中可直接观察的 HTML、PowerShell、Batch、Bash 和发布产物格式；未来恢复源码时应另行确立源码规范。

## Naming Patterns

**Files:**

- Windows 启动入口使用大写动作前缀和连字符，例如 `START-ALL.bat`、`START-MINI.bat`、`START-WEB.bat`、`STOP.bat`。
- macOS 启停入口使用小写 kebab-case，例如 `start-all.command`、`stop.command`。
- 面向中文使用者的入口与英文入口成对保留，例如 `启动全部-START-ALL.bat` 与 `START-ALL.bat`；当前各配对文件 SHA-256 内容完全一致。
- 发布资源使用构建器生成的内容哈希文件名，例如 `mini-program/assets/index-MfHB7Usc.js` 和 `web-admin/assets/index-M0Bc6DtH.css`。
- 业务图片使用小写 kebab-case，例如 `mini-program/assets/hesheng/enterprise-banner.png`、`mini-program/assets/hesheng/meeting-12.png`。
- HTML 的 ID 和 class 使用小写 kebab-case，例如 `overlay-root`、`toast-root`、`skip-link`，见 `web-admin/index.html`。

**Functions:**

- PowerShell 调用 .NET/PowerShell API 时保留 PascalCase，例如 `Resolve-Path`、`Test-Path`、`WriteAllText`、`ReadAllBytes`，见 `tools/serve.ps1`。
- PowerShell 脚本的局部变量使用 camelCase，例如 `$siteRoot`、`$pidDirectory`、`$requestPath`、`$candidatePath`，见 `tools/serve.ps1`。
- Bash 只包含顶层控制流程，没有声明可复用函数，见 `start-all.command`、`stop.command`。
- 两份 JS bundle 的函数和变量已压缩成短标识符；不得把 `e`、`t`、`n` 等发布变量当作源码命名约定。

**Variables:**

- Batch 环境变量使用大写 snake case：`PACKAGE_ROOT`，见 `START-ALL.bat`、`START-MINI.bat`、`START-WEB.bat`、`STOP.bat`。
- Bash 的包根目录使用大写 `ROOT`，进程号临时值使用小写 `pid`，见 `start-all.command`、`stop.command`。
- PowerShell 参数采用 PascalCase：`$Root`、`$Port`、`$PidFile`、`$PidFiles`；参数派生的局部变量采用 camelCase，见 `tools/serve.ps1`、`tools/stop.ps1`。

**Types:**

- PowerShell 入口参数显式标注 `[string]`、`[int]`、`[string[]]`，必填参数使用 `[Parameter(Mandatory = $true)]`，见 `tools/serve.ps1`、`tools/stop.ps1`。
- 当前仓库不含 TypeScript 声明、领域类型或接口文件；`mini-program/assets/index-MfHB7Usc.js` 与 `web-admin/assets/index-Col4iETK.js` 只能证明浏览器最终执行 JavaScript。

## Code Style

**Formatting:**

- 未检测到自动格式化工具或格式化命令。
- 手写 HTML 使用两个空格缩进、属性双引号和小写 HTML5 标签，见 `mini-program/index.html`、`web-admin/index.html`。
- `index.html` 的内联 CSS 以一条规则一行组织；声明间用空格分隔，并对响应式规则使用 `@media (max-width: 640px)`。
- PowerShell 和 Bash 控制块使用两个空格缩进，花括号与控制语句同行，见 `tools/serve.ps1`、`start-all.command`。
- 发布 CSS/JS 均已压缩；直接编辑 `mini-program/assets/index-D4FIHBUm.css` 或 `web-admin/assets/index-Col4iETK.js` 会破坏可追溯性，应从缺失的源工程重新构建，而不是手改 bundle。

**Linting:**

- 未检测到 ESLint、Stylelint、PSScriptAnalyzer、ShellCheck 或 HTML lint 配置。
- 当前可执行的最低静态检查是对 bundle 运行 `node --check`、用 PowerShell AST 解析 `tools/*.ps1`、用 `bash -n` 解析 `*.command`；这些命令尚未固化为项目脚本。
- `START-*.bat` 和 `STOP.bat` 没有仓库内 lint 规则；修改时应维持 `setlocal`/`endlocal` 边界及 `%~dp0` 相对包根定位方式。

## Import Organization

**Order:**

1. 不适用于当前手写 HTML、Batch、PowerShell 和 Bash 文件；这些文件没有模块导入。
2. `mini-program/index.html`、`web-admin/index.html` 各只加载一个 JS bundle 和一个 CSS bundle。
3. bundle 已合并依赖和应用代码，源码 import 分组与排序不可从发布产物可靠恢复。

**Path Aliases:**

- 未检测到 TypeScript/Vite/Webpack 的路径别名配置。
- 小程序发布页使用根绝对资源路径 `/assets/...`，见 `mini-program/index.html`；管理端使用相对资源路径 `./assets/...`，见 `web-admin/index.html`，两端部署基址行为并不一致。

## Error Handling

**Patterns:**

- Bash 总启动脚本使用 `set -euo pipefail`，并在启动前用 `lsof` 检查 18081/18082 端口；冲突时打印中文信息并以状态码 1 退出，见 `start-all.command`。
- PowerShell 静态服务器把监听器生命周期放在 `try`/`finally` 中，退出时停止监听、关闭资源并删除 PID 文件，见 `tools/serve.ps1`。
- 单请求处理使用内层 `try`/`catch`；异常统一返回 HTTP 500 并关闭响应，但不记录异常细节，见 `tools/serve.ps1`。
- 静态服务器对站点根目录以外的解析路径返回 HTTP 403；缺失叶子文件回退到 `index.html` 以支持前端路由，见 `tools/serve.ps1`。
- 停止脚本对不存在、无效或已结束的 PID 容错：`tools/stop.ps1` 使用 `SilentlyContinue`，`stop.command` 使用 `|| true`。
- 管理端发布 bundle 对批量操作、角色权限、日期格式、筛选和必填字段执行条件校验，并通过 toast 显示警告；证据位于 `web-admin/assets/index-Col4iETK.js`。
- 小程序发布 bundle 对反馈内容使用 `trim()` 非空判断并限制 `maxLength: 500`，见 `mini-program/assets/index-MfHB7Usc.js`。

## Logging

**Framework:** console / shell output；未检测到结构化日志或错误追踪 SDK。

**Patterns:**

- `start-all.command` 和 `stop.command` 仅输出启动、端口冲突和停止结果。
- `tools/serve.ps1` 不记录正常请求、404 回退或 500 异常；运行诊断只能依赖进程状态和 HTTP 行为。
- 发布 bundle 中出现的 `console.error` 主要属于 React 运行时，不足以证明应用层日志约定，见 `mini-program/assets/index-MfHB7Usc.js`。

## Comments

**When to Comment:**

- 手写脚本当前几乎没有行内注释；流程通过明确变量名与短控制块表达，见 `tools/serve.ps1`、`tools/stop.ps1`。
- 修改路径安全、SPA 回退或 PID 清理时，应在行为不直观处补充原因说明，避免只重复代码动作。

**JSDoc/TSDoc:**

- 未检测到可读源码，因此没有可确认的 JSDoc/TSDoc 使用模式。

## Function Design

**Size:** `tools/serve.ps1` 采用一个脚本级监听循环；`tools/stop.ps1` 采用双层循环处理逗号分隔和数组形式的 PID 参数。当前没有可复用函数边界。

**Parameters:** 外部脚本参数显式声明类型和必填性；内部路径操作始终使用 `-LiteralPath` 或 .NET 路径 API，见 `tools/serve.ps1`、`tools/stop.ps1`。

**Return Values:** 启停脚本主要通过进程退出码、控制台消息、PID 文件和 HTTP 状态表达结果；未定义结构化返回对象。

## Module Design

**Exports:** 当前交付物没有源码模块 API；两个 HTML 入口通过一个构建 bundle 初始化应用，见 `mini-program/index.html`、`web-admin/index.html`。

**Barrel Files:** 未检测到 barrel/index 源模块；现有 `index.html` 是浏览器入口而非代码导出聚合。

## Maintainability Rules for This Snapshot

- 修改启动器时同步更新中英文同内容副本；当前八组配对文件完全一致，任一单边修改都会造成用户入口行为漂移。
- 修改端口时同步更新 `README.txt`、`使用说明.txt`、`index.html`、`打开入口.html`、Windows/macOS 启动器和停止器涉及的 18081/18082 引用。
- 不把 `tools/mini.pid`、`tools/web.pid` 当成源码；它们是运行态文件，当前仓库没有 `.gitignore` 来自动排除。
- 在前端源工程进入本仓库前，不声明已具备可重复构建、源码级 lint 或类型安全；当前提交只能验证发布产物可被浏览器解析。

---

*Convention analysis: 2026-08-28*

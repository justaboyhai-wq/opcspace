---
document: stack
project: opcspace
mapped_at: 2026-08-28
last_mapped_commit: 1fd6a9f7c6ba8a68d301c0bad956ad513f4c4061
evidence_scope: current_worktree_built_artifacts
---

# 技术栈映射

## 结论与证据边界

- 当前仓库是“和盛大厦”双端 HTML 交互原型的发布包，不是完整前端源码工程。
- `README.txt` 明确记录打包日期为 2026-08-26，并说明可离线运行、无需 Node.js 或安装依赖。
- 当前 Git 仅有一个提交；仓库内没有 `package.json`、锁文件、TypeScript 配置、Vite 配置、测试或源映射。
- 因此，下述框架版本只在构建产物能直接佐证时给出；无法从产物确认的构建期依赖均标为未知。
- 仓库根 `index.html` 是双端选择页，不承担业务运行时。

## 语言与运行时

| 范围 | 语言/运行时 | 真实路径 | 说明 |
|---|---|---|---|
| 入口选择页 | HTML5 + 内联 CSS | `index.html` | 纯静态页面，跳转两个 localhost 服务 |
| 小程序交互原型 | 浏览器 JavaScript ES Module + CSS | `mini-program/index.html`, `mini-program/assets/index-MfHB7Usc.js`, `mini-program/assets/index-D4FIHBUm.css` | 实际是移动端 Web 仿真，不是微信小程序原生工程 |
| 管理端交互原型 | 浏览器 JavaScript ES Module + CSS | `web-admin/index.html`, `web-admin/assets/index-Col4iETK.js`, `web-admin/assets/index-M0Bc6DtH.css` | 自定义 SPA 构建产物 |
| Windows 静态服务 | PowerShell / .NET `HttpListener` | `tools/serve.ps1`, `tools/stop.ps1` | 仅绑定 `localhost`，静态文件回退到 `index.html` |
| macOS 静态服务 | Bash + Python 3 `http.server` | `start-all.command`, `stop.command` | 绑定 `127.0.0.1`，依赖系统 `python3` 与 `lsof` |
| Windows 启停入口 | Batch | `START-ALL.bat`, `START-MINI.bat`, `START-WEB.bat`, `STOP.bat` | 启动 18081/18082 端口并写 PID 文件 |

## 前端框架与库

### 小程序端

- `mini-program/assets/index-MfHB7Usc.js` 内含 React 和 React DOM 生产构建。
- 构建产物直接暴露 reconciler 版本 `19.2.8`，因此可确认 React/React DOM 19.2.8。
- 根节点通过 `createRoot(document.getElementById("root"))` 挂载。
- 图标实现带有 `lucide-*` 类名和 Lucide icon node 工厂，可确认打包了 Lucide React；精确包版本未知。
- 页面切换使用自定义组件状态和内存导航栈，未发现 React Router、Redux、Zustand 等标识。
- 没有 `wx.*`、`uni.*` 或 Taro 运行时调用；它目前只是浏览器中的 iPhone/Pixel 外观模拟器。
- CSS 内嵌移动设备外壳、状态栏与业务页面样式，并从本地加载 Roboto 500 字体。
- 本地视觉资产位于 `mini-program/assets/hesheng/`、`mini-program/assets/iphone/` 与 `mini-program/assets/status/`。

### Web 管理端

- `web-admin/assets/index-Col4iETK.js` 未发现 React、Vue、Angular、Svelte 或常见 UI 框架运行时标识。
- 管理端采用原生 DOM 模板字符串、事件委托、集中式内存状态与自定义更新函数。
- 路由基于 `window.location.hash` 和 `hashchange`，入口示例为 `#/dashboard-overview`。
- 业务权限由前端内存中的 role/permission/scope 数据和页面访问判断模拟，不是可信安全边界。
- 大量演示集合由 `Object.freeze` 固化，交互动作只更新当前页面内存中的状态副本。
- CSS 为单一构建产物，未发现外链字体、CSS CDN 或第三方主题资源。

## 构建与打包判断

- 两个入口均加载带内容哈希的 JS/CSS 文件，并包含 `modulepreload` polyfill，构建形态强烈符合 Vite。
- 由于没有 `vite.config.*`、源码目录或依赖清单，Vite 版本、插件、Node.js 版本和原始构建命令均无法确认。
- 小程序端使用 React JSX production runtime；原始语言可能是 JavaScript 或 TypeScript，产物不足以区分。
- 管理端原始模块已被压缩合并；无法确认其源码目录、模块边界或是否经过 TypeScript 编译。
- 当前仓库不能从源码重建已有 bundle；只能把现有文件当作静态制品运行。
- 生产化前应找回原始双端源码与锁文件，或明确将本原型作为需求参考后重新建工程。

## 配置与环境

- 当前配置全部硬编码在启动脚本或构建产物中，没有 `.env*`、运行时 JSON 配置或环境变量约定。
- 小程序端默认监听 `localhost:18081`，管理端默认监听 `localhost:18082`。
- Windows 服务以 `Cache-Control: no-store` 返回文件，并对未知路径做 SPA `index.html` 回退。
- PowerShell MIME 表覆盖 HTML、CSS、JS、JSON、常见图片、SVG、字体与 WebP。
- PID 记录写入 `tools/mini.pid` 和 `tools/web.pid`；这只是本地进程管理，不是应用存储。
- macOS 脚本与 Windows 脚本的服务器实现不同，部署行为应在生产化时统一。

## 数据、状态与测试

- 两端业务数据均直接打包在 JS bundle 中；`README.txt` 明确声明所有数据都是演示数据。
- 未发现业务 `fetch`、Axios、XHR、WebSocket、SSE 或 GraphQL 客户端调用。
- bundle 中唯一 `fetch` 用于 Vite 风格的 modulepreload polyfill，不是业务 API。
- 未发现 `localStorage`、`sessionStorage`、IndexedDB 或 Cookie 业务读写；刷新页面会恢复演示初始态。
- 管理端表单借助浏览器 `FormData` 读取字段，但提交仍由本地状态处理。
- 未发现单元测试、端到端测试、Lint 配置、CI/CD 配置或质量门禁。

## 面向 RuoYi 后端的技术缺口

- 需先确定采用 RuoYi-Vue、RuoYi-Vue-Plus、RuoYi-Cloud 或其他具体分支，不能只以“RuoYi”作为可执行技术规格。
- 需建立可编译的管理端与真正的小程序端工程，并定义共享 DTO、枚举、错误码和 API 版本策略。
- 需把前端模拟的 RBAC 转为后端鉴权与数据权限，前端仅保留展示级权限控制。
- 需选择数据库、对象存储、缓存、消息队列、任务调度和审计日志方案；当前仓库均无实现证据。
- 需补齐开发/测试/预发/生产环境配置、Secret 注入、API base URL 与跨域策略。
- 需建立测试金字塔、接口契约测试、构建复现、制品发布、监控告警与数据库迁移流程。
- 当前 bundle 中出现大量成熟业务状态机和表单字段，可用于反向提取 PRD/领域模型，但不能直接当作后端契约。

## 未知项清单

- 原始源码所在仓库、源码冻结点与当前发布包之间的可追溯关系未知。
- 原型说明提及的小程序冻结点 `0ae90c5` 与管理端冻结点 `7e5c3c9` 不存在于当前 Git 对象中，无法在本仓核验。
- 原始依赖版本（Lucide 除外也只可确认家族）、许可证清单和供应链风险未知。
- 浏览器支持范围、无障碍验收标准、性能预算和移动设备适配矩阵未知。
- 生产域名、HTTPS、网关拓扑、租户隔离方式与数据留存规则未知。

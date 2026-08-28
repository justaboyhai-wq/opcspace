# OPCSpace 仓库目录治理设计

## 1. 目标

将仓库从“原型交付包与正式工程混放”整理为一眼可识别的产品工程：

- `prototypes/` 只保存冻结的静态效果原型。
- `docs/` 只保存 PRD、架构、计划、追踪和代码库盘点。
- `apps/` 只保存用户侧应用源码，包括管理前端和小程序。
- `services/` 只保存后端服务源码。
- `contracts/`、`database/`、`deploy/`、`scripts/` 保存跨组件工程支撑。
- 根目录只保留仓库级元数据和权威说明。

整理只改变目录和文档引用，不把冻结原型误写成正式源码，也不宣称占位目录已经实现。

## 2. 目标目录

```text
opcspace/
|-- README.md
|-- .gitignore
|-- THIRD_PARTY_NOTICES.md
|-- workspace-baseline.json
|-- prototypes/
|   |-- index.html
|   |-- README.md
|   |-- admin/
|   `-- mini/
|-- docs/
|   |-- prd/
|   |-- architecture/
|   |-- plans/
|   |-- traceability/
|   `-- codebase/
|-- apps/
|   |-- admin-web/
|   `-- mini-app/
|-- services/
|   `-- backend/
|-- contracts/
|-- database/
|-- deploy/
`-- scripts/
```

## 3. 路径迁移

| 当前路径 | 目标路径 | 规则 |
|---|---|---|
| `prd-demo/` | `prototypes/` | 保留静态产物，标记为冻结证据 |
| 根 `index.html` | `prototypes/index.html` | 改为相对链接的统一原型入口 |
| `docs/product/` | `docs/prd/` | PRD、功能清单、业务流程和详细设计统一归档 |
| `docs/superpowers/plans/` | `docs/plans/` | 实施计划进入稳定文档边界 |
| `docs/superpowers/specs/` | `docs/architecture/` | 工程设计进入架构文档边界 |
| `.planning/codebase/` | `docs/codebase/` | 技术栈、结构、集成和风险盘点公开可见 |

`apps/admin-web`、`apps/mini-app`、`services/backend`、`contracts`、`database`、`deploy` 和 `scripts` 保持现有责任，不进行无关代码重构。

## 4. 删除范围

删除以下原型交付包遗留物：

- Windows 与 macOS 的全部 `START-*`、`STOP*`、中文重复启动/停止脚本。
- `README.txt`、`使用说明.txt`、`打开入口.html`。
- 只为这些脚本服务的 `tools/serve.ps1`、`tools/stop.ps1` 和失效 PID 文件。

保留 `scripts/` 中的基线验证和构建脚本。未纳入 Git 的 `.superpowers/` 是本地临时状态，不属于发布内容。

## 5. 原型访问规则

- `prototypes/admin` 与 `prototypes/mini` 是冻结构建产物，禁止继续作为正式源码开发。
- `prototypes/index.html` 使用 `./admin/` 与 `./mini/` 相对链接。
- 小程序原型入口及冻结 bundle 中的静态资源路径改为相对路径，确保从 `prototypes/` 作为站点根目录时可以加载；只归一化路径，不改变页面逻辑。
- 仓库不再维护平台专用的一键启动/停止脚本。需要预览时使用任意标准静态 HTTP 服务；是否发布 GitHub Pages 不在本次范围。

## 6. 文档一致性

全局更新 README、PRD、架构、计划、追踪矩阵、基线 JSON 和脚本中的旧路径：

- `prd-demo` 改为 `prototypes`。
- `docs/product` 改为 `docs/prd`。
- `docs/superpowers/plans` 改为 `docs/plans`。
- `docs/superpowers/specs` 改为 `docs/architecture`。
- `.planning/codebase` 改为 `docs/codebase`。

早期实施计划中的推荐目录同步为已批准的 `apps/services/contracts/database/deploy` 结构，消除 `backend/packages/infra` 与实际仓库的冲突。

## 7. 验收标准

1. 根目录不再出现原型启动、停止和重复说明文件。
2. `prototypes`、`docs/prd`、`apps/admin-web`、`apps/mini-app`、`services/backend` 边界清晰存在。
3. Git 跟踪文件中不存在旧目录和已删除脚本引用。
4. 两个静态原型入口及其核心资源通过 HTTP 返回成功状态。
5. `scripts/verify-baseline.ps1` 在新路径下通过。
6. 当前未提交的四份 v0.2 产品文档及 README、追踪矩阵修改完整保留。
7. 最终提交推送到 `origin/master`，并核对本地与远端提交一致。

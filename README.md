# OPCSpace

OPCSpace 是“和盛大厦”双端原型的产品化工作区。根仓负责产品版本、需求、架构、契约、数据库迁移和部署定义；正式管理端、小程序与后端保持独立构建和发布边界。

本仓库是原生 Git 工程：移动端与后端源码均由根仓直接管理，不使用 Git 子模块，也不携带上游提交历史。两套底座以 MIT 许可的源码快照导入，来源、快照和许可证见 [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)。

公开仓库：<https://github.com/justaboyhai-wq/opcspace>

## 产品文档

- [OPCSpace 园区服务一体化平台 PRD v0.1](docs/product/OPCSpace-PRD-v0.1.md)
- [业务流程与动作契约 v0.1](docs/product/OPCSpace-BUSINESS-FLOWS-v0.1.md)
- [PRD 待确认事项](docs/product/OPCSpace-PENDING-TOPICS.md)
- [功能追踪矩阵](docs/traceability/feature-matrix.md)

PRD 中的“原型证据”只表示冻结原型存在相应页面或交互，不代表业务已经实现。当前首期研发范围收敛为身份与主数据、报修工单黄金纵切、基础消息和审计。

## 当前目录基线

| 路径 | 作用 | 当前状态 |
|---|---|---|
| `prd-demo/mini/` | 小程序浏览器交互原型 | 冻结发布产物，仅作需求与视觉证据 |
| `prd-demo/admin/` | 管理端交互原型 | 冻结发布产物，仅作需求与视觉证据 |
| `apps/admin-web/` | Vue 3 + TypeScript 管理端 | 占位边界，源码尚未接入 |
| `apps/mini-app/` | 小程序产品底座 | 根仓管理的 uni-app 源码快照；待切换 Vue 3 产品基线 |
| `services/backend/` | 后端产品底座 | 根仓管理的 RuoYi-Vue 源码快照；待切换 Spring Boot 3 产品基线 |
| `contracts/` | OpenAPI 与共享词汇契约 | 占位边界，尚无正式契约 |
| `database/` | 迁移与非敏感种子数据 | 占位边界，尚无正式迁移 |
| `deploy/` | 本地编排、环境样例与发布清单 | 占位边界，尚无部署实现 |
| `.planning/codebase/` | 迁移前代码库事实快照 | 保留，不作为当前路径说明 |

占位目录中的 README 只声明责任和准入条件，不代表对应产品能力已经实现。当前仍缺少可维护的管理端源码；不得继续开发 `prd-demo/admin/assets/` 下的压缩 bundle。

## 获取与校验工作区

```powershell
git clone https://github.com/justaboyhai-wq/opcspace.git
Set-Location opcspace
.\scripts\verify-baseline.ps1
```

当前后端可在无需宿主机 JDK/Maven 的情况下通过 Docker 构建：

```powershell
.\scripts\build-backend-docker.ps1
```

该命令使用 Maven 3.9.11 + Eclipse Temurin JDK 17 执行 `mvn --no-transfer-progress -DskipTests package`。它只证明当前上游基线可编译打包；数据库初始化、Redis、登录和业务接口仍需后续运行验证。

## 架构边界

- 首期后端采用模块化单体，不采用 RuoYi-Cloud。
- 管理端 API：`/api/admin/v1/**`。
- 小程序 API：`/api/app/v1/**`。
- 外部回调：`/api/callback/v1/{provider}/**`。
- 首期业务模块为 `opc-foundation`、`opc-service`、`opc-content`、`opc-governance`。
- 管理端身份域与小程序身份域分离；Admin JWT 与 App JWT 不得跨端互用。

完整说明见 `docs/architecture/PROJECT_BASELINE.md` 与 `docs/architecture/MODULAR_MONOLITH.md`。

## 版本规则

- 产品版本在根仓打 SemVer 标签，例如 `v0.1.0-alpha.0`、`v0.1.0`。
- 根仓提交直接追踪全部产品源码；上游初始快照仅用于许可证与升级评审，不是子模块依赖。
- 数据库迁移、OpenAPI 契约、管理端、小程序和部署制品必须能追溯到同一个根仓版本。
- 上游框架升级单独提交，不与业务功能混合，升级后执行全量契约、权限和数据库回归。
- 对上游代码的后续同步必须独立评审，并保留许可证、NOTICE 和版权来源。

本次目录迁移不切换已导入源码快照的上游分支。后端仍是 Spring Boot 4.1.0 基线，移动端仍是 Vue 2/Vuex 基线；推荐分支只作为后续独立基线变更候选。

## 本地 PRD 演示

Windows 可运行 `START-ALL.bat`，macOS 可运行 `start-all.command`。演示端口保持：

- 小程序原型：<http://localhost:18081/>
- 管理端原型：<http://localhost:18082/>

PRD 演示仅在本地提供，不连接正式 API，也不部署到云端。

## 安全边界

- 不在根仓、子模块、日志或前端配置中提交数据库密码、微信密钥、支付证书和第三方 token。
- `apps/mini-app/config.js` 和 `apps/mini-app/manifest.json` 不含生产 AppID 或线上地址；上线前必须由环境配置注入项目自己的值。
- 当前静态原型不包含真实业务数据，不应把其前端角色判断、状态或成功提示当作生产规则。

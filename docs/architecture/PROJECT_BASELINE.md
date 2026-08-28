# OPCSpace 项目版本基座

> 本文记录 OPCSpace 原生工程基线。移动端与后端均已转换为根仓普通源码目录，不含 Git 子模块或嵌套 Git 提交历史；转换保留了适用的 LICENSE、版权和来源记录，见 `THIRD_PARTY_NOTICES.md`。

## 1. 已落地的原生工程边界

根仓 `opcspace` 直接追踪正式工程、原型证据、契约和发布定义：

```text
opcspace
|-- prototypes/
|   |-- admin/                  # 冻结管理端原型
|   `-- mini/                   # 冻结小程序原型
|-- apps/
|   |-- admin-web/              # 正式管理端占位边界
|   `-- mini-app/               # 小程序源码快照
|-- services/
|   `-- backend/                # 后端源码快照
|-- contracts/                  # API 与共享词汇
|-- database/                   # 迁移与种子
`-- deploy/                     # 编排、环境和发布
```

原型迁移只改变根仓路径，不修改 bundle 内容。两个框架源码快照的来源、评估提交和 MIT 许可证记录在 `workspace-baseline.json` 与 `THIRD_PARTY_NOTICES.md`；它们不再是 Git 子模块。

## 2. 当前基线不是最终生产选型

| 组件 | 当前精确基线 | 生产候选 | 当前判断 |
|---|---|---|---|
| 后端 | `services/backend`：`master@13db1fce`，Spring Boot 4.1.0，JDK 17 | `springboot3@a51a838b`，Spring Boot 3.5.16，JDK 17 | 本次不切换；后续以独立基线变更采用 Spring Boot 3 |
| 小程序 | `apps/mini-app`：`master@207cb4b`，Vue 2/Vuex | `vue3@930d5cd6`，Vue 3/Pinia | 本次不切换；后续以独立基线变更采用 Vue 3 |
| 管理端 | `apps/admin-web/` 仅有占位 README | Vue 3 + TypeScript + Vite + Pinia + Element Plus | 正式源码尚未接入，原型压缩产物不得充当源码 |

这些候选提交只是 2026-08-28 评估点，不表示已被本工作区采用。

## 3. 上游来源与合规边界

`services/backend` 与 `apps/mini-app` 是根仓的普通源码目录，不含上游远端或提交记录。公开仓库准备已满足以下边界：

- 源码由根仓普通文件追踪，`.gitmodules`、gitlink 与嵌套 `.git` 关联均已移除。
- 保留上游 LICENSE、NOTICE、文件头和版权归属，并记录来源与评估提交。
- 在公开前完成 Secret、演示环境、生成物和许可证兼容性审查。
- 上游同步作为独立、可审查的来源导入，不混入业务功能。

后续上游同步作为显式的源码导入提交，不能覆盖本项目业务变更。

## 4. 正式工程责任

- `apps/admin-web` 独立构建管理端静态制品。
- `apps/mini-app` 独立构建微信小程序制品。
- `services/backend` 独立构建 Java 容器镜像。
- `contracts/openapi` 保存权威接口契约，不复制粘贴 DTO。
- `contracts/vocabulary` 保存状态、错误码、权限码和事件命名。
- `database/migrations` 保存版本化迁移；`database/seeds` 只允许非敏感基准和开发数据。
- `deploy/compose` 只服务本地开发联调；`deploy/environments` 不得保存 Secret；`deploy/release` 锁定可追溯制品。

当前各占位 README 只定义边界，不证明实现存在。

## 5. 首期架构决策

首期采用模块化单体，明确不采用 RuoYi-Cloud。管理端、小程序和外部系统都通过后端边界访问权威业务状态：

- 管理端：`/api/admin/v1/**`
- 小程序：`/api/app/v1/**`
- 外部回调：`/api/callback/v1/{provider}/**`

管理端身份域以 `sys_user`、`sys_dept`、`sys_role` 为核心并签发 Admin JWT；小程序身份域以 `app_user`、`company_member`、`wechat_identity` 为核心并签发 App JWT。两类 token 使用不同受众和权限集合，不得跨端复用。

首个 Alpha 只规划以下后端模块：

| 模块 | 首期责任 | 当前实现状态 |
|---|---|---|
| `opc-foundation` | 项目、楼宇、楼层、空间、企业、成员和服务商主数据 | 尚未建立 |
| `opc-service` | 报修、工单、派单、处理记录、SLA、评价和时间线 | 尚未建立 |
| `opc-content` | 小程序公告和基础消息内容 | 尚未建立 |
| `opc-governance` | 业务审计、通知任务、字典与配置发布边界 | 尚未建立 |

资产、租赁、财务、停车、门禁和 AI 模块不在首个 Alpha 的实现范围。

更详细的调用和依赖规则见 `MODULAR_MONOLITH.md`。

## 6. 当前验证事实与阻塞

- 本机可用 Node.js 24.13.0 与 npm 11.6.2，但没有宿主机 JDK 与 Maven；已于 2026-08-28 使用 `maven:3.9.11-eclipse-temurin-17` 容器，在当前 `services/backend` 路径执行 `-DskipTests package` 并获得 `BUILD SUCCESS`。测试仍被明确跳过。
- `apps/mini-app` 没有根 `package.json`，当前仍依赖 HBuilderX，尚不能进入标准 CLI/CI 构建流水线。
- `apps/admin-web` 正式源码尚未进入工作区。
- 正式产品 GitHub 远端已创建并公开：<https://github.com/justaboyhai-wq/opcspace>；根仓 `master` 追踪 `origin/master`。
- Druid 控制台、Swagger UI 和 OpenAPI 文档默认关闭；仅能由受控环境变量显式开启。Druid 默认只允许 `127.0.0.1`，生产环境还必须注入账号、密码和允许网段。
- 后端 Spring Boot 3/4 与移动端 Vue 2/3 的正式分支选择仍需独立基线提交。

## 7. 下一次基座变更顺序

1. 以独立变更切换 Spring Boot 3 与 RuoYi-App Vue 3 候选基线。
2. 补充 Vue 3 + TypeScript 管理端源码。
3. 增加 Wrapper、Compose 基础设施和环境配置样例。
4. 创建四个首期后端模块与数据库迁移基线。
5. 打通双身份域、健康检查、OpenAPI 和第一条报修纵切。

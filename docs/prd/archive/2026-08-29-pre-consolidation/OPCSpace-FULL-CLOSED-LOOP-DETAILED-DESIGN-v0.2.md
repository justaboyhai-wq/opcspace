# OPCSpace 候选业务闭环详细设计 v0.2

> **文档状态：历史候选详细设计，暂停作为需求基线。** 当前应先按功能联动集合逐条评审是否闭环；本文的状态机、API、数据表和实施顺序均为候选，不代表已确认或已实现。
>
> 编制日期：2026-08-28
>
> 产品边界：物业管理端 + 入驻企业微信小程序 + 统一业务后端
>
> 首发项目：和盛大厦；目标模型预留同一物业多项目能力
>
> 当前基线：[PRD v0.3](./OPCSpace-PRD-v0.3.md)、[功能联动集合 v0.3](./OPCSpace-MINI-ADMIN-FUNCTION-LINKAGE-COLLECTION-v0.3.md)。配套证据：[小程序原型功能全量清单](./OPCSpace-MINI-PROTOTYPE-FUNCTION-INVENTORY-v0.2.md)、[管理端原型功能全量清单](./OPCSpace-ADMIN-PROTOTYPE-FUNCTION-INVENTORY-v0.2.md)、[待确认事项](./OPCSpace-PENDING-TOPICS.md)
>
> 当前范围不包含设备台账、物业巡检、维保、设备告警和通用 IoT/BA 能力；普通报修保留；访客二维码、门禁、闸机和核销硬件保留。

## 1. 文档目标与设计原则

本设计解决的不是“把原型页面开发出来”，而是将每个小程序入口落实为同一条可运营业务链：企业用户发起，后端生成权威记录，管理端承接审批或执行，结果和异常持续回传小程序，最终形成可评价、可追责、可复盘的闭环。

### 1.1 闭环定义

每条业务线必须同时具备：

1. 明确触发事件、发起者、责任主体和目标结果。
2. 明确输入字段、附件、权限、数据范围和前置状态。
3. 后端生成唯一业务编号，并维护权威状态机和版本。
4. 管理端拥有对应待办、详情、审批/执行动作和责任视图。
5. 小程序能查询同一业务对象的状态、时间线、公开回复和下一步动作。
6. 重复、并发、超时、撤回、驳回、外部失败和人工补偿均有唯一处置路径。
7. 关键动作记录操作者、时间、前后状态、原因、来源端和请求 ID。
8. 完成后有验收/确认、评价或明确的规则关闭机制，不能以成功 Toast 代替完成。

### 1.2 事实与建议边界

| 类型 | 本文表达 |
|---|---|
| 当前事实 | 冻结原型存在相应页面；正式业务模块、API、迁移和双端状态尚未实现 |
| 工程基线前提 | 双身份域、模块化单体、管理端/小程序 API 分界、首发和盛大厦、核心表携带 `project_id`；是否沿用以当前架构基线为准 |
| 建议设计 | 本文给出的领域、状态、页面、API 和异常策略，需业务评审后冻结 |
| 待确认 | 依赖物业制度、财务权威源、外部厂商或合规结论，本文不替业务负责人做决定 |

### 1.3 证据优先级与追溯规则

1. 小程序事实以 `MP-*` 清单为准；管理端事实以 `ADM-*` 清单为准。
2. 页面存在、按钮存在和演示成功态，只能证明原型表达，不能证明接口、数据库或外部系统已经工作。
3. 每条业务线必须能回溯到一个或多个 `MP-*` 入口和 `ADM-*` 承接页；找不到承接页的内容明确标为新增设计。
4. 原型与本文冲突时，先登记冲突并由产品/业务评审，不静默改变原型含义。
5. 所有待确认规则在确认前使用配置或禁用策略，不以开发人员默认值替代业务决策。

## 2. 整体产品架构

```mermaid
flowchart LR
    U[企业成员/企业管理员] --> MP[微信小程序]
    P[物业员工/管理人员] --> ADM[物业管理端]
    MP --> APPAPI[/api/app/v1]
    ADM --> ADMINAPI[/api/admin/v1]
    APPAPI --> CORE[模块化业务后端]
    ADMINAPI --> CORE
    CORE --> DB[(MySQL 权威事实)]
    CORE --> REDIS[(Redis 会话/幂等/协调)]
    CORE --> OBJ[(私有对象存储)]
    CORE --> OUTBOX[(Outbox/异步任务)]
    OUTBOX --> WX[微信/短信/邮件]
    OUTBOX --> PAY[支付/发票]
    OUTBOX --> ACCESS[访客门禁/闸机]
    PAY --> CALLBACK[/api/callback/v1/provider]
    ACCESS --> CALLBACK
    CALLBACK --> CORE
```

### 2.1 端到端责任

| 层 | 责任 | 禁止事项 |
|---|---|---|
| 小程序 | 发起业务、查看本人/本企业授权数据、确认和评价 | 自己生成可信 ID、审批人、最终状态或支付成功事实 |
| 管理端 | 受理、审批、派工、执行、复核、补偿和运营分析 | 仅靠隐藏按钮做权限；绕过状态机直接改库 |
| 后端 | 身份、权限、状态机、事务、幂等、审计、通知任务和外部回执 | 信任客户端提交的操作者、`company_id` 或最终状态 |
| 外部适配器 | 签名、回调、ID 映射、重试、对账和降级 | 将 HTTP 200 等同于支付、开票、开门或下发成功 |

### 2.2 目标后端模块

| 模块 | 数据所有权与职责 |
|---|---|
| `opc-foundation` | 项目、楼宇、楼层、空间、企业、成员、企业—空间关系、服务商 |
| `opc-service` | 报修、投诉、环境服务、客服会话、工单、SLA、评价与回访 |
| `opc-finance` | 费项、账单、支付单、渠道流水、退款、充值账户/流水、发票、押金、关账 |
| `opc-leasing` | 合同、租赁单元、续退租、装修入驻、承包商、人员和交接 |
| `opc-operations` | 空间资源、时段、预约、访客、凭证、停车车辆/月卡/优惠 |
| `opc-content` | 公告、Banner、活动、报名、企业服务目录、AI 服务商品 |
| `opc-governance` | 审批、通知投递、配置发布、审计、失败补偿、隐私请求 |
| `opc-integration` | 微信、支付、发票、短信和访客门禁/闸机适配器；不包含停车控制、电表设备或 BA |
| `opc-ai` | AI 会话、知识来源、用量、动作草稿、人工确认与接管；V2 启用 |

首期仍采用一个部署单元。模块通过应用服务和领域事件协作，不能直接更新其他模块的表。

## 3. 用户、组织与权限设计

### 3.1 主体模型

| 主体 | 所属身份域 | 主要权限 |
|---|---|---|
| 超级管理员 | Admin | 项目、系统配置、角色、审计和跨项目治理 |
| 运营受理/客服人员 | Admin | 报修、投诉、访客、客服和服务受理 |
| 运营服务/安保人员 | Admin | 处理分配的服务任务、访客核销或通行异常；不承担系统内物业巡检 |
| 财务 | Admin | 账单、收款、充值、发票、押金、对账和关账；高风险职责分离 |
| 招商 | Admin | 企业、合同、续退租、装修业务信息和交接 |
| 内容 | Admin | 公告、活动、企业服务、Banner 和 AI 订阅商品 |
| 企业管理员 | App | 本企业成员、企业服务、访客、预约及企业范围记录 |
| 企业成员 | App | 本人服务发起、记录查询、确认、评价和有限企业数据 |
| 服务商/承包商 | 受限 Admin/后续移动端 | 仅查看和处理分配给本组织的任务 |
| 访客 | 临时凭证 | 仅在指定时间、区域、次数内通行 |

### 3.2 两套身份域

- 管理端：`sys_user + sys_dept + sys_role`，签发 Admin JWT。
- 小程序：`wechat_identity + app_user + company_member`，签发 App JWT。
- `sys_dept` 仅表示物业内部组织；入驻企业使用独立 `company`，园区使用独立 `project`。
- 同一自然人可有多个企业成员关系；当前企业上下文必须显式选择并由服务端校验。
- Admin JWT 与 App JWT 使用不同 audience、权限码和 API 前缀，不得跨端使用。

### 3.3 四层权限

1. 菜单权限：是否能进入管理端页面。
2. API 权限：是否能调用查询或命令。
3. 数据范围：项目、企业、楼宇、空间、工单和责任范围。
4. 状态权限：对象当前状态下能否受理、派单、处理、复核、退款、红冲或发布。

成员授权、匿名解密、财务复核、退款/红冲、配置发布、外部开门和敏感导出必须强化认证、双人复核或独立审批，并记录不可缺失的业务审计。

## 4. 跨业务公共底座

### 4.1 服务目录与小程序入口发布

管理端 `system-config-publish` 负责配置入口，不直接保存业务记录。

| 配置对象 | 关键字段 |
|---|---|
| 服务入口 | 编码、名称、图标、跳转目标、所属分组、排序、版本、启停状态 |
| 可见规则 | 项目、企业类型、成员角色、合同状态、灰度组、有效期 |
| 依赖状态 | 对应后端能力、外部系统健康、维护窗口、降级文案 |
| 发布记录 | 草稿、待复核、已发布、已回滚、发布人、复核人、版本摘要 |

发布前服务端校验跳转目标、权限码和依赖能力。已下线入口仍保留历史业务详情深链，不能让用户失去已有记录。

### 4.2 统一业务记录投影

首页“进行中的服务”和“我的服务”使用只读聚合，不新建万能工单表：

```text
service_projection
  object_type
  object_id
  project_id
  company_id
  requester_id
  display_title
  public_status
  next_action
  updated_at
```

各领域在状态变化时更新投影；点击后通过 `object_type + object_id` 跳转对应详情。领域对象仍是权威源。

### 4.3 状态事件与时间线

所有可流转对象保存当前快照和不可缺失的状态事件：对象、前状态、后状态、动作、操作者、来源端、公开说明、内部说明、发生时间、请求 ID、规则版本。小程序只读取公开字段；内部调查、风控和个人敏感信息不得泄露。

### 4.4 附件

采用“申请上传凭证 → 私有直传 → 扫描/转码 → 完成附件 → 绑定业务对象”。未完成或扫描失败附件不能被业务命令引用。删除业务记录不立即物理删除审计附件；保留期按对象和合规规则确定。

### 4.5 通知

通知不拥有业务状态。业务事务内写 Outbox，异步任务按站内信、微信订阅、短信或邮件投递并记录 `pending/sent/delivered/failed`。投递失败不回滚工单、预约或审批事实；进入重试或人工补偿。

### 4.6 审批与待办

- 领域对象决定是否需要审批、审批输入及审批通过后的领域动作。
- `opc-governance` 保存审批实例、节点、候选人、委托、加签、超时和意见。
- 统一审批中心是任务聚合器，不替代续租、装修、发票、充值等领域状态机。
- 批量审批只允许同规则、同状态、无高风险差异的对象，并逐条产生日志。

### 4.7 失败补偿台

候选统一补偿台展示通知、上传处理、支付回调、开票、访客门禁下发和导出等异步任务。每项包含业务对象、外部 ID、当前事实、失败分类、重试历史、下一动作、责任人、截止时间和审计。停车只处理业务/账务记录，不包含硬件同步。禁止通过直接改数据库完成补偿。

## 5. 双端页面通用详细设计

### 5.1 小程序

- 列表页显示公开状态、更新时间、下一步动作和异常提示，不只显示颜色标签。
- 提交页先校验本地格式，服务端仍重复校验身份、范围、状态和业务规则。
- 创建命令携带 `Idempotency-Key`；按钮提交中禁用，但不能仅依赖前端防重复。
- 详情页统一包含摘要、公开时间线、附件、联系人、下一动作、撤回/申诉入口和客服入口。
- 外部动作显示“已受理、渠道处理中、成功、失败”，不得提前展示成功凭证。
- 网络失败可安全重试；版本冲突提示刷新，不静默覆盖用户输入。

### 5.2 管理端

- 列表页提供职责范围内的待办、SLA、异常和责任人，不以全量台账替代待办。
- 详情页固定包含基础事实、状态时间线、可执行动作、公开回复、内部记录、附件和审计。
- 操作按钮由后端返回的 `allowed_actions` 辅助展示，真正权限仍由命令接口校验。
- 高风险动作要求原因、二次确认、版本号和必要附件；审批人与发起人按规则分离。
- 看板只聚合领域事实，不维护独立计数；指标必须有定义、时间范围和刷新时间。

## 6. 各业务线详细设计

### 6.0 业务线覆盖矩阵

| 业务线 | 小程序事实编号 | 管理端承接编号 | 设计章节 | 当前原型承接判断 |
|---|---|---|---|---|
| 企业、成员与激活 | MP-04、MP-33、MP-34 | ADM-05-01、ADM-08-01、ADM-10-02 | 6.1 | 部分承接 |
| 公告、消息、Banner、订阅 | MP-01、MP-05、MP-35、MP-G04 | ADM-07-01、ADM-07-06、ADM-10-03、ADM-10-06 | 6.2 | 部分承接 |
| 报修工单 | MP-07、MP-08A、MP-08B、MP-09 | ADM-02-01、ADM-02-02 | 6.3 | 较明确，评价/异常待补 |
| 环境服务 | MP-10 | ADM-02-04 | 6.4 | 部分承接 |
| 投诉、客服、产品反馈 | MP-11、MP-36、MP-37 | ADM-02-03、ADM-07-05、ADM-09-02 | 6.5 | 部分承接 |
| 访客与通行 | MP-15、MP-16、MP-17 | ADM-06-04 | 6.6 | 较明确，门禁异常待补 |
| 停车 | MP-30 | ADM-06-03、ADM-04-01、ADM-04-02 | 6.7 | 后台较全，前台子流程缺失 |
| 空间预约 | MP-27、MP-28、MP-29A、MP-29B | ADM-06-01、ADM-06-02 | 6.8 | 部分承接 |
| 园区活动 | MP-31、MP-32 | ADM-07-02 | 6.9 | 报名步骤缺失 |
| 企业服务代办 | MP-12、MP-13、MP-14 | ADM-07-03、ADM-09-01、ADM-09-02 | 6.10 | 部分承接 |
| 租约、入驻、装修、退租 | MP-25、MP-26 | ADM-05-02 至 ADM-05-05、ADM-04-06、ADM-04-07 | 6.11 | 后台对象分散，前台仅流程壳 |
| 账单、支付、对账 | MP-18、MP-19、MP-23 | ADM-04-01、ADM-04-02、ADM-04-07 | 6.12 | 支付过程缺失 |
| 电费、充值、空调、押金 | MP-21、MP-22 | ADM-04-04 至 ADM-04-07、ADM-10-07 | 6.13 | 对公充值较明确，其余待补 |
| 发票 | MP-20、MP-24 | ADM-04-03 | 6.14 | 部分承接 |
| 工程设施 | 无 | ADM-03-01 至 ADM-03-04 | 6.15 | 原型证据，当前排除 |
| AI 订阅与 AI 管家 | MP-03、MP-06、MP-U01 至 MP-U03、MP-G09 | ADM-07-04、ADM-09-03、ADM-09-04、ADM-09-01 | 6.16 | 部分承接，动作边界待实现 |
| 合规文档与隐私 | MP-38 | ADM-08-02、ADM-10-04；需新增内容版本页 | 6.17 | 无专用内容承接 |

### 6.1 企业、成员与小程序激活

| 层 | 详细设计 |
|---|---|
| 小程序 | MP-04/MP-33/MP-34：首次微信登录 → 手机号验证/激活码 → 选择当前企业；“我的公司”展示企业档案；成员管理支持邀请、待审核、角色、停用和离职申请 |
| 管理端 | ADM-05-01 维护企业主档；ADM-08-01 维护成员关系、激活、停用和强制下线；ADM-10-02 提供角色权限；新增成员申请/授权审计视图 |
| 后端 | `company`、`company_space`、`app_user`、`wechat_identity`、`company_member`、`activation_credential`、`member_role_grant` |
| 状态 | 成员关系 `invited -> active -> suspended/left`；加入申请 `submitted -> approved/rejected/withdrawn` |
| 关键异常 | 一码多绑、手机号多企业、微信换绑、企业失效、成员离职、管理员离职、未完业务移交 |

关键 API：

- App：`POST /auth/wechat-login`、`POST /auth/activate`、`GET /me/companies`、`POST /company/members/invitations`、`POST /company/membership-requests/{id}/decision`。
- Admin：`POST /companies`、`POST /companies/{id}/members`、`POST /members/{id}/suspend`、`GET /member-role-grants`。

完成标准：停用后会话立即失效；企业管理员不能操作其他企业；所有角色变更可追溯；历史业务记录不因离职丢失。

### 6.2 公告、消息、Banner 与订阅

| 层 | 详细设计 |
|---|---|
| 小程序 | MP-01/MP-05/MP-35/MP-G04：首页 Banner/提醒、通知中心、公告详情、已读/确认、订阅偏好 |
| 管理端 | ADM-07-01 编辑/审核/发布/撤回和阅读明细；ADM-07-06 编排 Banner；ADM-10-03 管理模板、渠道和订阅规则；ADM-10-06 发布入口配置 |
| 后端 | `content_item`、`content_version`、`audience_rule`、`publish_job`、`user_read_cursor`、`user_ack`、`subscription_preference`、`delivery_task` |
| 状态 | 内容 `draft -> pending_review -> scheduled/published -> withdrawn/expired` |
| 关键异常 | 错误受众、XSS、定时失败、撤回后缓存、紧急公告未确认、微信未授权订阅 |

紧急公告可绕过普通营销订阅偏好，但仍需符合通知同意和合规规则；“关闭今日提醒”只改变当前用户展示，不撤回公告。

### 6.3 报修工单

| 层 | 详细设计 |
|---|---|
| 小程序 | MP-07 提交；MP-08A/MP-08B 查看列表、详情和时间线；MP-09 验收、评价或重开 |
| 管理端 | ADM-02-01 工单池受理/派单；ADM-02-02 详情页接单、开始、挂起、恢复、转派、完工、关闭、回访和 SLA |
| 后端 | `work_order`、`work_order_assignment`、`work_order_action`、`work_order_sla`、`work_order_evaluation`、`work_order_relation` |
| 状态 | `submitted -> accepted -> assigned -> processing -> pending_acceptance -> completed -> closed`；分支 `withdrawn/suspended/reopened/cancelled` |
| 关键异常 | 重复提交、附件失败、并发派单、无人可派、挂起超时、责任人离岗、通知失败、用户离职、自动关闭并发 |

关键命令：创建、受理、派单、接单、开始、挂起、恢复、转派、提交完工、验收、评价、重开、撤回、关闭。每个命令都有允许角色、前置状态、版本号和原因。

完成标准：小程序与管理端读取同一工单和时间线；运营服务人员不能代用户评价；通知失败不改变工单事实；每次转派保留前后责任人。

### 6.4 保洁、绿化与消杀

| 层 | 详细设计 |
|---|---|
| 小程序 | MP-10 选择服务、地址、面积、时间、补充说明，查看报价，提交并确认；“我的服务”查看履约和验收 |
| 管理端 | ADM-02-04 待确认、供应商分派、冲突确认、服务开始、完工、验收和异常 |
| 后端 | `environment_service_catalog`、`environment_booking`、`service_quote`、`supplier_assignment`、`service_execution`、`service_acceptance` |
| 状态 | `submitted -> quoted/pending_confirmation -> confirmed -> assigned -> in_service -> pending_acceptance -> completed`；分支 `cancelled/rejected/reschedule_required` |
| 关键异常 | 排期冲突、现场加价、供应商拒单、人员证件失效、用户取消、未到场、验收不通过、收费退款 |

原型的“提交预约 → 确认预约”只是前端弹层。正式设计中，报价变化必须再次由用户确认；服务商开始/完工有现场记录；用户验收后才完成。

### 6.5 投诉、客服与产品反馈

投诉、在线客服和产品反馈是三个对象：投诉处理物业责任，客服会话提供沟通渠道，产品反馈改进平台本身。

| 业务 | 小程序 | 管理端 | 状态与收口 |
|---|---|---|---|
| 投诉 | MP-11 提交、查看公开回复、确认/不认可 | ADM-02-03 受理、分级、转办、处理、回访 | `submitted -> triaged -> processing -> pending_confirmation -> closed/reopened/withdrawn` |
| 在线客服 | MP-36 进入排队、会话、结束、评价 | ADM-09-02 认领、回复、转工单、结束、质检 | `queued -> active -> pending_user -> resolved -> evaluated/archived` |
| 产品反馈 | MP-37 提交建议、查看回复 | ADM-07-05 分类、分派、处理、回复 | `submitted -> reviewing -> planned/resolved/rejected -> closed` |

匿名投诉是否开放、哪些角色可解密、投诉转工单后的责任边界均为待确认。关联工单完成不自动关闭投诉，仍需投诉处理结论和用户确认。

### 6.6 访客邀请与通行

| 层 | 详细设计 |
|---|---|
| 小程序 | MP-15 录入访客最小信息、时间、区域、次数、车牌和减免；MP-16 展示凭证、转发、撤销和到访状态；MP-17 查看记录 |
| 管理端 | ADM-06-04 审批、签发、门禁下发、核销、撤销、过期、人工放行和异常对账 |
| 后端 | `visitor_invitation`、`visitor_approval`、`access_credential`、`credential_delivery`、`access_event`、`manual_pass_record` |
| 状态 | `submitted -> pending_approval/approved -> credential_issuing -> valid -> used/expired/revoked`；外部失败 `delivery_failed` |
| 关键异常 | 重复邀请、黑名单/频控、门禁离线、二维码截屏复用、区域错误、撤销后未回收、访客未到、人工放行 |

凭证只有门禁下发成功或明确支持在线核验后才能显示“可通行”；否则显示“凭证生成中/人工核验可用”。核销必须幂等并防重放。

### 6.7 停车服务

| 层 | 详细设计 |
|---|---|
| 小程序 | MP-30 余额、车辆认证、月卡、访客减免、商户券、停车记录和临停缴费 |
| 管理端 | ADM-06-03 处理车辆/月卡、车场状态、订单、优惠和异常出场；ADM-04-01/ADM-04-02 处理支付、退款和对账 |
| 后端 | `parking_vehicle`、`vehicle_verification`、`parking_subscription`、`parking_session`、`parking_order`、`parking_coupon`、`coupon_redemption` |
| 状态 | 车辆业务申请 `submitted -> verified/rejected`；月租业务 `pending -> active -> expiring -> expired/suspended`；停车账单 `created -> priced -> paying -> paid/closed` |
| 关键异常 | 车辆资料不一致、重复申请、优惠叠加、金额争议、支付结果未知、退款和月租业务变更失败 |

当前只设计车辆、月租、优惠、账单、缴费和记录等业务信息，不设计实时空位、设备协议、自动抬杆或停车硬件回执。

### 6.8 空间预约

| 层 | 详细设计 |
|---|---|
| 小程序 | MP-27 资源目录；MP-28 可用时段；MP-29A 预约凭证；MP-29B“我的预约”列表，并补取消/改期、签到和评价 |
| 管理端 | ADM-06-01 管资源、开放规则和维护排期；ADM-06-02 管审核、冲突、签到、爽约、完成和取消 |
| 后端 | `bookable_resource`、`availability_rule`、`resource_block`、`booking`、`booking_attendee`、`checkin_record`、`booking_charge` |
| 状态 | `submitted -> pending_approval/confirmed -> checked_in -> in_use -> completed`；分支 `rejected/cancelled/no_show` |
| 关键异常 | 同时抢订、跨午夜、维护冲突、审批与取消并发、收费失败、资源临时不可用、未签到、超时使用 |

冲突必须在事务内通过锁或数据库约束解决。前端显示空闲不构成预留；确认预约后才能生成预约凭证。空间预约不联动门禁硬件。

### 6.9 园区活动

| 层 | 详细设计 |
|---|---|
| 小程序 | MP-31 活动列表/详情；MP-32 报名、候补、取消、凭证、签到状态、保存日历和评价 |
| 管理端 | ADM-07-02 草稿/审核/发布、容量、报名人员、候补递补、签到、活动取消和数据导出 |
| 后端 | `activity`、`activity_version`、`activity_audience`、`registration`、`waitlist_entry`、`activity_checkin` |
| 状态 | 活动沿用内容发布状态；报名 `registered/waitlisted -> checked_in/completed`，分支 `cancelled/no_show` |
| 关键异常 | 容量并发、重复报名、资格变化、候补通知失败、活动取消、收费活动退款、二维码重复签到 |

原型点击活动后直接显示“报名成功”，正式版必须先展示详情和报名确认，只有服务端容量扣减成功才进入已报名。

### 6.10 企业服务代办

| 层 | 详细设计 |
|---|---|
| 小程序 | MP-12 服务目录；MP-13 提交意向；MP-14 查看顾问、材料、进度、公开记录和交付物 |
| 管理端 | ADM-07-03 维护服务产品、资格/材料并处理申请；ADM-09-01 承接必要审批；ADM-09-02 承接在线沟通 |
| 后端 | `enterprise_service_product`、`service_requirement`、`enterprise_service_request`、`advisor_assignment`、`service_followup`、`service_deliverable` |
| 状态 | `submitted -> assigned -> contacted -> materials_pending -> processing -> delivered -> pending_confirmation -> closed`；分支 `cancelled/rejected` |
| 关键异常 | 无顾问、资格不符、材料过期、线下合同未签、第三方办理失败、交付物被拒绝、超时未联系 |

对“线下材料与合同”必须明确系统边界：OPCSpace 至少记录负责人、联系时间、材料清单、外部办理状态和最终交付；不能在“顾问已联系”时关闭。

### 6.11 租约、续租、入驻、装修与退租

| 子业务 | 小程序设计 | 管理端设计 | 候选状态 |
|---|---|---|---|
| 合同查看 | MP-25 查看脱敏摘要和授权文件 | ADM-05-02 版本、附件、到期和付款计划 | `draft -> reviewing -> effective -> expiring -> expired/terminated` |
| 续租 | MP-25 提交意向、查看方案、确认/驳回、签约进度 | ADM-05-03 招商、物业、财务会签 | `intent_submitted -> negotiating -> approving -> approved -> signing -> effective` |
| 入驻 | MP-26 资料提交、补件、验收、交接确认 | ADM-05-04 六步流程 | `submitted -> reviewing -> fees_pending -> handover -> completed` |
| 装修 | MP-26 图纸/人员/计划、补件、缴押金、施工证、验收 | ADM-05-04 + ADM-05-05 + ADM-04-06 | `submitted -> reviewing -> fees_pending -> permitted -> in_progress -> inspection -> completed` |
| 退租 | MP-26 申请、交接、欠费/押金、确认结算 | ADM-05-03 + ADM-04-06 + ADM-04-07 | `submitted -> reviewing -> handover -> settlement -> refunding -> completed` |

核心实体：`lease_contract`、`contract_version`、`lease_unit`、`renewal_request`、`move_request`、`decoration_application`、`contractor`、`site_person`、`inspection`、`handover_item`。

关键边界：续租意向不等于合同续签；退租通过不等于押金已退；装修验收不等于财务结算完成。每个子状态分别记录，再由总流程计算公开状态。

### 6.12 账单、支付、对账与关账

| 层 | 详细设计 |
|---|---|
| 小程序 | MP-18 查询账单/明细、选择或合并并发起支付；MP-19 查看支付结果/回单；MP-23 查看付款记录、提交账单异议 |
| 管理端 | ADM-04-01 生成/复核/发布/调整/作废账单；ADM-04-02 匹配渠道流水；ADM-04-07 对账和关账 |
| 后端 | `charge_item`、`bill`、`bill_line`、`bill_adjustment`、`payment_order`、`channel_transaction`、`bill_allocation`、`refund`、`statement` |
| 状态 | 账单 `draft -> reviewing -> issued -> partially_paid/paid -> closed`；支付单 `created -> pending -> succeeded/failed/closed -> refunding/refunded` |
| 关键异常 | 重复/乱序回调、金额不符、部分支付、合并支付部分成功、超时未知、退款、账单异议、对账差异、关账后调整 |

支付订单、渠道流水、账单核销和发票必须是不同对象。回调验签并落渠道流水后再核销账单；日对账发现差异进入补偿台。

### 6.13 电费、充值、空调加时与押金

| 子业务 | 小程序 | 管理端 | 关键规则 |
|---|---|---|---|
| 电费账户 | MP-21 余额、账单、阈值、流水 | ADM-04-04、ADM-04-07 | 明确财务账务权威源；余额由不可变流水计算；不管理电表设备或实时抄表 |
| 线上充值 | MP-21 选择金额并确认支付 | ADM-04-04、ADM-04-02 | 支付成功后入账；手续费、退款独立记录 |
| 对公充值 | MP-22 上传回单并查看进度 | ADM-04-04 待初审/复核/入账；ADM-10-07 投影用户可见态 | 双人复核，账号可见态由复核发布 |
| 空调加时 | 需新增小程序申请入口/记录 | ADM-04-05 确认时长并出账 | 申请时长、人工确认时长和账单可勾稽，不连接设备控制 |
| 押金 | MP-26 装修/退租流程中查看 | ADM-04-06 收取、扣减、退还 | 未结扣减阻塞退还；扣减与退还分别审批 |

状态：充值 `submitted -> pending_payment/pending_review -> pending_second_review -> posted`，分支 `rejected/refunding/refunded`。任何余额变化都必须对应唯一流水、来源单据和余额快照。

### 6.14 发票

| 层 | 详细设计 |
|---|---|
| 小程序 | MP-24 查看记录；MP-20 选择可开票交易/账单、抬头、票种、邮箱，提交、补正、下载或申请红冲 |
| 管理端 | ADM-04-03 审核、开具、交付、驳回、红冲、重开和异常补偿 |
| 后端 | `invoice_profile`、`invoice_application`、`invoice_source_line`、`invoice_issue_task`、`invoice_document`、`red_flush_request` |
| 状态 | `requested -> reviewing -> issuing -> issued -> delivered`；分支 `rejected/issue_failed/red_flushing/red_flushed/reissued` |
| 关键异常 | 重复开票、抬头与合同不符、超过可开金额、外部开票未知、文件交付失败、红冲与重开并发 |

可开票金额由已确认收入/支付与历史开票计算，不能信任小程序输入金额。数电票服务商未确定前不进入正式联调承诺。

### 6.15 工程设施（当前排除）

`ADM-03-01` 至 `ADM-03-04` 仅作为管理端冻结原型证据保留。设备台账、设备详情、物业巡检、维保计划、设备告警、告警自动转单及其数据模型均不进入当前产品。普通报修独立属于运营服务，不引用上述对象。

### 6.16 AI 服务订阅与 AI 管家

#### AI 服务订阅

小程序 MP-03 展示商品，MP-06 展示用量和套餐；用户“立即订购”生成订购申请。管理端 ADM-07-04 负责商品、价格、审批、开通、席位/额度、续费和停用。核心实体为 `ai_product`、`subscription_order`、`subscription`、`seat_grant`、`usage_ledger`。状态为 `submitted -> reviewing -> pending_payment -> provisioning -> active -> suspended/expired/terminated`。

#### AI 管家

问答和动作必须分层：

1. 知识问答只返回带来源版本的答案，不写业务事实。
2. 动作草稿保存结构化字段、权限快照、引用和风险等级。
3. 用户查看、修改并确认后，调用与普通页面相同的业务命令 API。
4. 支付、退款、开门、发票、导出、权限和配置发布强制人工审批或二次确认。
5. ADM-09-03 负责知识健康、意图路由、灰度、草稿校验和人工接管；ADM-09-04 只编排受控事件；ADM-09-01 承接必要审批。

状态：`generated -> waiting_user_confirmation -> waiting_business_validation -> submitted_to_domain -> executed`，分支 `rejected/taken_over/expired/failed`。模型输出、提示版本、知识引用、确认人、最终命令和执行结果进入审计。

### 6.17 合规文档与隐私请求

| 层 | 详细设计 |
|---|---|
| 小程序 | MP-38 展示当前生效的服务协议、隐私政策和第三方信息共享清单；首次同意、重大版本变更和撤回授权均有明确操作与记录 |
| 管理端 | ADM-08-02 处理访问、更正、删除、撤回等隐私请求；ADM-10-04 提供审计。新增“合规文档版本管理”页面，支持草稿、法务复核、定时生效、撤回和历史版本 |
| 后端 | `legal_document`、`legal_document_version`、`consent_record`、`consent_withdrawal`、`privacy_request`、`privacy_request_action` |
| 状态 | 文档 `draft -> reviewing -> scheduled/published -> withdrawn/expired`；请求 `submitted -> identity_verifying -> processing -> fulfilled/rejected -> closed` |
| 关键异常 | 用户身份核验失败、保留义务与删除请求冲突、版本生效失败、第三方清单遗漏、撤回后仍有非必要处理、超期未答复 |

接口至少包括 `GET /legal-documents/current`、`GET /legal-documents/{code}/versions/{version}`、`POST /consents`、`POST /consents/{id}/withdraw`、`POST /privacy-requests`。同意记录保存文档代码、精确版本、正文摘要、用户、企业上下文、时间、来源和证据；不得只保存一个布尔值。

## 7. API 与事件详细约定

### 7.1 API 分层

- App 查询：面向用户的脱敏视图和 `allowed_actions`。
- App 命令：只允许本人/本企业授权动作，统一幂等键。
- Admin 查询：菜单/API/数据范围校验后返回管理视图。
- Admin 命令：校验角色、状态、版本、职责分离和原因。
- Callback：验签、防重放、外部 ID 唯一、原始摘要留存和可重放处理。

### 7.2 写命令请求

```json
{
  "commandId": "客户端生成的幂等键",
  "objectVersion": 3,
  "reasonCode": "可选字典编码",
  "reasonText": "必要时填写",
  "payload": {}
}
```

身份、项目、企业和操作者从会话计算，不由 `payload` 决定。成功响应返回对象 ID、业务编号、当前状态、版本、时间线游标和下一允许动作。

### 7.3 错误分类

| 类别 | 客户端处理 |
|---|---|
| 参数错误 | 精确定位字段，保留表单 |
| 未认证/会话失效 | 重新登录；不得自动重复高风险命令 |
| 无权限/越范围 | 明确拒绝，不泄露目标对象 |
| 状态冲突 | 刷新对象和允许动作 |
| 版本冲突 | 展示新版本差异，重新确认 |
| 可重试系统错误 | 使用同一幂等键安全重试 |
| 外部处理中 | 展示处理中并轮询/订阅结果，不重复创建业务单 |
| 外部最终失败 | 提供重试、改用其他方式或人工客服入口 |

### 7.4 领域事件

事件采用过去式：`WorkOrderSubmitted`、`BookingConfirmed`、`VisitorCredentialIssued`、`PaymentSucceeded`、`InvoiceIssued`。事件包含对象 ID、项目/企业、版本、发生时间、操作者/系统、请求 ID 和最小必要载荷。跨模块消费必须幂等。

## 8. 核心数据模型

| 数据组 | 核心表/对象 | 关键约束 |
|---|---|---|
| 主数据 | project/building/floor/space/company/company_member/service_provider | 编码唯一、状态有效期、历史快照 |
| 身份 | app_user/wechat_identity/activation_credential/member_role_grant | 微信唯一绑定、凭据哈希、授权版本 |
| 服务 | work_order/complaint/environment_booking/service_execution/evaluation | 状态机、责任人、SLA、公开/内部信息分离 |
| 通行 | resource/booking/visitor_invitation/access_credential/parking_order | 时间区间冲突、凭证签名、核销幂等 |
| 财务 | bill/payment_order/channel_transaction/refund/recharge_ledger/invoice/deposit | 金额定点数、不可变流水、来源唯一、职责分离 |
| 租赁 | lease_contract/contract_version/renewal_request/decoration/handover | 合同版本、日期区间、附件和审批关联 |
| 内容 | content_version/activity/registration/service_product/service_request | 受众、发布版本、容量并发、办理进度 |
| 治理 | approval_instance/approval_task/audit_event/outbox_task/compensation_case | 操作者可信、状态可重放、处理结论完整 |

所有核心业务表携带 `project_id`；企业域对象携带 `company_id`；历史记录保留发起时的名称/位置/规则快照，避免主数据变化后无法解释旧单。

## 9. 版本与实施优先级

设计覆盖完整产品，但实现按纵切交付：

| 阶段 | 业务闭环 | 退出条件 |
|---|---|---|
| S0 | 正式三端基座、OpenAPI、迁移、身份和审计 | 可重复构建部署，双 token 隔离 |
| S1 | 项目/空间/企业/成员与激活 | 企业成员真实登录且越权用例通过 |
| S2 | 报修黄金纵切 | 真机提交到后台处理、验收评价、审计完整 |
| S3 | 投诉、保洁、公告、消息和客服 | 每条均有编号、责任人、进度和用户确认 |
| S4 | 空间、访客、活动和企业服务 | 冲突、容量、凭证、补件和交付可闭环 |
| S5 | 租赁、装修业务信息 | 合同唯一主档、审批和业务验收；不包含物业巡检 |
| S6 | 账单、电费、充值、发票、押金 | 渠道回调、对账、退款/红冲和关账通过 |
| S7 | 访客门禁集成 | 门禁授权、闸机事件、核销、离线和人工放行状态可区分、可补偿、可对账 |
| S8 | AI 订阅、问答和动作草稿 | AI 不绕过普通 API、权限和人工确认 |

每个切片必须同时交付小程序、管理端、后端、迁移、契约、权限、审计和 E2E；不接受只完成页面或 CRUD。

## 10. 验收设计

### 10.1 每条业务线固定测试集

1. 正常发起—处理—完成路径。
2. 重复点击、网络超时和同幂等键重试。
3. 横向越权、纵向越权、跨项目和跨企业。
4. 无效状态动作和并发版本冲突。
5. 附件失败、通知失败和外部系统超时。
6. 撤回、驳回、取消、重开或补偿路径。
7. 账号停用、企业关系变化和责任人离岗。
8. 审计字段、公开时间线与内部记录隔离。
9. 管理端与小程序状态、编号和时间线一致。
10. 业务指标能从权威事件重算，不依赖前端缓存。

### 10.2 全系统完成定义

- 小程序所有业务命令都能映射到明确管理端待办或自动规则，并有唯一业务对象。
- 所有管理端动作都能说明会改变哪个领域事实、由谁执行、为何允许以及如何回传。
- 高风险外部能力均有请求、回执、对账、失败、重试和人工补偿。
- 所有状态变化可追溯，不能通过直接改库或仅弹成功提示完成。
- 正式工程具有可重复构建、自动迁移、契约检查、权限测试和端到端验收证据。

## 11. 需要与你讨论并冻结的关键业务决策

以下问题不阻塞本版结构设计，但会改变字段、状态机、审批链和验收，应按优先级讨论：

### P0：首个闭环开发前

1. 企业管理员是否拥有成员“直接邀请并生效”的权力，还是必须由物业复核？哪些角色属于敏感授权？
2. 同一手机号是否允许同时属于多个入驻企业；切换企业后历史记录如何可见？
3. 报修分类、优先级、服务时间、SLA、挂起停表、撤回、自动关闭和重开窗口。
4. 保洁/绿化/消杀由物业自营还是第三方供应商；报价何时锁定，谁验收，是否在线收费？
5. 投诉是否允许匿名；内部调查信息与用户公开回复的边界；谁有权关闭投诉？
6. 小程序入口是全园区统一配置，还是可按企业合同/套餐差异化开放？

### P1：园区服务上线前

7. 空间预约哪些资源自动通过、哪些人工审批；取消、爽约、超时使用和收费规则。
8. 访客收集哪些个人信息，哪些区域/时段需要安保审批；门禁厂商、离线和人工放行方案。
9. 停车车辆、月租、优惠券、临停缴费和记录的数据来源及业务责任；不讨论停车硬件控制。
10. 企业服务代办的真实服务目录、顾问组织、SLA、线下合同与交付物标准。
11. 续租、装修、入驻、退租的真实审批链、材料清单、押金和交接制度。

### P2：财务与外部集成前

12. OPCSpace 是账单/电费/押金权威系统，还是既有物业财务系统的业务前台？
13. 支付渠道、商户主体、退款权限、对账责任人和会计日期规则。
14. 数电票服务商、可开票来源、红冲/重开规则和电子文件交付方式。
15. 访客门禁/闸机的厂商协议、沙箱、授权回执、离线和数据质量责任；电表、BA 与停车硬件不在范围内。
16. AI 服务商品是否真实售卖；计费、席位、额度、供应商、数据出境和内容安全边界。

这些决策冻结后，应回写当前 PRD v0.3、`OPCSpace-PENDING-TOPICS.md` 和对应 `FC-*`；闭环评审完成后，再形成可进入技术设计的需求基线。

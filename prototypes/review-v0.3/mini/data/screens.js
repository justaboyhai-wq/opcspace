(function () {
  const link = (source, admin, returned) => ({ source, admin, return: returned });
  const action = (label, target, kind) => ({ label, target, kind: kind || "secondary" });

  window.OPC_MINI_SCREENS = {
    meta: {
      product: "OPCSpace 企业服务",
      version: "v0.3",
      stage: "功能集合与信息联动评审版",
      enterprise: "星海科技",
      project: "和盛大厦",
      updatedAt: "2026-08-29 17:30:00",
      notice: "本原型展示功能入口与双端信息联动，不代表业务已形成闭环。"
    },
    tabs: [
      { id: "home", label: "首页", icon: "home", mpId: "MP-G05" },
      { id: "services", label: "服务", icon: "grid", mpId: "MP-G06" },
      { id: "ai-hub", label: "AI", icon: "sparkles", mpId: "MP-G07" },
      { id: "profile", label: "我的", icon: "user", mpId: "MP-G08" }
    ],
    services: [
      { id: "FC-00", title: "导航与服务入口", screen: "services", admin: "配置发布" },
      { id: "FC-01", title: "首页内容与运营信息", screen: "home", admin: "内容与首页配置" },
      { id: "FC-02", title: "通知、消息与订阅", screen: "notice-center", admin: "消息模板与自动化" },
      { id: "FC-03", title: "企业、账号与成员", screen: "company", admin: "企业与账号管理" },
      { id: "FC-04", title: "报修工单", screen: "repair-submit", admin: "运营工单池" },
      { id: "FC-05", title: "保洁、绿化与消杀", screen: "environment-booking", admin: "环境服务预约" },
      { id: "FC-06", title: "投诉建议", screen: "complaints", admin: "投诉受理" },
      { id: "FC-07", title: "访客预约与通行", screen: "visitor-invite", admin: "访客审批与通行核验" },
      { id: "FC-08", title: "账单、支付与记录", screen: "bills-center", admin: "账单与对账" },
      { id: "FC-09", title: "电费账户与充值", screen: "electricity", admin: "电费账户与回单入账" },
      { id: "FC-10", title: "发票申请与记录", screen: "invoice-application", admin: "发票审核" },
      { id: "FC-11", title: "空间资源与预约", screen: "space-catalog", admin: "资源排期与预约审核" },
      { id: "FC-12", title: "停车业务信息", screen: "parking", admin: "停车业务与账务" },
      { id: "FC-13", title: "合同与续租", screen: "lease-contract", admin: "合同与续租审批" },
      { id: "FC-14", title: "入驻、装修与退租", screen: "move-flows", admin: "流程资料与节点" },
      { id: "FC-15", title: "园区活动", screen: "activities", admin: "活动与报名名单" },
      { id: "FC-16", title: "政策与企业服务", screen: "policy-services", admin: "服务产品与服务单" },
      { id: "FC-17", title: "AI 商品、订阅与用量", screen: "ai-hub", admin: "套餐、订单与用量" },
      { id: "FC-18", title: "AI 管家与动作草稿", screen: "ai-draft-history", admin: "业务校验与人工接管" },
      { id: "FC-19", title: "联系客服", screen: "contact-service", admin: "客服队列与会话" },
      { id: "FC-20", title: "产品意见反馈", screen: "feedback", admin: "反馈分派与处理" },
      { id: "FC-21", title: "关于、协议与隐私", screen: "about", admin: "隐私、审计与合规" }
    ],
    screens: [
      {
        id: "global-shell", title: "全局导航", subtitle: "稳定页面栈与四栏入口", fcIds: ["FC-00", "FC-18"],
        mpIds: ["MP-G01", "MP-G02", "MP-G03", "MP-G04", "MP-G05", "MP-G06", "MP-G07", "MP-G08", "MP-G09"], type: "shell",
        sections: [{ title: "全局控件", kind: "chips", items: ["返回", "更多操作", "关闭", "通知", "首页", "服务", "AI", "我的", "AI 管家"] }],
        actions: [action("打开通知", "notice-center"), action("打开 AI 管家", "ai-hub", "primary")],
        linkage: link("用户导航与入口点击", "超级管理员发布入口配置与白名单", "展示当前可用服务入口")
      },
      {
        id: "home", title: "和盛大厦", subtitle: "星海科技 · 企业服务首页", fcIds: ["FC-01", "FC-02", "FC-04", "FC-07", "FC-08", "FC-11", "FC-15"], mpIds: ["MP-01"], type: "home",
        hero: { eyebrow: "今日园区服务", title: "下午好，陈经理", description: "3 项服务正在进行，1 笔账单待缴" },
        sections: [
          { title: "快捷服务", kind: "grid", items: ["访客邀请", "账单缴费", "空间预约", "全部服务"] },
          { title: "进行中服务", kind: "records", items: ["OPS-20260829-017 · 空调报修 · 处理中", "VIS-20260829-026 · 访客邀请 · 待到访"] },
          { title: "园区消息", kind: "list", items: ["和盛大厦中庭活动报名开启", "BILL-202608-0188 将于 09-05 到期"] }
        ],
        actions: [action("全部服务", "services", "primary"), action("通知中心", "notice-center")],
        linkage: link("管理端内容、配置与业务公开摘要", "内容发布、工作台聚合、配置发布", "首页卡片与消息按公开状态回显")
      },
      {
        id: "services", title: "全部服务", subtitle: "14 类企业服务入口", fcIds: ["FC-00"], mpIds: ["MP-02"], type: "service-grid",
        sections: [{ title: "园区服务", kind: "grid", items: ["报事报修", "保洁绿化", "投诉建议", "访客通行", "停车服务", "账单中心", "电费充值", "发票服务", "空间预订", "租约与续租", "入驻/装修/退租", "AI 服务", "园区活动", "企业服务代办"] }],
        actions: [action("提交报修", "repair-submit", "primary"), action("访客邀请", "visitor-invite"), action("查看账单", "bills-center")],
        linkage: link("管理端发布的入口顺序与可见范围", "配置发布", "按企业权限展示服务目录")
      },
      {
        id: "notice-center", title: "通知中心", subtitle: "公告、服务与费用消息", fcIds: ["FC-02"], mpIds: ["MP-05"], type: "list",
        sections: [{ title: "最新通知", kind: "records", items: ["园区活动 · 中秋企业沙龙报名", "服务进度 · OPS-20260829-017 已派单", "费用提醒 · BILL-202608-0188 待缴", "访客到访 · VIS-20260829-026"] }],
        actions: [action("消息订阅", "subscriptions", "primary"), action("查看报修", "repair-detail")],
        linkage: link("公告发布与业务事件", "消息模板、订阅规则、自动化记录", "按订阅偏好显示消息并进入业务记录")
      },
      {
        id: "ai-hub", title: "AI 企业服务", subtitle: "商品、问答与业务导航", fcIds: ["FC-17", "FC-18"], mpIds: ["MP-03", "MP-U03"], type: "catalog",
        sections: [{ title: "AI 商品", kind: "cards", items: ["通用大模型 Pro", "企业知识中枢", "营销 Agent", "AIGC 内容工厂", "智能客服数字员工", "会议纪要助手", "企业协作账号", "经营数据 Copilot"] }, { title: "AI 管家", kind: "suggestions", items: ["查询和盛大厦可用会议室", "为 OPS-20260829-017 补充说明", "生成账单异议草稿"] }],
        actions: [action("查看用量", "ai-usage", "primary"), action("动作草稿", "ai-draft-history")],
        linkage: link("用户问答、导航或草稿意图", "套餐计费、业务校验与人工接管", "返回回答、页面入口或待确认草稿")
      },
      {
        id: "profile", title: "我的", subtitle: "星海科技 · 企业管理员", fcIds: ["FC-03", "FC-02", "FC-19", "FC-20", "FC-21"], mpIds: ["MP-04"], type: "profile",
        sections: [{ title: "企业", kind: "menu", items: ["我的公司", "成员管理", "我的活动", "空间预约"] }, { title: "记录与设置", kind: "menu", items: ["报修/投诉记录", "AI 管家历史", "账单与发票", "消息订阅", "联系客服", "意见反馈", "关于我们"] }],
        actions: [action("我的公司", "company", "primary"), action("消息订阅", "subscriptions")],
        linkage: link("企业、账号及用户偏好", "账号、角色与企业关系管理", "展示当前用户可见的资料和服务记录")
      },
      {
        id: "ai-usage", title: "AI 用量与订阅", subtitle: "企业共享额度", fcIds: ["FC-17"], mpIds: ["MP-06"], type: "dashboard",
        sections: [{ title: "本月用量", kind: "metrics", items: ["Token 68%", "剩余 320 万", "成员共享 12 人"] }, { title: "套餐", kind: "records", items: ["企业知识中枢 · 已开通", "自动续费 · 已开启"] }],
        actions: [action("购买 Token", "ai-usage", "primary"), action("套餐管理", "ai-usage")],
        linkage: link("订购、充值及共享设置", "管理端审核订单并聚合用量", "展示套餐、额度与到期信息")
      },
      {
        id: "ai-draft-history", title: "AI 管家历史", subtitle: "业务动作草稿与状态", fcIds: ["FC-18"], mpIds: ["MP-U01"], type: "list",
        sections: [{ title: "最近草稿", kind: "records", items: ["账单异议草稿 · 待确认", "空间取消草稿 · 已撤销", "成员邀请草稿 · 校验中"] }],
        actions: [action("查看草稿", "ai-draft-detail", "primary")],
        linkage: link("AI 生成的结构化动作草稿", "管理端校验、接管或转入对应业务", "草稿历史显示校验与处理结果")
      },
      {
        id: "ai-draft-detail", title: "动作草稿", subtitle: "提交前由用户确认", fcIds: ["FC-18"], mpIds: ["MP-U02"], type: "form",
        sections: [{ title: "账单异议", kind: "fields", items: ["账单：BILL-202608-0188", "企业：星海科技", "原因：费用周期待核对", "引用：2026 年 8 月账单"] }],
        actions: [action("提交，等待业务校验", "ai-draft-history", "primary"), action("修改草稿", "ai-draft-detail")],
        linkage: link("用户确认的字段与引用", "权限、业务规则和幂等校验", "回写校验中、已受理或失败原因")
      },
      {
        id: "repair-submit", title: "报事报修", subtitle: "普通报修由运营服务人员承接", fcIds: ["FC-04"], mpIds: ["MP-07"], type: "form",
        sections: [{ title: "报修信息", kind: "fields", items: ["范围：户内报修", "分类：空调使用问题", "位置：和盛大厦 8F 星海科技", "联系人：陈经理", "预约：2026-08-30 10:00-12:00", "图片：2 张"] }],
        actions: [action("提交报修", "repair-progress", "primary")],
        linkage: link("范围、分类、位置、描述、图片和预约时间", "运营工单池受理、派单与更新节点", "生成 OPS-20260829-017 并显示公开进度")
      },
      {
        id: "repair-progress", title: "我的报修", subtitle: "进行中与历史工单", fcIds: ["FC-04"], mpIds: ["MP-08A"], type: "list",
        sections: [{ title: "进行中", kind: "records", items: ["OPS-20260829-017 · 空调使用问题 · 处理中", "OPS-20260826-009 · 照明问题 · 待评价"] }],
        actions: [action("查看工单", "repair-detail", "primary")],
        linkage: link("当前用户提交的工单", "管理端公开状态与时间线", "按业务时间倒序展示")
      },
      {
        id: "repair-detail", title: "工单详情", subtitle: "OPS-20260829-017", fcIds: ["FC-04", "FC-19"], mpIds: ["MP-08B"], type: "detail",
        sections: [{ title: "当前状态", kind: "status", items: ["处理中", "运营服务人员：李师傅", "预计 2026-08-30 12:00 前完成"] }, { title: "处理时间线", kind: "timeline", items: ["08-29 09:20 已提交", "08-29 09:28 已受理", "08-29 09:40 已派单"] }],
        actions: [action("联系物业", "contact-service"), action("服务评价", "repair-evaluation", "primary")],
        linkage: link("工单编号与公开处理节点", "运营保存处理信息、关闭与归属判定", "回显状态、服务人员、时间线和评价入口")
      },
      {
        id: "repair-evaluation", title: "服务评价", subtitle: "评价 OPS-20260829-017", fcIds: ["FC-04"], mpIds: ["MP-09"], type: "form",
        sections: [{ title: "本次服务", kind: "rating", items: ["5 星", "响应及时", "态度友好", "问题解决", "支持匿名评价"] }],
        actions: [action("提交评价", "repair-progress", "primary")],
        linkage: link("评分、标签与评价内容", "工单评价记录与低分回访线索", "显示已评价状态")
      },
      {
        id: "environment-booking", title: "环境服务预约", subtitle: "保洁、绿化与消杀", fcIds: ["FC-05"], mpIds: ["MP-10"], type: "form",
        sections: [{ title: "预约信息", kind: "fields", items: ["服务：办公区深度保洁", "日期：2026-09-01", "时段：14:00-16:00", "地址：和盛大厦 8F", "面积：320㎡", "联系人：陈经理"] }],
        actions: [action("提交预约", "environment-booking", "primary")],
        linkage: link("服务类型、时段、地址和联系人", "运营确认预约并记录服务节点", "显示预约与服务记录")
      },
      {
        id: "complaints", title: "投诉建议", subtitle: "提交问题并查看处理记录", fcIds: ["FC-06"], mpIds: ["MP-11"], type: "form",
        sections: [{ title: "投诉内容", kind: "fields", items: ["分类：环境卫生", "描述：午间公共区域清洁频次建议", "附件：1 张"] }, { title: "我的投诉", kind: "records", items: ["CMP-20260825-006 · 已受理"] }],
        actions: [action("提交投诉", "complaints", "primary")],
        linkage: link("分类、描述与附件", "投诉列表受理、处理和回访", "显示责任状态和公开处理信息")
      },
      {
        id: "policy-services", title: "政策与企业服务", subtitle: "专业服务产品目录", fcIds: ["FC-16"], mpIds: ["MP-12"], type: "catalog",
        sections: [{ title: "服务分类", kind: "chips", items: ["政策申报", "工商服务", "知识产权", "财税法务", "融资服务"] }, { title: "热门服务", kind: "cards", items: ["高新技术企业认定", "滨江研发补贴", "人才引进补贴", "专精特新申报"] }],
        actions: [action("申请服务", "service-apply", "primary"), action("办理进度", "service-progress")],
        linkage: link("管理端发布的服务产品", "内容端维护价格、周期、材料与承办方", "展示当前可申请服务")
      },
      {
        id: "service-apply", title: "企业服务申请", subtitle: "专精特新申报咨询", fcIds: ["FC-16"], mpIds: ["MP-13"], type: "form",
        sections: [{ title: "需求信息", kind: "fields", items: ["企业：星海科技", "联系人：陈经理", "电话：138****8266", "需求：评估申报条件与材料清单"] }],
        actions: [action("提交申请", "service-progress", "primary")],
        linkage: link("联系人、电话与需求描述", "管理端生成服务单并分派顾问", "显示服务单编号和办理进度")
      },
      {
        id: "service-progress", title: "办理进度", subtitle: "企业服务单 ENT-20260829-003", fcIds: ["FC-16", "FC-19"], mpIds: ["MP-14"], type: "detail",
        sections: [{ title: "办理节点", kind: "timeline", items: ["需求已提交", "顾问已受理", "等待资格评估"] }, { title: "服务顾问", kind: "contact", items: ["周顾问", "企业政策服务组"] }],
        actions: [action("联系顾问", "contact-service", "primary")],
        linkage: link("服务需求及补充信息", "服务单、顾问与进度更新", "回显步骤、更新日志和顾问信息")
      },
      {
        id: "visitor-invite", title: "访客邀请", subtitle: "创建访客通行授权", fcIds: ["FC-07"], mpIds: ["MP-15"], type: "form",
        sections: [{ title: "访客信息", kind: "fields", items: ["姓名：王女士", "手机号：139****3198", "来访企业：星海科技", "时间：2026-08-30 14:00-18:00", "访问楼层：8F", "次数：1 次", "车牌：浙A·XH026", "停车减免：2 小时"] }],
        actions: [action("生成邀请", "visitor-pass", "primary"), action("访客记录", "visitor-records")],
        linkage: link("访客、时间、楼层、次数、车牌和减免信息", "审批、签发、门禁授权与黑名单校验", "生成 VIS-20260829-026 通行证")
      },
      {
        id: "visitor-pass", title: "访客通行证", subtitle: "VIS-20260829-026", fcIds: ["FC-07"], mpIds: ["MP-16"], type: "pass",
        sections: [{ title: "动态二维码", kind: "qr", items: ["授权：和盛大厦 1F 门岗、8F 门禁", "有效期：2026-08-30 14:00-18:00", "剩余次数：1 次"] }, { title: "异常通行说明", kind: "notice", items: ["闸机离线时由门岗人工核验访客身份与邀请编号", "人工放行与核销结果将记录在访客记录中"] }],
        actions: [action("转发给访客", "visitor-pass", "primary"), action("撤销通行证", "visitor-records", "danger")],
        linkage: link("已签发二维码与门禁授权", "闸机核销、离线事件和人工核验记录", "显示有效期、次数、签到和作废状态")
      },
      {
        id: "visitor-records", title: "访客记录", subtitle: "邀请、到访与核销", fcIds: ["FC-07"], mpIds: ["MP-17"], type: "list",
        sections: [{ title: "本月概览", kind: "metrics", items: ["邀请 18 人", "已到访 15 人", "到访率 83%"] }, { title: "最近记录", kind: "records", items: ["VIS-20260829-026 · 待到访", "VIS-20260828-019 · 闸机已核销", "VIS-20260827-014 · 离线人工核验已放行"] }],
        actions: [action("查看通行证", "visitor-pass", "primary")],
        linkage: link("邀请与通行事件", "门禁、闸机、离线及人工放行记录", "回显到访、核销和作废状态")
      },
      {
        id: "bills-center", title: "账单中心", subtitle: "星海科技 · 2026 年 8 月", fcIds: ["FC-08", "FC-10"], mpIds: ["MP-18"], type: "list",
        sections: [{ title: "待缴账单", kind: "records", items: ["BILL-202608-0188 · 物业费 · ¥12,680.00", "BILL-202608-0194 · 电费 · ¥3,286.40"] }, { title: "筛选", kind: "chips", items: ["全部", "物业费", "租金", "电费", "停车费", "空调加时费"] }],
        actions: [action("合并支付", "payment-success", "primary"), action("缴费记录", "payment-records")],
        linkage: link("管理端生成并复核的账单", "财务对账、催缴和收款匹配", "展示账单、支付结果和缴费记录")
      },
      {
        id: "payment-success", title: "缴费成功", subtitle: "BILL-202608-0188", fcIds: ["FC-08", "FC-10"], mpIds: ["MP-19"], type: "result",
        sections: [{ title: "支付结果", kind: "receipt", items: ["金额：¥12,680.00", "时间：2026-08-29 16:18:32", "订单：PAY-20260829-8831", "电子回单：已生成"] }],
        actions: [action("申请电子发票", "invoice-application", "primary"), action("查看缴费记录", "payment-records")],
        linkage: link("支付渠道返回的订单结果", "收款流水匹配入账", "显示支付结果、订单号和电子回单")
      },
      {
        id: "payment-records", title: "缴费记录", subtitle: "近 90 天企业缴费", fcIds: ["FC-08"], mpIds: ["MP-23"], type: "list",
        sections: [{ title: "最近记录", kind: "records", items: ["BILL-202608-0188 · ¥12,680.00 · 已缴", "BILL-202607-0162 · ¥3,105.20 · 已缴"] }],
        actions: [action("查看回单", "payment-success", "primary")],
        linkage: link("已匹配入账的收款记录", "企业对账单与用户可见流水", "按业务时间倒序展示缴费记录")
      },
      {
        id: "invoice-application", title: "发票申请", subtitle: "关联 BILL-202608-0188", fcIds: ["FC-10"], mpIds: ["MP-20"], type: "form",
        sections: [{ title: "开票信息", kind: "fields", items: ["类型：增值税普通发票", "抬头：星海科技有限公司", "税号：9133********621X", "金额：¥12,680.00", "邮箱：finance@xinghai.example"] }],
        actions: [action("提交申请", "invoice-records", "primary")],
        linkage: link("票种、抬头、税号、邮箱与关联缴费", "财务审核并更新开票状态", "发票记录显示审核与交付状态")
      },
      {
        id: "invoice-records", title: "发票记录", subtitle: "星海科技开票申请", fcIds: ["FC-10"], mpIds: ["MP-24"], type: "list",
        sections: [{ title: "申请记录", kind: "records", items: ["INV-20260829-008 · ¥12,680.00 · 审核中", "INV-20260731-021 · ¥9,830.00 · 已开票"] }],
        actions: [action("新增发票申请", "invoice-application", "primary")],
        linkage: link("用户提交的发票申请", "财务审核状态", "显示申请、审核和开票结果")
      },
      {
        id: "electricity", title: "电费账户", subtitle: "账户、账单与充值", fcIds: ["FC-09"], mpIds: ["MP-21"], type: "dashboard",
        sections: [{ title: "账户余额", kind: "metrics", items: ["余额 ¥8,620.40", "待缴 ¥3,286.40", "余额提醒 ¥2,000"] }, { title: "充值金额", kind: "chips", items: ["¥1,000", "¥3,000", "¥5,000", "其他金额"] }],
        actions: [action("立即充值", "electricity", "primary"), action("对公转账", "corporate-transfer")],
        linkage: link("企业电费账户、账单与充值申请", "回单初审、复核入账与可见状态映射", "显示余额、账单、充值状态和回单")
      },
      {
        id: "corporate-transfer", title: "对公转账登记", subtitle: "上传回单后由财务核验", fcIds: ["FC-09"], mpIds: ["MP-22"], type: "form",
        sections: [{ title: "收款账户", kind: "fields", items: ["户名：和盛大厦运营服务有限公司", "银行：招商银行杭州分行", "账号：62**********9026"] }, { title: "登记信息", kind: "fields", items: ["金额：¥5,000.00", "回单：xinghai-0829.pdf"] }],
        actions: [action("提交登记", "electricity", "primary")],
        linkage: link("转账金额与回单", "财务初审、复核和入账", "返回待核验、已入账或驳回补件状态")
      },
      {
        id: "lease-contract", title: "租约与合同", subtitle: "星海科技 · 和盛大厦 8F", fcIds: ["FC-13"], mpIds: ["MP-25"], type: "detail",
        sections: [{ title: "合同摘要", kind: "fields", items: ["合同：LEASE-2025-0831", "租期：2025-09-01 至 2027-08-31", "面积：1,280㎡", "月租：¥153,600", "保证金：¥460,800"] }],
        actions: [action("申请续租", "lease-contract", "primary"), action("相关流程", "move-flows")],
        linkage: link("管理端合同与履约信息、用户续租意向", "招商维护合同并处理续租申请", "显示合同摘要、文件和流程状态")
      },
      {
        id: "move-flows", title: "入驻、装修与退租", subtitle: "申请资料与办理节点", fcIds: ["FC-14"], mpIds: ["MP-26"], type: "process",
        sections: [{ title: "流程类型", kind: "tabs", items: ["装修报备", "入驻办理", "退租办理"] }, { title: "装修报备", kind: "timeline", items: ["提交资料", "招商审核", "运营协同", "完成确认"] }],
        actions: [action("发起装修报备", "move-flows", "primary")],
        linkage: link("申请类型、资料和房源", "招商审核、跨角色审批与财务结算信息", "显示公开办理节点与材料状态")
      },
      {
        id: "space-catalog", title: "空间预订", subtitle: "和盛大厦共享空间", fcIds: ["FC-11"], mpIds: ["MP-27"], type: "catalog",
        sections: [{ title: "可预约空间", kind: "cards", items: ["海棠会议室 · 12 人 · 8F", "星河路演厅 · 80 人 · 2F", "共享洽谈室 · 6 人 · 6F"] }],
        actions: [action("查看空间", "space-detail", "primary"), action("我的预约", "space-bookings")],
        linkage: link("管理端空间、设施描述、开放时间和排期", "运营维护资源与冲突", "按类别和日期展示可用空间")
      },
      {
        id: "space-detail", title: "海棠会议室", subtitle: "和盛大厦 8F · 12 人", fcIds: ["FC-11"], mpIds: ["MP-28"], type: "detail",
        sections: [{ title: "增值设施", kind: "chips", items: ["投影", "视频会议", "白板", "饮水"] }, { title: "可用时段", kind: "slots", items: ["09:00-10:00", "10:00-11:00", "14:00-15:00", "16:00-17:00"] }],
        actions: [action("立即预约", "space-pass", "primary")],
        linkage: link("资源详情与当前可用时段", "运营排期与预约审核", "预约后生成凭证和公开状态")
      },
      {
        id: "space-pass", title: "预约凭证", subtitle: "BOOK-20260829-012", fcIds: ["FC-11"], mpIds: ["MP-29A"], type: "pass",
        sections: [{ title: "预约二维码", kind: "qr", items: ["海棠会议室", "2026-09-02 14:00-15:00", "预约码：HS-9K2M"] }],
        actions: [action("取消预约", "space-bookings", "danger")],
        linkage: link("已审核预约与凭证", "运营更新预约、取消和排期", "显示二维码、预约码与取消状态")
      },
      {
        id: "space-bookings", title: "我的预约", subtitle: "未来与历史预约", fcIds: ["FC-11"], mpIds: ["MP-29B"], type: "list",
        sections: [{ title: "未来预约", kind: "records", items: ["BOOK-20260829-012 · 海棠会议室 · 已确认"] }, { title: "历史预约", kind: "records", items: ["BOOK-20260818-007 · 共享洽谈室 · 已完成"] }],
        actions: [action("查看凭证", "space-pass", "primary")],
        linkage: link("用户当前与历史预约", "管理端预约状态与排期", "显示未来、历史及已取消记录")
      },
      {
        id: "parking", title: "停车服务", subtitle: "车辆、月租、优惠与账务", fcIds: ["FC-12"], mpIds: ["MP-30"], type: "dashboard",
        sections: [{ title: "停车账户", kind: "metrics", items: ["余额 ¥268.00", "月租有效至 2026-09-30", "优惠券 3 张"] }, { title: "业务入口", kind: "menu", items: ["我的车辆", "月租车位", "访客停车", "商户优惠券", "停车记录"] }, { title: "待缴账单", kind: "records", items: ["临停费用 ¥10.00 · 浙A·XH026"] }],
        actions: [action("临停缴费 ¥10", "payment-success", "primary")],
        linkage: link("车辆、月租、优惠、账单和缴费信息", "运营维护停车业务规则，财务记录缴费", "显示停车业务账户、账单与记录")
      },
      {
        id: "activities", title: "园区活动", subtitle: "和盛大厦企业社区", fcIds: ["FC-15"], mpIds: ["MP-31"], type: "catalog",
        sections: [{ title: "活动分类", kind: "chips", items: ["全部", "政策宣讲", "企业沙龙", "节日活动"] }, { title: "本周活动", kind: "cards", items: ["AI 驱动企业增长沙龙 · 余 18 席", "中秋企业邻里会 · 报名中"] }],
        actions: [action("查看活动", "activity-registration", "primary")],
        linkage: link("管理端发布的活动、名额和场地", "内容端维护活动并查看报名签到名单", "展示活动和报名状态")
      },
      {
        id: "activity-registration", title: "活动报名", subtitle: "AI 驱动企业增长沙龙", fcIds: ["FC-15"], mpIds: ["MP-32"], type: "result",
        sections: [{ title: "报名结果", kind: "status", items: ["报名成功", "2026-09-06 14:00", "和盛大厦 2F 星河路演厅", "状态：待签到"] }],
        actions: [action("保存到日历", "activities", "primary")],
        linkage: link("用户报名信息", "内容端报名、名额与签到名单", "回显报名成功、待签到或取消状态")
      },
      {
        id: "company", title: "我的公司", subtitle: "星海科技有限公司", fcIds: ["FC-03"], mpIds: ["MP-33"], type: "detail",
        sections: [{ title: "企业档案", kind: "fields", items: ["入驻项目：和盛大厦", "办公地址：8F 801-808", "统一社会信用代码：9133********621X", "企业状态：已认证"] }, { title: "联系方式", kind: "contact", items: ["企业管理员：陈经理", "电话：138****8266"] }],
        actions: [action("成员管理", "members", "primary")],
        linkage: link("管理端企业、房源、联系人和认证信息", "招商维护企业，超级管理员审核账号关系", "显示用户有权查看的企业档案")
      },
      {
        id: "members", title: "成员管理", subtitle: "星海科技 · 12 位成员", fcIds: ["FC-03"], mpIds: ["MP-34"], type: "list",
        sections: [{ title: "企业成员", kind: "records", items: ["陈经理 · 企业管理员", "林会计 · 财务", "周行政 · 服务申请人"] }],
        actions: [action("邀请成员", "members", "primary")],
        linkage: link("成员邀请与角色信息", "账号管理与角色数据范围", "显示成员、角色及邀请处理状态")
      },
      {
        id: "subscriptions", title: "消息订阅", subtitle: "设置业务事件接收偏好", fcIds: ["FC-02"], mpIds: ["MP-35"], type: "settings",
        sections: [{ title: "订阅项目", kind: "toggles", items: ["缴费通知 · 开", "工单进度 · 开", "访客到访 · 开", "园区活动 · 开", "政策推送 · 关", "通知公告 · 开"] }],
        actions: [action("保存设置", "profile", "primary")],
        linkage: link("个人订阅开关", "消息模板、事件映射和通知通道", "按偏好接收可订阅消息")
      },
      {
        id: "contact-service", title: "联系客服", subtitle: "园区运营服务中心", fcIds: ["FC-19"], mpIds: ["MP-36"], type: "contact",
        sections: [{ title: "服务方式", kind: "cards", items: ["一键拨打 · 0571-8899 0266", "在线客服 · 当前排队 2 人", "服务时间 · 08:30-20:00"] }],
        actions: [action("进入在线客服", "contact-service", "primary"), action("拨打电话", "contact-service")],
        linkage: link("用户咨询与关联业务编号", "客服队列、坐席、会话和知识库", "返回坐席回复或转入相关业务")
      },
      {
        id: "feedback", title: "意见反馈", subtitle: "帮助我们改进 OPCSpace", fcIds: ["FC-20"], mpIds: ["MP-37"], type: "form",
        sections: [{ title: "反馈内容", kind: "fields", items: ["建议增加账单按费用周期筛选", "最多 300 字"] }],
        actions: [action("提交反馈", "profile", "primary")],
        linkage: link("反馈文字与企业账号", "内容端分派责任人并更新状态", "提交成功后保留反馈编号")
      },
      {
        id: "about", title: "关于 OPCSpace", subtitle: "版本 v0.3 · 和盛大厦", fcIds: ["FC-21"], mpIds: ["MP-38"], type: "about",
        sections: [{ title: "合规信息", kind: "menu", items: ["服务协议", "隐私政策", "第三方信息共享清单"] }, { title: "版本说明", kind: "text", items: ["功能集合与信息联动评审版", "不代表业务已形成闭环"] }],
        actions: [action("查看隐私政策", "about", "primary")],
        linkage: link("平台版本及合规文档", "隐私请求、审计与合规治理", "展示当前有效协议与隐私信息")
      }
    ],
    traceability: {
      fcIds: Array.from({ length: 22 }, (_, index) => `FC-${String(index).padStart(2, "0")}`),
      mpIds: [
        "MP-G01", "MP-G02", "MP-G03", "MP-G04", "MP-G05", "MP-G06", "MP-G07", "MP-G08", "MP-G09",
        "MP-01", "MP-02", "MP-03", "MP-04", "MP-05", "MP-06", "MP-U01", "MP-U02", "MP-U03", "MP-07", "MP-08A", "MP-08B",
        "MP-09", "MP-10", "MP-11", "MP-12", "MP-13", "MP-14", "MP-15", "MP-16", "MP-17", "MP-18", "MP-19", "MP-20", "MP-21", "MP-22", "MP-23", "MP-24", "MP-25", "MP-26", "MP-27", "MP-28", "MP-29A", "MP-29B", "MP-30", "MP-31", "MP-32", "MP-33", "MP-34", "MP-35", "MP-36", "MP-37", "MP-38"
      ]
    }
  };
})();

(function () {
  'use strict';

  const DATA = window.OPC_MINI_SCREENS || { screens: [], traceability: [] };
  const view = document.getElementById('app-view');
  const title = document.getElementById('page-title');
  const sheetMask = document.getElementById('sheet-mask');
  const sheetBody = document.getElementById('sheet-body');
  const dialogMask = document.getElementById('dialog-mask');
  const dialogTitle = document.getElementById('dialog-title');
  const dialogMessage = document.getElementById('dialog-message');
  const toast = document.getElementById('toast');
  const state = { pending: null, previous: [], activeSegment: {}, submitted: {} };

  const routeAliases = {
    notice: 'notice-center', members: 'company-members', repair: 'repair-submit',
    'repair-progress': 'repair-list', cleaning: 'environment-booking', visitor: 'visitor-invite',
    bills: 'bill-center', 'bills-center': 'bill-center', electricity: 'electricity-recharge', invoice: 'invoice-records',
    spaces: 'space-catalog', parking: 'parking-services', lease: 'lease-contract',
    move: 'move-flows', activities: 'activity-center', enterprise: 'enterprise-service',
    company: 'my-company', members: 'company-members', 'contact-service': 'customer-service',
    'invoice-application': 'invoice-apply', 'space-pass': 'space-booking-pass',
    'ai-draft-history': 'ai-drafts', 'service-apply': 'enterprise-service',
    'service-progress': 'enterprise-progress', 'policy-services': 'enterprise-service',
    agreement: 'about', privacy: 'about', 'third-party': 'about', 'notice-detail': 'notice-center',
    feedback: 'feedback', about: 'about'
  };

  const canonicalDataIds = {
    'my-company': 'company', 'company-members': 'members', 'customer-service': 'contact-service',
    'bill-center': 'bills-center', 'electricity-recharge': 'electricity', 'invoice-apply': 'invoice-application',
    'space-booking-pass': 'space-pass', 'parking-services': 'parking', 'activity-center': 'activities',
    'ai-drafts': 'ai-draft-history', 'repair-list': 'repair-progress', 'enterprise-service': 'service-apply',
    'enterprise-progress': 'service-progress'
  };

  const serviceRoutes = [
    ['repair-submit', '报事报修', '修'], ['environment-booking', '保洁绿化', '洁'],
    ['complaints', '投诉建议', '诉'], ['visitor-invite', '访客通行', '访'],
    ['parking-services', '停车服务', '停'], ['bill-center', '账单中心', '账'],
    ['electricity-recharge', '电费充值', '电'], ['invoice-records', '发票服务', '票'],
    ['space-catalog', '空间预订', '空'], ['lease-contract', '租约续租', '租'],
    ['move-flows', '入驻装修退租', '迁'], ['ai-hub', 'AI 服务', 'AI'],
    ['activity-center', '园区活动', '活'], ['enterprise-service', '企业服务代办', '企']
  ];

  function getRoute() {
    const raw = (location.hash || '#home').slice(1).split('?')[0];
    return routeAliases[raw] || raw || 'home';
  }

  function findScreen(route) {
    const list = Array.isArray(DATA.screens) ? DATA.screens : Object.values(DATA.screens || {});
    const dataId = canonicalDataIds[route] || route;
    return list.find(item => item.id === dataId || item.route === dataId || (item.aliases || []).includes(dataId)) || null;
  }

  function escapeHtml(value) {
    return String(value == null ? '' : value).replace(/[&<>'"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[c]));
  }

  function routeButton(route, label, className) {
    return `<button type="button" class="${className || ''}" data-route="${route}">${label}</button>`;
  }

  function pageLead(name, desc) {
    return `<div class="page-lead"><h1>${name}</h1><p>${desc}</p></div>`;
  }

  function section(titleText, body, action) {
    return `<section class="section-block"><div class="section-heading"><h2>${titleText}</h2>${action || ''}</div>${body}</section>`;
  }

  function row(route, icon, name, sub, tag, action) {
    const attrs = route ? `data-route="${route}"` : `data-action="${action || 'show-detail'}"`;
    return `<button class="list-row" type="button" ${attrs}><span class="row-icon">${icon}</span><span class="row-main"><span class="row-title">${name}${tag || ''}</span><span class="row-sub">${sub}</span></span><span class="row-arrow">›</span></button>`;
  }

  function formField(label, control, required, hint) {
    return `<label class="form-field"><span class="form-label">${required ? '<span class="required">*</span>' : ''}${label}</span>${control}${hint ? `<span class="field-hint">${hint}</span>` : ''}</label>`;
  }

  function textInput(label, placeholder, required, type, value, hint) {
    return formField(label, `<input class="form-input" type="${type || 'text'}" value="${value || ''}" placeholder="${placeholder}" maxlength="50" ${required ? 'required' : ''}>`, required, hint);
  }

  function textarea(label, placeholder, required) {
    return formField(label, `<textarea class="form-textarea" placeholder="${placeholder}" maxlength="300" ${required ? 'required' : ''}></textarea>`, required, '最多 300 字');
  }

  function selectField(label, options, required) {
    return formField(label, `<select class="form-select" ${required ? 'required' : ''}><option value="">请选择${label}</option>${options.map(x => `<option>${x}</option>`).join('')}</select>`, required);
  }

  function submit(label, success, confirmText) {
    return `<button type="button" class="primary-wide" data-action="submit-form" data-success="${success}" data-confirm="${confirmText || ''}">${label}</button>`;
  }

  function linkage(screen) {
    const trace = screen || {};
    const fc = trace.fcIds || trace.fc || [];
    const mp = trace.mpIds || trace.mp || [];
    const source = trace.linkage?.source || '企业成员在小程序提交或查看业务信息';
    const admin = trace.linkage?.admin || '管理端按责任族接收、处理并记录结果';
    const back = trace.linkage?.return || trace.linkage?.feedback || '处理状态和关键结果返回对应记录与消息';
    return `<aside class="linkage-note" data-anno-id="mini.linkage-${escapeHtml(trace.id || 'common')}">
      <div class="linkage-label">— 以下为原型设计说明，不在实际产品页面中显示 —</div>
      <div class="linkage-card"><strong>双端信息联动</strong>
        <div class="linkage-line"><strong>信息来源</strong><span>${source}</span></div>
        <div class="linkage-line"><strong>管理处理</strong><span>${admin}</span></div>
        <div class="linkage-line"><strong>返回小程序</strong><span>${back}</span></div>
        <div class="trace-ids">功能追溯：${[].concat(fc).join('、') || '按页面入口'} · ${[].concat(mp).join('、') || '共享页面'}</div>
      </div></aside>`;
  }

  function renderHome() {
    return `<div class="hero-card"><div class="hero-eyebrow">企业服务工作台</div><h1>上午好，林一帆</h1><p>星海科技在和盛大厦的服务进展，都集中在这里。</p><div class="hero-actions">${routeButton('notice-center', '3 条新消息')}${routeButton('company-members', '企业成员')}</div></div>
      ${section('快捷服务', `<div class="card-mobile quick-grid">${[['visitor-invite','访客邀请','访'],['bill-center','账单缴费','账'],['space-catalog','空间预约','空'],['services','全部服务','全']].map(x => `<button class="quick-item" type="button" data-route="${x[0]}"><span class="quick-icon">${x[2]}</span><span>${x[1]}</span></button>`).join('')}</div>`)}
      ${section('今日提醒', `<div class="card-mobile">${row('bill-center','账','8 月物业账单待缴','BILL-202608-0188 · 截止 2026-09-05','<span class="tag-mini warning">待缴</span>')}${row('visitor-pass','访','访客即将到访','VIS-20260829-026 · 14:00—16:00','<span class="tag-mini info">今日</span>')}</div>`, routeButton('notice-center','查看全部'))}
      ${section('进行中服务', `<div class="card-mobile">${row('repair-detail','修','办公室照明故障','OPS-20260829-017 · 运营服务人员已接单','<span class="tag-mini warning">处理中</span>')}${row('enterprise-progress','企','高新技术企业认定代办','顾问已完成材料初审','<span class="tag-mini info">待补件</span>')}</div>`)}
      ${section('园区动态', `<div class="card-mobile">${row('activity-center','活','星海企业开放日','2026-09-06 14:00 · 3F 路演厅')}${row('notice-center','告','和盛大厦消防演习通知','2026-08-29 09:00:00')}</div>`)}
      ${linkage(findScreen('home'))}`;
  }

  function renderServices() {
    return `${pageLead('全部服务','按企业在园区的经营、人员与空间需求集中查找服务。')}<div class="card-mobile service-grid">${serviceRoutes.map(x => `<button class="service-item" type="button" data-route="${x[0]}"><span class="service-icon">${x[2]}</span><span>${x[1]}</span></button>`).join('')}</div>${linkage(findScreen('services'))}`;
  }

  function renderNotice() {
    return `${pageLead('消息中心','查看公告、服务进度、费用和访客通行回执。')}<div class="segmented-mobile">${['全部','公告','服务','费用'].map((x,i)=>`<button type="button" data-action="segment" ${i===0?'class="active"':''}>${x}</button>`).join('')}</div><div class="card-mobile">${row('repair-detail','修','报修工单已接单','OPS-20260829-017 · 2026-08-29 09:18:20','<span class="tag-mini warning">处理中</span>')}${row('visitor-pass','访','访客门禁授权已生成','VIS-20260829-026 · 等待访客使用','<span class="tag-mini success">已授权</span>')}${row('bill-center','账','8 月物业账单待缴','BILL-202608-0188 · ¥12,680.00','<span class="tag-mini warning">待缴</span>')}${row('notice-detail','告','和盛大厦消防演习通知','2026-08-29 09:00:00','<span class="tag-mini info">未读</span>')}</div>${linkage(findScreen('notice-center'))}`;
  }

  function renderProfile() {
    return `<div class="hero-card"><div class="hero-eyebrow">企业管理员</div><h1>林一帆</h1><p>星海科技 · 和盛大厦 1201—1208</p><div class="hero-actions">${routeButton('my-company','企业资料')}${routeButton('company-members','成员管理')}</div></div>${section('我的服务',`<div class="card-mobile">${row('activity-center','活','我的活动','已报名 2 场')}${row('space-bookings','空','空间预约','未来预约 1 条')}${row('repair-list','修','报修与投诉记录','处理中 1 条')}${row('ai-drafts','AI','AI 管家历史','待确认草稿 2 条')}${row('payment-records','账','账单与发票','待缴 1 笔')}</div>`)}${section('设置与帮助',`<div class="card-mobile">${row('subscriptions','订','消息订阅','按业务事件设置接收偏好')}${row('customer-service','客','联系客服','工作日 08:30—18:00')}${row('feedback','意','意见反馈','提交产品使用建议')}${row('about','关','关于我们','协议、隐私与第三方共享清单')}</div>`)}${linkage(findScreen('profile'))}`;
  }

  function renderCompany(route) {
    if (route === 'company-members') return `${pageLead('企业成员','管理星海科技成员的角色和服务权限。')}<div class="kpi-grid"><div class="kpi-card"><strong>18</strong><span>在职成员</span></div><div class="kpi-card"><strong>3</strong><span>管理员</span></div><div class="kpi-card"><strong>1</strong><span>待加入</span></div></div>${section('成员列表',`<div class="card-mobile">${row(null,'林','林一帆','企业管理员 · 138****1024','<span class="tag-mini success">正常</span>','member-detail')}${row(null,'陈','陈思远','财务联系人 · 137****5678','<span class="tag-mini success">正常</span>','member-detail')}${row(null,'赵','赵景','访客邀请人 · 139****3390','<span class="tag-mini warning">待加入</span>','member-detail')}</div>`)}<button class="primary-wide" type="button" data-action="open-invite-member">邀请成员</button>${linkage(findScreen(route))}`;
    return `${pageLead('我的公司','企业档案由管理端审核后展示，成员可查看当前有效信息。')}<div class="card-mobile scope-list"><div class="scope-item"><span>企业名称</span><strong>星海科技有限公司</strong></div><div class="scope-item"><span>入驻项目</span><strong>和盛大厦</strong></div><div class="scope-item"><span>入驻空间</span><strong>1201—1208</strong></div><div class="scope-item"><span>统一社会信用代码</span><strong>9133********381X</strong></div><div class="scope-item"><span>租赁有效期</span><strong>2027-08-31</strong></div></div>${routeButton('company-members','进入成员管理','primary-wide')}${linkage(findScreen(route))}`;
  }

  function renderRepair(route) {
    if (route === 'repair-list') return `${pageLead('报修记录','查看进行中和历史报修。')}<div class="segmented-mobile"><button class="active" type="button" data-action="segment">进行中</button><button type="button" data-action="segment">历史工单</button></div><div class="card-mobile">${row('repair-detail','修','办公室照明故障','OPS-20260829-017 · 2026-08-29 09:12:03','<span class="tag-mini warning">处理中</span>')}${row('repair-evaluation','修','茶水间门锁松动','OPS-20260822-008 · 2026-08-22 16:30:15','<span class="tag-mini success">待评价</span>')}</div>${linkage(findScreen(route))}`;
    if (route === 'repair-detail') return `${pageLead('工单详情','OPS-20260829-017')}<div class="card-mobile"><div class="money-summary"><div><span class="tag-mini warning">处理中</span><h2>办公室照明故障</h2></div><small>普通报修</small></div><div class="scope-list"><div class="scope-item"><span>位置</span><strong>12F 1206 会议室</strong></div><div class="scope-item"><span>预约时段</span><strong>今日 14:00—16:00</strong></div><div class="scope-item"><span>运营服务人员</span><strong>王师傅 · 138****3221</strong></div></div></div>${section('处理进度',`<div class="card-mobile timeline"><div class="timeline-item"><strong>运营服务人员已接单</strong><p>2026-08-29 09:18:20 · 预计 14:00 到场</p></div><div class="timeline-item"><strong>运营已受理</strong><p>2026-08-29 09:14:08 · 已完成信息核对</p></div><div class="timeline-item"><strong>企业提交报修</strong><p>2026-08-29 09:12:03</p></div></div>`)}<div class="choice-row">${routeButton('customer-service','联系运营','secondary-wide')}<button class="danger-wide" type="button" data-action="confirm-state" data-message="确认撤销工单 OPS-20260829-017 吗？">撤销工单</button></div>${linkage(findScreen(route))}`;
    if (route === 'repair-evaluation') return `${pageLead('服务评价','请对已完成的服务作出评价。')}<div class="form-card">${formField('服务评分','<div class="choice-row"><button type="button" class="choice-chip selected" data-action="choice">★★★★★</button><button type="button" class="choice-chip" data-action="choice">★★★★</button></div>',true)}${formField('评价标签','<div class="choice-row"><button type="button" class="choice-chip selected" data-action="choice">响应及时</button><button type="button" class="choice-chip" data-action="choice">态度友好</button><button type="button" class="choice-chip" data-action="choice">问题解决</button></div>')} ${textarea('评价内容','请输入评价内容',false)}${submit('提交评价','评价已提交')}</div>${linkage(findScreen(route))}`;
    return `${pageLead('报事报修','提交后由运营服务人员按报修事项受理。')}<div class="segmented-mobile"><button class="active" type="button" data-action="segment">户内报修</button><button type="button" data-action="segment">公共区域报修</button></div><div class="form-card">${selectField('故障类型',['灯具照明','空调使用','水电问题','门窗问题','其他'],true)}${textInput('报修位置','请输入具体楼层和位置',true)}${textarea('问题描述','请描述问题现象',true)}${textInput('联系人','请输入联系人',true,'text','林一帆')}${textInput('手机号','请输入手机号',true,'tel','13800138024')}${selectField('预约时段',['今日 14:00—16:00','今日 16:00—18:00','明日 09:00—11:00'],true)}${formField('现场照片','<button type="button" class="secondary-wide" data-action="upload-demo">上传照片</button>',false,'最多 6 张，单张不超过 10MB')}${submit('提交报修','报修已提交，工单编号 OPS-20260829-017')}</div>${linkage(findScreen(route))}`;
  }

  function renderSimpleForm(route) {
    const map = {
      'environment-booking': ['保洁绿化预约','预约保洁、绿化或消杀服务。','服务项目',['办公室深度保洁','绿植养护','公共区域消杀'],'服务地址','请输入楼层和房间号','提交预约','预约申请已提交'],
      complaints: ['投诉建议','提交问题并在记录中查看运营处理结果。','投诉类别',['环境卫生','秩序服务','运营态度','其他'],'问题位置','请输入问题发生位置','提交投诉','投诉已提交'],
      feedback: ['意见反馈','帮助我们改善企业服务体验。','反馈类别',['功能建议','体验问题','内容纠错','其他'],'联系方式','请输入手机号或邮箱','提交反馈','感谢反馈，我们会认真查看'],
      'enterprise-service': ['企业服务代办','选择服务并提交需求，运营顾问将联系企业。','服务项目',['高新技术企业认定','人才引进补贴','工商变更','财税法务'],'联系人','请输入联系人','提交申请','服务申请已提交']
    };
    const x = map[route];
    return `${pageLead(x[0],x[1])}<div class="form-card">${selectField(x[2],x[3],true)}${route==='environment-booking'?selectField('预约日期',['2026-08-30','2026-08-31','2026-09-01'],true):''}${textInput(x[4],x[5],true,'text',route==='enterprise-service'?'林一帆':'')}${textarea(route==='feedback'?'反馈内容':'需求描述',route==='feedback'?'请输入具体意见或建议':'请输入具体需求',true)}${formField('相关材料','<button type="button" class="secondary-wide" data-action="upload-demo">上传附件</button>',false,'支持图片或 PDF，最多 6 个文件')}${submit(x[6],x[7],route==='complaints'?'确认提交本次投诉吗？':'')}</div>${linkage(findScreen(route))}`;
  }

  function renderVisitor(route) {
    if (route === 'visitor-pass') return `${pageLead('访客通行证','VIS-20260829-026')}<div class="card-mobile qr-card"><span class="tag-mini success">门禁授权已生成</span><div class="qr-demo">${Array.from({length:49},(_,i)=>`<i data-n="${i}"></i>`).join('')}</div><div class="code-text">4839 2716</div><p class="row-sub">有效期：2026-08-29 14:00—16:00</p><div class="scope-list"><div class="scope-item"><span>授权范围</span><strong>大堂闸机、12F 门禁</strong></div><div class="scope-item"><span>通行次数</span><strong>2 次</strong></div><div class="scope-item"><span>核验方式</span><strong>二维码或人工核验</strong></div></div></div>${section('通行回执',`<div class="card-mobile timeline"><div class="timeline-item"><strong>门禁授权成功</strong><p>2026-08-29 09:35:16 · 等待访客到访</p></div><div class="timeline-item"><strong>离线保障已启用</strong><p>闸机离线时可由前台核对访客证件并人工放行，放行结果将补录。</p></div></div>`)}<button class="primary-wide" type="button" data-action="share-pass">转发给访客</button><button class="danger-wide" type="button" data-action="confirm-state" data-message="确认撤销访客 VIS-20260829-026 的门禁授权吗？">撤销授权</button>${linkage(findScreen(route))}`;
    if (route === 'visitor-records') return `${pageLead('访客记录','查看邀请、到访及通行核验结果。')}<div class="kpi-grid"><div class="kpi-card"><strong>26</strong><span>本月邀请</span></div><div class="kpi-card"><strong>22</strong><span>已到访</span></div><div class="kpi-card"><strong>84.6%</strong><span>到访率</span></div></div>${section('最近邀请',`<div class="card-mobile">${row('visitor-pass','访','周宁 · 云岸设计','VIS-20260829-026 · 今日 14:00—16:00','<span class="tag-mini success">已授权</span>')}${row('visitor-pass','访','李泽 · 远望咨询','VIS-20260828-019 · 闸机已核销','<span class="tag-mini success">已到访</span>')}${row('visitor-pass','访','孙可 · 独立访客','VIS-20260827-011 · 前台人工核验放行','<span class="tag-mini info">人工放行</span>')}</div>`)}${linkage(findScreen(route))}`;
    return `${pageLead('访客邀请','提交访客信息后生成通行授权。')}<div class="form-card">${textInput('访客姓名','请输入访客姓名',true)}${textInput('手机号','请输入访客手机号',true,'tel')}${textInput('访客公司','请输入访客公司',false)}${selectField('来访时间',['2026-08-29 14:00—16:00','2026-08-29 16:00—18:00','2026-08-30 09:00—11:00'],true)}${textInput('来访事由','请输入来访事由',true)}${selectField('到访楼层',['12F 星海科技','1F 大堂会客区'],true)}${selectField('通行次数',['1 次','2 次','不限次数（有效期内）'],true)}${textInput('车牌号','请输入车牌号',false)}${formField('访客确认','<label><input type="checkbox" required> 已确认访客信息真实并同意访客管理规则</label>',true)}${submit('生成邀请','邀请已生成，编号 VIS-20260829-026')}</div>${routeButton('visitor-records','查看访客记录','secondary-wide')}${linkage(findScreen(route))}`;
  }

  function renderBills(route) {
    if (route === 'payment-success') return `${pageLead('缴费结果','支付结果已确认。')}<div class="card-mobile qr-card"><div class="dialog-icon">✓</div><h2>缴费成功</h2><div class="price">¥12,680.00</div><div class="scope-list"><div class="scope-item"><span>账单编号</span><strong>BILL-202608-0188</strong></div><div class="scope-item"><span>支付时间</span><strong>2026-08-29 10:06:18</strong></div><div class="scope-item"><span>支付订单</span><strong>PAY-20260829-0826</strong></div></div></div><button class="secondary-wide" type="button" data-action="download-receipt">查看电子回单</button>${routeButton('invoice-apply','申请电子发票','primary-wide')}${linkage(findScreen(route))}`;
    if (route === 'payment-records') return `${pageLead('缴费记录','查看近 90 天企业缴费记录。')}<div class="card-mobile">${row('payment-success','账','8 月物业服务费','BILL-202608-0188 · ¥12,680.00','<span class="tag-mini success">已缴</span>')}${row('payment-success','电','7 月电费','BILL-202607-0156 · ¥4,218.60','<span class="tag-mini success">已缴</span>')}${row('payment-success','停','8 月停车月租','BILL-202608-0162 · ¥800.00','<span class="tag-mini success">已缴</span>')}</div>${linkage(findScreen(route))}`;
    return `${pageLead('账单中心','企业账单按业务类型集中查看和支付。')}<div class="segmented-mobile"><button class="active" type="button" data-action="segment">待缴</button><button type="button" data-action="segment">已缴</button><button type="button" data-action="segment">全部</button></div><div class="card-mobile"><label class="record-row"><input type="checkbox" checked data-action="bill-check"><span class="row-main"><span class="row-title">8 月物业服务费 <span class="tag-mini warning">待缴</span></span><span class="row-sub">BILL-202608-0188 · 截止 2026-09-05</span></span><strong>¥12,680.00</strong></label><label class="record-row"><input type="checkbox" data-action="bill-check"><span class="row-main"><span class="row-title">8 月停车月租 <span class="tag-mini warning">待缴</span></span><span class="row-sub">BILL-202608-0162 · 截止 2026-09-01</span></span><strong>¥800.00</strong></label></div><div class="card-mobile money-summary"><div><small>已选 1 笔</small><div class="price">¥12,680.00</div></div><button type="button" class="primary-wide" style="width:128px;margin:0" data-action="pay-bill">确认支付</button></div>${routeButton('payment-records','查看缴费记录','secondary-wide')}${linkage(findScreen(route))}`;
  }

  function renderElectricity(route) {
    if (route === 'corporate-transfer') return `${pageLead('对公转账登记','上传银行回单后由财务核验并完成入账。')}<div class="card-mobile scope-list"><div class="scope-item"><span>收款户名</span><strong>和盛园区运营有限公司</strong></div><div class="scope-item"><span>开户银行</span><strong>招商银行杭州滨江支行</strong></div><div class="scope-item"><span>银行账号</span><strong>5719 **** **** 0286</strong></div></div><button class="secondary-wide" type="button" data-action="copy-account">复制收款信息</button><div class="form-card">${textInput('转账金额','请输入转账金额',true,'number')}${textInput('转账账户名','请输入转账账户名',true)}${formField('银行回单','<button type="button" class="secondary-wide" data-action="upload-demo">上传回单</button>',true,'支持 JPG、PNG 或 PDF，单个文件不超过 10MB')}${submit('提交登记','对公回单已提交，等待财务核验')}</div>${linkage(findScreen(route))}`;
    return `${pageLead('电费账户','展示账户、账单、充值和入账信息。')}<div class="hero-card"><div class="hero-eyebrow">星海科技电费账户</div><h1>¥ 8,620.40</h1><p>可用余额 · 余额提醒阈值 ¥2,000.00</p></div>${section('待缴账单',`<div class="card-mobile">${row('bill-center','电','8 月电费账单','BILL-202608-0193 · ¥4,382.16','<span class="tag-mini warning">待缴</span>')}</div>`)}${section('充值金额',`<div class="form-card"><div class="choice-row"><button class="choice-chip selected" type="button" data-action="choice">¥1,000</button><button class="choice-chip" type="button" data-action="choice">¥3,000</button><button class="choice-chip" type="button" data-action="choice">¥5,000</button></div>${textInput('其他金额','请输入充值金额',false,'number')}${submit('确认充值','充值支付已发起','确认充值 ¥1,000.00 吗？')}</div>`)}${routeButton('corporate-transfer','对公转账充值','secondary-wide')}${linkage(findScreen(route))}`;
  }

  function renderInvoice(route) {
    if (route === 'invoice-apply') return `${pageLead('发票申请','选择可开票缴费记录并填写开票信息。')}<div class="form-card">${selectField('发票类型',['增值税普通发票','增值税专用发票'],true)}${textInput('发票抬头','请输入发票抬头',true,'text','星海科技有限公司')}${textInput('纳税人识别号','请输入纳税人识别号',true,'text','9133********381X')}${textInput('接收邮箱','请输入接收邮箱',true,'email','finance@xinghai.example')}${selectField('开票账单',['BILL-202608-0188 · ¥12,680.00','BILL-202608-0162 · ¥800.00'],true)}${submit('提交申请','发票申请已提交')}</div>${linkage(findScreen(route))}`;
    return `${pageLead('发票记录','查看开票状态、下载电子发票。')}<div class="card-mobile">${row(null,'票','8 月物业服务费发票','INV-20260829-0068 · ¥12,680.00','<span class="tag-mini success">已开票</span>','download-invoice')}${row('invoice-apply','票','8 月停车月租发票','INV-20260829-0071 · ¥800.00','<span class="tag-mini warning">审核中</span>')}</div>${routeButton('invoice-apply','新增发票申请','primary-wide')}${linkage(findScreen(route))}`;
  }

  function renderSpace(route) {
    if (route === 'space-detail') return `${pageLead('3F 路演厅','可容纳 60 人 · ¥800/小时')}<div class="card-mobile"><div class="row-icon">空</div><h2>适合路演、培训与企业发布会</h2><p class="row-sub">包含投影、音响、无线麦克风与基础桌椅，具体服务以预约确认结果为准。</p></div>${section('选择预约时段',`<div class="form-card">${selectField('预约日期',['2026-09-01','2026-09-02','2026-09-03'],true)}${formField('可用时段','<div class="choice-row"><button class="choice-chip selected" type="button" data-action="choice">09:00—11:00</button><button class="choice-chip" type="button" data-action="choice">14:00—16:00</button><button class="choice-chip" type="button" data-action="choice">16:00—18:00</button></div>',true)}${textInput('活动用途','请输入活动用途',true)}${textInput('参与人数','请输入参与人数',true,'number')}${submit('提交预约','空间预约已提交')}</div>`)}${linkage(findScreen(route))}`;
    if (route === 'space-booking-pass') return `${pageLead('预约凭证','SPACE-20260901-0036')}<div class="card-mobile qr-card"><span class="tag-mini success">预约成功</span><div class="qr-demo">${Array.from({length:49},(_,i)=>`<i data-n="${i}"></i>`).join('')}</div><div class="scope-list"><div class="scope-item"><span>空间</span><strong>3F 路演厅</strong></div><div class="scope-item"><span>时段</span><strong>2026-09-01 14:00—16:00</strong></div><div class="scope-item"><span>预约企业</span><strong>星海科技</strong></div></div></div><button class="danger-wide" type="button" data-action="confirm-state" data-message="确认取消空间预约 SPACE-20260901-0036 吗？">取消预约</button>${linkage(findScreen(route))}`;
    if (route === 'space-bookings') return `${pageLead('我的预约','查看未来和历史空间预约。')}<div class="card-mobile">${row('space-booking-pass','空','3F 路演厅','2026-09-01 14:00—16:00','<span class="tag-mini success">预约成功</span>')}${row('space-booking-pass','空','2F 会议室 B','2026-08-20 10:00—11:00','<span class="tag-mini">已完成</span>')}</div>${linkage(findScreen(route))}`;
    return `${pageLead('空间预订','按日期浏览和盛大厦可预约空间。')}<div class="segmented-mobile"><button class="active" type="button" data-action="segment">全部</button><button type="button" data-action="segment">会议室</button><button type="button" data-action="segment">路演厅</button></div><div class="card-mobile">${row('space-detail','空','3F 路演厅','60 人 · ¥800/小时 · 今日有空闲','<span class="tag-mini success">可预约</span>')}${row('space-detail','空','2F 会议室 B','12 人 · ¥120/小时 · 14:00 后可用','<span class="tag-mini success">可预约</span>')}${row('space-detail','空','15F 多功能厅','120 人 · ¥1,600/小时 · 今日已满','<span class="tag-mini">已约满</span>')}</div>${linkage(findScreen(route))}`;
  }

  function renderParking() {
    return `${pageLead('停车服务','管理车辆、月租、优惠、停车账单、缴费和记录。')}<div class="hero-card"><div class="hero-eyebrow">停车账户余额</div><h1>¥ 320.00</h1><p>2 辆已绑定车辆 · 1 个月租权益</p></div>${section('我的停车',`<div class="card-mobile">${row(null,'车','浙A·XH0826','企业月租 · 有效期至 2026-09-30','<span class="tag-mini success">生效中</span>','vehicle-detail')}${row(null,'月','月租续费','¥800/月 · 下期 2026-10-01','<span class="tag-mini info">可续费</span>','renew-parking')}${row('visitor-records','访','访客停车优惠','本月已使用 8 次')}${row('payment-records','记','停车缴费记录','近 90 天共 12 笔')}</div>`)}<div class="form-card">${textInput('停车订单号','请输入停车订单号',true)}${submit('查询并缴费','已找到停车账单，进入支付确认')}</div>${linkage(findScreen('parking-services'))}`;
  }

  function renderLeaseMove(route) {
    if (route === 'lease-contract') return `${pageLead('租约与合同','查看当前租赁合同并发起续租意向。')}<div class="card-mobile scope-list"><div class="scope-item"><span>合同编号</span><strong>LEASE-HS-2025-036</strong></div><div class="scope-item"><span>租赁空间</span><strong>12F 1201—1208</strong></div><div class="scope-item"><span>合同期限</span><strong>2025-09-01—2027-08-31</strong></div><div class="scope-item"><span>合同状态</span><strong><span class="tag-mini success">履约中</span></strong></div></div><button class="secondary-wide" type="button" data-action="download-contract">查看合同文件</button><button class="primary-wide" type="button" data-action="open-renew">申请续租</button>${linkage(findScreen(route))}`;
    return `${pageLead('入驻、装修与退租','选择事项并查看材料和办理进度。')}<div class="segmented-mobile"><button class="active" type="button" data-action="segment">装修报备</button><button type="button" data-action="segment">入驻办理</button><button type="button" data-action="segment">退租办理</button></div><div class="card-mobile timeline"><div class="timeline-item"><strong>填写事项信息</strong><p>选择办理类型、联系人和计划日期</p></div><div class="timeline-item"><strong>提交业务材料</strong><p>上传与事项相关的企业材料</p></div><div class="timeline-item"><strong>运营审核</strong><p>查看审核结果并按需补充材料</p></div><div class="timeline-item"><strong>业务确认</strong><p>企业确认办理结果和相关费用</p></div></div><button class="primary-wide" type="button" data-action="open-move-form">发起装修报备</button>${linkage(findScreen(route))}`;
  }

  function renderActivity(route) {
    if (route === 'activity-registration') return `${pageLead('活动报名','星海企业开放日')}<div class="card-mobile"><h2>2026-09-06 14:00</h2><p class="row-sub">和盛大厦 3F 路演厅 · 剩余 18 个名额</p></div><div class="form-card">${textInput('报名人姓名','请输入报名人姓名',true,'text','林一帆')}${textInput('手机号','请输入手机号',true,'tel','13800138024')}${textInput('参与人数','请输入参与人数',true,'number','1')}${submit('确认报名','活动报名成功')}</div>${linkage(findScreen(route))}`;
    return `${pageLead('园区活动','浏览活动详情、报名并查看报名记录。')}<div class="segmented-mobile"><button class="active" type="button" data-action="segment">全部</button><button type="button" data-action="segment">政策宣讲</button><button type="button" data-action="segment">企业沙龙</button></div><div class="card-mobile">${row('activity-registration','活','星海企业开放日','2026-09-06 14:00 · 3F 路演厅','<span class="tag-mini success">报名中</span>')}${row('activity-registration','活','专精特新政策宣讲','2026-09-10 09:30 · 15F 多功能厅','<span class="tag-mini success">报名中</span>')}${row('activity-registration','活','企业增长私享会','2026-09-18 14:00 · 2F 会议室 B','<span class="tag-mini warning">即将满员</span>')}</div>${linkage(findScreen(route))}`;
  }

  function renderAI(route) {
    if (route === 'ai-usage') return `${pageLead('AI 用量与订阅','查看企业套餐额度、成员共享和续费设置。')}<div class="hero-card"><div class="hero-eyebrow">企业知识中枢</div><h1>68%</h1><p>本月已用 680 万 / 1,000 万 Token</p></div>${section('最近用量',`<div class="card-mobile">${row(null,'AI','企业知识问答','2026-08-29 10:18:22 · 12,860 Token','', 'usage-detail')}${row(null,'AI','会议纪要整理','2026-08-29 09:02:16 · 8,240 Token','', 'usage-detail')}</div>`)}<button class="secondary-wide" type="button" data-action="buy-token">购买 Token</button><button class="primary-wide" type="button" data-action="manage-plan">套餐管理</button>${linkage(findScreen(route))}`;
    if (route === 'ai-drafts') return `${pageLead('AI 管家历史','敏感业务动作只生成草稿，需用户确认后提交业务校验。')}<div class="card-mobile">${row('ai-draft-detail','AI','访客邀请草稿','访客周宁 · 今日 14:00—16:00','<span class="tag-mini warning">待确认</span>')}${row('ai-draft-detail','AI','账单缴费草稿','BILL-202608-0188 · ¥12,680.00','<span class="tag-mini warning">待确认</span>')}${row('ai-draft-detail','AI','空间预约草稿','3F 路演厅 · 2026-09-01','<span class="tag-mini info">待校验</span>')}</div>${linkage(findScreen(route))}`;
    if (route === 'ai-draft-detail') return `${pageLead('动作草稿','AI-DRAFT-20260829-0058')}<div class="card-mobile"><span class="tag-mini warning">待用户确认</span><h2>为周宁创建访客邀请</h2><div class="scope-list"><div class="scope-item"><span>访客</span><strong>周宁 · 云岸设计</strong></div><div class="scope-item"><span>时间</span><strong>2026-08-29 14:00—16:00</strong></div><div class="scope-item"><span>授权</span><strong>大堂闸机、12F 门禁</strong></div></div></div><button class="secondary-wide" type="button" data-route="visitor-invite">修改草稿</button><button class="primary-wide" type="button" data-action="confirm-draft">提交，等待业务校验</button>${linkage(findScreen(route))}`;
    if (route === 'ai-assistant') return `${pageLead('AI 管家','可回答问题、导航服务或生成待确认动作草稿。')}<div class="card-mobile"><div class="row-sub">AI 管家</div><p>上午好。你可以问我园区服务，也可以让我帮你填写访客、报修或账单草稿。</p></div><div class="card-mobile" style="margin-top:10px"><div class="row-sub">你</div><p>帮我邀请周宁今天下午来 12 楼。</p></div><div class="card-mobile" style="margin-top:10px"><div class="row-sub">AI 管家</div><p>已根据企业通讯录和当前项目生成访客邀请草稿。门禁授权属于敏感动作，需要你核对后提交。</p>${routeButton('ai-draft-detail','查看动作草稿','primary-wide')}</div><div class="form-card" style="margin-top:10px">${textInput('发送消息','请输入问题或业务需求',true)}<button class="primary-wide" type="button" data-action="send-ai">发送</button></div>${linkage(findScreen(route))}`;
    return `${pageLead('AI 服务','浏览企业 AI 商品、查看用量和订阅状态。')}<div class="hero-card"><div class="hero-eyebrow">星海科技企业套餐</div><h1>企业知识中枢</h1><p>本月额度已使用 68%</p><div class="hero-actions">${routeButton('ai-usage','查看用量')}${routeButton('ai-drafts','动作草稿')}</div></div>${section('AI 商品',`<div class="card-mobile">${row(null,'AI','通用大模型 Pro','企业级对话与文本生成 · 按量计费','<span class="tag-mini info">模型调用</span>','order-ai')}${row(null,'知','企业知识中枢','连接企业资料与业务知识','<span class="tag-mini success">已订阅</span>','manage-plan')}${row(null,'客','智能客服数字员工','企业客户咨询与服务分流','<span class="tag-mini info">工具订阅</span>','order-ai')}${row(null,'会','会议纪要助手','转写、摘要与待办整理','<span class="tag-mini info">Skill</span>','order-ai')}</div>`)}${linkage(findScreen(route))}`;
  }

  function renderSupport(route) {
    if (route === 'subscriptions') return `${pageLead('消息订阅','设置不同业务事件的接收偏好。')}<div class="card-mobile">${['缴费通知','工单进度','访客到访','园区活动','政策推送','通知公告'].map((x,i)=>`<label class="record-row"><span class="row-main"><span class="row-title">${x}</span><span class="row-sub">${i<3?'已开启服务通知':'按需接收内容消息'}</span></span><input type="checkbox" ${i<4?'checked':''} data-action="toggle-subscription"></label>`).join('')}</div><button class="primary-wide" type="button" data-action="save-settings">保存</button>${linkage(findScreen(route))}`;
    if (route === 'customer-service') return `${pageLead('联系客服','工作日 08:30—18:00，紧急事项可拨打服务电话。')}<div class="card-mobile qr-card"><div class="row-icon" style="margin:auto">客</div><h2>和盛大厦企业服务中心</h2><p class="row-sub">当前在线 · 预计 2 分钟内响应</p></div><button class="primary-wide" type="button" data-action="online-service">进入在线客服</button><button class="secondary-wide" type="button" data-action="call-service">拨打 0571-8888 6622</button>${linkage(findScreen(route))}`;
    return `${pageLead('关于 OPCSpace','为入驻企业提供园区经营与服务协同。')}<div class="card-mobile qr-card"><div class="service-icon">OPC</div><h2>OPCSpace v0.3</h2><p class="row-sub">和盛大厦企业服务平台</p></div><div class="card-mobile" style="margin-top:12px">${row('agreement','协','服务协议','生效时间 2026-08-01')}${row('privacy','隐','隐私政策','生效时间 2026-08-01')}${row('third-party','共','第三方信息共享清单','查看共享场景和信息类型')}</div>${linkage(findScreen(route))}`;
  }

  function renderGeneric(screen, route) {
    if (!screen) return `${pageLead('页面未登记','当前入口尚未找到对应页面数据。')}<div class="empty-state"><div class="empty-icon">○</div><h3>请从全部服务重新进入</h3>${routeButton('services','返回全部服务','primary-wide')}</div>`;
    const sections = (screen.sections || []).map(s => section(s.title || '业务信息', `<div class="card-mobile">${(s.items || [s.description || screen.subtitle || '']).map((item,i)=>row(item.route || null,item.icon || '•',item.title || String(item),item.subtitle || '',item.status?`<span class="tag-mini ${item.tone||''}">${item.status}</span>`:'',item.action || 'show-detail')).join('')}</div>`)).join('');
    return `${pageLead(screen.title || route,screen.subtitle || '查看并处理当前业务信息。')}${sections || '<div class="empty-state"><div class="empty-icon">○</div><h3>暂无更多记录</h3><p>相关业务结果将在这里展示。</p></div>'}${linkage(screen)}`;
  }

  function render() {
    const route = getRoute();
    const screen = findScreen(route);
    const renderers = {
      home: renderHome, services: renderServices, 'notice-center': renderNotice, profile: renderProfile,
      'my-company': () => renderCompany(route), 'company-members': () => renderCompany(route),
      'repair-submit': () => renderRepair(route), 'repair-list': () => renderRepair(route), 'repair-detail': () => renderRepair(route), 'repair-evaluation': () => renderRepair(route),
      'environment-booking': () => renderSimpleForm(route), complaints: () => renderSimpleForm(route), feedback: () => renderSimpleForm(route), 'enterprise-service': () => renderSimpleForm(route),
      'visitor-invite': () => renderVisitor(route), 'visitor-pass': () => renderVisitor(route), 'visitor-records': () => renderVisitor(route),
      'bill-center': () => renderBills(route), 'payment-success': () => renderBills(route), 'payment-records': () => renderBills(route),
      'electricity-recharge': () => renderElectricity(route), 'corporate-transfer': () => renderElectricity(route),
      'invoice-apply': () => renderInvoice(route), 'invoice-records': () => renderInvoice(route),
      'space-catalog': () => renderSpace(route), 'space-detail': () => renderSpace(route), 'space-bookings': () => renderSpace(route), 'space-booking-pass': () => renderSpace(route),
      'parking-services': renderParking, 'lease-contract': () => renderLeaseMove(route), 'move-flows': () => renderLeaseMove(route),
      'activity-center': () => renderActivity(route), 'activity-registration': () => renderActivity(route),
      'ai-hub': () => renderAI(route), 'ai-usage': () => renderAI(route), 'ai-drafts': () => renderAI(route), 'ai-draft-detail': () => renderAI(route), 'ai-assistant': () => renderAI(route),
      subscriptions: () => renderSupport(route), 'customer-service': () => renderSupport(route), about: () => renderSupport(route)
    };
    title.textContent = screen?.title || ({home:'OPCSpace',services:'全部服务',profile:'我的','ai-hub':'AI 服务'}[route] || 'OPCSpace');
    view.innerHTML = (renderers[route] || (() => renderGeneric(screen, route)))();
    view.scrollTop = 0;
    document.querySelector('.header-back').style.visibility = ['home','services','ai-hub','profile'].includes(route) ? 'hidden' : 'visible';
    document.querySelectorAll('.bottom-nav button').forEach(btn => {
      const profileRoutes = ['profile','my-company','company-members','subscriptions','customer-service','feedback','about'];
      const tab = route === 'home' || route === 'notice-center' ? 'home' : route === 'services' ? 'services' : route.startsWith('ai-') ? 'ai' : profileRoutes.includes(route) ? 'profile' : 'services';
      btn.classList.toggle('active', btn.dataset.tab === tab);
    });
  }

  function navigate(route) {
    const current = getRoute();
    if (current !== route) state.previous.push(current);
    location.hash = route;
  }

  function showToast(message) {
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(showToast.timer);
    showToast.timer = setTimeout(() => toast.classList.remove('show'), 2200);
  }

  function openSheet(actions) {
    sheetBody.innerHTML = actions.map(a => `<button class="sheet-action" type="button" data-action="${a.action}" ${a.route?`data-route="${a.route}"`:''}>${a.label}</button>`).join('');
    sheetMask.hidden = false;
  }

  function confirmAction(message, callback, heading) {
    dialogTitle.textContent = heading || '确认操作';
    dialogMessage.textContent = message;
    state.pending = callback;
    dialogMask.hidden = false;
  }

  function validateForm(button) {
    const container = button.closest('.form-card') || view;
    const fields = Array.from(container.querySelectorAll('[required]'));
    const invalid = fields.find(el => (el.type === 'checkbox' && !el.checked) || (!el.value && el.type !== 'checkbox'));
    if (invalid) { invalid.focus(); showToast('请完整填写必填项'); return false; }
    return true;
  }

  document.addEventListener('click', function (event) {
    const routeEl = event.target.closest('[data-route]');
    if (routeEl && !routeEl.disabled) { event.preventDefault(); navigate(routeEl.dataset.route); return; }
    const el = event.target.closest('[data-action]');
    if (!el || el.disabled) return;
    const action = el.dataset.action;
    if (action === 'back') { const prev = state.previous.pop(); prev ? (location.hash = prev) : history.back(); }
    else if (action === 'open-more') openSheet([{label:'返回首页',route:'home',action:'route'},{label:'消息中心',route:'notice-center',action:'route'},{label:'联系客服',route:'customer-service',action:'route'},{label:'关闭当前页面',action:'close-page'}]);
    else if (action === 'close-sheet') sheetMask.hidden = true;
    else if (action === 'close-page') { sheetMask.hidden = true; navigate('home'); showToast('已关闭当前页面'); }
    else if (action === 'cancel-dialog') { dialogMask.hidden = true; state.pending = null; }
    else if (action === 'confirm-dialog') { const cb = state.pending; dialogMask.hidden = true; state.pending = null; if (cb) cb(); }
    else if (action === 'segment') { el.parentElement.querySelectorAll('button').forEach(x=>x.classList.remove('active')); el.classList.add('active'); showToast(`已切换到“${el.textContent.trim()}”`); }
    else if (action === 'choice') { if (!el.parentElement.classList.contains('choice-row')) return; el.parentElement.querySelectorAll('.choice-chip').forEach(x=>x.classList.remove('selected')); el.classList.add('selected'); }
    else if (action === 'submit-form') {
      if (!validateForm(el)) return;
      const finish = () => { el.disabled = true; el.textContent = '提交中'; setTimeout(()=>{el.textContent='已提交';showToast(el.dataset.success || '提交成功');},500); };
      el.dataset.confirm ? confirmAction(el.dataset.confirm, finish, el.textContent.trim()) : finish();
    }
    else if (action === 'confirm-state') confirmAction(el.dataset.message || '确认执行该操作吗？',()=>{el.disabled=true;el.textContent='处理中';showToast('操作已提交，等待处理结果');},el.textContent.trim());
    else if (action === 'pay-bill') confirmAction('确认支付账单 BILL-202608-0188，金额 ¥12,680.00 吗？',()=>navigate('payment-success'),'确认支付');
    else if (action === 'confirm-draft') confirmAction('确认提交该动作草稿并等待业务校验吗？',()=>{el.disabled=true;el.textContent='等待业务校验';showToast('草稿已提交');},'提交动作草稿');
    else if (action === 'open-invite-member') openSheet([{label:'微信邀请成员',action:'share-member'},{label:'复制邀请链接',action:'copy-invite'}]);
    else if (action === 'open-renew') openSheet([{label:'续租 1 年',action:'renew-one'},{label:'续租 2 年',action:'renew-two'}]);
    else if (action === 'open-move-form') openSheet([{label:'装修报备',action:'move-submit'},{label:'入驻办理',action:'move-submit'},{label:'退租办理',action:'move-submit'}]);
    else if (['share-member','copy-invite','share-pass','copy-account','download-receipt','download-invoice','download-contract','upload-demo','save-settings','send-ai','usage-detail','vehicle-detail'].includes(action)) showToast({'share-member':'已打开微信成员邀请','copy-invite':'邀请链接已复制','share-pass':'已生成访客转发卡片','copy-account':'收款信息已复制','download-receipt':'电子回单预览已打开','download-invoice':'电子发票下载已开始','download-contract':'合同文件预览已打开','upload-demo':'已选择演示文件','save-settings':'订阅设置已保存','send-ai':'AI 管家正在整理回答','usage-detail':'已打开本次用量详情','vehicle-detail':'已打开车辆详情'}[action]);
    else if (['call-service','online-service','order-ai','manage-plan','buy-token','renew-parking','move-submit','renew-one','renew-two','show-detail','member-detail'].includes(action)) {
      const messages={ 'call-service':'正在呼叫 0571-8888 6622','online-service':'已进入在线客服排队','order-ai':'已打开商品订购确认','manage-plan':'已打开套餐管理','buy-token':'已打开 Token 购买页面','renew-parking':'已打开月租续费确认','move-submit':'已打开事项申请表','renew-one':'已生成续租 1 年意向草稿','renew-two':'已生成续租 2 年意向草稿','show-detail':'已打开记录详情','member-detail':'已打开成员详情'};
      sheetMask.hidden = true; showToast(messages[action]);
    }
    else if (action === 'toggle-subscription') showToast(el.checked ? '已开启订阅' : '已关闭订阅');
    else showToast('操作已响应');
  });

  sheetMask.addEventListener('click', e => { if (e.target === sheetMask) sheetMask.hidden = true; });
  dialogMask.addEventListener('click', e => { if (e.target === dialogMask) { dialogMask.hidden = true; state.pending = null; } });
  window.addEventListener('hashchange', render);
  render();
}());

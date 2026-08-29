(function () {
  "use strict";
  const app = document.getElementById("app");
  const modal = document.getElementById("modal");
  const toast = document.getElementById("toast");
  const pages = window.OPC_ADMIN_PAGES || [];
  const groups = window.OPC_ADMIN_GROUPS || [];
  const state = { route:"index", page:1, size:15, query:"", status:"", role:"运营" };
  const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const statusClass = s => ({"待处理":"status-pending","处理中":"status-doing","已完成":"status-done","已驳回":"status-rejected"}[s] || "status-doing");
  const pageByRoute = r => pages.find(p => p.route === r);
  function parseHash() {
    const raw = location.hash.replace(/^#\/?/,"");
    if (!raw) return {route:"index"};
    const parts = raw.split("/");
    return {route:parts[0] || "index", mode:parts[1] || "", id:decodeURIComponent(parts.slice(2).join("/"))};
  }
  function shell(content, active) {
    const nav = groups.map(g => `<div class="side-group"><div class="side-group-title">${esc(g)}</div>${pages.filter(p=>p.family===g).map(p=>`<button class="side-item ${p.route===active?'active':''}" data-action="route" data-route="${p.route}"><span class="side-id">${p.adm}</span><span>${esc(p.title)}</span></button>`).join("")}</div>`).join("");
    return `<header class="admin-top"><div class="brand"><span class="brand-mark">O</span><span>OPCSpace 管理端</span><span class="tag tag-primary">v0.3 评审版</span></div><div class="top-context"><button class="btn" data-action="role">当前责任族：${esc(state.role)}</button><span class="context-chip">和盛大厦</span><span class="context-chip">星海科技</span><button class="btn btn-text" data-action="route" data-route="index">原型入口</button></div></header><div class="admin-body"><aside class="admin-side">${nav}</aside><main class="admin-main">${content}</main></div>`;
  }
  function renderHome() {
    const groupCards = [
      ["管理端工作台","从经营总览进入待办与业务处理","dashboard-overview"],
      ["小程序原型","查看企业用户发起与结果回显","../mini/index.html","link"],
      ["关键报修单","打开 OPS-20260829-017 的管理详情","property-work-order-detail"],
      ["关键访客单","打开 VIS-20260829-026 的授权与核销信息","operations-visitors"]
    ];
    const content = `<section class="home-hero"><div><h1>v0.3-功能集合与信息联动 · 高保真原型</h1><p>和盛大厦 · 管理端评审入口 · 当前阶段用于确认功能集合和信息承接关系</p></div><button class="btn btn-primary" data-action="route" data-route="dashboard-overview">进入管理端</button></section>
      <section class="admin-card"><div class="admin-card-head">双端入口</div><div class="admin-card-body entry-grid">${groupCards.map(c=>`<button class="entry-card" data-action="${c[3]||'route'}" ${c[3]==='link'?`data-link="${c[2]}"`:`data-route="${c[2]}"`}><div class="entry-title">${c[0]}</div><div class="entry-desc">${c[1]}</div></button>`).join("")}</div></section>
      <section class="admin-card"><div class="admin-card-head">责任族与共用治理</div><div class="admin-card-body"><div class="entry-grid">${groups.map(g=>{const p=pages.find(x=>x.family===g);return `<button class="entry-card" data-action="route" data-route="${p.route}"><div class="entry-title">${g}</div><div class="entry-desc">${pages.filter(x=>x.family===g).length} 个现行页面，点击进入 ${p.title}</div></button>`}).join("")}</div></div></section>
      <section class="admin-card"><div class="admin-card-head">系统权限说明</div><div class="admin-card-body"><p>菜单、按钮和数据范围由超级管理员在“角色权限”统一维护。五类责任族是职责分工，不代表系统只有五项功能；工作台、待办、审批、客服、消息、审计、自动化、配置发布和数据质量按授权共用。</p><button class="btn" data-action="route" data-route="system-roles">查看角色权限</button></div></section>
      <section class="admin-card"><div class="admin-card-head">版本变更记录</div><div class="admin-card-body"><table class="version-table"><thead><tr><th>版本号</th><th>时间</th><th>类型</th><th>涉及页面</th><th>变更内容摘要</th></tr></thead><tbody><tr><td>v0.3</td><td>2026-08-29</td><td><span class="tag tag-success">新增</span></td><td>管理端全域、小程序联动</td><td>按现行 PRD 重构功能集合与信息联动评审原型，保留访客通行硬件业务。</td></tr></tbody></table></div></section>
      <section class="admin-card"><div class="admin-card-head">PRD 摘要</div><div class="admin-card-body"><h3>一、产品背景与目标</h3><p>面向国内园区与楼宇企业服务场景，把企业用户的服务入口和管理人员的信息承接放在同一业务语境下评审。</p><h3>二、用户角色与场景</h3><p>企业成员在小程序查看、申请和跟踪服务；招商、财务、运营、内容与超级管理员在管理端按责任处理，共用治理能力提供跨域支持。</p><h3>三、核心痛点与价值</h3><p>先确认每个入口由谁承接、处理什么信息以及返回哪里，再讨论状态、异常和闭环规则，减少原型之间的口径冲突。</p><div class="flow-line"><span class="flow-node">小程序发起</span><span class="flow-arrow">→</span><span class="flow-node">管理端承接</span><span class="flow-arrow">→</span><span class="flow-node">处理结果</span><span class="flow-arrow">→</span><span class="flow-node">小程序回显</span></div></div></section>`;
    app.innerHTML = shell(content,"");
  }
  function filtered(p) { return p.records.filter(r => (!state.query || `${r.id}${r.subject}${r.company}`.includes(state.query)) && (!state.status || r.status===state.status)); }
  function pagination(total) {
    const count=Math.max(1,Math.ceil(total/state.size)); state.page=Math.min(state.page,count); const start=total?(state.page-1)*state.size+1:0, end=Math.min(state.page*state.size,total);
    const nums=Array.from({length:Math.min(5,count)},(_,i)=>i+1).map(n=>`<button class="page-btn ${n===state.page?'active':''}" data-action="page" data-page="${n}">${n}</button>`).join("");
    return `<div class="pagination-full"><label>每页 <select data-action="size"><option ${state.size===15?'selected':''}>15</option><option ${state.size===25?'selected':''}>25</option><option>50</option><option>100</option><option>200</option></select> 条</label><span>当前 ${start}-${end} 条</span><span>共 ${total} 条</span><button class="page-btn" data-action="page" data-page="${state.page-1}" ${state.page===1?'disabled':''}>‹</button><div class="page-numbers">${nums}</div><button class="page-btn" data-action="page" data-page="${state.page+1}" ${state.page===count?'disabled':''}>›</button><label>前往 <input data-action="jump-input" value="${state.page}" size="3"> 页</label><button class="btn btn-small" data-action="jump">跳转</button></div>`;
  }
  function renderPage(p) {
    const rows=filtered(p), view=rows.slice((state.page-1)*state.size,state.page*state.size);
    const visitorActions=p.route==='operations-visitors'?`<button class="btn btn-danger" data-action="visitor-revoke" data-route="${p.route}" data-id="VIS-20260829-026">撤销通行证</button><button class="btn" data-action="visitor-release" data-route="${p.route}" data-id="VIS-20260829-026">人工放行</button>`:"";
    const content=`<div class="page-head"><div><h1 class="page-title">${p.title}</h1><div class="page-sub">${p.adm} · ${p.family} · ${p.fc}</div></div><div class="head-actions">${visitorActions}<button class="btn" data-action="export">导出</button><button class="btn btn-primary" data-action="new" data-route="${p.route}">新增</button></div></div>
      <section class="kpi-grid"><div class="kpi"><div class="kpi-label">当前记录</div><div class="kpi-value">${p.records.length}</div><div class="kpi-foot">和盛大厦</div></div><div class="kpi"><div class="kpi-label">待处理</div><div class="kpi-value">${p.records.filter(x=>x.status==='待处理').length}</div><div class="kpi-foot">按业务时间倒序</div></div><div class="kpi"><div class="kpi-label">处理中</div><div class="kpi-value">${p.records.filter(x=>x.status==='处理中').length}</div><div class="kpi-foot">当前责任族：${p.family}</div></div><div class="kpi"><div class="kpi-label">关联集合</div><div class="kpi-value">${p.fc.split('/').length}</div><div class="kpi-foot">${p.fc}</div></div></section>
      <section class="admin-card"><div class="admin-card-head">查询条件</div><div class="admin-card-body"><div class="filter-grid"><input id="query" class="input" placeholder="请输入编号 / 主题 / 企业" value="${esc(state.query)}"><select id="status"><option value="">请选择状态</option>${["待处理","处理中","已完成","已驳回"].map(s=>`<option ${state.status===s?'selected':''}>${s}</option>`).join('')}</select><select><option>请选择项目</option><option selected>和盛大厦</option></select><div class="filter-actions"><button class="btn btn-primary" data-action="query">查询</button><button class="btn" data-action="reset">重置</button></div></div></div></section>
      <section class="admin-card"><div class="admin-card-head"><span>${p.title}记录</span><span class="tag tag-primary">${p.fc}</span></div><div class="admin-table-wrap"><table class="admin-table"><thead><tr><th style="width:155px">业务编号</th><th>主题</th><th style="width:130px">企业</th><th style="width:90px">负责人</th><th style="width:105px">状态</th><th style="width:155px">业务时间</th><th style="width:140px">操作</th></tr></thead><tbody>${view.map(r=>`<tr><td class="record-id">${esc(r.id)}</td><td>${esc(r.subject)}</td><td>${esc(r.company)}</td><td>${esc(r.owner)}</td><td><span class="status-tag ${statusClass(r.status)}">${r.status}</span></td><td>${r.time}</td><td><div class="cell-actions"><button class="btn btn-text" data-action="view" data-route="${p.route}" data-id="${r.id}">查看</button><button class="btn btn-text" data-action="process" data-route="${p.route}" data-id="${r.id}">处理</button></div></td></tr>`).join('')||`<tr><td colspan="7"><div class="empty">暂无符合条件的记录</div></td></tr>`}</tbody></table></div>${pagination(rows.length)}</section>
      <section class="admin-card"><div class="admin-card-head">双端联动摘要</div><div class="admin-card-body linkage-grid"><div class="linkage-step"><div class="linkage-label">信息来源</div><div class="linkage-text">${p.source}</div></div><div class="linkage-step"><div class="linkage-label">管理处理</div><div class="linkage-text">${p.process}</div></div><div class="linkage-step"><div class="linkage-label">返回小程序</div><div class="linkage-text">${p.feedback}</div></div></div></section>
      <section class="proto-section"><div class="proto-label">— 以下为原型设计说明，不在实际产品页面中显示 —</div><div class="admin-card"><div class="admin-card-head">原型设计说明</div><div class="admin-card-body" data-anno-id="admin.${p.route}.desc-1"><ul class="note-list"><li>本页用于评审 ${p.adm} 的功能集合和信息联动，不代表正式系统已经实现，也不据此判断业务已经闭环。</li><li>列表默认按业务时间倒序，初始化展示当前项目的全部可见范围；点击“查询”手动刷新演示结果。</li><li>“查看”进入只读详情；“处理”先展示处理信息，执行状态变化前需要再次确认。</li><li>${p.route==='operations-visitors'?'访客保留二维码、门禁授权、闸机事件、核销、离线与人工放行。':p.route==='operations-parking'?'停车只承载车辆、月租、优惠、账单、缴费和记录，不提供设备控制。':p.route==='finance-electricity'?'电费只承载账户、账单、充值、回单和入账，不提供电表管理或实时抄表。':'信息回显需在对应小程序记录或消息中继续评审。'}</li></ul></div></div></section>`;
    app.innerHTML=shell(content,p.route);
  }
  function renderDetail(p,id) {
    const r=p.records.find(x=>x.id===id)||p.records[0];
    const visitor=p.route==='operations-visitors'?`<dt>通行凭证</dt><dd>二维码已签发 · A座大堂闸机、18层门禁</dd><dt>闸机事件</dt><dd>2026-08-29 14:32:18 核销成功；离线时可由前台人工核验并确认放行</dd>`:"";
    const visitorDetailActions=p.route==='operations-visitors'?`<button class="btn btn-danger" data-action="visitor-revoke" data-route="${p.route}" data-id="${r.id}">撤销通行证</button><button class="btn" data-action="visitor-release" data-route="${p.route}" data-id="${r.id}">人工放行</button>`:"";
    const content=`<div class="page-head"><div><h1 class="page-title">${p.title}详情</h1><div class="page-sub">${p.adm} · 业务编号 ${esc(r.id)}</div></div><div class="head-actions"><button class="btn" data-action="back-list" data-route="${p.route}">返回列表</button>${visitorDetailActions}<button class="btn btn-primary" data-action="process" data-route="${p.route}" data-id="${r.id}">处理</button></div></div><section class="admin-card"><div class="admin-card-head">基础信息</div><div class="admin-card-body"><div class="readonly-tip">当前为只读详情。处理动作将单独打开确认流程。</div><dl class="detail-grid"><dt>业务编号</dt><dd>${esc(r.id)}</dd><dt>主题</dt><dd>${esc(r.subject)}</dd><dt>项目</dt><dd>和盛大厦</dd><dt>企业</dt><dd>${esc(r.company)}</dd><dt>联系人</dt><dd>陈澄 · 138****6208</dd><dt>负责人</dt><dd>${esc(r.owner)}</dd><dt>当前状态</dt><dd><span class="status-tag ${statusClass(r.status)}">${r.status}</span></dd><dt>业务时间</dt><dd>${r.time}</dd>${visitor}</dl></div></section><section class="admin-card"><div class="admin-card-head">处理记录</div><div class="admin-card-body"><div class="steps"><div class="step done"><span class="dot">✓</span><span>小程序提交<br><small>2026-08-29 09:12:00</small></span></div><div class="step active"><span class="dot">2</span><span>管理端受理<br><small>2026-08-29 09:20:00</small></span></div><div class="step"><span class="dot">3</span><span>结果回显<br><small>等待处理</small></span></div></div></div></section><section class="admin-card"><div class="admin-card-head">双端联动摘要</div><div class="admin-card-body linkage-grid"><div class="linkage-step"><div class="linkage-label">信息来源</div><div class="linkage-text">${p.source}</div></div><div class="linkage-step"><div class="linkage-label">管理处理</div><div class="linkage-text">${p.process}</div></div><div class="linkage-step"><div class="linkage-label">返回小程序</div><div class="linkage-text">${p.feedback}</div></div></div></section><section class="proto-section"><div class="proto-label">— 以下为原型设计说明，不在实际产品页面中显示 —</div><div class="admin-card"><div class="admin-card-head">原型设计说明</div><div class="admin-card-body" data-anno-id="admin.${p.route}.detail-desc-1">详情只展示演示记录；处理和访客通行状态变化使用独立确认流程。处理结果是否形成完整业务闭环需在后续评审确认。</div></div></section>`;
    app.innerHTML=shell(content,p.route);
  }
  function openDialog(opts) {
    modal.innerHTML=`<div class="admin-dialog" role="dialog" aria-modal="true"><div class="dialog-head"><span>${esc(opts.title)}</span><button class="icon-btn" data-action="modal-close" aria-label="关闭">×</button></div><div class="dialog-body">${opts.body}</div><div class="dialog-foot"><button class="btn" data-action="modal-close">取消</button>${opts.confirm?`<button class="btn btn-primary" data-action="modal-confirm" data-kind="${opts.kind||''}" data-route="${opts.route||''}" data-id="${opts.id||''}">${esc(opts.confirm)}</button>`:''}</div></div>`;
    modal.classList.add("open"); modal.setAttribute("aria-hidden","false");
  }
  function closeDialog(){modal.classList.remove("open");modal.setAttribute("aria-hidden","true");}
  function showToast(msg){toast.textContent=msg;toast.classList.add("show");clearTimeout(showToast.t);showToast.t=setTimeout(()=>toast.classList.remove("show"),2200);}
  function go(route,mode,id){location.hash=`#/${route}${mode?`/${mode}/${encodeURIComponent(id||'')}`:''}`;}
  function render(){const h=parseHash();state.route=h.route;const p=pageByRoute(h.route);if(!p)return renderHome();if(h.mode==='detail')return renderDetail(p,h.id);renderPage(p);}
  document.addEventListener("click", e => {
    const b=e.target.closest("[data-action]"); if(!b)return; const a=b.dataset.action;
    if(a==="route"){state.page=1;state.query="";state.status="";go(b.dataset.route);}
    else if(a==="link"){location.href=b.dataset.link;}
    else if(a==="role"){const rs=["运营","招商","财务","内容","超级管理员"];state.role=rs[(rs.indexOf(state.role)+1)%rs.length];showToast(`已切换为${state.role}视角`);render();}
    else if(a==="view"){go(b.dataset.route,"detail",b.dataset.id);}
    else if(a==="back-list"){go(b.dataset.route);}
    else if(a==="process"){const p=pageByRoute(b.dataset.route),r=p.records.find(x=>x.id===b.dataset.id)||p.records[0];openDialog({title:`处理 ${r.id}`,body:`<div class="readonly-tip">请核对当前记录后选择本次处理动作。</div><dl class="detail-grid"><dt>当前状态</dt><dd><span class="status-tag ${statusClass(r.status)}">${r.status}</span></dd><dt>处理动作</dt><dd>${p.actions.join(" / ")}</dd><dt>处理意见</dt><dd><textarea class="input" rows="4" maxlength="300" placeholder="请输入处理意见（最多 300 字）" style="width:100%"></textarea></dd></dl>`,confirm:"确认处理",kind:"process",route:p.route,id:r.id});}
    else if(a==="visitor-release"){openDialog({title:"人工放行",body:`<p>确认已由前台核验访客身份，并人工放行该访客吗？</p><div class="readonly-tip">确认后将记录操作人、时间和放行原因，并在访客记录中展示。</div>`,confirm:"确认放行",kind:"visitor-release",route:b.dataset.route,id:b.dataset.id});}
    else if(a==="visitor-revoke"){openDialog({title:"撤销通行证",body:`<p>确认撤销该访客通行证吗？</p><div class="readonly-tip">确认后二维码和门禁授权进入失效状态，已发生的闸机事件继续保留。</div>`,confirm:"确认撤销",kind:"visitor-revoke",route:b.dataset.route,id:b.dataset.id});}
    else if(a==="new"){openDialog({title:`新增${pageByRoute(b.dataset.route).title}记录`,body:`<div class="form-item"><label><span class="required">*</span> 主题</label><input class="input" maxlength="50" placeholder="请输入主题" style="width:100%"></div><div class="form-item" style="margin-top:12px"><label><span class="required">*</span> 企业</label><input class="input" value="星海科技" readonly style="width:100%"></div>`,confirm:"提交",kind:"new",route:b.dataset.route});}
    else if(a==="modal-close")closeDialog();
    else if(a==="modal-confirm"){const kind=b.dataset.kind,p=pageByRoute(b.dataset.route),r=p&&p.records.find(x=>x.id===b.dataset.id);b.disabled=true;b.classList.add("is-loading");b.textContent="处理中";setTimeout(()=>{if(kind==="process"&&r)r.status="处理中";if(kind==="visitor-release"&&r)r.status="已完成";if(kind==="visitor-revoke"&&r)r.status="已驳回";if(kind==="new"&&p)p.records.unshift({id:`NEW-20260829-${String(p.records.length+1).padStart(3,"0")}`,subject:`新增${p.title}记录`,company:"星海科技",owner:"待分派",status:"待处理",time:"2026-08-29 18:30:00"});closeDialog();showToast(kind==="new"?"已提交演示记录":kind==="visitor-release"?"已记录人工放行，并进入小程序访客记录":kind==="visitor-revoke"?"通行证已撤销，二维码和门禁授权已失效":"处理状态已更新，并进入小程序回显信息队列");render();},500);}
    else if(a==="query"){state.query=document.getElementById("query").value.trim();state.status=document.getElementById("status").value;state.page=1;render();showToast("已刷新查询结果");}
    else if(a==="reset"){state.query="";state.status="";state.page=1;render();}
    else if(a==="export")showToast("已生成当前筛选范围的演示导出文件");
    else if(a==="page"){const n=Number(b.dataset.page);if(n>0){state.page=n;render();}}
    else if(a==="jump"){const i=document.querySelector('[data-action="jump-input"]');const n=Number(i&&i.value);if(n>0){state.page=n;render();}}
  });
  document.addEventListener("change",e=>{if(e.target.matches('[data-action="size"]')){state.size=Number(e.target.value);state.page=1;render();}});
  window.addEventListener("hashchange",render); render();
})();

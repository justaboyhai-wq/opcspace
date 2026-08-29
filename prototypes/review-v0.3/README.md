# OPCSpace v0.3 双端功能联动评审原型

本目录是依据当前 PRD 与冻结原型重新生成的可维护评审原型，不是正式产品源码，也不代表接口、数据库或业务闭环已经实现。

## 入口

- `index.html`：双端统一评审入口、版本记录和 PRD 摘要。
- `admin/index.html`：物业管理端评审原型。
- `mini/index.html`：入驻企业小程序评审原型。
- `conventions.md`：双端共同设计、术语、范围和交互约定。
- `ia.md`：管理端与小程序页面架构及跨端演示主线。

## 需求基线

- `../../docs/prd/OPCSpace-PRD.md`
- `../../docs/prd/OPCSpace-FUNCTION-TRACEABILITY.md`

## 预览

将 `prototypes/` 作为静态站点根目录，通过标准 HTTP 静态服务打开 `/review-v0.3/`。不要直接修改旧版 `admin/assets/index-*.js` 或 `mini/assets/index-*.js` 压缩构建产物。

## 范围说明

- 普通报修保留并归属运营服务。
- 访客二维码、门禁授权、闸机事件、核销、离线和人工放行保留。
- 停车和电费只展示业务与账务信息，不展示硬件控制。
- 设备台账、物业巡检、维保告警、施工每日巡检和通用 IoT/BA 不进入本版。

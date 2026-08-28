# OPCSpace 小程序基座

本目录是 OPCSpace 根仓直接管理的 uni-app 小程序源码边界，不是 Git 子模块。正式业务将通过 `/api/app/v1/**` 与 OPCSpace 后端通信。

当前为基座快照，尚未实现 OPCSpace 的身份绑定、工单或微信生产配置。项目将以独立变更切换到 Vue 3 产品基线，并建立可重复的 CLI/CI 构建入口。

## 开源来源与许可

本目录最初导入自 RuoYi-App `master@207cb4b4566f74442b61d88435151915d3b8eb36`。适用的 MIT 许可证保留在 [LICENSE](LICENSE)；来源记录见根目录 [THIRD_PARTY_NOTICES.md](../../THIRD_PARTY_NOTICES.md)。

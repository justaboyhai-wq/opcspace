# OPCSpace 后端基座

本目录是 OPCSpace 根仓直接管理的 Java 后端源码边界，不是 Git 子模块。首期按模块化单体演进，并为下列接口提供服务边界：

- `/api/admin/v1/**`
- `/api/app/v1/**`
- `/api/callback/v1/{provider}/**`

当前为基座快照，`opc-foundation`、`opc-service`、`opc-content` 和 `opc-governance` 尚未建立。项目将以独立变更切换到 Spring Boot 3 产品基线。

## 开源来源与许可

本目录最初导入自 RuoYi-Vue `master@13db1fcef36bee9ce45d2d636a1d4e8f5ed5bbc3`。适用的 MIT 许可证保留在 [LICENSE](LICENSE)；来源记录见根目录 [THIRD_PARTY_NOTICES.md](../../THIRD_PARTY_NOTICES.md)。

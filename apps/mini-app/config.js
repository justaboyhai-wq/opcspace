// 应用全局配置
module.exports = {
  // 开发环境可由构建配置替换；不得提交生产域名或凭证。
  baseUrl: '/api/app/v1',
  // 应用信息
  appInfo: {
    // 应用名称
    name: "opcspace-mini",
    // 应用版本
    version: "0.1.0-alpha.0",
    // 应用logo
    logo: "/static/logo.png",
    // 官方网站
    site_url: "",
    // 政策协议
    agreements: [{
        title: "隐私政策",
        url: "/legal/privacy"
      },
      {
        title: "用户服务协议",
        url: "/legal/service"
      }
    ]
  }
}

和盛大厦 Web 管理端 + 小程序端 HTML 交互原型
================================================
打包日期：2026-08-26
小程序端：冻结点 0ae90c5（tag v1.0.0）
Web 管理端：冻结点 7e5c3c9（tag prototype-freeze-v1.0.1）

使用方法（Windows）
1. 请先把 ZIP 压缩包完整解压到任意文件夹，不要直接在压缩包里运行。
2. 双击 START-ALL.bat（或“启动全部-START-ALL.bat”）。
3. 浏览器会打开原型选择页，点击“小程序端”或“园区管理端”即可。
4. 使用结束后，双击 STOP.bat（或“关闭原型服务-STOP.bat”）。

单独启动（Windows）
- 只看小程序：双击 START-MINI.bat
- 只看管理端：双击 START-WEB.bat

使用方法（macOS）
1. 解压后双击 start-all.command（或“启动全部.command”）。若系统提示无法打开，请在终端执行：
   chmod +x start-all.command stop.command
   再双击。
2. 浏览器会打开原型选择页。
3. 使用结束后双击 stop.command。

访问地址
- 小程序端：http://localhost:18081/
- Web 管理端：http://localhost:18082/#/dashboard-overview

运行要求
- Windows 10 / Windows 11，或 macOS
- 无需安装 Node.js，无需安装项目依赖
- 解压后可离线运行
- 首次运行若系统弹出安全提示，请允许在本机运行；服务只监听 localhost，不对外网开放

说明
- 所有数据均为演示数据，不会提交到真实业务系统。
- 若端口被其他程序占用，请先双击关闭脚本，或关闭占用 18081 / 18082 端口的程序后重试。

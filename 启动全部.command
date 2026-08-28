#!/bin/bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT"
mkdir -p "$ROOT/tools"

if lsof -nP -iTCP:18081 -sTCP:LISTEN >/dev/null 2>&1; then
  echo "端口 18081 已被占用，请先运行 关闭原型服务.command"
  exit 1
fi
if lsof -nP -iTCP:18082 -sTCP:LISTEN >/dev/null 2>&1; then
  echo "端口 18082 已被占用，请先运行 关闭原型服务.command"
  exit 1
fi

python3 -m http.server 18081 --bind 127.0.0.1 --directory "$ROOT/prd-demo/mini" >/dev/null 2>&1 &
echo $! > "$ROOT/tools/mini.pid"
python3 -m http.server 18082 --bind 127.0.0.1 --directory "$ROOT/prd-demo/admin" >/dev/null 2>&1 &
echo $! > "$ROOT/tools/web.pid"
sleep 1
open "$ROOT/index.html"
echo "已启动：小程序 http://localhost:18081/  管理端 http://localhost:18082/"
echo "关闭请双击 关闭原型服务.command"

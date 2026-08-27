#!/bin/bash
set -u
ROOT="$(cd "$(dirname "$0")" && pwd)"
for f in "$ROOT/tools/mini.pid" "$ROOT/tools/web.pid"; do
  if [ -f "$f" ]; then
    pid="$(cat "$f")"
    if [ -n "$pid" ] && kill -0 "$pid" 2>/dev/null; then
      kill "$pid" 2>/dev/null || true
    fi
    rm -f "$f"
  fi
done
echo "Prototype services stopped."
sleep 1

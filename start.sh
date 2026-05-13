#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$ROOT_DIR/brsms-demo/backend"
FRONTEND_DIR="$ROOT_DIR/brsms-demo/frontend"

BACKEND_PORT="${PORT:-3000}"
FRONTEND_HOST="${VITE_HOST:-0.0.0.0}"
FRONTEND_PORT="${VITE_PORT:-5173}"
API_ORIGIN="${VITE_API_ORIGIN:-http://localhost:${BACKEND_PORT}}"
WS_ORIGIN="${VITE_WS_ORIGIN:-ws://localhost:${BACKEND_PORT}}"

PIDS=()

cleanup() {
  for pid in "${PIDS[@]:-}"; do
    if kill -0 "$pid" 2>/dev/null; then
      kill "$pid" 2>/dev/null || true
    fi
  done
}

trap cleanup EXIT INT TERM

require_command() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "Missing command: $1" >&2
    exit 1
  fi
}

ensure_port_free() {
  local port="$1"
  if command -v lsof >/dev/null 2>&1 && lsof -nP -iTCP:"$port" -sTCP:LISTEN >/dev/null 2>&1; then
    echo "Port $port is already in use. Stop the existing process or set another port." >&2
    exit 1
  fi
}

ensure_node_modules() {
  local dir="$1"
  if [ ! -d "$dir/node_modules" ]; then
    echo "Installing dependencies in $dir ..."
    (cd "$dir" && npm install)
  fi
}

wait_for_url() {
  local url="$1"
  local name="$2"
  local retries=30

  if ! command -v curl >/dev/null 2>&1; then
    return 0
  fi

  until curl -fsS "$url" >/dev/null 2>&1; do
    retries=$((retries - 1))
    if [ "$retries" -le 0 ]; then
      echo "$name did not become ready: $url" >&2
      exit 1
    fi
    sleep 1
  done
}

require_command node
require_command npm
ensure_port_free "$BACKEND_PORT"
ensure_port_free "$FRONTEND_PORT"
ensure_node_modules "$BACKEND_DIR"
ensure_node_modules "$FRONTEND_DIR"

echo "Starting backend on http://localhost:${BACKEND_PORT}"
(cd "$BACKEND_DIR" && PORT="$BACKEND_PORT" npm run dev) &
PIDS+=("$!")

wait_for_url "http://localhost:${BACKEND_PORT}/api/manage/metadata" "Backend"

echo "Starting frontend on http://localhost:${FRONTEND_PORT}"
(
  cd "$FRONTEND_DIR"
  VITE_API_ORIGIN="$API_ORIGIN" \
    VITE_WS_ORIGIN="$WS_ORIGIN" \
    npm run dev -- --host "$FRONTEND_HOST" --port "$FRONTEND_PORT"
) &
PIDS+=("$!")

wait_for_url "http://localhost:${FRONTEND_PORT}" "Frontend"

cat <<EOF

Project is running:
- Frontend: http://localhost:${FRONTEND_PORT}/
- Backend:  http://localhost:${BACKEND_PORT}
- WebSocket: ${WS_ORIGIN}/ws

Press Ctrl+C to stop all services.
EOF

while true; do
  for pid in "${PIDS[@]}"; do
    if ! kill -0 "$pid" 2>/dev/null; then
      echo "A service exited unexpectedly." >&2
      exit 1
    fi
  done
  sleep 1
done

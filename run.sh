#!/usr/bin/env bash
# Prompt Improver — start both backend and frontend
# Usage: bash run.sh

set -e

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "=== Prompt Improver ==="
echo ""

# Install backend dependencies
echo "[1/4] Installing backend dependencies..."
cd "$ROOT_DIR/backend"
npm install --silent

# Install frontend dependencies
echo "[2/4] Installing frontend dependencies..."
cd "$ROOT_DIR/frontend"
npm install --silent

# Create .env if it doesn't exist
if [ ! -f "$ROOT_DIR/backend/.env" ]; then
  echo "[3/4] Creating backend/.env from .env.example (mock LLM mode)..."
  cp "$ROOT_DIR/backend/.env.example" "$ROOT_DIR/backend/.env"
else
  echo "[3/4] backend/.env already exists, skipping..."
fi

# Start both servers
echo "[4/4] Starting servers..."
echo ""
echo "  Backend:  http://localhost:3001"
echo "  Frontend: http://localhost:5173"
echo ""
echo "  Press Ctrl+C to stop both."
echo ""

# Start backend in background
cd "$ROOT_DIR/backend"
node server.js &
BACKEND_PID=$!

# Start frontend in foreground
cd "$ROOT_DIR/frontend"
npx vite --host &
FRONTEND_PID=$!

# Trap Ctrl+C to kill both
trap "echo ''; echo 'Shutting down...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit 0" INT TERM

# Wait for either to exit
wait

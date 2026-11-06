#!/bin/bash
set -e

# Kill any existing processes using ports 3000 and 8001
for port in 3000 8001; do
  pids=$(lsof -ti tcp:"$port" || true)
  if [ -n "$pids" ]; then
    kill -9 $pids 2>/dev/null || true
  fi
done

echo "============================================="
echo "        Starting MedSync Clinical OS         "
echo "============================================="

# Setup PaddleOCR cache directory inside workspace to avoid permission issues
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
export PADDLE_PDX_CACHE_HOME="${SCRIPT_DIR}/.paddlex"
export PADDLE_HOME="${SCRIPT_DIR}/.paddle"
export PADDLE_PDX_DISABLE_MODEL_SOURCE_CHECK="True"
mkdir -p "${SCRIPT_DIR}/.paddlex" "${SCRIPT_DIR}/.paddle"

# 1. Start Backend (redirect output to backend.log)
echo "Starting FastAPI Backend on port 8001..."
PYTHONPATH=. backend/venv/bin/uvicorn backend.app.main:app --host 0.0.0.0 --port 8001 --reload > backend.log 2>&1 &
BACKEND_PID=$!

# 2. Start Frontend (redirect output to frontend.log)
echo "Starting Next.js Frontend on port 3000..."
npm --prefix frontend run dev > frontend.log 2>&1 &
FRONTEND_PID=$!

# Cleanup trap to stop both child processes when the script exits
cleanup() {
  kill "$BACKEND_PID" "$FRONTEND_PID" 2>/dev/null || true
}
trap cleanup INT TERM EXIT

echo ""
echo "MedSync Services Running:"
echo " -> Frontend: http://localhost:3000"
echo " -> Backend API: http://localhost:8001"
echo " -> Interactive Docs: http://localhost:8001/api/docs"
echo ""
echo "Demo Accounts:"
echo " - Patient:   patient@medsync.io   (pass: password123)"
echo " - Doctor:    doctor@medsync.io    (pass: password123)"
echo " - Paramedic: paramedic@medsync.io (pass: password123)"
echo " - Admin:     admin@medsync.io     (pass: password123)"
echo ""

wait

#!/bin/bash
set -e
echo "=== SP Granites Build ==="
echo "Node: $(node --version)"
echo "Working dir: $(pwd)"

if [ ! -d "node_modules" ]; then
  echo "Step 0: Installing dependencies..."
  npm install
fi

echo "Step 1: Building frontend with Vite..."
./node_modules/.bin/vite build

echo "Step 2: Compiling server with esbuild..."
mkdir -p dist-server
./node_modules/.bin/esbuild server/index.ts --bundle --platform=node --target=node20 --outfile=dist-server/index.js --format=esm --packages=external

echo "=== Build succeeded ==="

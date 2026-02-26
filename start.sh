#!/bin/bash
kill -9 $(lsof -t -i:5000) 2>/dev/null
kill -9 $(lsof -t -i:3001) 2>/dev/null
PORT=3001 node_modules/.bin/tsx server/index.ts &
node_modules/.bin/vite

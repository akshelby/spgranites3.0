#!/bin/bash
PORT=3001 node_modules/.bin/tsx server/index.ts &
node_modules/.bin/vite

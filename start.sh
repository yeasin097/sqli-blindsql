#!/bin/sh
cd /app/backend && node server.js &
cd /app/frontend && npm run dev
#!/bin/bash

# Start backend
cd /app/backend
node server.js &

# Start frontend
cd /app/frontend
npm run dev -- --host 0.0.0.0

# Keep container running
wait

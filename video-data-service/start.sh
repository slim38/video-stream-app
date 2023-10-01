#!/bin/sh

npx prisma migrate dev
node dist/main.js
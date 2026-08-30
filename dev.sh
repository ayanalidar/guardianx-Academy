#!/bin/bash
export DATABASE_URL='postgresql://neondb_owner:npg_HaLfn1qG3JPR@ep-raspy-firefly-azeivku9-pooler.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require'
export NEXTAUTH_SECRET='guardianx-dev-secret-key-change-in-prod-9f7b'
export NEXTAUTH_URL='http://localhost:3000'
exec ./node_modules/.bin/next dev -p 3000 2>&1 | tee dev.log

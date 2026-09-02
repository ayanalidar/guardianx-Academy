#!/bin/bash
# Admin-view verification — single bash command, per task spec. (v3 — proven refs)
set +e
cd /home/z/my-project

echo "========================================================"
echo "STEP 1 — Clean stale Turbopack temp files"
echo "========================================================"
find tool-results -name ".*" -type f -delete 2>/dev/null
echo "done"

echo "========================================================"
echo "STEP 2 — Start the dev server (background, log to dev.log)"
echo "========================================================"
( ./node_modules/.bin/next dev -p 3000 > /home/z/my-project/dev.log 2>&1 ) & DEV_PID=$!
echo "DEV_PID=$DEV_PID"

cleanup() {
  echo "Cleaning up dev server (PID $DEV_PID)..."
  kill $DEV_PID 2>/dev/null
  wait $DEV_PID 2>/dev/null
}
trap cleanup EXIT

echo "Waiting for dev server to be ready..."
for i in $(seq 1 60); do
  if curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/ 2>/dev/null | grep -qE "200|307|308"; then
    echo "Dev server responding (after ${i}s)"
    break
  fi
  sleep 1
done

echo "Warming up homepage + auth + admin APIs (curl, with auth)..."
COOKIE_JAR=$(mktemp)
CSRF=$(curl -s -c "$COOKIE_JAR" http://localhost:3000/api/auth/csrf | python3 -c "import sys,json; print(json.load(sys.stdin).get('csrfToken',''))" 2>/dev/null)
echo "csrf token: ${CSRF:0:24}..."
curl -s -b "$COOKIE_JAR" -c "$COOKIE_JAR" -o /dev/null -w "POST /api/auth/callback/credentials HTTP %{http_code}\n" \
  -X POST http://localhost:3000/api/auth/callback/credentials \
  -H "Content-Type: application/x-www-form-urlencoded" \
  --data "csrfToken=${CSRF}&email=admin@guardianx.io&password=admin123&redirect=http://localhost:3000/&json=true"

echo ""
echo "========================================================"
echo "STEP 3 — curl-probe the 3 admin APIs (proves DB queries work)"
echo "========================================================"
echo ""
echo "--- GET /api/admin/instructors ---"
curl -s -b "$COOKIE_JAR" http://localhost:3000/api/admin/instructors | python3 -c "
import sys, json
d = json.load(sys.stdin)
print('count:', d.get('count'))
print('instructors:')
for i in d.get('instructors', []):
    print('  - id=' + i['id'])
    print('    name=' + i['name'] + ', email=' + i['email'] + ', title=' + (i.get('title') or ''))
    print('    role=' + i['role'] + ', taughtCourses=' + str(i.get('taughtCourses', 0)))
"
echo ""
echo "--- GET /api/admin/students ---"
curl -s -b "$COOKIE_JAR" http://localhost:3000/api/admin/students | python3 -c "
import sys, json
d = json.load(sys.stdin)
print('count:', d.get('count'), 'total:', d.get('total'))
print('students:')
for s in d.get('students', []):
    print('  - ' + s['name'] + ' <' + s['email'] + '> (id=' + s['id'][:18] + '...)')
    print('    enrollments=' + str(s.get('enrollmentCount', 0)) + ', completed=' + str(s.get('completedCount', 0)) + ', labs=' + str(s.get('labCount', 0)) + ', certs=' + str(s.get('certCount', 0)) + ', xp=' + str(s.get('xp', 0)) + ', lvl=' + str(s.get('level', 1)))
"
echo ""
echo "--- GET /api/admin/training-batches ---"
curl -s -b "$COOKIE_JAR" http://localhost:3000/api/admin/training-batches | python3 -c "
import sys, json
d = json.load(sys.stdin)
print('count:', d.get('count'))
print('batches:')
for b in d.get('batches', []):
    print('  - ' + b.get('certification', '?') + ' | ' + b.get('name', '?') + ' | status=' + b.get('status', '?') + ' | starts=' + b.get('startDate', '?') + ' | instructor=' + b.get('instructor', '?'))
    keys = sorted(b.keys())
    print('    fields:', ', '.join(keys))
"
echo ""

echo "========================================================"
echo "STEP 4 — Browser: warm homepage, login as admin (refs e28/e29/e25)"
echo "========================================================"
agent-browser close >/dev/null 2>&1 || true
agent-browser open http://localhost:3000/ >/dev/null 2>&1
agent-browser wait 8000 >/dev/null 2>&1
agent-browser wait --text "Master Cyber Security" --timeout 30000 >/dev/null 2>&1 || true
echo "Homepage loaded."

agent-browser open http://localhost:3000/#/login >/dev/null 2>&1
agent-browser wait 3000 >/dev/null 2>&1
agent-browser wait --text "Sign in to continue" --timeout 30000 2>&1 | head -1
agent-browser wait 1500 >/dev/null 2>&1
echo "Login page loaded. Refreshing refs via snapshot -i..."
agent-browser snapshot -i 2>&1 | grep -E "textbox|button \"Sign In\"" | head -10
echo "Filling credentials..."
agent-browser fill @e28 "admin@guardianx.io" 2>&1 | head -1
agent-browser fill @e29 "admin123" 2>&1 | head -1
agent-browser click @e25 2>&1 | head -1
echo "Sign In clicked. Waiting for redirect..."
for i in $(seq 1 20); do
  URL=$(agent-browser get url 2>/dev/null | head -1)
  if echo "$URL" | grep -qE "/admin|/dashboard"; then
    echo "Redirected to: $URL (after ${i}s)"
    break
  fi
  sleep 1
done
agent-browser wait 3000 >/dev/null 2>&1
agent-browser wait --load networkidle >/dev/null 2>&1 || true
echo "Post-login URL: $(agent-browser get url 2>/dev/null | head -1)"

echo ""
echo "========================================================"
echo "STEP 5 — Navigate to Instructor Assignment view"
echo "========================================================"
agent-browser open http://localhost:3000/#/admin-instructor-assignment >/dev/null 2>&1
echo "Waiting for instructor-assignment view..."
for i in $(seq 1 30); do
  TEXT=$(agent-browser snapshot 2>/dev/null)
  if echo "$TEXT" | grep -q "Instructor Assignment Manager"; then
    echo "Instructor Assignment view loaded (after ${i}s)"
    break
  fi
  sleep 1
done
agent-browser wait 3000 >/dev/null 2>&1

echo "--- Snapshot of admin-instructor-assignment view (full) ---"
agent-browser snapshot 2>&1 | head -150

echo ""
echo "========================================================"
echo "STEP 6 — Navigate to Student Progress view"
echo "========================================================"
agent-browser open http://localhost:3000/#/admin-student-progress >/dev/null 2>&1
echo "Waiting for student-progress view..."
for i in $(seq 1 30); do
  TEXT=$(agent-browser snapshot 2>/dev/null)
  if echo "$TEXT" | grep -q "Student Progress Overview"; then
    echo "Student Progress view loaded (after ${i}s)"
    break
  fi
  sleep 1
done
agent-browser wait 3000 >/dev/null 2>&1

echo "--- Snapshot of admin-student-progress view (full) ---"
agent-browser snapshot 2>&1 | head -150

echo ""
echo "========================================================"
echo "STEP 7 — Navigate to Batch Calendar view"
echo "========================================================"
agent-browser open http://localhost:3000/#/admin-batch-calendar >/dev/null 2>&1
echo "Waiting for batch-calendar view shell..."
for i in $(seq 1 60); do
  TEXT=$(agent-browser snapshot 2>/dev/null)
  if echo "$TEXT" | grep -q "Batch Calendar"; then
    echo "Batch Calendar view shell loaded (after ${i}s)"
    break
  fi
  sleep 1
done
echo "Waiting for batch content..."
for i in $(seq 1 60); do
  TEXT=$(agent-browser snapshot 2>/dev/null)
  if echo "$TEXT" | grep -q "Upcoming Batches\|No training batches yet"; then
    echo "Batch Calendar content loaded (after ${i}s)"
    break
  fi
  sleep 1
done
agent-browser wait 3000 >/dev/null 2>&1

echo "--- Snapshot of admin-batch-calendar view (full) ---"
agent-browser snapshot 2>&1 | head -200

echo ""
echo "========================================================"
echo "STEP 8 — Click a batch on the calendar (verify edit dialog)"
echo "========================================================"
# Snapshot interactive to find a clickable batch button
agent-browser snapshot -i 2>&1 | grep -iE "Security|CEH|CCNA|CISSP" | head -10
# Click the first batch-cert button we can find by text
agent-browser find text "Security+" click 2>&1 | head -3 || true
agent-browser wait 2000 >/dev/null 2>&1
echo "--- After clicking a batch ---"
agent-browser snapshot 2>&1 | head -50

echo ""
echo "========================================================"
echo "STEP 9 — Done. Closing browser."
echo "========================================================"
agent-browser close >/dev/null 2>&1 || true
rm -f "$COOKIE_JAR"

echo "========================================================"
echo "Tail of dev.log (last 20 lines)"
echo "========================================================"
tail -20 /home/z/my-project/dev.log

echo "========================================================"
echo "VERIFICATION COMPLETE"
echo "========================================================"

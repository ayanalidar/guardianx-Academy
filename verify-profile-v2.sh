#!/usr/bin/env bash
# Verify profile editing features — admin + student flows.
# Run from /home/z/my-project.

set -u

PROJECT=/home/z/my-project
cd "$PROJECT"

echo "==[1/10]== Clean tool-results temp files"
find tool-results -name ".*" -type f -delete 2>/dev/null
echo "  done"

echo "==[2/10]== Start dev server (port 3000)"
( ./node_modules/.bin/next dev -p 3000 > /home/z/my-project/dev.log 2>&1 ) &
DEV_PID=$!
echo "  dev_pid=$DEV_PID"
# Wait for the dev server to start
for i in $(seq 1 60); do
  if curl -sf http://localhost:3000/ -o /dev/null 2>/dev/null; then
    echo "  server ready after ${i}s"
    break
  fi
  sleep 1
done

echo "==[3/10]== Warm-up curl — homepage + login + APIs"
curl -sf http://localhost:3000/ -o /dev/null
# Warm the next-auth + me endpoints (just to trigger compilation)
curl -sf http://localhost:3000/api/auth/providers -o /dev/null
echo "  curl warm-up done"

echo "==[4/10]== Set agent-browser session"
export AGENT_BROWSER_SESSION="$(agent-browser session id --scope worktree --prefix profile-v2)"
echo "  session=$AGENT_BROWSER_SESSION"

echo "==[5/10]== Open browser + navigate to login"
agent-browser open "http://localhost:3000/#/login" > /dev/null
agent-browser wait --load networkidle
# Navigate explicitly to login hash
agent-browser open "http://localhost:3000/#/login" > /dev/null
agent-browser wait --load networkidle
agent-browser snapshot -i

echo "==[6/10]== Fill admin credentials + sign in"
# Find the email/password inputs (Sign In tab is default)
agent-browser find label "Email" fill "admin@guardianx.io"
agent-browser find label "Password" fill "admin123"
# Click the Sign In submit button (it's the type=submit button)
agent-browser find role button click --name "Sign In"
agent-browser wait --load networkidle
# Wait a moment for SPA route transition
sleep 2
agent-browser wait --url "**/admin**"
echo "  admin logged in — url:"
agent-browser get url

echo "==[7/10]== Navigate to #/profile as admin"
agent-browser open "http://localhost:3000/#/profile" > /dev/null
agent-browser wait --load networkidle
sleep 3
agent-browser wait --text "Edit Profile"
echo "  --- ADMIN PROFILE SNAPSHOT (interactive) ---"
agent-browser snapshot -i
echo "  --- ADMIN PROFILE PAGE TEXT ---"
agent-browser read
echo "  --- taking admin screenshot ---"
agent-browser screenshot "$PROJECT/agent-ctx/profile-admin.png"

echo "==[8/10]== Logout (clear session) + login as student"
# Close the existing browser session and start a fresh one to clear cookies.
agent-browser close
export AGENT_BROWSER_SESSION="$(agent-browser session id --scope worktree --prefix profile-student)"
echo "  new session=$AGENT_BROWSER_SESSION"
agent-browser open "http://localhost:3000/#/login" > /dev/null
agent-browser wait --load networkidle
sleep 1
agent-browser snapshot -i

# Fill student credentials
agent-browser find label "Email" fill "student@guardianx.io"
agent-browser find label "Password" fill "student123"
agent-browser find role button click --name "Sign In"
agent-browser wait --load networkidle
sleep 2
agent-browser wait --url "**/dashboard**"
echo "  student logged in — url:"
agent-browser get url

echo "==[9/10]== Navigate to #/profile as student"
agent-browser open "http://localhost:3000/#/profile" > /dev/null
agent-browser wait --load networkidle
sleep 3
agent-browser wait --text "Edit Profile"
echo "  --- STUDENT PROFILE SNAPSHOT (interactive) ---"
agent-browser snapshot -i
echo "  --- STUDENT PROFILE PAGE TEXT ---"
agent-browser read
echo "  --- taking student screenshot ---"
agent-browser screenshot "$PROJECT/agent-ctx/profile-student.png"

echo "==[10/10]== Close browser + tail dev.log + kill dev server"
agent-browser close
echo "  --- dev.log tail (last 30 lines) ---"
tail -30 /home/z/my-project/dev.log
kill $DEV_PID 2>/dev/null
wait $DEV_PID 2>/dev/null
echo "=== verify done ==="

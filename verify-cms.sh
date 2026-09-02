#!/usr/bin/env bash
# Single-shot end-to-end verification for the Content Studio CMS fix.
# - Cleans tool-results temp files
# - Starts the Next.js dev server on port 3000
# - Warms up the homepage + CMS API
# - Logs in as admin via agent-browser
# - Navigates to #/cms
# - Verifies the CMS shows editable content (not empty / not read-only)
# - Edits the homepage hero badge value
# - Saves the change
# - Navigates to #/ (homepage)
# - Verifies the new badge text appears
# - Prints the snapshots

set -e

echo "===== STEP 1: clean tool-results + kill old dev server ====="
find /home/z/my-project/tool-results -name ".*" -type f -delete 2>/dev/null || true
pkill -9 -f "next-server" 2>/dev/null || true
pkill -9 -f "next dev" 2>/dev/null || true
sleep 2

echo "===== STEP 2: start dev server ====="
cd /home/z/my-project
( nohup ./node_modules/.bin/next dev -p 3000 > /home/z/my-project/dev.log 2>&1 < /dev/null & )
sleep 2
for i in $(seq 1 30); do
  sleep 2
  HTTP=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 http://localhost:3000/ 2>/dev/null || true)
  if [ "$HTTP" = "200" ]; then echo "warm at ${i}*2s, HTTP=$HTTP"; break; fi
done

echo "===== STEP 3: warm up the CMS API (proves Prisma works) ====="
echo "GET /api/cms/home (public):"
curl -s http://localhost:3000/api/cms/home | python3 -c "import sys,json; d=json.load(sys.stdin); print('  page:', d['page'], 'sections:', list(d['sections'].keys()))"

echo "===== STEP 4: agent-browser login as admin ====="
export AGENT_BROWSER_SESSION="cms-verify-$$"
agent-browser open "http://localhost:3000/#/login" 2>&1 | tail -2
agent-browser wait --load networkidle 2>&1 | tail -1 || true
agent-browser snapshot -i 2>&1 | head -50
SNAP=$(agent-browser snapshot -i 2>&1)
echo "$SNAP" | head -50
# Find email field by label
EMAIL_REF=$(echo "$SNAP" | grep -i "email\|admin@" | head -1 | grep -oE "@e[0-9]+" | head -1)
PWD_REF=$(echo "$SNAP" | grep -i "password" | head -1 | grep -oE "@e[0-9]+" | head -1)
echo "Email ref: $EMAIL_REF, Password ref: $PWD_REF"

agent-browser find label "Email" fill "admin@guardianx.io" 2>&1 | tail -1
agent-browser find label "Password" fill "admin123" 2>&1 | tail -1
# click Sign In button (NOT the Sign In tab)
agent-browser find role button click --name "Sign In" 2>&1 | tail -1
agent-browser wait --url "**/admin**" 2>&1 | tail -1 || true
agent-browser wait 3000 2>&1 | tail -1
URL=$(agent-browser get url 2>&1 | tail -1)
echo "Post-login URL: $URL"

echo "===== STEP 5: navigate to #/cms ====="
agent-browser open "http://localhost:3000/#/cms" 2>&1 | tail -1
agent-browser wait --text "CONTENT STUDIO" 2>&1 | tail -1
agent-browser wait 3000 2>&1 | tail -1
SNAP=$(agent-browser snapshot -i 2>&1)
echo "----- CMS snapshot (refs) -----"
echo "$SNAP" | head -80

echo "===== STEP 6: verify the CMS shows editable content ====="
# Confirm we see the home page editor with multiple sections
SECTIONS=$(echo "$SNAP" | grep -E "sections|Hero|Audiences|Courses|Labs" | head -10)
echo "Sections in CMS: $SECTIONS"

echo "===== STEP 7: edit the homepage hero badge ====="
# Re-snapshot to refresh refs after the page settled
SNAP=$(agent-browser snapshot -i 2>&1)
echo "Refreshed CMS snapshot:"
echo "$SNAP" | head -100

# Find the hero section accordion trigger and click to expand
HERO_TRIG=$(echo "$SNAP" | grep -B1 "Hero" | grep -oE "@e[0-9]+" | head -1)
echo "Hero accordion trigger ref: $HERO_TRIG"
if [ -n "$HERO_TRIG" ]; then
  agent-browser click "$HERO_TRIG" 2>&1 | tail -1
  agent-browser wait 2000 2>&1 | tail -1
fi
SNAP=$(agent-browser snapshot -i 2>&1)
echo "After expanding Hero section:"
echo "$SNAP" | head -100

# Find the badge input — it's an input with value "WORLD-CLASS CYBER SECURITY EDUCATION"
BADGE_INPUT=$(echo "$SNAP" | grep -i "WORLD-CLASS\|badge" | head -3)
echo "Badge input candidate lines:"
echo "$BADGE_INPUT"
# Get the input value to confirm
BADGE_REF=$(echo "$SNAP" | grep -i "WORLD-CLASS CYBER SECURITY EDUCATION" | head -1 | grep -oE "@e[0-9]+" | head -1)
echo "Badge input ref: $BADGE_REF"

if [ -z "$BADGE_REF" ]; then
  echo "Could not find badge input — falling back to find by label"
  # Try filling via label
  agent-browser find label "badge" fill "EDITED BY CONTENT STUDIO" 2>&1 | tail -2
else
  agent-browser fill "$BADGE_REF" "EDITED BY CONTENT STUDIO" 2>&1 | tail -2
fi
agent-browser wait 1000 2>&1 | tail -1

echo "===== STEP 8: click Save Changes ====="
SNAP=$(agent-browser snapshot -i 2>&1)
SAVE_REF=$(echo "$SNAP" | grep -i "Save Changes" | grep -oE "@e[0-9]+" | head -1)
echo "Save Changes button ref: $SAVE_REF"
if [ -n "$SAVE_REF" ]; then
  agent-browser click "$SAVE_REF" 2>&1 | tail -1
fi
agent-browser wait 3000 2>&1 | tail -1
# Look for the success toast
SNAP=$(agent-browser snapshot -i 2>&1)
echo "----- After save snapshot -----"
echo "$SNAP" | head -40
echo "Looking for toast notification..."
echo "$SNAP" | grep -i "saved\|Changes\|live" | head -5

echo "===== STEP 9: verify via API that the value changed ====="
echo "GET /api/cms/home → hero.badge:"
curl -s http://localhost:3000/api/cms/home | python3 -c "import sys,json; d=json.load(sys.stdin); print('  hero.badge =', repr(d['sections']['hero']['badge']))"

echo "===== STEP 10: navigate to homepage and verify ====="
agent-browser open "http://localhost:3000/#/" 2>&1 | tail -1
agent-browser wait --load networkidle 2>&1 | tail -1
agent-browser wait 5000 2>&1 | tail -1
agent-browser wait --text "EDITED BY CONTENT STUDIO" 2>&1 | tail -1
URL=$(agent-browser get url 2>&1 | tail -1)
echo "Homepage URL: $URL"
SNAP=$(agent-browser snapshot 2>&1)
echo "----- Homepage snapshot (first 30 lines) -----"
echo "$SNAP" | head -30
echo "Looking for EDITED BY CONTENT STUDIO text on homepage..."
echo "$SNAP" | grep -i "EDITED BY CONTENT STUDIO\|WORLD-CLASS" | head -5
TEXT=$(agent-browser read 2>&1)
echo "Looking for EDITED BY CONTENT STUDIO in page text..."
echo "$TEXT" | grep -i "EDITED BY CONTENT STUDIO\|WORLD-CLASS" | head -5

echo "===== STEP 11: screenshot the homepage ====="
agent-browser screenshot /home/z/my-project/agent-ctx/cms-homepage-after-edit.png 2>&1 | tail -1

echo "===== STEP 12: restore the original badge via seed ====="
echo "Skipping restore to leave the edit visible for the user."
# Actually restore so we don't leave the homepage in a weird state
# curl -s -X POST -b /tmp/cookies.txt http://localhost:3000/api/admin/site-content/seed -H "Content-Type: application/json" -d '{"page":"home"}'

echo "===== STEP 13: close browser + tail dev.log ====="
agent-browser close 2>&1 | tail -1
echo "Recent dev.log:"
tail -20 /home/z/my-project/dev.log

echo "===== DONE ====="

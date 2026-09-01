#!/bin/bash
# GuardianX Lab Platform — Build & Push Script
# 
# Builds all Docker images for the lab platform and pushes them to a registry.
#
# Usage:
#   ./docker/build-and-push.sh              # Build all
#   ./docker/build-and-push.sh kali         # Build only Kali attack image
#   ./docker/build-and-push.sh sqli         # Build only SQLi target
#   REGISTRY=registry.example.com ./docker/build-and-push.sh  # Custom registry

set -e

REGISTRY="${REGISTRY:-guardianx}"
TAG="${TAG:-latest}"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

log() { echo -e "${GREEN}[build]${NC} $1"; }
warn() { echo -e "${YELLOW}[warn]${NC} $1"; }
info() { echo -e "${CYAN}[info]${NC} $1"; }

# Check Docker
if ! command -v docker &> /dev/null; then
  echo "❌ Docker is not installed. Install it first: curl -fsSL https://get.docker.com | sh"
  exit 1
fi

# === Image definitions ===
declare -A IMAGES=(
  ["kali-attack"]="kali-attack"
  ["sqli"]="lab-sqli-target"
  ["nmap"]="lab-nmap-target"
  ["privesc"]="lab-privesc-target"
  ["xss"]="lab-xss-target"
  ["cmd-injection"]="lab-cmd-injection-target"
  ["jwt"]="lab-jwt-target"
  ["ssrf"]="lab-ssrf-target"
  ["traversal"]="lab-traversal-target"
  ["generic"]="lab-generic-target"
  ["idor"]="lab-idor-target"
  ["log4shell"]="lab-log4shell-target"
  ["re-crackme"]="lab-re-crackme-target"
)

# === Build function ===
build_image() {
  local short_name=$1
  local dir_name=${IMAGES[$short_name]}
  local image_name="${REGISTRY}/${dir_name}:${TAG}"
  local dir="${SCRIPT_DIR}/${dir_name}"
  
  if [ ! -d "$dir" ]; then
    warn "Directory not found: $dir — skipping ${short_name}"
    return 0
  fi
  
  log "Building ${image_name} from ${dir}..."
  docker build -t "$image_name" "$dir"
  log "✅ Built ${image_name}"
}

# === Push function ===
push_image() {
  local short_name=$1
  local dir_name=${IMAGES[$short_name]}
  local image_name="${REGISTRY}/${dir_name}:${TAG}"
  
  if [ "$REGISTRY" = "guardianx" ]; then
    info "Skipping push (no registry configured). Images are local only."
    return 0
  fi
  
  log "Pushing ${image_name}..."
  docker push "$image_name"
  log "✅ Pushed ${image_name}"
}

# === Main ===
TARGET="${1:-all}"

log "🚀 GuardianX Lab Platform — Docker Image Builder"
info "Registry: ${REGISTRY}"
info "Tag: ${TAG}"
echo ""

if [ "$TARGET" = "all" ]; then
  log "Building ALL images..."
  for short_name in "${!IMAGES[@]}"; do
    build_image "$short_name"
    echo ""
  done
  
  log "Pushing ALL images..."
  for short_name in "${!IMAGES[@]}"; do
    push_image "$short_name"
  done
else
  if [[ -v "IMAGES[$TARGET]" ]]; then
    build_image "$TARGET"
    push_image "$TARGET"
  else
    echo "❌ Unknown target: $TARGET"
    echo "Available: ${!IMAGES[*]}"
    exit 1
  fi
fi

echo ""
log "✅ Done! Built images:"
docker images | grep "${REGISTRY}/" | head -20

echo ""
info "To start the platform: docker-compose up -d"
info "To verify: curl http://localhost:3004/health"

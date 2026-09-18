#!/bin/bash
# deploy-to-koyeb.sh — Perissos CMS MVP Deployment Script
# Usage: ./deploy-to-koyeb.sh [service]
# Services: payload, casdoor, apisix, all

set -e

REGISTRY="ghcr.io/perissos"
PROJECT="perissos-cms"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}🚀 Perissos CMS MVP Deployment${NC}"
echo -e "${YELLOW}================================${NC}"

# Check prerequisites
check_prerequisites() {
  echo -e "${GREEN}📋 Checking prerequisites...${NC}"
  command -v docker >/dev/null 2>&1 || { echo -e "${RED}❌ Docker is required${NC}"; exit 1; }
  command -v docker-compose >/dev/null 2>&1 || { echo -e "${RED}❌ docker-compose is required${NC}"; exit 1; }
  echo -e "${GREEN}✅ Prerequisites met${NC}"
}

# Build Docker images
build_images() {
  echo -e "${GREEN}🏗️  Building Docker images...${NC}"

  # Payload
  echo -e "${YELLOW}  → Building Payload...${NC}"
  docker build -t ${REGISTRY}/backoffice:latest -f apps/backoffice/Dockerfile .

  # Casdoor
  echo -e "${YELLOW}  → Building Casdoor...${NC}"
  docker build -t ${REGISTRY}/casdoor:latest -f apps/casdoor/Dockerfile .

  # APISIX
  echo -e "${YELLOW}  → Building APISIX...${NC}"
  docker build -t ${REGISTRY}/apisix:latest -f apps/apisix/Dockerfile .

  echo -e "${GREEN}✅ All images built${NC}"
}

# Push to GitHub Container Registry
push_images() {
  echo -e "${GREEN}📤 Pushing images to ghcr.io...${NC}"
  docker push ${REGISTRY}/backoffice:latest
  docker push ${REGISTRY}/casdoor:latest
  docker push ${REGISTRY}/apisix:latest
  echo -e "${GREEN}✅ Images pushed${NC}"
}

# Deploy to Koyeb
deploy_koyeb() {
  echo -e "${GREEN}☁️  Deploying to Koyeb...${NC}"

  # Create Koyeb app if not exists
  # koyeb app create perissos-cms --org ...
  # koyeb service create perissos-cms --docker ${REGISTRY}/backoffice:latest --ports 3000:http --route cms.perissos.dev
  # koyeb service create perissos-auth --docker ${REGISTRY}/casdoor:latest --ports 8000:http --route auth.perissos.dev
  # koyeb service create perissos-gateway --docker ${REGISTRY}/apisix:latest --ports 9080:http --route api.perissos.dev

  echo -e "${YELLOW}  → Run Koyeb CLI commands to deploy${NC}"
  echo -e "${YELLOW}  → See: koyeb-deploy/koyeb-deploy.sh${NC}"
  echo -e "${GREEN}✅ Deploy commands ready${NC}"
}

case "${1:-all}" in
  payload)
    build_images
    push_images
    ;;
  casdoor)
    docker build -t ${REGISTRY}/casdoor:latest -f apps/casdoor/Dockerfile .
    docker push ${REGISTRY}/casdoor:latest
    ;;
  apisix)
    docker build -t ${REGISTRY}/apisix:latest -f apps/apisix/Dockerfile .
    docker push ${REGISTRY}/apisix:latest
    ;;
  all)
    check_prerequisites
    build_images
    push_images
    deploy_koyeb
    ;;
  *)
    echo -e "${RED}Usage: $0 [payload|casdoor|apisix|all]${NC}"
    exit 1
    ;;
esac

echo -e "${GREEN}✅ Deployment complete!${NC}"

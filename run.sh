#!/usr/bin/env bash

# ==============================================================================
# CardioPulse-ESP32 Telemonitoring System - 1-Click Launch Script (Linux / macOS)
# JUST RUN THE SCRIPT = DONE!
# ==============================================================================

set -e

# Terminal colors
CYAN='\033[0;36m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BOLD='\033[1m'
NC='\033[0m' # No Color

echo -e "${CYAN}${BOLD}"
echo "  ================================================================"
echo "    🫀 CardioPulse-ESP32 Telemonitoring System (ICU Obsidian)    "
echo "    Faculté de Médecine & CHU - Moniteur Clinique Temps Réel     "
echo "  ================================================================"
echo "  ⚡ JUST RUN THE SCRIPT = DONE! Automating setup & launch..."
echo "  ================================================================"
echo -e "${NC}"

# Navigate to the script's directory
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" >/dev/null 2>&1 && pwd)"
cd "$DIR"

# Auto-install helper for Node.js
install_node() {
  echo -e "\n${YELLOW}⚙ Attempting to install Node.js 20 LTS automatically...${NC}"
  if command -v apt-get >/dev/null 2>&1; then
    echo -e "${CYAN}Detected Ubuntu / Debian. Updating packages...${NC}"
    sudo apt-get update && sudo apt-get install -y curl ca-certificates gnupg build-essential
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs
  elif command -v dnf >/dev/null 2>&1; then
    sudo dnf install -y nodejs npm
  elif command -v pacman >/dev/null 2>&1; then
    sudo pacman -Sy --noconfirm nodejs npm
  elif command -v brew >/dev/null 2>&1; then
    brew install node
  else
    echo -e "${RED}Unsupported package manager. Please install Node.js 20 from https://nodejs.org${NC}"
    exit 1
  fi
}

# 1. Check for Node.js
if ! command -v node >/dev/null 2>&1; then
  echo -e "${YELLOW}[NOTICE] Node.js is not installed.${NC}"
  read -p "Would you like to install Node.js 20 LTS automatically? (Requires sudo) [Y/n]: " -n 1 -r
  echo
  if [[ $REPLY =~ ^[Yy]$ ]] || [[ -z $REPLY ]]; then
    install_node
  else
    echo -e "${RED}Please install Node.js 18+ and re-run this script.${NC}"
    exit 1
  fi
fi

NODE_VER=$(node -v | sed 's/v//' | cut -d'.' -f1)
if [ "$NODE_VER" -lt 18 ]; then
  echo -e "${YELLOW}[WARNING] Your Node.js version ($(node -v)) is outdated (< v18).${NC}"
  read -p "Would you like to upgrade to Node.js 20 LTS now? [Y/n]: " -n 1 -r
  echo
  if [[ $REPLY =~ ^[Yy]$ ]] || [[ -z $REPLY ]]; then
    install_node
  else
    echo -e "${RED}Please update Node.js to version 18+ (20+ LTS recommended).${NC}"
    exit 1
  fi
fi

echo -e "${GREEN}✓ Node.js detected:${NC} $(node -v) (v18+ verified)"

# 2. Check for npm
if ! command -v npm >/dev/null 2>&1; then
  echo -e "${RED}${BOLD}[ERROR] npm is not installed!${NC}"
  echo "Please install npm (usually bundled with Node.js)."
  exit 1
fi
echo -e "${GREEN}✓ npm detected:${NC} $(npm -v)"

# 3. Check / Install dependencies
if [ ! -d "node_modules" ]; then
  echo -e "${YELLOW}⚙ First-time setup: Installing dependencies (npm install)...${NC}"
  npm install
  echo -e "${GREEN}✓ Dependencies installed successfully!${NC}"
else
  echo -e "${GREEN}✓ Dependencies already installed.${NC}"
fi

# 4. Open browser helper function
open_browser() {
  local URL="http://localhost:5173"
  # Wait for Vite dev server to respond
  for i in {1..20}; do
    if curl -s -o /dev/null -w "%{http_code}" "$URL" 2>/dev/null | grep -q "200"; then
      break
    fi
    sleep 0.5
  done

  echo -e "${CYAN}${BOLD}🌐 Opening browser at ${URL} ...${NC}"
  if command -v xdg-open >/dev/null 2>&1; then
    xdg-open "$URL" >/dev/null 2>&1 &
  elif command -v open >/dev/null 2>&1; then
    open "$URL" >/dev/null 2>&1 &
  elif command -v sensible-browser >/dev/null 2>&1; then
    sensible-browser "$URL" >/dev/null 2>&1 &
  fi
}

echo -e "\n${BOLD}${GREEN}🚀 Starting Local Development Server on http://localhost:5173 ...${NC}"
echo -e "${YELLOW}Press Ctrl+C at any time to stop the application.${NC}\n"

# Launch browser opener in the background
open_browser &

# Start Vite dev server
npm run dev

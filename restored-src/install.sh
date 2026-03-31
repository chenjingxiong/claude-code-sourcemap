#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
INSTALL_DIR="$SCRIPT_DIR/dist"

echo "=== Claude Code (Restored) — Install ==="
echo ""

# 1. Check prerequisites
command -v node >/dev/null 2>&1 || { echo "Error: node is required (>=18)"; exit 1; }
command -v bun >/dev/null 2>&1 || { echo "Error: bun is required for building"; exit 1; }

NODE_MAJOR=$(node -e "console.log(process.versions.node.split('.')[0])")
if [ "$NODE_MAJOR" -lt 18 ]; then
  echo "Error: Node.js >= 18 required (found v$(node --version))"
  exit 1
fi

# 2. Install dependencies
echo "[1/4] Installing dependencies..."
cd "$SCRIPT_DIR"
npm install --legacy-peer-deps --silent 2>/dev/null

# 3. Restore internal SDKs from sourcemap
echo "[2/4] Restoring internal SDKs..."
for pkg in bedrock-sdk vertex-sdk foundry-sdk; do
  if [ -d "node_modules_sourcemap/@anthropic-ai/$pkg" ]; then
    cp -r "node_modules_sourcemap/@anthropic-ai/$pkg" "node_modules/@anthropic-ai/$pkg" 2>/dev/null || true
  fi
done

# 4. Build
echo "[3/4] Building..."
bun run build.ts 2>&1 | grep -E "^(Build|Output)" || true

# 5. Create symlink
echo "[4/4] Creating claude-dev command..."
BIN_PATH="$HOME/.local/bin/claude-dev"
mkdir -p "$(dirname "$BIN_PATH")"
cat > "$BIN_PATH" << EOF
#!/bin/bash
exec node "$INSTALL_DIR/cli.js" "\$@"
EOF
chmod +x "$BIN_PATH"

echo ""
echo "✓ Installed successfully!"
echo ""
echo "Usage:"
echo "  claude-dev              # Interactive mode (in a real terminal)"
echo "  claude-dev --version    # Show version"
echo "  claude-dev --help       # Show help"
echo "  claude-dev -p 'hello'   # Print mode (needs ANTHROPIC_API_KEY)"
echo ""
echo "Make sure ~/.local/bin is in your PATH:"
echo "  export PATH=\"\$HOME/.local/bin:\$PATH\""
echo ""
echo "NOTE: Must run in a real terminal (TTY) for interactive mode."
echo "      If it appears to hang, you're likely in a non-TTY environment."

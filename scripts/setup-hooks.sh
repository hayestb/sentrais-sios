#!/usr/bin/env sh
# Install project git hooks into .git/hooks.
# Run once after cloning: ./scripts/setup-hooks.sh

set -e

REPO_ROOT="$(git rev-parse --show-toplevel)"
HOOKS_SRC="$REPO_ROOT/.githooks"
HOOKS_DST="$REPO_ROOT/.git/hooks"

if [ ! -d "$HOOKS_SRC" ]; then
  echo "ERROR: .githooks directory not found at $HOOKS_SRC"
  exit 1
fi

for hook in "$HOOKS_SRC"/*; do
  name="$(basename "$hook")"
  dest="$HOOKS_DST/$name"
  cp "$hook" "$dest"
  chmod +x "$dest"
  echo "Installed: $dest"
done

echo "Git hooks installed successfully."
echo "Tip: run 'git commit --allow-empty -m test' to verify the hook fires."

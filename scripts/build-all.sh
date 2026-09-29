#!/usr/bin/env bash
# Root deploy build for the single Vercel project (li.yishan.app).
# Ensures a Bun that can read the apps' bun.lock files, then runs build-all.ts,
# which builds every apps/<slug>/ into ./dist/<slug>/ and writes ./dist/index.html.
set -euo pipefail

cd "$(dirname "$0")/.."

# App lockfiles are bun.lock "lockfileVersion": 2 (Bun >= 1.4). Older Bun cannot parse them.
MIN_BUN_MINOR="${MIN_BUN_MINOR:-4}"
BUN_INSTALL_VERSION="${BUN_INSTALL_VERSION:-1.4.2}"

bun_ok() {
  command -v bun >/dev/null 2>&1 || return 1
  local v major minor
  v="$(bun --version 2>/dev/null || echo 0.0.0)"
  major="${v%%.*}"
  minor="$(echo "$v" | cut -d. -f2)"
  [ "$major" -gt 1 ] || { [ "$major" -eq 1 ] && [ "$minor" -ge "$MIN_BUN_MINOR" ]; }
}

if ! bun_ok; then
  echo "[build-all] bun >= 1.${MIN_BUN_MINOR} not found (have: $(bun --version 2>/dev/null || echo none)); installing bun ${BUN_INSTALL_VERSION}"
  # Prefer npm (always present with Node on Vercel; no unzip needed), fall back to the official installer.
  BUN_NPM_PREFIX="${BUN_NPM_PREFIX:-$HOME/.cache/xbm-bun}"
  if command -v npm >/dev/null 2>&1 && \
     npm install --prefix "$BUN_NPM_PREFIX" --no-audit --no-fund --no-save --loglevel=error "bun@${BUN_INSTALL_VERSION}"; then
    export PATH="$BUN_NPM_PREFIX/node_modules/.bin:$PATH"
  else
    export BUN_INSTALL="${BUN_INSTALL:-$HOME/.bun}"
    curl -fsSL https://bun.sh/install | bash -s "bun-v${BUN_INSTALL_VERSION}"
    export PATH="$BUN_INSTALL/bin:$PATH"
  fi
  hash -r
  bun_ok || { echo "[build-all] could not provision bun >= 1.${MIN_BUN_MINOR}" >&2; exit 1; }
fi

echo "[build-all] using bun $(bun --version) at $(command -v bun)"
exec bun scripts/build-all.ts "$@"

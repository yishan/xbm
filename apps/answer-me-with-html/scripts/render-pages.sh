#!/usr/bin/env bash
# Render drafts/*.md with the upstream `am` CLI (QingYunA/answer-me-with-html v0.4.14, MIT)
# into public/pages/<id>.html. Each page embeds all 3 themes x light/dark (root data-theme / data-mode),
# so one render per draft is enough; the gallery switches them through the iframe. Output is committed, so the root build does not need the CLI.
# usage: AM_SRC=/path/to/answer-me-with-html bash scripts/render-pages.sh
set -euo pipefail
cd "$(dirname "$0")/.."
AM_SRC=${AM_SRC:-/workspace/amwh-src}
export AM_HOME=$(mktemp -d)
rm -rf public/pages public/drafts && mkdir -p public/pages public/drafts
for f in drafts/*.md; do
  id=$(basename "$f" .md); cp "$f" public/drafts/
  node "$AM_SRC/bin/am.js" render "$f" -o "public/pages/$id.html" --no-open </dev/null &
done
wait
rm -rf "$AM_HOME"
ls -la public/pages

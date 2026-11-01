#!/usr/bin/env bash
# Render drafts/*.md with the upstream `am` CLI (QingYunA/answer-me-with-html v0.5.10, MIT)
# into public/pages/<id>.html. Each page embeds all 3 themes x light/dark (root data-theme / data-mode),
# so one render per draft is enough; the gallery switches them through the iframe. Output is committed, so the root build does not need the CLI.
# usage: AM_SRC=/path/to/answer-me-with-html bash scripts/render-pages.sh
set -euo pipefail
cd "$(dirname "$0")/.."
AM_SRC=${AM_SRC:-/workspace/amwh-0.5.10}
export AM_NO_UPDATE_CHECK=1
export AM_HOME=$(mktemp -d)
# Catalog themes (comic / manga / pop, v0.5.3) come from the upstream marketplace folder.
# A page carries only its own theme, so 08-weekly-numbers is rendered once per catalog theme:
# 08-weekly-numbers.html (comic), 08-weekly-numbers--manga.html, 08-weekly-numbers--pop.html.
mkdir -p "$AM_HOME/themes" && cp "$AM_SRC"/marketplace/themes/{comic,manga,pop}.json "$AM_HOME/themes/"
CATALOG_PAGES="08-weekly-numbers"
rm -rf public/pages public/drafts && mkdir -p public/pages public/drafts
for f in drafts/*.md; do
  id=$(basename "$f" .md); cp "$f" public/drafts/
  if [[ " $CATALOG_PAGES " == *" $id "* ]]; then
    node "$AM_SRC/bin/am.js" render "$f" -o "public/pages/$id.html" --theme comic --no-open </dev/null &
    for t in manga pop; do node "$AM_SRC/bin/am.js" render "$f" -o "public/pages/$id--$t.html" --theme $t --no-open </dev/null & done
  else
    node "$AM_SRC/bin/am.js" render "$f" -o "public/pages/$id.html" --no-open </dev/null &
  fi
done
wait
rm -rf "$AM_HOME"
ls -la public/pages

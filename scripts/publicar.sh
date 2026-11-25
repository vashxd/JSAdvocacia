#!/usr/bin/env bash
# Publica o site no Cloudflare Pages (projeto "joycesantos").
# Envia so os arquivos publicos: scripts, docs, fotos originais e o .git ficam de fora.
# Primeira vez: `npx wrangler@4 login`.
set -euo pipefail
cd "$(dirname "$0")/.."
PROJETO="${PROJETO:-joycesantos}"

saida=$(mktemp -d)
trap 'rm -rf "$saida"' EXIT
cp -r index.html 404.html privacidade.html termos.html \
      favicon.svg robots.txt sitemap.xml _headers \
      css js fonts img "$saida/"

npx --yes wrangler@4 pages deploy "$saida" \
  --project-name="$PROJETO" --branch=main --commit-dirty=true

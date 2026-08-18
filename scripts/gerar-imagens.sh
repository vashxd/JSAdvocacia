#!/usr/bin/env bash
# Gera os PNGs que redes sociais e iOS exigem (SVG nao serve para eles):
#   img/og-joyce-santos.png  1200x630  a partir de scripts/og.html
#   img/apple-touch-icon.png  180x180  a partir de favicon.svg
# Usa o Chrome em modo headless — nenhuma dependencia extra a instalar.
set -euo pipefail
cd "$(dirname "$0")/.."
raiz=$(pwd -W 2>/dev/null || pwd)

chrome=""
for c in \
  "/c/Program Files/Google/Chrome/Application/chrome.exe" \
  "/c/Program Files (x86)/Google/Chrome/Application/chrome.exe" \
  "$(command -v google-chrome || true)" \
  "$(command -v chromium || true)"; do
  if [ -n "$c" ] && [ -x "$c" ]; then chrome="$c"; break; fi
done
if [ -z "$chrome" ]; then
  echo "Chrome nao encontrado. Gere os PNGs a mao a partir de scripts/og.html e favicon.svg." >&2
  exit 1
fi

perfil=$(mktemp -d)
tirar() { # <arquivo-origem> <largura> <altura> <destino>
  "$chrome" --headless=new --disable-gpu --hide-scrollbars --force-device-scale-factor=1 \
    --user-data-dir="$perfil" --virtual-time-budget=3000 \
    --window-size="$2,$3" --screenshot="${raiz}/$4" "file:///${raiz}/$1" >/dev/null 2>&1
  echo "gerado $4"
}

tirar "scripts/og.html" 1200 630 "img/og-joyce-santos.png"
tirar "favicon.svg"      180  180 "img/apple-touch-icon.png"
rm -rf "$perfil"

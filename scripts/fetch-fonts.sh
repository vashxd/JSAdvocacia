#!/usr/bin/env bash
# Baixa os subsets latin/latin-ext das fontes do Google Fonts e gera css/fonts.css.
# Self-host e obrigatorio: Google Fonts via CDN transfere o IP do visitante ao
# exterior (LGPD) e adiciona um round-trip de rede. Rodar de novo so se as
# fontes mudarem de versao.
set -euo pipefail
cd "$(dirname "$0")/.."
UA="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36"
URL="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght,SOFT,WONK@9..144,300..700,50,0&family=IBM+Plex+Mono:wght@400;500&family=Instrument+Sans:wght@400..600&display=swap"

raw=$(curl -sfL -m 30 -H "User-Agent: $UA" "$URL")
mkdir -p fonts

python - "$raw" <<'PY'
import re, sys, os, urllib.request
raw = sys.argv[1]
blocks = re.findall(r"/\* (\S+) \*/\s*@font-face \{(.*?)\}", raw, re.S)
out = ["/* Gerado por scripts/fetch-fonts.sh - nao editar a mao. */\n"]
for subset, body in blocks:
    if subset not in ("latin", "latin-ext"):
        continue
    fam = re.search(r"font-family: '([^']+)'", body).group(1)
    wght = re.search(r"font-weight: ([^;]+);", body).group(1).strip()
    url = re.search(r"url\((https://[^)]+)\)", body).group(1)
    urange = re.search(r"unicode-range: ([^;]+);", body).group(1).strip()
    slug = fam.lower().replace(" ", "-")
    name = f"{slug}-{subset}-{wght.replace(' ', '-')}.woff2"
    path = os.path.join("fonts", name)
    if not os.path.exists(path):
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, timeout=30) as r, open(path, "wb") as f:
            f.write(r.read())
        print("baixado", path)
    out.append(
        "@font-face {\n"
        f"  font-family: '{fam}';\n"
        "  font-style: normal;\n"
        f"  font-weight: {wght};\n"
        "  font-display: swap;\n"
        f"  src: url('../fonts/{name}') format('woff2');\n"
        f"  unicode-range: {urange};\n"
        "}\n"
    )
open(os.path.join("css", "fonts.css"), "w", encoding="utf-8").write("\n".join(out))
print("css/fonts.css escrito")
PY

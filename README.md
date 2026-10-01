# Joyce Santos, Advogada — landing page

Site institucional estático, construído a partir de [`guia-landing-page-joyce-santos.md`](guia-landing-page-joyce-santos.md).

HTML, CSS e um arquivo de JavaScript. **Sem build, sem framework, sem dependências** — o que estiver no repositório é exatamente o que vai ao ar. Escolha deliberada: o guia previa Astro + Tailwind ou HTML puro, e para sete seções sem estado o HTML puro entrega o mesmo resultado e continua manutenível daqui a dois anos, por qualquer pessoa, sem `npm install`.

## Rodar localmente

```bash
python -m http.server 4321
# abrir http://127.0.0.1:4321
```

Qualquer servidor estático serve. Abrir o arquivo direto por `file://` também funciona, mas os caminhos absolutos (`/favicon.svg`) só resolvem sob um servidor.

## Estrutura

```
index.html            landing completa — 7 seções, JSON-LD Attorney + FAQPage
privacidade.html      Política de Privacidade (LGPD)
termos.html           Termos de uso + aviso do Provimento 205/2021
404.html              página de erro

css/styles.css        folha única, comentada por seção
css/fonts.css         gerado por scripts/fetch-fonts.sh — não editar à mão
js/main.js            reveal ao rolar, estado do header, formulário que abre o WhatsApp
fonts/                Fraunces, Instrument Sans, IBM Plex Mono (woff2, 240 KB)
img/                  retrato e foto de contexto (placeholders SVG), OG, ícone
scripts/              utilitários de manutenção
_headers              CSP e cache para Cloudflare Pages / Netlify
robots.txt sitemap.xml favicon.svg
```

## Scripts

| Comando | Para quê |
|---|---|
| `python scripts/verificar.py` | Conferência de pré-deploy: termos vedados pelo Provimento 205, placeholders pendentes, links quebrados, JSON-LD |
| `bash scripts/gerar-imagens.sh` | Regera `img/og-joyce-santos.png` (1200×630) e `img/apple-touch-icon.png` via Chrome headless |
| `bash scripts/fetch-fonts.sh` | Rebaixa os subsets das fontes e reescreve `css/fonts.css` |

`scripts/og.html` é a arte da imagem de compartilhamento — editar ali e regerar.

## Decisões que não são cosméticas

**Base 18px, alvos de toque de 48px, contraste AA.** O público previdenciário tem 50–70 anos e chega pelo celular. Fonte pequena é barreira de conversão, não questão de gosto.

**Fontes self-hosted.** Google Fonts via CDN transfere o IP do visitante ao exterior — problema de LGPD e um round-trip a mais. Os `.woff2` estão no repositório.

**Formulário sem campo de texto livre.** Casos de INSS e de família carregam dado sensível (saúde, filiação). Coletar isso por formulário público exigiria base legal, retenção e segurança próprias, e criaria risco de conflito de interesses antes da triagem. A descrição acontece na conversa.

**Nada de depoimento, avaliação, valor de honorário ou promessa de resultado.** Vedações do Provimento 205/2021 do CFOAB. `scripts/verificar.py` varre o texto em busca desses termos a cada deploy.

**Movimento mínimo e desligável.** Filete do hero traçado uma vez, reveal de 400ms ao rolar, sublinhado no hover. `prefers-reduced-motion: reduce` desliga tudo. Sem JavaScript, nada fica invisível.

## Deploy

**Ao alterar `css/styles.css` ou `js/main.js`, aumentar o `?v=N`** nos `<link>`/`<script>` de todas as páginas. O `_headers` manda o navegador guardar esses arquivos por 7 dias; sem trocar a versão, quem já visitou continua com o arquivo antigo.

Cloudflare Pages ou Netlify, apontando para a raiz do repositório, **sem comando de build**. `_headers` é lido automaticamente pelos dois (CSP, HSTS, cache imutável para as fontes).

Se hospedar em outro lugar, replicar os cabeçalhos de `_headers` na configuração do servidor. A CSP libera apenas `self` (e `wa.me` como destino do formulário) — qualquer script de terceiro precisa ser adicionado lá.

## O que ficou fora, de propósito

Blog com CMS, agendamento online, chatbot, área do cliente e versão em inglês — seção 8 do guia. Não construir agora.

Fase 2, três a seis meses após o lançamento: uma página de conteúdo por área de atuação. É o caminho de aquisição mais barato e o Provimento 205 endossa expressamente o marketing de conteúdo.

## Antes de publicar

Ler [`CONFIGURAR.md`](CONFIGURAR.md). Todos os dados no site hoje são de exemplo.

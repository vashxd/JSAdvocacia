# O que trocar antes de publicar

Todo dado de exemplo está marcado abaixo. `python scripts/verificar.py` lista o que ainda falta e **falha enquanto sobrar placeholder** — rode antes de qualquer deploy.

## 1. Dados da advogada

| Placeholder | Onde aparece | Trocar por |
|---|---|---|
| `00.000` | `index.html`, `privacidade.html`, `termos.html`, `obrigado.html`, `404.html`, `scripts/og.html` | Número real de inscrição na OAB/AM |
| `00.000.000/0001-00` | rodapé de todas as páginas | CNPJ da sociedade unipessoal — **remover a linha inteira se não houver CNPJ** |
| `Rua Exemplo, 000, sala 00 — Centro, Manaus/AM` | rodapé, seção de contato, JSON-LD, páginas legais | Endereço real. Se não houver endereço fixo, usar apenas `Atendimento mediante agendamento` e remover `streetAddress`/`postalCode` do JSON-LD |
| `69000-000` | JSON-LD em `index.html` | CEP real |
| `Bacharel em Direito — Instituição, ano` | `index.html`, bloco "Credenciais" | Instituição e ano reais. **Só citar título de pós-graduação se estiver concluído** — título em andamento é informação inverídica |
| `Segunda a sexta, das 9h às 18h` | seção de contato e `openingHoursSpecification` | Horário real |

## 2. Contato

| Placeholder | Onde | Formato |
|---|---|---|
| `5592900000000` | todos os links `wa.me` (header, hero, contato, botão flutuante, `obrigado.html`) | `55` + DDD + número, só dígitos: `5592981234567` |
| `(92) 90000-0000` | seção de contato e `telephone` do JSON-LD | Como o número deve aparecer na tela |
| `contato@joycesantos.adv.br` | contato, rodapé, páginas legais, JSON-LD | E-mail no domínio próprio. **Nunca Gmail pessoal** — Zoho Mail é gratuito para 1 domínio |
| `joycesantos.adv.br` | `<link rel=canonical>`, Open Graph, `sitemap.xml`, `robots.txt`, `_headers` | Domínio registrado |

Busca e substituição em lote (Git Bash, a partir da raiz):

```bash
grep -rl "5592900000000" --include="*.html" . | xargs sed -i 's/5592900000000/55SEUNUMERO/g'
```

### Mensagem pré-preenchida do WhatsApp

Hoje é `Olá, gostaria de tirar uma dúvida jurídica.` (neutra, sem promessa). Se alterar, manter a regra: **a mensagem promete conversa, nunca desfecho**. E a saudação automática do WhatsApp Business não pode oferecer consulta gratuita nem mencionar resultado.

## 3. Formulário

O `<form>` aponta para o [Web3Forms](https://web3forms.com) (gratuito, sem backend).

1. Criar a chave de acesso com o e-mail profissional;
2. Em `index.html`, substituir `COLE-AQUI-A-CHAVE-DO-WEB3FORMS` pela chave;
3. Ajustar o campo oculto `redirect` para `https://SEUDOMINIO/obrigado.html`;
4. Enviar um teste real e confirmar a chegada do e-mail.

Enquanto a chave não for preenchida, o JavaScript deixa o envio nativo acontecer em vez de fingir sucesso — o erro aparece, em vez de sumir.

**Não adicionar campo "descreva seu caso".** A ausência dele é decisão de projeto (LGPD + conflito de interesses), explicada na seção 5.7 do guia e refletida na Política de Privacidade.

O serviço mantém servidores no exterior. A Política de Privacidade já declara a transferência internacional — se trocar de serviço, revisar o item 5 dela.

## 4. Fotografia

Os arquivos `img/retrato-joyce.svg` e `img/contexto-mesa.svg` são espaços reservados. Depois da sessão de fotos:

1. Exportar em WebP (retrato ~800×1000, contexto ~600×800);
2. Salvar como `img/retrato-joyce.webp` e `img/contexto-mesa.webp`;
3. Trocar o `src` nas duas tags `<img>` de `index.html`, mantendo `width`, `height` e um `alt` descritivo;
4. Rodar `bash scripts/gerar-imagens.sh` para regerar a imagem de compartilhamento.

Evitar: banco de imagens, martelo de juiz, balança da justiça, estante de livros vermelhos, aperto de mãos.

## 5. Redes sociais (opcional)

Preencher `sameAs` no JSON-LD de `index.html` com os perfis profissionais:

```json
"sameAs": ["https://www.instagram.com/perfil", "https://www.linkedin.com/in/perfil"]
```

Deixar `[]` se não houver.

## 6. Analytics (opcional)

Usar ferramenta sem cookies — Plausible ou Umami. Basta uma tag `<script>` antes de `</body>`. Ferramenta cookieless dispensa banner de cookies; se optar por Google Analytics, será preciso banner de consentimento e revisão da Política de Privacidade.

Ao adicionar qualquer script externo, incluir o domínio dele em `script-src` e `connect-src` no `_headers`, senão a CSP bloqueia.

## 7. Datas das páginas legais

`privacidade.html` e `termos.html` trazem “Atualizada em 18 de agosto de 2026”. Ajustar para a data real de publicação, e novamente a cada alteração.

---

## Antes de considerar pronto

- [ ] `python scripts/verificar.py` termina sem itens pendentes
- [ ] Texto final submetido à Comissão de Fiscalização da OAB/AM (consulta gratuita, protege)
- [ ] Link do WhatsApp testado em iPhone e em Android reais
- [ ] Formulário testado ponta a ponta, com e-mail chegando
- [ ] Domínio `.adv.br` apontado e HTTPS ativo
- [ ] Google Search Console verificado e `sitemap.xml` enviado
- [ ] Perfil no Google Business criado como “Advogado” — **sem solicitar avaliações de clientes**

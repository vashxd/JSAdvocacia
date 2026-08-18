#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""Conferencia antes do deploy.

Roda tres checagens sobre os HTMLs do site:

  1. Publicidade (Prov. 205/2021, secao 3.2 do guia) — procura os termos vedados.
     Ocorrencia NAO significa infracao automatica: "nao existe prazo garantido"
     e negacao de promessa, e portanto valida. O script mostra o trecho para
     que a decisao seja de quem le.
  2. Placeholders — avisa se dados de exemplo (OAB 00.000, telefone, chave do
     formulario) ainda estao no lugar. Isso trava o deploy.
  3. Referencias locais — confere se todo href/src apontando para arquivo do
     projeto existe no disco, e valida os blocos JSON-LD.

Uso:  python scripts/verificar.py
"""
import json
import os
import re
import sys

try:  # console do Windows costuma vir em cp1252
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')
except (AttributeError, ValueError):
    pass

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PAGINAS = ['index.html', 'privacidade.html', 'termos.html', 'obrigado.html', '404.html']

VEDADOS = [
    'causa ganha', 'garantimos', 'garantido', 'garanta', 'aprovação certa',
    'você vai receber', 'consulta gratuita', 'primeira consulta grátis', 'grátis',
    'gratuito', 'desconto', 'parcelamos', 'honorários a partir de', 'r$',
    'melhor advogad', 'referência em', 'líder', 'premiada', 'especialista',
    'vasta experiência', 'anos de atuação', 'escritório consolidado',
    'contrate agora', 'oferta', 'vagas limitadas', 'não perca',
    'depoimento', 'avaliação de cliente', 'nossos clientes dizem',
]

PLACEHOLDERS = {
    '00.000': 'número de inscrição na OAB',
    '5592900000000': 'número de WhatsApp',
    '(92) 90000-0000': 'telefone exibido',
    'COLE-AQUI-A-CHAVE-DO-WEB3FORMS': 'chave do serviço de formulário',
    'Rua Exemplo': 'endereço do escritório',
    '00.000.000/0001-00': 'CNPJ',
    'Instituição, ano': 'formação acadêmica',
}


def sem_tags(html):
    html = re.sub(r'<(script|style)[^>]*>.*?</\1>', ' ', html, flags=re.S)
    return re.sub(r'<[^>]+>', ' ', html)


def main():
    problemas = 0
    avisos = 0

    print('\n== 1. Publicidade (Provimento 205/2021) ==')
    for pagina in PAGINAS:
        caminho = os.path.join(RAIZ, pagina)
        if not os.path.exists(caminho):
            continue
        texto = sem_tags(open(caminho, encoding='utf-8').read())
        plano = re.sub(r'\s+', ' ', texto)
        for termo in VEDADOS:
            for m in re.finditer(re.escape(termo), plano, re.I):
                ini = max(0, m.start() - 70)
                print('  ! %s: "...%s..."' % (pagina, plano[ini:m.end() + 70].strip()))
                avisos += 1
    if not avisos:
        print('  nenhum termo da lista encontrado')
    else:
        print('  -> revise cada trecho acima; negações ("não existe prazo garantido") são válidas')

    print('\n== 2. Placeholders ainda no site ==')
    pendentes = []
    for pagina in PAGINAS:
        caminho = os.path.join(RAIZ, pagina)
        if not os.path.exists(caminho):
            continue
        conteudo = open(caminho, encoding='utf-8').read()
        for marca, descricao in PLACEHOLDERS.items():
            if marca in conteudo:
                pendentes.append('%s — %s (%s)' % (pagina, descricao, marca))
    if pendentes:
        for p in sorted(set(pendentes)):
            print('  X ' + p)
        problemas += len(pendentes)
    else:
        print('  nenhum — dados reais em todas as páginas')

    print('\n== 3. Referências locais e JSON-LD ==')
    quebrados = 0
    for pagina in PAGINAS:
        caminho = os.path.join(RAIZ, pagina)
        if not os.path.exists(caminho):
            continue
        conteudo = open(caminho, encoding='utf-8').read()
        for alvo in re.findall(r'(?:href|src)="([^"#][^"]*)"', conteudo):
            if alvo.startswith(('http', 'mailto:', 'tel:', 'data:', '//')):
                continue
            destino = os.path.join(RAIZ, alvo.lstrip('/').split('#')[0].split('?')[0])
            if not os.path.exists(destino):
                print('  X %s -> %s (não existe)' % (pagina, alvo))
                quebrados += 1
        for bloco in re.findall(r'<script type="application/ld\+json">(.*?)</script>', conteudo, re.S):
            try:
                json.loads(bloco)
            except ValueError as e:
                print('  X %s -> JSON-LD inválido: %s' % (pagina, e))
                quebrados += 1
    problemas += quebrados
    if not quebrados:
        print('  todas as referências existem e os JSON-LD são válidos')

    print('\n== Resultado ==')
    if problemas:
        print('  %d item(ns) impedem o deploy.\n' % problemas)
        return 1
    print('  pronto para publicar (revise os avisos da seção 1, se houver).\n')
    return 0


if __name__ == '__main__':
    sys.exit(main())

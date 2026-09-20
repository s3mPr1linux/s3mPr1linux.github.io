---
# ════════════════════════════════════════════════════════════
#  TEMPLATE — copie este arquivo para criar uma cheatsheet.
#  published: false mantém ele fora do site. Remova essa linha
#  (ou mude para true) no arquivo copiado.
# ════════════════════════════════════════════════════════════
published:  false

title:      "Título da cheatsheet"
summary:    "Uma frase dizendo o que esta folha cobre e para quem serve."
category:   "Nome do agrupamento no índice"   # ex: Active Directory, Detecção, Web
tags:       [tag-um, tag-dois, tag-tres]
updated:    2026-09-20
difficulty: "Intermediário"                   # Básico | Intermediário | Avançado
toc:        true                              # false esconde o índice automático

# ── Crédito a terceiros ────────────────────────────────────
# Caso 1 — a folha é SUA e você quer creditar uma fonte que ajudou:
# source:     "Nome da fonte"
# source_url: "https://exemplo.com/pagina"
#
# Caso 2 — conteúdo de terceiro republicado COM autorização.
# republished: true muda a caixa para crédito explícito, e canonical
# aponta o buscador para o original (evita penalidade de conteúdo
# duplicado e deixa o SEO com quem escreveu).
# republished: true
# source:      "Red Block Market"
# source_url:  "https://redblock.market/cheatsheets/xxx"
# author:      "RedBlock"
# canonical:   "https://redblock.market/cheatsheets/xxx"
---

Um parágrafo de abertura enquadrando o assunto: quando você usa isto, que
problema resolve, que pressupostos estão em jogo. Duas ou três linhas bastam.

> **Nota de contexto.** Blockquote vira caixa destacada. Bom para avisos,
> pegadinhas e "isso mudou na versão X".

## 1. Primeira seção

Todo `h2` e `h3` entra no índice automático e ganha âncora própria, então dá
para linkar direto para uma seção específica.

### Comandos

Todo bloco de código ganha botão de copiar no hover:

```bash
# comentário explicando o porquê, não o quê
comando --flag valor
```

Comando inline fica assim: `whoami /priv`.

### Tabela de referência

Tabelas rolam horizontalmente no celular em vez de estourar o layout:

| Campo | Significado | Onde aparece |
|---|---|---|
| `campo.um` | O que representa | Fonte do dado |
| `campo.dois` | O que representa | Fonte do dado |

## 2. Segunda seção

- Item de lista
- Outro item
  - Sub-item

1. Passo numerado
2. Passo seguinte

## 3. Armadilhas comuns

O que costuma dar errado e como perceber rápido. Esta seção é a que mais
envelhece bem — vale manter.

## Referências

- [Documentação oficial](https://exemplo.com)
- Anotações próprias do lab X

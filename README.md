# 🚌 Jhonnytur — Site institucional

Site estático da **Jhonnytur Viagens** — excursões de ônibus em grupo.
Puro HTML + CSS + JavaScript, sem build, sem dependências.

## Estrutura

| Arquivo | O que é |
|---|---|
| `index.html` | Página inicial (herói, busca, destaques, como funciona, FAQ) |
| `viagens.html` | Catálogo com 9 roteiros e filtros |
| `experiencia.html` | A experiência / história da marca |
| `videos.html` | Vídeos das viagens (abrem em modal) |
| `contato.html` | Formulário → WhatsApp + perguntas frequentes |
| `styles.css` | Design system (cores, layout, componentes, responsivo) |
| `animations.css` | Animações de revelação ao rolar e cortina entre páginas |
| `animations.js` | Toda a interação: menu, filtros, favoritos, modal, contadores |
| `Logo Jhonnytur recortada.png` | Logo usada no topo e no rodapé |
| `_serve.js` | Servidor local de preview (opcional) |

As fotos dos destinos são carregadas do Unsplash (internet necessária).

## Rodar localmente

```bash
node _serve.js      # abre em http://localhost:8099
```

Ou simplesmente clique duas vezes no `index.html`.

## Publicar no GitHub (passo a passo)

1. Crie o repositório em <https://github.com/new>
   - Nome sugerido: `jhonnytur`
   - Deixe **Public**
   - **Não** marque "Add a README" nem "Add .gitignore" (já vamos subir os nossos)
2. Na página do repositório novo, clique em **uploading an existing file**
3. Arraste **o conteúdo desta pasta** (todos os arquivos) para a área de upload
4. Clique em **Commit changes**
5. Ative o site: **Settings → Pages → Source: Deploy from a branch**
   - Branch: `main` · Pasta: `/ (root)` → **Save**
6. Em 1–2 minutos o site fica no ar em:
   `https://SEU_USUARIO.github.io/jhonnytur/`

Todos os links e imagens são relativos, então funciona tanto na raiz
(`SEU_USUARIO.github.io`) quanto dentro de subpasta (`.../jhonnytur`).

## ✏️ Guia rápido pra editar (sem quebrar nada)

Tudo é editável direto no site do GitHub: abre o arquivo → clique no lápis ✏️ → muda → **Commit changes**.
O site online atualiza sozinho em 1–2 minutos.

| O que quer mudar | Onde |
|---|---|
| **Número do WhatsApp** | `animations.js` → constante `WHATSAPP` · rodapé das 5 páginas → `https://wa.me/...` · `contato.html` → `action` do formulário |
| **Preço de uma viagem** | `viagens.html` (catálogo) e `index.html` (os 3 em destaque) → procurar `R$` |
| **Texto de uma viagem** | mesmo lugar → título dentro de `<h3>` e descrição no `<p>` |
| **Foto de um destino** | procurar `https://images.unsplash.com/photo-...` no cartão e colar a nova URL |
| **Instagram** | rodapé das 5 páginas → `instagram.com/jhon_nytur` |
| **Adicionar viagem** | copie um bloco `<article class="trip-card">...</article>` inteiro e cole outro embaixo |

**Não mexer** (quebra o visual): `styles.css`, `animations.css` e `animations.js` — exceto o `WHATSAPP` acima.

**Testar sem subir:** baixe a pasta e clique duas vezes no `index.html`, ou rode `node _serve.js`.

## ⚠️ Pendência

Trocar o número de WhatsApp placeholder `5500000000000` pelo real em:

- `animations.js` → constante `WHATSAPP`
- Rodapé das 5 páginas → links `https://wa.me/5500000000000`
- `contato.html` → `action` do formulário

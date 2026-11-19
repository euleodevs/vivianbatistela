# Vivian Batistela — site

Este repositório contém os arquivos estáticos do site publicado no Cloudflare Pages.

## Publicação

Use o workflow de produção do projeto Cloudflare Pages `vivian-batistela` para publicar os arquivos da branch `main`.

As páginas versionam as URLs de CSS e JavaScript para evitar que o domínio principal reaproveite arquivos antigos do cache. Ao publicar novas alterações nesses arquivos, atualize também o parâmetro `v` nos HTMLs.

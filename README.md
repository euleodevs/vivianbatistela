# Vivian Batistela — site

Este repositório contém os arquivos estáticos publicados no Cloudflare Pages.

## Publicação automática

Commits enviados para `main` iniciam a publicação do site no projeto Pages `vivian-batistela` pelo GitHub Actions.

Configure estes segredos em **Settings → Secrets and variables → Actions** do repositório:

- `CLOUDFLARE_API_TOKEN`: token com permissão **Account → Cloudflare Pages → Edit**.
- `CLOUDFLARE_ACCOUNT_ID`: ID da conta Cloudflare que contém o projeto.

O workflow não publica enquanto esses dois segredos não estiverem configurados. Depois de adicioná-los, execute `Deploy to Cloudflare Pages` em **Actions → Deploy to Cloudflare Pages → Run workflow**. Os próximos commits em `main` serão publicados automaticamente.

# Montar uma vez: fazer, agendar e postar

As partes 1 e 4 fazem os reels. As partes 2 e 3 só servem para postar sozinho no Instagram;
sem elas, você posta à mão pelo app do Instagram (que também agenda) usando o `legenda.txt`.

## O que precisa

- **Node.js 22+**, **git** e **ffmpeg** (`node --version`, `git --version`, `ffmpeg -version`).
- **HyperFrames**: não instala nada; o `npx` baixa na primeira vez.
- Um agente que roda comando no terminal: **Claude Code** (ou Codex) para as tarefas agendadas.
- Para postar sozinho: conta **profissional** do Instagram (criador ou empresa), conta grátis de
  **desenvolvedor da Meta** e conta grátis no **GitHub**.

## 1. O primeiro reel

```bash
git clone https://github.com/inematds/reel-asmr-cortes.git
cd reel-asmr-cortes
node ferramentas/som.mjs
npx --yes hyperframes@0.9.37 check
npx --yes hyperframes@0.9.37 render . -o renders/reel.mp4 --fps 30
```

O `som.mjs` cria o `assets/cortes.wav` (tem de vir antes do render). O `check` precisa terminar sem erro.
O vídeo sai em `renders/reel.mp4`: 36 s, 1080 × 1920.

## 2. App da Meta e token (uma vez)

1. A conta do Instagram precisa ser **criador** ou **empresa** (Configurações → Tipo de conta).
2. Em https://developers.facebook.com/apps crie um app. Caso de uso: **gerenciar mensagens e conteúdo no Instagram**.
3. Na parte da API do Instagram, escolha a configuração com **login unificado** (Unified login).
4. A Meta pede um **portfólio empresarial**: crie um grátis ou use o que já tem.
5. **Adicionar conta**: conecte o seu Instagram.
6. **Gerar token**: clique em gerar ao lado da conta e copie o token (começa com `EAA`).
   O número comprido abaixo do nome da conta é o seu `IG_USER_ID`.

Para postar só na sua própria conta, não precisa de revisão do app.

**O token é uma senha.** Cole você mesmo no `.env`, num editor de texto:

```bash
cp .env.exemplo .env
nano .env        # preencha IG_USER_ID e IG_ACCESS_TOKEN
```

Se um dia o post parar com erro de token, gere outro e cole do mesmo jeito.

## 3. Link público do vídeo (uma vez)

A API do Instagram não recebe o arquivo: ela baixa o vídeo de um link público. Um repositório público
no GitHub Pages resolve de graça.

1. No GitHub, crie um repositório **público** chamado `links-reels`, com README.
2. Em **Settings → Pages**: Source "Deploy from a branch", branch `main`, pasta `/ (root)`.
3. Clone na sua máquina, fora deste projeto: `git clone https://github.com/<você>/links-reels.git ~/links-reels`
4. No `.env`: `LINKS_DIR=/home/<você>/links-reels` e `LINKS_URL=https://<você>.github.io/links-reels`
5. Sua máquina precisa conseguir dar `git push` nesse repositório (`gh auth login` ou chave SSH).

Tudo em `links-reels` fica público: só vão para lá os reels que você aprovou. Limite do GitHub: 100 MB por arquivo
(o reel tem bem menos).

Teste sem postar: `node ferramentas/postar-instagram.mjs --ensaio`.

## 4. Agendar

Duas tarefas, cada uma um prompt pronto em `agendar/`:

| Tarefa | Quando | O que faz |
|---|---|---|
| `agendar/1-fazer-reels.md` | segunda 9h | faz até 3 reels e deixa em `prontos/`; **nunca posta** |
| `agendar/2-postar-aprovado.md` | seg, qua e sex 18h | posta 1 reel que você marcou como aprovado |

**Com cron + Claude Code no terminal** (`crontab -e`; troque o caminho):

```
0 9 * * 1      cd /caminho/reel-asmr-cortes && claude -p "$(cat agendar/1-fazer-reels.md)" --allowedTools "Bash Read Edit Write" >> agenda.log 2>&1
0 18 * * 1,3,5 cd /caminho/reel-asmr-cortes && claude -p "$(cat agendar/2-postar-aprovado.md)" --allowedTools "Bash Read" >> agenda.log 2>&1
```

O `--allowedTools` libera o terminal e a edição de arquivos para a tarefa rodar sozinha, sem ninguém para aprovar cada comando.

**Com o app desktop do Claude**: abra a pasta, cole o prompt e peça para virar uma tarefa agendada no horário da tabela.
O computador precisa estar ligado nessa hora.

## 5. Aprovar

Assista cada reel em `prontos/`. Gostou: `node ferramentas/status.mjs <objeto> aprovado`.
Não gostou: ajuste o `objeto.js` da pasta em `reels/` e rode o `fazer-reel.sh` de novo.
**Só o que você aprova vai ao ar.**

## YouTube Shorts

O mesmo `reel.mp4` serve para Shorts. Suba pelo YouTube Studio, que também agenda.
A API do YouTube deixa privado o upload de app novo até o Google revisar o app, por isso este kit não automatiza essa parte.

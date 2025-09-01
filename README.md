# 🧠 Cognitiva - Web

Aplicação web construída com **Next.js 15**, **React 19** e **Tailwind CSS**, voltada para a plataforma Cognitiva. Este documento contém os passos completos para clonar, instalar, executar e contribuir com o projeto.

---

## ✅ Requisitos

- **Node.js**: v20.9.0
- **npm**: (instalado junto com o Node.js)

---

## 🛠️ Instalação do Node.js

### Windows / Linux / macOS

Instale a versão **20.9.0** do Node.js:

Se ainda não tem o `nvm`:

- [Instruções para instalar no Windows](https://github.com/coreybutler/nvm-windows)
- [Instruções para instalar no Linux/macOS](https://github.com/nvm-sh/nvm)
# baixe e instale o arquivo nvm-setup.exe
# reinicie o vscode
Para testar se funcionou digite no terminal:

```bash
nvm -v
```

Então instale o Node.js:

```bash
# Via nvm (recomendado)
nvm install 20.9.0
nvm use 20.9.0
```

---

## 📦 Clonando o projeto

```bash
git clone https://github.com/augustocarva1ho/Cognitiva.git
cd Cognitiva
```

---

## 🔧 Instalando as dependências

```bash
npm install next@15.3.2 react@19.0.0 react-dom@19.0.0 @eslint/eslintrc@^3 @types/node@^20 @types/react@^19 @types/react-dom@^19 @types/webpack@^5.28.5 autoprefixer@^10.4.21 eslint@^9 eslint-config-next@15.3.2 postcss@^8.5.3 tailwindcss@^3.4.17 typescript@^5 framer-motion dlv --save-dev
```

Ou, mais simples:

```bash
npm install
```
Instale também o Prisma:
```bash
npm install @prisma/client
npm install -D prisma
```
---

## ▶️ Rodando localmente

```bash
npm run dev
```

Acesse: [http://localhost:3000](http://localhost:3000)

---

## 💾 Comandos Git

### Obter últimas alterações (pull)

```bash
git pull origin master
```

### Adicionar, commitar e subir alterações

```bash
git add .
git commit -m "mensagem do commit"
git push origin master
```

---

## 📁 Estrutura do Projeto (resumida)

```
/public              # Imagens e favicon
/src
  ├── app            # Páginas (Next.js App Router)
  └── components     # Componentes reutilizáveis (Header, Footer etc.)
tailwind.config.js   # Configuração do Tailwind CSS
postcss.config.js    # Pós-processamento de CSS
```

---

## 🧪 Scripts disponíveis

```bash
npm run dev      # Inicia o servidor de desenvolvimento
npm run build    # Gera a versão de produção
npm run start    # Inicia o servidor com o build gerado
npm run lint     # Executa o lint
```


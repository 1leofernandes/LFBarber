# 🔧 Correção - Google OAuth Redirect

## Problema Identificado

URL sendo gerado incorretamente: `/auth/google/undefined/cliente-home.html?token=...` retornava 404.

## Causa Raiz

O método `googleCallback` estava:

1. Usando caminhos com `/` no início (`/login.html`)
2. Não validando corretamente a combinação de `role` e `roles`
3. Redirecionando para rota inexistente do backend

## Solução Implementada

### ✅ Correção 1: AuthController.googleCallback

- Removidas barras `/` iniciais dos nomes de página
- Simplificada a lógica de redirecionamento por `role`
- Adicionado fallback para `FRONTEND_URL`
- Melhorado logging para debug

**Lógica de redirecionamento:**

```
roles === 'admin'        → admin.html
role === 'barbeiro'      → barbeiro.html
role === 'cliente'       → cliente-home.html
padrão                   → login.html
```

## 📋 Checklist de Variáveis de Ambiente

Certifique-se que o `.env` contém:

```env
# Backend
BACKEND_URL=https://lfbarber.onrender.com
FRONTEND_URL=https://lbarber.vercel.app
NODE_ENV=production
PORT=3000

# Google OAuth
GOOGLE_CLIENT_ID=seu_client_id
GOOGLE_CLIENT_SECRET=seu_client_secret

# JWT
JWT_SECRET=sua_chave_secreta_forte
JWT_EXPIRATION=1h

# Email
EMAIL_USER=seu_email@gmail.com
EMAIL_PASS=sua_senha_aplicativa

# Database
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
```

## 🧪 Teste Manual

1. Acesse: `https://lfbarber.onrender.com/auth/google`
2. Autorize o acesso ao Google
3. Aguarde redirect para uma destas URLs:
   - `https://lbarber.vercel.app/admin.html?token=...` (admin)
   - `https://lbarber.vercel.app/barbeiro.html?token=...` (barbeiro)
   - `https://lbarber.vercel.app/cliente-home.html?token=...` (cliente)

## 🚀 Deploy

Após as alterações:

```bash
git add .
git commit -m "fix: corrigir google oauth callback redirect"
git push origin main
```

Render.com fará redeploy automaticamente.

## 📝 Nota

Se o erro persistir após deploy:

1. Verifique `BACKEND_URL` e `FRONTEND_URL` em produção
2. Confirme credenciais Google OAuth válidas
3. Verifique logs do Render.com para erros adicionais

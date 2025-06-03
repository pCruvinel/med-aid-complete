# 🚀 Deploy no EasyPanel

## Pré-requisitos
- Conta no EasyPanel
- Acesso à sua VPS
- Git configurado na sua máquina

## Passos para Deploy

### 1. **Preparar Repositório Git**
```bash
# Se ainda não iniciou o Git
git init
git add .
git commit -m "Initial commit - A3M for Helpem"

# Criar repositório no GitHub/GitLab e fazer push
git remote add origin <sua-url-do-repositorio>
git push -u origin main
```

### 2. **Configurar no EasyPanel**

#### **Opção A: Deploy via GitHub/GitLab (Recomendado)**
1. Faça login no EasyPanel
2. Clique em **"Create App"**
3. Selecione **"Git"**
4. Configure:
   - **Repository URL**: URL do seu repositório
   - **Branch**: `main`
   - **Build Command**: `npm run build`
   - **Install Command**: `npm ci`
   - **Start Command**: Deixe vazio (usaremos Dockerfile)

#### **Opção B: Deploy via Dockerfile**
1. No EasyPanel, clique em **"Create App"**
2. Selecione **"Dockerfile"**
3. Conecte seu repositório Git
4. O EasyPanel detectará automaticamente o Dockerfile

### 3. **Configurações da Aplicação**

#### **Variáveis de Ambiente** (se necessário)
- `NODE_ENV=production`
- Outras variáveis específicas do seu projeto

#### **Domínio**
1. Vá em **"Domains"** na sua aplicação
2. Adicione seu domínio personalizado
3. Configure SSL automático

### 4. **Build e Deploy**
1. Clique em **"Deploy"**
2. Acompanhe os logs de build
3. Aguarde a conclusão do deploy

## ⚙️ Configurações de Produção

### **Recursos Recomendados**
- **CPU**: 0.5 cores
- **RAM**: 512MB - 1GB
- **Storage**: 1GB

### **Health Check**
- **Path**: `/`
- **Port**: `80`

### **Logs**
- Monitore os logs em tempo real no painel do EasyPanel

## 🔧 Troubleshooting

### **Build Falhou**
```bash
# Limpar cache npm
npm cache clean --force
```

### **Aplicação não inicia**
- Verifique os logs do container
- Confirme se o nginx.conf está correto
- Verifique se a porta 80 está exposta

### **Problemas de CORS/API**
- Verifique a URL do webhook em `src/config/webhook.ts`
- Confirme se o domínio está correto

## 📱 Acesso
Após o deploy bem-sucedido:
- **URL temporária**: Fornecida pelo EasyPanel
- **URL personalizada**: Seu domínio configurado

## 🔄 Atualizações
Para fazer atualizações:
1. Faça commit das mudanças no Git
2. Push para o repositório
3. No EasyPanel, clique em **"Redeploy"**

## ✅ Checklist Final
- [ ] Repositório Git configurado
- [ ] Dockerfile e nginx.conf presentes
- [ ] Aplicação criada no EasyPanel
- [ ] Build concluído com sucesso
- [ ] Aplicação acessível via URL
- [ ] SSL configurado (se usando domínio próprio)
- [ ] Webhook funcionando corretamente 
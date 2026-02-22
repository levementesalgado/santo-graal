#!/bin/bash

# Script de Inicialização - Projeto de Análise de Dados Agrícolas CONAB
# Desenvolvido para Linux Debian e derivados - Versão Resiliente (v1.1)

# Cores para saída
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # Sem cor

echo -e "${BLUE}====================================================${NC}"
echo -e "${BLUE}   Inicialização do Projeto de Análise CONAB 2026   ${NC}"
echo -e "${BLUE}====================================================${NC}"

# 1. Verificar dependências do sistema
echo -e "\n${YELLOW}[1/4] Verificando dependências do sistema...${NC}"
if ! command -v node &> /dev/null; then
    echo -e "${RED}Erro: Node.js não encontrado. Por favor, instale o Node.js (v18+).${NC}"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo -e "${RED}Erro: npm não encontrado. Por favor, instale o npm.${NC}"
    exit 1
fi

NODE_VERSION=$(node -v)
echo -e "${GREEN}✓ Node.js encontrado: $NODE_VERSION${NC}"

# 2. Configurar npm para maior resiliência
echo -e "\n${YELLOW}[2/4] Otimizando configurações do npm para conexões instáveis...${NC}"
npm config set fetch-retry-maxtimeout 120000
npm config set fetch-retry-mintimeout 20000
npm config set fetch-retries 5
npm config set timeout 60000
echo -e "${GREEN}✓ Configurações de timeout e retentativa aplicadas.${NC}"

# 3. Instalar dependências do projeto
echo -e "\n${YELLOW}[3/4] Instalando dependências do projeto...${NC}"
echo -e "${BLUE}Tentando instalar via npm (com configurações de resiliência)...${NC}"

# Tentar instalar com cache limpo se houver erro persistente
npm install --no-audit --no-fund

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Dependências instaladas com sucesso!${NC}"
else
    echo -e "${RED}Falha na instalação padrão. Tentando modo de recuperação (limpeza de cache)...${NC}"
    npm cache clean --force
    npm install --no-audit --no-fund
    
    if [ $? -ne 0 ]; then
        echo -e "${RED}Erro persistente de rede detectado.${NC}"
        echo -e "${YELLOW}DICA: Se você estiver em uma rede instável, tente usar o pnpm:${NC}"
        echo -e "${YELLOW}      sudo npm install -g pnpm && pnpm install${NC}"
        exit 1
    fi
fi

# 4. Configurar ambiente e Finalização
echo -e "\n${YELLOW}[4/4] Finalizando configuração...${NC}"
if [ ! -f .env ]; then
    echo "VITE_ENABLE_ROUTE_MESSAGING=true" > .env
    echo -e "${GREEN}✓ Arquivo .env criado.${NC}"
fi

echo -e "${BLUE}====================================================${NC}"
echo -e "${GREEN}Projeto pronto! Comandos úteis:${NC}"
echo -e "${YELLOW}  npm run dev   - Iniciar servidor local${NC}"
echo -e "${YELLOW}  npm run build - Gerar versão de produção${NC}"
echo -e "${BLUE}====================================================${NC}"

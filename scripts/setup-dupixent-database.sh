#!/bin/bash

echo "🚀 Configurando banco de dados com dados do Dupixent..."

# Verificar se o arquivo .env existe
if [ ! -f .env ]; then
    echo "📝 Arquivo .env não encontrado. Copiando de env.example..."
    cp env.example .env
    echo "⚠️  Por favor, configure o arquivo .env com suas variáveis de ambiente."
fi

# Verificar se o MongoDB está rodando
echo "🔍 Verificando conexão com MongoDB..."

# Executar o script de configuração do banco
echo "💾 Executando configuração do banco de dados..."
npm run seed:dupixent

echo "✅ Configuração do banco concluída!" 
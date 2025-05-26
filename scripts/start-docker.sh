#!/bin/bash

# Script para inicializar a aplicação com Docker Compose
echo "🚀 Iniciando Drug Indication Service com Docker..."

# Verificar se o arquivo .env existe
if [ ! -f .env ]; then
    echo "⚠️  Arquivo .env não encontrado. Copiando de env.example..."
    cp env.example .env
    echo "📝 Por favor, edite o arquivo .env com suas configurações antes de continuar."
    echo "   Especialmente o JWT_SECRET e outras configurações sensíveis."
    exit 1
fi

# Parar containers existentes
echo "🛑 Parando containers existentes..."
docker-compose down

# Construir e iniciar os serviços
echo "🔨 Construindo e iniciando serviços..."
docker-compose up -d --build

# Aguardar os serviços ficarem prontos
echo "⏳ Aguardando serviços ficarem prontos..."
sleep 10

# Verificar status dos serviços
echo "📊 Status dos serviços:"
docker-compose ps

# Executar seed de dados (opcional)
read -p "🌱 Deseja executar o seed de dados do Dupixent? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🌱 Executando seed de dados..."
    docker-compose exec api npm run seed:dupixent
fi

echo "✅ Drug Indication Service está rodando!"
echo "📚 API Documentation: http://localhost:3000/api-docs"
echo "🏥 Health Check: http://localhost:3000/health"
echo "📝 Para ver os logs: docker-compose logs -f api" 
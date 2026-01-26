#!/usr/bin/env bash

set -e

echo "🔧 EAS Pre-Build Hook - Configurando Firebase..."

# Decodificar google-services.json do secret
if [ -n "$GOOGLE_SERVICES_JSON" ]; then
  echo "📱 Criando google-services.json para Android..."
  echo "$GOOGLE_SERVICES_JSON" | base64 -d > google-services.json
  echo "✅ google-services.json criado com sucesso"
else
  echo "⚠️  GOOGLE_SERVICES_JSON secret não encontrado"
fi

# Decodificar GoogleService-Info.plist do secret
if [ -n "$GOOGLE_SERVICE_INFO_PLIST" ]; then
  echo "🍎 Criando GoogleService-Info.plist para iOS..."
  echo "$GOOGLE_SERVICE_INFO_PLIST" | base64 -d > GoogleService-Info.plist
  echo "✅ GoogleService-Info.plist criado com sucesso"
else
  echo "⚠️  GOOGLE_SERVICE_INFO_PLIST secret não encontrado"
fi

echo "✅ Hook concluído!"

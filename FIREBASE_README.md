# Firebase Analytics - Guia Completo

## ✅ Status: Implementado

O Firebase Analytics está totalmente configurado e funcionando no Guia do Aventureiro.

---

## 🔧 Configuração Inicial

### 1. Criar Projeto no Firebase Console

1. Acesse [Firebase Console](https://console.firebase.google.com/)
2. Crie projeto: **Guia do Aventureiro**
3. Habilite Google Analytics

### 2. Adicionar Apps

**Android:**
- Package: `com.guiaaventureiro.app`
- Baixar `google-services.json` → colocar na raiz de `mobile/`

**iOS:**
- Bundle ID: `com.guiaaventureiro.app`
- Baixar `GoogleService-Info.plist` → colocar na raiz de `mobile/`

### 3. Rebuild (após adicionar arquivos)

```bash
# Android
npx expo run:android

# iOS
npx expo run:ios
```

---

## 📊 Eventos Rastreados

### Navegação
- `screen_view` - Visualização de telas

### Autenticação
- `sign_up` - Novo cadastro
- `login` - Login realizado

### Roteiros
- `itinerary_create` - Roteiro criado
- `itinerary_view` - Roteiro visualizado
- `itinerary_edit` - Roteiro editado
- `itinerary_delete` - Roteiro deletado
- `itinerary_duplicate` - Roteiro duplicado
- `itinerary_share` - Roteiro compartilhado

### IA
- `ai_suggestion_request` - Solicitação de roteiro IA
- `ai_suggestion_accept` - Aceitação de sugestão IA

### Fotos
- `photo_upload` - Upload de foto(s)
  - Parâmetros: `count`, `source` (camera/gallery)

### Engajamento
- `rating_submit` - Avaliação enviada
  - Parâmetros: `rating_value`, `itinerary_id`

### Busca
- `search_destination` - Busca de destino

---

## 📁 Arquivos do Sistema

### Implementação
- `src/services/analyticsService.ts` - Serviço centralizado
- `src/navigation/RootNavigator.tsx` - Tracking de navegação
- `src/services/itineraryService.ts` - Events de roteiros
- `src/services/photoService.ts` - Events de fotos
- `src/services/authService.ts` - Events de autenticação

### Configuração
- `google-services.json.example` - Template Android
- `GoogleService-Info.plist.example` - Template iOS
- `app.json` - Plugins Firebase configurados

---

## 🎯 Propriedades do Usuário

- `user_id` - ID do usuário
- `is_premium` - Status premium (true/false)

---

## 🔍 Debug & Visualização

### DebugView (Tempo Real)

```bash
# Android
adb shell setprop debug.firebase.analytics.app com.guiaaventureiro.app

# iOS - adicionar ao scheme:
-FIRDebugEnabled
```

### Dashboard
1. Firebase Console → Analytics → Dashboard
2. **Eventos**: Lista completa de events
3. **Conversões**: Metas e KPIs
4. **Públicos**: Segmentos de usuários
5. **Funil**: Fluxo de navegação

---

## 🔒 Privacidade

- ✅ Sem dados pessoais (nomes, emails)
- ✅ User IDs anonimizados
- ✅ Opt-out disponível em Configurações do Perfil
- ✅ GDPR compliant

### Código de Opt-out

```typescript
// Em ProfileScreen - Toggle analytics
await analyticsService.setEnabled(false);
```

---

## 💡 Uso do Analytics Service

```typescript
import analyticsService from '@/services/analyticsService';

// Inicializar (feito automaticamente no RootNavigator)
await analyticsService.initialize();

// Rastrear evento customizado
await analyticsService.trackEvent('custom_event', {
  param1: 'value1',
  param2: 123
});

// Definir propriedade de usuário
await analyticsService.setUserProperty('custom_prop', 'value');

// Desabilitar analytics
await analyticsService.setEnabled(false);
```

---

## ⚙️ Configuração em app.json

```json
{
  "plugins": [
    "@react-native-firebase/app",
    "@react-native-firebase/analytics"
  ]
}
```

---

## 📦 Dependências

```json
{
  "@react-native-firebase/app": "^23.8.3",
  "@react-native-firebase/analytics": "^23.8.3",
  "expo-firebase-analytics": "^8.0.0"
}
```

---

## 🐛 Troubleshooting

### Analytics não aparece no console
- Aguarde 24h (dados podem demorar)
- Use DebugView para ver em tempo real
- Verifique se `google-services.json` está correto

### Erro ao buildar
- Limpe cache: `npx expo start --clear`
- Rebuild: `npx expo run:android` (não use Expo Go)

### Eventos não disparam
- Verifique se `analyticsService.initialize()` foi chamado
- Confira console.log em modo DEBUG

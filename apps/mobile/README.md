# ClinicOps Mobile

App mobile React Native + Expo para o sistema ClinicOps.

## Funcionalidades

- Login com autenticacao Supabase
- Visualizacao de atendimentos do dia
- Lista de pacientes com busca
- Detalhes do paciente com historico
- Registro de novos atendimentos
- Integracao direta com WhatsApp e telefone

## Setup

```bash
# Instalar dependencias
cd apps/mobile
npm install

# Iniciar o app
npm start

# Abrir no Android
npm run android

# Abrir no iOS
npm run ios
```

## Estrutura

```
src/
  contexts/     # Context providers (Auth)
  hooks/        # Custom hooks (usePacientes, useAtendimentos)
  lib/          # Bibliotecas (Supabase client)
  navigation/   # Navegacao React Navigation
  screens/      # Telas do app
  types/        # Tipos TypeScript
```

## Configuracao

As credenciais do Supabase estao configuradas em `app.json` na secao `extra`.

## Build

Para gerar APK/IPA:

```bash
# Android
npm run build:android

# iOS  
npm run build:ios
```

Requer configuracao do EAS (Expo Application Services).

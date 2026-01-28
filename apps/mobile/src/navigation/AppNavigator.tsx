/**
 * Navegador principal do app.
 * Gerencia rotas autenticadas e nao autenticadas.
 */

import React from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { useAuth } from '../contexts/AuthContext'

import { LoginScreen } from '../screens/LoginScreen'
import { HomeScreen } from '../screens/HomeScreen'
import { PacientesScreen } from '../screens/PacientesScreen'
import { PacienteDetalheScreen } from '../screens/PacienteDetalheScreen'
import { NovoAtendimentoScreen } from '../screens/NovoAtendimentoScreen'
import type { RootStackParamList } from './types'

const Stack = createNativeStackNavigator<RootStackParamList>()

const screenOptions = {
  headerStyle: {
    backgroundColor: '#FFF',
  },
  headerTintColor: '#0F172A',
  headerTitleStyle: {
    fontWeight: '600' as const,
  },
  headerShadowVisible: false,
  headerBackTitleVisible: false,
}

export function AppNavigator() {
  const { isAuthenticated, isLoading } = useAuth()

  // Enquanto verifica autenticacao, nao renderiza nada
  // O LoginScreen mostra loading enquanto isLoading for true
  if (isLoading) {
    return null
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={screenOptions}>
        {!isAuthenticated ? (
          // Rotas nao autenticadas
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ headerShown: false }}
          />
        ) : (
          // Rotas autenticadas
          <>
            <Stack.Screen
              name="Home"
              component={HomeScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Pacientes"
              component={PacientesScreen}
              options={{ title: 'Pacientes' }}
            />
            <Stack.Screen
              name="PacienteDetalhe"
              component={PacienteDetalheScreen}
              options={{ title: 'Detalhes' }}
            />
            <Stack.Screen
              name="NovoAtendimento"
              component={NovoAtendimentoScreen}
              options={{ title: 'Novo Atendimento' }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  )
}

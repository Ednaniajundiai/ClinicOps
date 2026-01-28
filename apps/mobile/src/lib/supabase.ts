/**
 * Cliente Supabase para React Native.
 * Usa expo-secure-store para persistencia segura da sessao.
 */

import { createClient } from '@supabase/supabase-js'
import * as SecureStore from 'expo-secure-store'
import Constants from 'expo-constants'
import type { Database } from '../types/database.types'

// Obtem configuracoes do app.json
const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl ?? ''
const supabaseAnonKey = Constants.expoConfig?.extra?.supabaseAnonKey ?? ''

/**
 * Adaptador de storage usando SecureStore do Expo.
 * Permite persistencia segura da sessao de autenticacao.
 */
const ExpoSecureStoreAdapter = {
  getItem: async (key: string): Promise<string | null> => {
    try {
      return await SecureStore.getItemAsync(key)
    } catch {
      return null
    }
  },
  setItem: async (key: string, value: string): Promise<void> => {
    try {
      await SecureStore.setItemAsync(key, value)
    } catch {
      // Silently fail - pode acontecer em alguns simuladores
    }
  },
  removeItem: async (key: string): Promise<void> => {
    try {
      await SecureStore.deleteItemAsync(key)
    } catch {
      // Silently fail
    }
  },
}

/**
 * Instancia singleton do cliente Supabase.
 */
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: ExpoSecureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})

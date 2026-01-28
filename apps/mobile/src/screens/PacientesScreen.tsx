/**
 * Tela de Lista de Pacientes.
 * Exibe lista com busca e navegacao para detalhes.
 */

import React, { useEffect, useState, useCallback } from 'react'
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { usePacientes } from '../hooks/usePacientes'
import type { Paciente } from '../types/database.types'
import type { RootStackParamList } from '../navigation/types'

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Pacientes'>

export function PacientesScreen() {
  const navigation = useNavigation<NavigationProp>()
  const { pacientes, isLoading, fetchPacientes, searchPacientes } = usePacientes()
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchPacientes()
  }, [fetchPacientes])

  // Debounce da busca
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim()) {
        searchPacientes(searchQuery.trim())
      } else {
        fetchPacientes()
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [searchQuery, searchPacientes, fetchPacientes])

  const formatarTelefone = (telefone: string | null) => {
    if (!telefone) return '-'
    return telefone
  }

  const getInitials = (nome: string) => {
    const parts = nome.split(' ')
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase()
    }
    return nome.substring(0, 2).toUpperCase()
  }

  const renderPaciente = useCallback(({ item }: { item: Paciente }) => (
    <TouchableOpacity
      style={styles.pacienteCard}
      onPress={() => navigation.navigate('PacienteDetalhe', { pacienteId: item.id })}
    >
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{getInitials(item.nome)}</Text>
      </View>
      <View style={styles.pacienteInfo}>
        <Text style={styles.pacienteNome}>{item.nome}</Text>
        <View style={styles.pacienteDetails}>
          <Ionicons name="call-outline" size={14} color="#64748B" />
          <Text style={styles.telefone}>{formatarTelefone(item.telefone)}</Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#CBD5E1" />
    </TouchableOpacity>
  ), [navigation])

  return (
    <View style={styles.container}>
      {/* Barra de busca */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color="#9CA3AF" />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar paciente..."
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Lista de pacientes */}
      {isLoading && pacientes.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0891B2" />
        </View>
      ) : pacientes.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="people-outline" size={64} color="#CBD5E1" />
          <Text style={styles.emptyTitle}>Nenhum paciente encontrado</Text>
          <Text style={styles.emptySubtitle}>
            {searchQuery ? 'Tente outro termo de busca' : 'Cadastre pacientes pelo sistema web'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={pacientes}
          keyExtractor={(item) => item.id}
          renderItem={renderPaciente}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={fetchPacientes}
              colors={['#0891B2']}
            />
          }
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#0F172A',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 8,
  },
  listContent: {
    paddingVertical: 16,
  },
  pacienteCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E0F2FE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0891B2',
  },
  pacienteInfo: {
    flex: 1,
  },
  pacienteNome: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 4,
  },
  pacienteDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  telefone: {
    fontSize: 14,
    color: '#64748B',
  },
  separator: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginLeft: 82,
  },
})

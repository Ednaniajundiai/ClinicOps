/**
 * Tela Home/Dashboard.
 * Exibe resumo e atendimentos do dia.
 */

import React, { useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { useAuth } from '../contexts/AuthContext'
import { useAtendimentos } from '../hooks/useAtendimentos'
import type { RootStackParamList } from '../navigation/types'

type NavigationProp = NativeStackNavigationProp<RootStackParamList>

export function HomeScreen() {
  const navigation = useNavigation<NavigationProp>()
  const { usuario, clinica, signOut } = useAuth()
  const { atendimentos, isLoading, fetchAtendimentosHoje } = useAtendimentos()

  useEffect(() => {
    fetchAtendimentosHoje()
  }, [fetchAtendimentosHoje])

  const formatarHora = (dataHora: string) => {
    const data = new Date(dataHora)
    return data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      agendado: '#3B82F6',
      confirmado: '#10B981',
      em_andamento: '#F59E0B',
      concluido: '#6B7280',
      cancelado: '#EF4444',
      faltou: '#DC2626',
    }
    return colors[status] || '#6B7280'
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Ola, {usuario?.nome?.split(' ')[0]}</Text>
          <Text style={styles.clinicName}>{clinica?.nome}</Text>
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={signOut}>
          <Ionicons name="log-out-outline" size={24} color="#64748B" />
        </TouchableOpacity>
      </View>

      {/* Cards de navegacao */}
      <View style={styles.cardsContainer}>
        <TouchableOpacity
          style={styles.card}
          onPress={() => navigation.navigate('Pacientes')}
        >
          <View style={[styles.cardIcon, { backgroundColor: '#E0F2FE' }]}>
            <Ionicons name="people" size={24} color="#0891B2" />
          </View>
          <Text style={styles.cardTitle}>Pacientes</Text>
          <Text style={styles.cardSubtitle}>Ver lista</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.card}
          onPress={() => navigation.navigate('NovoAtendimento', {})}
        >
          <View style={[styles.cardIcon, { backgroundColor: '#DCFCE7' }]}>
            <Ionicons name="add-circle" size={24} color="#16A34A" />
          </View>
          <Text style={styles.cardTitle}>Atendimento</Text>
          <Text style={styles.cardSubtitle}>Novo registro</Text>
        </TouchableOpacity>
      </View>

      {/* Atendimentos do dia */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Atendimentos de Hoje</Text>
        
        <ScrollView
          style={styles.atendimentosList}
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={fetchAtendimentosHoje}
              colors={['#0891B2']}
            />
          }
        >
          {isLoading && atendimentos.length === 0 ? (
            <ActivityIndicator size="small" color="#0891B2" style={styles.loader} />
          ) : atendimentos.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="calendar-outline" size={48} color="#CBD5E1" />
              <Text style={styles.emptyText}>Nenhum atendimento hoje</Text>
            </View>
          ) : (
            atendimentos.map((atendimento) => (
              <View key={atendimento.id} style={styles.atendimentoCard}>
                <View style={styles.atendimentoTime}>
                  <Text style={styles.timeText}>{formatarHora(atendimento.data_hora)}</Text>
                </View>
                <View style={styles.atendimentoInfo}>
                  <Text style={styles.pacienteNome}>
                    {atendimento.paciente?.nome ?? 'Paciente'}
                  </Text>
                  <Text style={styles.tipoAtendimento}>{atendimento.tipo}</Text>
                </View>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: getStatusColor(atendimento.status) + '20' },
                  ]}
                >
                  <Text
                    style={[
                      styles.statusText,
                      { color: getStatusColor(atendimento.status) },
                    ]}
                  >
                    {atendimento.status.replace('_', ' ')}
                  </Text>
                </View>
              </View>
            ))
          )}
        </ScrollView>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  clinicName: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 2,
  },
  logoutButton: {
    padding: 8,
  },
  cardsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 20,
    gap: 12,
  },
  card: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  cardIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
  },
  cardSubtitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  section: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 16,
  },
  atendimentosList: {
    flex: 1,
  },
  loader: {
    marginTop: 40,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#94A3B8',
    marginTop: 12,
  },
  atendimentoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  atendimentoTime: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 12,
  },
  timeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
  },
  atendimentoInfo: {
    flex: 1,
  },
  pacienteNome: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0F172A',
  },
  tipoAtendimento: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
})

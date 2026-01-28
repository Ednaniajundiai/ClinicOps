/**
 * Tela de Detalhes do Paciente.
 * Exibe informacoes e historico de atendimentos.
 */

import React, { useEffect, useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
  RefreshControl,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useNavigation, useRoute } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { RouteProp } from '@react-navigation/native'
import { usePacientes } from '../hooks/usePacientes'
import { useAtendimentos } from '../hooks/useAtendimentos'
import type { Paciente } from '../types/database.types'
import type { RootStackParamList } from '../navigation/types'

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'PacienteDetalhe'>
type RouteType = RouteProp<RootStackParamList, 'PacienteDetalhe'>

export function PacienteDetalheScreen() {
  const navigation = useNavigation<NavigationProp>()
  const route = useRoute<RouteType>()
  const { pacienteId } = route.params

  const { getPaciente } = usePacientes()
  const { atendimentos, isLoading: loadingAtendimentos, fetchAtendimentos } = useAtendimentos()
  
  const [paciente, setPaciente] = useState<Paciente | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [pacienteId])

  const loadData = async () => {
    setIsLoading(true)
    const data = await getPaciente(pacienteId)
    setPaciente(data)
    await fetchAtendimentos(pacienteId)
    setIsLoading(false)
  }

  const handleCall = () => {
    if (paciente?.telefone) {
      Linking.openURL(`tel:${paciente.telefone}`)
    }
  }

  const handleWhatsApp = () => {
    if (paciente?.telefone) {
      const phone = paciente.telefone.replace(/\D/g, '')
      Linking.openURL(`whatsapp://send?phone=55${phone}`)
    }
  }

  const formatarData = (data: string | null) => {
    if (!data) return '-'
    return new Date(data).toLocaleDateString('pt-BR')
  }

  const formatarDataHora = (dataHora: string) => {
    const data = new Date(dataHora)
    return data.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    })
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

  const getSexoLabel = (sexo: string | null) => {
    if (!sexo) return '-'
    const labels: Record<string, string> = {
      M: 'Masculino',
      F: 'Feminino',
      O: 'Outro',
    }
    return labels[sexo] || sexo
  }

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0891B2" />
      </View>
    )
  }

  if (!paciente) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
        <Text style={styles.errorText}>Paciente nao encontrado</Text>
      </View>
    )
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={isLoading} onRefresh={loadData} colors={['#0891B2']} />
      }
    >
      {/* Header com avatar e acoes */}
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {paciente.nome.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()}
          </Text>
        </View>
        <Text style={styles.nome}>{paciente.nome}</Text>
        
        <View style={styles.actionButtons}>
          {paciente.telefone && (
            <>
              <TouchableOpacity style={styles.actionButton} onPress={handleCall}>
                <Ionicons name="call" size={22} color="#0891B2" />
                <Text style={styles.actionButtonText}>Ligar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton} onPress={handleWhatsApp}>
                <Ionicons name="logo-whatsapp" size={22} color="#25D366" />
                <Text style={styles.actionButtonText}>WhatsApp</Text>
              </TouchableOpacity>
            </>
          )}
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('NovoAtendimento', { pacienteId: paciente.id })}
          >
            <Ionicons name="add-circle" size={22} color="#16A34A" />
            <Text style={styles.actionButtonText}>Atendimento</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Informacoes pessoais */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Informacoes Pessoais</Text>
        <View style={styles.infoGrid}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Telefone</Text>
            <Text style={styles.infoValue}>{paciente.telefone || '-'}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Email</Text>
            <Text style={styles.infoValue}>{paciente.email || '-'}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Nascimento</Text>
            <Text style={styles.infoValue}>{formatarData(paciente.data_nascimento)}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Sexo</Text>
            <Text style={styles.infoValue}>{getSexoLabel(paciente.sexo)}</Text>
          </View>
        </View>
      </View>

      {/* Endereco */}
      {(paciente.endereco || paciente.cidade) && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Endereco</Text>
          <View style={styles.addressCard}>
            <Ionicons name="location-outline" size={20} color="#64748B" />
            <Text style={styles.addressText}>
              {[paciente.endereco, paciente.cidade, paciente.estado]
                .filter(Boolean)
                .join(', ')}
              {paciente.cep && ` - CEP: ${paciente.cep}`}
            </Text>
          </View>
        </View>
      )}

      {/* Observacoes */}
      {paciente.observacoes && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Observacoes</Text>
          <View style={styles.observacoesCard}>
            <Text style={styles.observacoesText}>{paciente.observacoes}</Text>
          </View>
        </View>
      )}

      {/* Historico de atendimentos */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Historico de Atendimentos</Text>
        
        {loadingAtendimentos && atendimentos.length === 0 ? (
          <ActivityIndicator size="small" color="#0891B2" style={{ marginTop: 20 }} />
        ) : atendimentos.length === 0 ? (
          <View style={styles.emptyAtendimentos}>
            <Text style={styles.emptyText}>Nenhum atendimento registrado</Text>
          </View>
        ) : (
          atendimentos.map((atendimento) => (
            <View key={atendimento.id} style={styles.atendimentoCard}>
              <View style={styles.atendimentoHeader}>
                <Text style={styles.atendimentoData}>
                  {formatarDataHora(atendimento.data_hora)}
                </Text>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: getStatusColor(atendimento.status) + '20' },
                  ]}
                >
                  <Text
                    style={[styles.statusText, { color: getStatusColor(atendimento.status) }]}
                  >
                    {atendimento.status.replace('_', ' ')}
                  </Text>
                </View>
              </View>
              <Text style={styles.atendimentoTipo}>{atendimento.tipo}</Text>
              {atendimento.descricao && (
                <Text style={styles.atendimentoDescricao}>{atendimento.descricao}</Text>
              )}
            </View>
          ))
        )}
      </View>

      {/* Espaco inferior */}
      <View style={{ height: 40 }} />
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  errorText: {
    fontSize: 16,
    color: '#64748B',
    marginTop: 16,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 24,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#0891B2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFF',
  },
  nome: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 16,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  actionButtonText: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
  },
  section: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 12,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  infoItem: {
    width: '50%',
    marginBottom: 16,
  },
  infoLabel: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 15,
    color: '#0F172A',
    fontWeight: '500',
  },
  addressCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 12,
  },
  addressText: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  observacoesCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  observacoesText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  emptyAtendimentos: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  emptyText: {
    fontSize: 14,
    color: '#94A3B8',
  },
  atendimentoCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  atendimentoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  atendimentoData: {
    fontSize: 13,
    color: '#64748B',
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
  atendimentoTipo: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 4,
  },
  atendimentoDescricao: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
  },
})

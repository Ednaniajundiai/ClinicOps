/**
 * Tela de Novo Atendimento.
 * Formulario para registrar um atendimento.
 */

import React, { useEffect, useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useNavigation, useRoute } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { RouteProp } from '@react-navigation/native'
import { usePacientes } from '../hooks/usePacientes'
import { useAtendimentos } from '../hooks/useAtendimentos'
import type { Paciente, StatusAtendimento } from '../types/database.types'
import type { RootStackParamList } from '../navigation/types'

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'NovoAtendimento'>
type RouteType = RouteProp<RootStackParamList, 'NovoAtendimento'>

const TIPOS_ATENDIMENTO = [
  'Consulta',
  'Retorno',
  'Exame',
  'Procedimento',
  'Avaliacao',
  'Emergencia',
]

const STATUS_OPTIONS: { value: StatusAtendimento; label: string }[] = [
  { value: 'agendado', label: 'Agendado' },
  { value: 'confirmado', label: 'Confirmado' },
  { value: 'em_andamento', label: 'Em Andamento' },
  { value: 'concluido', label: 'Concluido' },
]

export function NovoAtendimentoScreen() {
  const navigation = useNavigation<NavigationProp>()
  const route = useRoute<RouteType>()
  const pacienteIdParam = route.params?.pacienteId

  const { pacientes, fetchPacientes, getPaciente } = usePacientes()
  const { createAtendimento } = useAtendimentos()

  const [selectedPaciente, setSelectedPaciente] = useState<Paciente | null>(null)
  const [showPacienteSelect, setShowPacienteSelect] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  
  const [tipo, setTipo] = useState('Consulta')
  const [status, setStatus] = useState<StatusAtendimento>('agendado')
  const [descricao, setDescricao] = useState('')
  const [observacoes, setObservacoes] = useState('')
  const [valor, setValor] = useState('')
  
  const [isLoading, setIsLoading] = useState(false)
  const [loadingPaciente, setLoadingPaciente] = useState(false)

  // Carrega paciente se veio da tela de detalhes
  useEffect(() => {
    if (pacienteIdParam) {
      loadPaciente(pacienteIdParam)
    }
  }, [pacienteIdParam])

  // Carrega lista de pacientes para selecao
  useEffect(() => {
    fetchPacientes()
  }, [fetchPacientes])

  const loadPaciente = async (id: string) => {
    setLoadingPaciente(true)
    const paciente = await getPaciente(id)
    setSelectedPaciente(paciente)
    setLoadingPaciente(false)
  }

  const handleSubmit = async () => {
    if (!selectedPaciente) {
      Alert.alert('Erro', 'Selecione um paciente')
      return
    }

    setIsLoading(true)

    const { success, error } = await createAtendimento({
      paciente_id: selectedPaciente.id,
      data_hora: new Date().toISOString(),
      tipo,
      status,
      descricao: descricao.trim() || null,
      observacoes: observacoes.trim() || null,
      valor: valor ? parseFloat(valor.replace(',', '.')) : null,
    })

    setIsLoading(false)

    if (success) {
      Alert.alert('Sucesso', 'Atendimento registrado com sucesso', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ])
    } else {
      Alert.alert('Erro', error || 'Erro ao registrar atendimento')
    }
  }

  const filteredPacientes = searchQuery
    ? pacientes.filter((p) =>
        p.nome.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : pacientes

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      {/* Selecao de Paciente */}
      <View style={styles.section}>
        <Text style={styles.label}>Paciente *</Text>
        
        {loadingPaciente ? (
          <ActivityIndicator size="small" color="#0891B2" />
        ) : selectedPaciente ? (
          <TouchableOpacity
            style={styles.selectedPaciente}
            onPress={() => setShowPacienteSelect(true)}
          >
            <View style={styles.pacienteAvatar}>
              <Text style={styles.avatarText}>
                {selectedPaciente.nome.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()}
              </Text>
            </View>
            <View style={styles.pacienteInfo}>
              <Text style={styles.pacienteNome}>{selectedPaciente.nome}</Text>
              <Text style={styles.pacienteTelefone}>{selectedPaciente.telefone || '-'}</Text>
            </View>
            <Ionicons name="chevron-down" size={20} color="#64748B" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.selectButton}
            onPress={() => setShowPacienteSelect(true)}
          >
            <Ionicons name="person-add-outline" size={20} color="#64748B" />
            <Text style={styles.selectButtonText}>Selecionar paciente</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Modal de selecao de paciente inline */}
      {showPacienteSelect && (
        <View style={styles.pacienteSelectContainer}>
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={18} color="#9CA3AF" />
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar paciente..."
              placeholderTextColor="#9CA3AF"
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus
            />
          </View>
          
          <View style={styles.pacientesList}>
            {filteredPacientes.slice(0, 5).map((paciente) => (
              <TouchableOpacity
                key={paciente.id}
                style={styles.pacienteOption}
                onPress={() => {
                  setSelectedPaciente(paciente)
                  setShowPacienteSelect(false)
                  setSearchQuery('')
                }}
              >
                <Text style={styles.optionText}>{paciente.nome}</Text>
              </TouchableOpacity>
            ))}
            {filteredPacientes.length === 0 && (
              <Text style={styles.noPacientes}>Nenhum paciente encontrado</Text>
            )}
          </View>
          
          <TouchableOpacity
            style={styles.cancelSelect}
            onPress={() => {
              setShowPacienteSelect(false)
              setSearchQuery('')
            }}
          >
            <Text style={styles.cancelText}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Tipo de Atendimento */}
      <View style={styles.section}>
        <Text style={styles.label}>Tipo de Atendimento *</Text>
        <View style={styles.chipsContainer}>
          {TIPOS_ATENDIMENTO.map((t) => (
            <TouchableOpacity
              key={t}
              style={[styles.chip, tipo === t && styles.chipSelected]}
              onPress={() => setTipo(t)}
            >
              <Text style={[styles.chipText, tipo === t && styles.chipTextSelected]}>
                {t}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Status */}
      <View style={styles.section}>
        <Text style={styles.label}>Status</Text>
        <View style={styles.chipsContainer}>
          {STATUS_OPTIONS.map((s) => (
            <TouchableOpacity
              key={s.value}
              style={[styles.chip, status === s.value && styles.chipSelected]}
              onPress={() => setStatus(s.value)}
            >
              <Text style={[styles.chipText, status === s.value && styles.chipTextSelected]}>
                {s.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Descricao */}
      <View style={styles.section}>
        <Text style={styles.label}>Descricao</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Descreva o atendimento..."
          placeholderTextColor="#9CA3AF"
          value={descricao}
          onChangeText={setDescricao}
          multiline
          numberOfLines={3}
        />
      </View>

      {/* Observacoes */}
      <View style={styles.section}>
        <Text style={styles.label}>Observacoes</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Observacoes adicionais..."
          placeholderTextColor="#9CA3AF"
          value={observacoes}
          onChangeText={setObservacoes}
          multiline
          numberOfLines={3}
        />
      </View>

      {/* Valor */}
      <View style={styles.section}>
        <Text style={styles.label}>Valor (R$)</Text>
        <TextInput
          style={styles.input}
          placeholder="0,00"
          placeholderTextColor="#9CA3AF"
          value={valor}
          onChangeText={setValor}
          keyboardType="decimal-pad"
        />
      </View>

      {/* Botao de submit */}
      <View style={styles.submitContainer}>
        <TouchableOpacity
          style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <>
              <Ionicons name="checkmark-circle" size={20} color="#FFF" />
              <Text style={styles.submitButtonText}>Registrar Atendimento</Text>
            </>
          )}
        </TouchableOpacity>
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
  section: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 10,
  },
  selectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
    gap: 10,
  },
  selectButtonText: {
    fontSize: 15,
    color: '#64748B',
  },
  selectedPaciente: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#0891B2',
  },
  pacienteAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E0F2FE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0891B2',
  },
  pacienteInfo: {
    flex: 1,
  },
  pacienteNome: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0F172A',
  },
  pacienteTelefone: {
    fontSize: 13,
    color: '#64748B',
  },
  pacienteSelectContainer: {
    marginHorizontal: 20,
    marginTop: 8,
    backgroundColor: '#FFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#0F172A',
  },
  pacientesList: {
    maxHeight: 200,
  },
  pacienteOption: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  optionText: {
    fontSize: 15,
    color: '#0F172A',
  },
  noPacientes: {
    padding: 16,
    textAlign: 'center',
    color: '#94A3B8',
  },
  cancelSelect: {
    padding: 14,
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  cancelText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  chipSelected: {
    backgroundColor: '#0891B2',
    borderColor: '#0891B2',
  },
  chipText: {
    fontSize: 14,
    color: '#64748B',
  },
  chipTextSelected: {
    color: '#FFF',
    fontWeight: '500',
  },
  input: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: '#0F172A',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  submitContainer: {
    paddingHorizontal: 20,
    paddingTop: 32,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0891B2',
    borderRadius: 12,
    paddingVertical: 16,
    gap: 8,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
})

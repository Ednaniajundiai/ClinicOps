/**
 * Tipos de navegacao do app.
 */

export type RootStackParamList = {
  Login: undefined
  Home: undefined
  Pacientes: undefined
  PacienteDetalhe: { pacienteId: string }
  NovoAtendimento: { pacienteId?: string }
}

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}

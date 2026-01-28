/**
 * Templates de Email Transacionais
 * Todos os templates seguem um layout consistente
 */

const baseTemplate = (content: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ClinicOps</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); padding: 30px 40px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">ClinicOps</h1>
              <p style="margin: 8px 0 0; color: rgba(255, 255, 255, 0.9); font-size: 14px;">Gestao Inteligente de Clinicas</p>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              ${content}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 24px 40px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 8px; color: #6b7280; font-size: 12px;">
                Este email foi enviado automaticamente pelo sistema ClinicOps.
              </p>
              <p style="margin: 0; color: #9ca3af; font-size: 11px;">
                Em caso de duvidas, entre em contato com o suporte.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`

/**
 * Email de boas-vindas para novos usuarios
 */
export function welcomeEmail(params: {
  nome: string
  email: string
  clinicaNome: string
}) {
  const content = `
    <h2 style="margin: 0 0 24px; color: #111827; font-size: 24px; font-weight: 600;">
      Bem-vindo ao ClinicOps!
    </h2>
    <p style="margin: 0 0 16px; color: #374151; font-size: 16px; line-height: 1.6;">
      Ola, <strong>${params.nome}</strong>!
    </p>
    <p style="margin: 0 0 16px; color: #374151; font-size: 16px; line-height: 1.6;">
      Sua conta foi criada com sucesso na clinica <strong>${params.clinicaNome}</strong>.
    </p>
    <p style="margin: 0 0 24px; color: #374151; font-size: 16px; line-height: 1.6;">
      Agora voce tem acesso a todas as funcionalidades do sistema para gerenciar pacientes, 
      atendimentos e documentos de forma simples e segura.
    </p>
    <div style="text-align: center; margin: 32px 0;">
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/login" 
         style="display: inline-block; background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-weight: 600; font-size: 16px;">
        Acessar o Sistema
      </a>
    </div>
    <p style="margin: 0; color: #6b7280; font-size: 14px;">
      Seu email de acesso: <strong>${params.email}</strong>
    </p>
  `

  return {
    subject: `Bem-vindo ao ClinicOps, ${params.nome}!`,
    html: baseTemplate(content),
    text: `Bem-vindo ao ClinicOps, ${params.nome}! Sua conta foi criada na clinica ${params.clinicaNome}. Acesse: ${process.env.NEXT_PUBLIC_APP_URL}/login`,
  }
}

/**
 * Email de confirmacao de assinatura
 */
export function subscriptionConfirmedEmail(params: {
  nome: string
  planoNome: string
  valor: number
  dataRenovacao: string
}) {
  const valorFormatado = params.valor.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })

  const content = `
    <h2 style="margin: 0 0 24px; color: #111827; font-size: 24px; font-weight: 600;">
      Assinatura Confirmada!
    </h2>
    <p style="margin: 0 0 16px; color: #374151; font-size: 16px; line-height: 1.6;">
      Ola, <strong>${params.nome}</strong>!
    </p>
    <p style="margin: 0 0 24px; color: #374151; font-size: 16px; line-height: 1.6;">
      Sua assinatura do plano <strong>${params.planoNome}</strong> foi confirmada com sucesso.
    </p>
    <div style="background-color: #f0fdf4; border: 1px solid #86efac; border-radius: 8px; padding: 20px; margin: 24px 0;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="color: #166534; font-size: 14px; padding-bottom: 8px;">Plano:</td>
          <td style="color: #166534; font-size: 14px; font-weight: 600; text-align: right; padding-bottom: 8px;">${params.planoNome}</td>
        </tr>
        <tr>
          <td style="color: #166534; font-size: 14px; padding-bottom: 8px;">Valor Mensal:</td>
          <td style="color: #166534; font-size: 14px; font-weight: 600; text-align: right; padding-bottom: 8px;">${valorFormatado}</td>
        </tr>
        <tr>
          <td style="color: #166534; font-size: 14px;">Proxima Renovacao:</td>
          <td style="color: #166534; font-size: 14px; font-weight: 600; text-align: right;">${params.dataRenovacao}</td>
        </tr>
      </table>
    </div>
    <p style="margin: 0 0 16px; color: #374151; font-size: 16px; line-height: 1.6;">
      Voce pode gerenciar sua assinatura a qualquer momento no painel administrativo.
    </p>
  `

  return {
    subject: `Assinatura do plano ${params.planoNome} confirmada!`,
    html: baseTemplate(content),
    text: `Assinatura confirmada! Plano: ${params.planoNome}, Valor: ${valorFormatado}, Proxima renovacao: ${params.dataRenovacao}`,
  }
}

/**
 * Email de recuperacao de senha
 */
export function passwordResetEmail(params: {
  nome: string
  resetUrl: string
}) {
  const content = `
    <h2 style="margin: 0 0 24px; color: #111827; font-size: 24px; font-weight: 600;">
      Redefinir Senha
    </h2>
    <p style="margin: 0 0 16px; color: #374151; font-size: 16px; line-height: 1.6;">
      Ola, <strong>${params.nome}</strong>!
    </p>
    <p style="margin: 0 0 16px; color: #374151; font-size: 16px; line-height: 1.6;">
      Recebemos uma solicitacao para redefinir a senha da sua conta no ClinicOps.
    </p>
    <p style="margin: 0 0 24px; color: #374151; font-size: 16px; line-height: 1.6;">
      Clique no botao abaixo para criar uma nova senha:
    </p>
    <div style="text-align: center; margin: 32px 0;">
      <a href="${params.resetUrl}" 
         style="display: inline-block; background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-weight: 600; font-size: 16px;">
        Redefinir Senha
      </a>
    </div>
    <div style="background-color: #fef3c7; border: 1px solid #fcd34d; border-radius: 8px; padding: 16px; margin: 24px 0;">
      <p style="margin: 0; color: #92400e; font-size: 14px;">
        <strong>Importante:</strong> Este link expira em 1 hora. Se voce nao solicitou 
        a redefinicao de senha, ignore este email.
      </p>
    </div>
    <p style="margin: 0; color: #6b7280; font-size: 14px;">
      Se o botao nao funcionar, copie e cole o link abaixo no seu navegador:
      <br><br>
      <span style="color: #2563eb; word-break: break-all;">${params.resetUrl}</span>
    </p>
  `

  return {
    subject: 'Redefinir senha - ClinicOps',
    html: baseTemplate(content),
    text: `Ola ${params.nome}! Para redefinir sua senha, acesse: ${params.resetUrl}. Este link expira em 1 hora.`,
  }
}

/**
 * Email de lembrete de atendimento
 */
export function appointmentReminderEmail(params: {
  pacienteNome: string
  profissionalNome: string
  dataHora: string
  tipo: string
  clinicaNome: string
}) {
  const content = `
    <h2 style="margin: 0 0 24px; color: #111827; font-size: 24px; font-weight: 600;">
      Lembrete de Consulta
    </h2>
    <p style="margin: 0 0 16px; color: #374151; font-size: 16px; line-height: 1.6;">
      Ola, <strong>${params.pacienteNome}</strong>!
    </p>
    <p style="margin: 0 0 24px; color: #374151; font-size: 16px; line-height: 1.6;">
      Este e um lembrete da sua consulta agendada:
    </p>
    <div style="background-color: #eff6ff; border: 1px solid #93c5fd; border-radius: 8px; padding: 20px; margin: 24px 0;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="color: #1e40af; font-size: 14px; padding-bottom: 8px;">Clinica:</td>
          <td style="color: #1e40af; font-size: 14px; font-weight: 600; text-align: right; padding-bottom: 8px;">${params.clinicaNome}</td>
        </tr>
        <tr>
          <td style="color: #1e40af; font-size: 14px; padding-bottom: 8px;">Profissional:</td>
          <td style="color: #1e40af; font-size: 14px; font-weight: 600; text-align: right; padding-bottom: 8px;">${params.profissionalNome}</td>
        </tr>
        <tr>
          <td style="color: #1e40af; font-size: 14px; padding-bottom: 8px;">Tipo:</td>
          <td style="color: #1e40af; font-size: 14px; font-weight: 600; text-align: right; padding-bottom: 8px;">${params.tipo}</td>
        </tr>
        <tr>
          <td style="color: #1e40af; font-size: 14px;">Data e Hora:</td>
          <td style="color: #1e40af; font-size: 14px; font-weight: 600; text-align: right;">${params.dataHora}</td>
        </tr>
      </table>
    </div>
    <p style="margin: 0; color: #6b7280; font-size: 14px;">
      Em caso de imprevistos, entre em contato com a clinica para reagendar.
    </p>
  `

  return {
    subject: `Lembrete: Consulta agendada - ${params.dataHora}`,
    html: baseTemplate(content),
    text: `Lembrete de consulta: ${params.tipo} com ${params.profissionalNome} em ${params.dataHora} na ${params.clinicaNome}.`,
  }
}

/**
 * Email de exportacao LGPD
 */
export function lgpdExportEmail(params: {
  nome: string
  downloadUrl: string
}) {
  const content = `
    <h2 style="margin: 0 0 24px; color: #111827; font-size: 24px; font-weight: 600;">
      Seus Dados estao Prontos
    </h2>
    <p style="margin: 0 0 16px; color: #374151; font-size: 16px; line-height: 1.6;">
      Ola, <strong>${params.nome}</strong>!
    </p>
    <p style="margin: 0 0 16px; color: #374151; font-size: 16px; line-height: 1.6;">
      Conforme sua solicitacao, preparamos a exportacao dos seus dados pessoais 
      armazenados em nosso sistema, em conformidade com a Lei Geral de Protecao 
      de Dados (LGPD).
    </p>
    <div style="text-align: center; margin: 32px 0;">
      <a href="${params.downloadUrl}" 
         style="display: inline-block; background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-weight: 600; font-size: 16px;">
        Baixar Meus Dados
      </a>
    </div>
    <div style="background-color: #fef3c7; border: 1px solid #fcd34d; border-radius: 8px; padding: 16px; margin: 24px 0;">
      <p style="margin: 0; color: #92400e; font-size: 14px;">
        <strong>Importante:</strong> Este link expira em 24 horas por motivos de seguranca. 
        O arquivo contem informacoes sensiveis, guarde-o em local seguro.
      </p>
    </div>
  `

  return {
    subject: 'Exportacao de Dados (LGPD) - ClinicOps',
    html: baseTemplate(content),
    text: `Ola ${params.nome}! Sua exportacao de dados LGPD esta pronta. Baixe em: ${params.downloadUrl}. Link valido por 24 horas.`,
  }
}

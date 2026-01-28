/**
 * Servico de Email Transacional
 * Suporta Resend e Brevo como provedores
 */

export interface EmailOptions {
  to: string | string[]
  subject: string
  html: string
  text?: string
  from?: string
  replyTo?: string
}

export interface EmailResult {
  success: boolean
  messageId?: string
  error?: string
}

// Usar email verificado no Brevo ou Resend
const DEFAULT_FROM_EMAIL = process.env.EMAIL_FROM || 'noreply@clinicops.com.br'
const DEFAULT_FROM_NAME = process.env.EMAIL_FROM_NAME || 'ClinicOps'
const DEFAULT_FROM = `${DEFAULT_FROM_NAME} <${DEFAULT_FROM_EMAIL}>`

/**
 * Envia email usando Resend
 */
async function sendWithResend(options: EmailOptions): Promise<EmailResult> {
  const apiKey = process.env.RESEND_API_KEY

  if (!apiKey) {
    console.warn('RESEND_API_KEY nao configurada')
    return { success: false, error: 'Servico de email nao configurado' }
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: options.from || DEFAULT_FROM,
        to: Array.isArray(options.to) ? options.to : [options.to],
        subject: options.subject,
        html: options.html,
        text: options.text,
        reply_to: options.replyTo,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      return { success: false, error: data.message || 'Erro ao enviar email' }
    }

    return { success: true, messageId: data.id }
  } catch (error) {
    console.error('Erro ao enviar email (Resend):', error)
    return { success: false, error: 'Erro ao conectar com servico de email' }
  }
}

/**
 * Envia email usando Brevo (SendinBlue)
 */
async function sendWithBrevo(options: EmailOptions): Promise<EmailResult> {
  const apiKey = process.env.BREVO_API_KEY

  if (!apiKey) {
    console.warn('BREVO_API_KEY nao configurada')
    return { success: false, error: 'Servico de email nao configurado' }
  }

  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sender: { 
          name: DEFAULT_FROM_NAME, 
          email: DEFAULT_FROM_EMAIL 
        },
        to: Array.isArray(options.to) 
          ? options.to.map(email => ({ email }))
          : [{ email: options.to }],
        subject: options.subject,
        htmlContent: options.html,
        textContent: options.text,
        replyTo: options.replyTo ? { email: options.replyTo } : undefined,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      return { success: false, error: data.message || 'Erro ao enviar email' }
    }

    return { success: true, messageId: data.messageId }
  } catch (error) {
    console.error('Erro ao enviar email (Brevo):', error)
    return { success: false, error: 'Erro ao conectar com servico de email' }
  }
}

/**
 * Envia email usando o provedor configurado
 * Prioridade: RESEND > BREVO
 */
export async function sendEmail(options: EmailOptions): Promise<EmailResult> {
  // Tentar Resend primeiro
  if (process.env.RESEND_API_KEY) {
    return sendWithResend(options)
  }
  
  // Fallback para Brevo
  if (process.env.BREVO_API_KEY) {
    return sendWithBrevo(options)
  }

  // Em desenvolvimento, apenas logar
  if (process.env.NODE_ENV === 'development') {
    console.log('=== EMAIL (DEV MODE) ===')
    console.log('To:', options.to)
    console.log('Subject:', options.subject)
    console.log('========================')
    return { success: true, messageId: 'dev-mode' }
  }

  return { success: false, error: 'Nenhum servico de email configurado' }
}

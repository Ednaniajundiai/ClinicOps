import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendEmail } from '@/lib/email'
import { 
  welcomeEmail, 
  subscriptionConfirmedEmail, 
  passwordResetEmail,
  appointmentReminderEmail 
} from '@/lib/email/templates'

// Supabase client com service role para operacoes administrativas
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { tipo, dados } = body

    if (!tipo || !dados) {
      return NextResponse.json(
        { error: 'Tipo e dados sao obrigatorios' },
        { status: 400 }
      )
    }

    let emailContent: { subject: string; html: string; text: string }
    let destinatario: string

    switch (tipo) {
      case 'boas_vindas':
        if (!dados.nome || !dados.email || !dados.clinicaNome) {
          return NextResponse.json(
            { error: 'Dados incompletos para email de boas-vindas' },
            { status: 400 }
          )
        }
        emailContent = welcomeEmail({
          nome: dados.nome,
          email: dados.email,
          clinicaNome: dados.clinicaNome,
        })
        destinatario = dados.email
        break

      case 'assinatura_confirmada':
        if (!dados.nome || !dados.email || !dados.planoNome || !dados.valor) {
          return NextResponse.json(
            { error: 'Dados incompletos para email de assinatura' },
            { status: 400 }
          )
        }
        emailContent = subscriptionConfirmedEmail({
          nome: dados.nome,
          planoNome: dados.planoNome,
          valor: dados.valor,
          dataRenovacao: dados.dataRenovacao || 'Em 30 dias',
        })
        destinatario = dados.email
        break

      case 'recuperar_senha':
        if (!dados.nome || !dados.email || !dados.resetUrl) {
          return NextResponse.json(
            { error: 'Dados incompletos para email de recuperacao' },
            { status: 400 }
          )
        }
        emailContent = passwordResetEmail({
          nome: dados.nome,
          resetUrl: dados.resetUrl,
        })
        destinatario = dados.email
        break

      case 'lembrete_atendimento':
        if (!dados.pacienteNome || !dados.email || !dados.profissionalNome) {
          return NextResponse.json(
            { error: 'Dados incompletos para lembrete' },
            { status: 400 }
          )
        }
        emailContent = appointmentReminderEmail({
          pacienteNome: dados.pacienteNome,
          profissionalNome: dados.profissionalNome,
          dataHora: dados.dataHora,
          tipo: dados.tipo || 'Consulta',
          clinicaNome: dados.clinicaNome,
        })
        destinatario = dados.email
        break

      default:
        return NextResponse.json(
          { error: `Tipo de email desconhecido: ${tipo}` },
          { status: 400 }
        )
    }

    const result = await sendEmail({
      to: destinatario,
      subject: emailContent.subject,
      html: emailContent.html,
      text: emailContent.text,
    })

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Erro ao enviar email' },
        { status: 500 }
      )
    }

    // Registrar envio de email na auditoria (opcional)
    await supabaseAdmin.from('auditoria').insert({
      acao: 'INSERT',
      tabela: 'emails_enviados',
      registro_id: result.messageId || 'unknown',
      dados_novos: {
        tipo,
        destinatario,
        assunto: emailContent.subject,
        enviado_em: new Date().toISOString(),
      },
    }).single()

    return NextResponse.json({
      success: true,
      messageId: result.messageId,
    })
  } catch (error) {
    console.error('Erro na API de email:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

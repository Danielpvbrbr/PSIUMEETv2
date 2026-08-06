// app/api/auditoria/[salaId]/route.js
import { NextResponse } from 'next/server';
import { db } from '../../../db';
import { salas, logsAuditoria } from '../../../db/schema';
import { eq, asc } from 'drizzle-orm';

export async function GET(request, { params }) {
  try {
    const { salaId } = await params;

    // 1. Busca os dados da sala agendada
    const [sala] = await db.select().from(salas).where(eq(salas.id, salaId));

    if (!sala) {
      return NextResponse.json({ erro: 'Sala não encontrada' }, { status: 404 });
    }

    // 2. Busca todo o histórico de eventos da sala ordenado pelo horário
    const logs = await db
      .select()
      .from(logsAuditoria)
      .where(eq(logsAuditoria.salaId, salaId))
      .orderBy(asc(logsAuditoria.criadoEm));

    // 3. Separa os logs por participante
    const logsProf = logs.filter(l => l.role === 'prof');
    const logsAluno = logs.filter(l => l.role === 'aluno');

    // 4. Retorna a síntese pericial dos acessos e a linha do tempo completa
    return NextResponse.json({
      salaId: sala.id,
      idAgendamentoExterno: sala.idAgendamentoExterno,
      horariosAgendados: {
        inicio: sala.inicio,
        fim: sala.fim
      },
      metricas: {
        professor: {
          presente: logsProf.length > 0,
          primeiroAcesso: logsProf[0]?.criadoEm || null,
          ultimoAcesso: logsProf[logsProf.length - 1]?.criadoEm || null,
          totalEventos: logsProf.length
        },
        aluno: {
          presente: logsAluno.length > 0,
          primeiroAcesso: logsAluno[0]?.criadoEm || null,
          ultimoAcesso: logsAluno[logsAluno.length - 1]?.criadoEm || null,
          totalEventos: logsAluno.length
        }
      },
      linhaDoTempo: logs.map(l => ({
        horario: l.criadoEm,
        role: l.role,
        evento: l.evento
      }))
    });

  } catch (error) {
    console.error('Erro ao consultar auditoria:', error);
    return NextResponse.json({ erro: 'Falha ao processar auditoria' }, { status: 500 });
  }
}
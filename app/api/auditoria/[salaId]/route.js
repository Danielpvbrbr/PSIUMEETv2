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
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }

    // 2. Busca todo o histórico de eventos da sala ordenado pelo horário
    const logs = await db
      .select()
      .from(logsAuditoria)
      .where(eq(logsAuditoria.salaId, salaId))
      .orderBy(asc(logsAuditoria.criadoEm));

    // 3. Separa os logs por participante 
    // (Checamos prof/aluno também para garantir compatibilidade com testes antigos)
    const logsHost = logs.filter(l => l.role === 'host' || l.role === 'prof' || l.role === '1');
    const logsGuest = logs.filter(l => l.role === 'guest' || l.role === 'aluno' || l.role === '2');

    // 4. Retorna a síntese pericial dos acessos e a linha do tempo completa
    // Tudo no novo padrão Flat e em Inglês!
    return NextResponse.json({
      roomId: sala.id,
      roomName: sala.roomName,
      externalId: sala.externalId,
      schedule: {
        startTime: sala.startTime,
        endTime: sala.endTime
      },
      metrics: {
        host: {
          name: sala.hostName,
          present: logsHost.length > 0,
          firstAccess: logsHost[0]?.criadoEm || null,
          lastAccess: logsHost[logsHost.length - 1]?.criadoEm || null,
          totalEvents: logsHost.length
        },
        guest: {
          name: sala.guestName,
          present: logsGuest.length > 0,
          firstAccess: logsGuest[0]?.criadoEm || null,
          lastAccess: logsGuest[logsGuest.length - 1]?.criadoEm || null,
          totalEvents: logsGuest.length
        }
      },
      timeline: logs.map(l => {
        // Padroniza a string de saída para host/guest
        let finalRole = l.role;
        if (l.role === 'prof' || l.role === '1') finalRole = 'host';
        if (l.role === 'aluno' || l.role === '2') finalRole = 'guest';

        return {
          timestamp: l.criadoEm,
          role: finalRole,
          event: l.evento
        };
      })
    });

  } catch (error) {
    console.error('Erro ao consultar auditoria:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
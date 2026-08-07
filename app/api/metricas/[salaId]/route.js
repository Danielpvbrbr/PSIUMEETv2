import { NextResponse } from 'next/server';
import { db } from '../../../db';
import { salas, logsAuditoria } from '../../../db/schema';
import { eq } from 'drizzle-orm';

export async function GET(request, { params }) {
  try {
    const { salaId } = await params;

    // 1. Verifica se a sala existe
    const [sala] = await db.select().from(salas).where(eq(salas.id, salaId));

    if (!sala) {
      return NextResponse.json({ erro: 'Sala não encontrada' }, { status: 404 });
    }

    // 2. Busca os logs para descobrir quem está online
    const logs = await db.select().from(logsAuditoria).where(eq(logsAuditoria.salaId, salaId));
    
    let status = 'aguardando';
    let participantesOnline = 0;

    const agora = new Date();

    // Se o tempo da sala já acabou, ela está encerrada
    if (agora >= sala.endTime) {
      status = 'encerrado';
    } else {
      // Lógica rápida para saber se há alguém online olhando os logs
      const hostEntrou = logs.filter(l => (l.role === 'host' || l.role === 'prof') && l.evento === 'PARTICIPANTE_ENTROU').length;
      const hostSaiu = logs.filter(l => (l.role === 'host' || l.role === 'prof') && l.evento === 'PARTICIPANTE_SAIU').length;
      const guestEntrou = logs.filter(l => (l.role === 'guest' || l.role === 'aluno') && l.evento === 'PARTICIPANTE_ENTROU').length;
      const guestSaiu = logs.filter(l => (l.role === 'guest' || l.role === 'aluno') && l.evento === 'PARTICIPANTE_SAIU').length;

      const hostOnline = hostEntrou > hostSaiu;
      const guestOnline = guestEntrou > guestSaiu;

      if (hostOnline) participantesOnline++;
      if (guestOnline) participantesOnline++;

      if (participantesOnline === 1) status = 'conectando';
      if (participantesOnline === 2) status = 'conectado';
    }

    // 3. Simula métricas saudáveis de uma conexão P2P WebRTC
    // (Num futuro avançado, podemos pegar isso direto do getStats() do navegador)
    const latenciaBase = status === 'conectado' ? 20 + Math.floor(Math.random() * 15) : 0; // 20ms a 35ms
    const jitterBase = status === 'conectado' ? 2 + Math.floor(Math.random() * 5) : 0;     // 2ms a 7ms
    const bitrateBase = status === 'conectado' ? 1200 + Math.floor(Math.random() * 300) : 0; // 1200kbps a 1500kbps

    return NextResponse.json({
      salaId: sala.id,
      status: status,
      participantes: participantesOnline,
      latenciaMs: latenciaBase,
      jitterMs: jitterBase,
      packetLoss: status === 'conectado' ? 0.1 : 0,
      bitrateKbps: bitrateBase,
      atualizadoEm: new Date().toISOString()
    });

  } catch (error) {
    console.error('Erro ao buscar métricas:', error);
    return NextResponse.json({ erro: 'Erro interno no servidor' }, { status: 500 });
  }
}
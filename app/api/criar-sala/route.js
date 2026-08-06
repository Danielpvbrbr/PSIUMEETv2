import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { db } from '../../db';
import { salas } from '../../db/schema';

// Função auxiliar para processar e criar a sala no banco
async function processarCriacaoSala(dados, reqHost, reqProto) {
  let { nomeSala, idAgendamentoExterno, horarioInicio, horarioFim, minutos } = dados;

  const agora = new Date();
  
  // Se não passar inicio, assume AGORA
  const dataInicio = horarioInicio ? new Date(horarioInicio) : agora;

  // Se não passar fim, calcula com base na duração informada (padrão: 60 minutos)
  let dataFim;
  if (horarioFim) {
    dataFim = new Date(horarioFim);
  } else {
    const duracaoMinutos = minutos ? parseInt(minutos, 10) : 60;
    dataFim = new Date(dataInicio.getTime() + duracaoMinutos * 60000);
  }

  const roomId = crypto.randomUUID();

  // Salva no SQLite via Drizzle
  await db.insert(salas).values({
    id: roomId,
    nome: nomeSala || 'Aula Agendada',
    idAgendamentoExterno: idAgendamentoExterno || null,
    inicio: dataInicio,
    fim: dataFim,
  });

  // Detecta dinamicamente a URL (Ngrok, Localhost ou Produção)
  const baseUrl = `${reqProto}://${reqHost}`;

  return {
    sucesso: true,
    roomId: roomId,
    nomeSala: nomeSala || 'Aula Agendada',
    // Retorna os links formatados com type=1 (Prof) e type=2 (Aluno)
    linkProfessor: `${baseUrl}/reuniao/${roomId}?type=1`,
    linkAluno: `${baseUrl}/reuniao/${roomId}?type=2`,
    // Mantém compatibilidade caso queira usar role=prof ou role=aluno
    linkProfessorRole: `${baseUrl}/reuniao/${roomId}?role=prof`,
    linkAlunoRole: `${baseUrl}/reuniao/${roomId}?role=aluno`,
    horarios: {
      inicio: dataInicio.toISOString(),
      fim: dataFim.toISOString(),
      duracaoMinutos: Math.round((dataFim - dataInicio) / 60000)
    }
  };
}

// 1. Método POST (Recebe JSON no Body)
export async function POST(request) {
  try {
    const body = await request.json();
    const host = request.headers.get('host');
    const proto = request.headers.get('x-forwarded-proto') || 'http';

    const resultado = await processarCriacaoSala(body, host, proto);
    return NextResponse.json(resultado);

  } catch (error) {
    console.error('Erro ao criar sala via POST:', error);
    return NextResponse.json({ erro: 'Falha interna ao criar sala' }, { status: 500 });
  }
}

// 2. Método GET (Prático para Postman, Swagger e Navegador)
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    
    const dados = {
      nomeSala: searchParams.get('nomeSala'),
      idAgendamentoExterno: searchParams.get('idAgendamentoExterno'),
      horarioInicio: searchParams.get('horarioInicio'),
      horarioFim: searchParams.get('horarioFim'),
      minutos: searchParams.get('minutos')
    };

    const host = request.headers.get('host');
    const proto = request.headers.get('x-forwarded-proto') || 'http';

    const resultado = await processarCriacaoSala(dados, host, proto);
    return NextResponse.json(resultado);

  } catch (error) {
    console.error('Erro ao criar sala via GET:', error);
    return NextResponse.json({ erro: 'Falha interna ao criar sala' }, { status: 500 });
  }
}
import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { db } from '../../db';
import { salas } from '../../db/schema';

async function processarCriacaoSala(dados, reqHost, reqProto) {
  let {
    roomName,
    externalId,
    startTime,
    endTime,
    duration,
    showEndButton,
    endWarningText,
    hostName,
    hostAvatar,
    guestName,
    guestAvatar,
    endRedirect
  } = dados;

  const agora = new Date();
  const dataInicio = startTime ? new Date(startTime) : agora;

  let dataFim;
  if (endTime) {
    dataFim = new Date(endTime);
  } else {
    const duracaoMinutos = duration ? parseInt(duration, 10) : 60;
    dataFim = new Date(dataInicio.getTime() + duracaoMinutos * 60000);
  }

  const finalMostrarBotao = (showEndButton === false || showEndButton === 'false') ? false : true;
  const finalTextoAviso = endWarningText || "Tem certeza que deseja encerrar esta sessão? Esta ação não poderá ser desfeita.";
  const roomId = crypto.randomUUID();

  // Insert com as novas colunas
  await db.insert(salas).values({
    id: roomId,
    roomName: roomName || 'Scheduled Room',
    externalId: externalId || null,
    startTime: dataInicio,
    endTime: dataFim,
    showEndButton: finalMostrarBotao,
    endWarningText: finalTextoAviso,
    hostName: hostName || 'Host',
    hostAvatar: hostAvatar || null,
    guestName: guestName || 'Guest',
    guestAvatar: guestAvatar || null,
    endRedirect: endRedirect || null
  });

  const baseUrl = `${reqProto}://${reqHost}`;

  // Retorno da API 100% em inglês (Padrão Internacional)
  return {
    success: true,
    roomId: roomId,
    roomName: roomName || 'Scheduled Room',
    hostLink: `${baseUrl}/reuniao/${roomId}?type=1`,
    guestLink: `${baseUrl}/reuniao/${roomId}?type=2`,
    schedule: {
      startTime: dataInicio.toISOString(),
      endTime: dataFim.toISOString(),
      durationMinutes: Math.round((dataFim - dataInicio) / 60000)
    }
  };
}

export async function POST(request) {
  try {
    const body = await request.json();
    const host = request.headers.get('host');
    const proto = request.headers.get('x-forwarded-proto') || (host.includes('localhost') ? 'http' : 'https');

    const resultado = await processarCriacaoSala(body, host, proto);
    return NextResponse.json(resultado);

  } catch (error) {
    console.error('Erro ao criar sala via POST:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);

    // Mapeando a query string em inglês
    const dados = {
      roomName: searchParams.get('roomName'),
      externalId: searchParams.get('externalId'),
      startTime: searchParams.get('startTime'),
      endTime: searchParams.get('endTime'),
      duration: searchParams.get('duration'),
      showEndButton: searchParams.get('showEndButton'),
      endWarningText: searchParams.get('endWarningText')
    };

    const host = request.headers.get('host');
    const proto = request.headers.get('x-forwarded-proto') || 'http';

    const resultado = await processarCriacaoSala(dados, host, proto);
    return NextResponse.json(resultado);

  } catch (error) {
    console.error('Erro ao criar sala via GET:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
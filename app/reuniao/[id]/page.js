import { db } from '../../db';
import { salas } from '../../db/schema';
import { eq } from 'drizzle-orm';
import SalaDeEspera from './SalaDeEspera';
import SalaAtiva from './SalaAtiva';
import SalaEncerrada from './SalaEncerrada';

export default async function PageReuniao({ params, searchParams }) {
  const { id } = await params;
  const resolvedSearchParams = await searchParams;
  
  // Traduz os parâmetros de entrada para os papéis 'host' e 'guest'
  const typeParam = resolvedSearchParams.type;
  const roleParam = resolvedSearchParams.role;

  let role = 'guest'; // Convidado como padrão por segurança
  if (typeParam === '1' || roleParam === 'prof' || roleParam === 'host') {
    role = 'host';
  } else if (typeParam === '2' || roleParam === 'aluno' || roleParam === 'guest') {
    role = 'guest';
  }

  const [sala] = await db.select().from(salas).where(eq(salas.id, id));

  if (!sala) {
    return (
      <div className="bg-[#0a0c10] h-screen flex items-center justify-center text-[#9aa2b1] text-lg font-sans">
        Sala não encontrada ou link inválido.
      </div>
    );
  }

  // Converte todas as datas para timestamp numérico para comparação garantida
  const agoraMs = new Date().getTime();
  const inicioMs = new Date(sala.startTime).getTime();
  const fimMs = new Date(sala.endTime).getTime();

  // 1. Checa se já passou do horário de término
  if (agoraMs >= fimMs) {
    return <SalaEncerrada sala={sala} role={role} />;
  }

  // 2. Checa se ainda não deu o horário de início
  if (agoraMs < inicioMs) {
    return <SalaDeEspera sala={sala} role={role} />;
  }

  // 3. Sala ativa dentro do horário estipulado
  return <SalaAtiva sala={sala} role={role} />;
}
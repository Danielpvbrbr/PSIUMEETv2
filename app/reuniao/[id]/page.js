import { db } from '../../db';
import { salas } from '../../db/schema';
import { eq } from 'drizzle-orm';
import SalaDeEspera from './SalaDeEspera';
import SalaAtiva from './SalaAtiva';
import SalaEncerrada from './SalaEncerrada';

export default async function PageReuniao({ params, searchParams }) {
  const { id } = await params;
  const resolvedSearchParams = await searchParams;
  
  // Agora traduzimos internamente para 'host' e 'guest' (mantendo compatibilidade com type=1 e type=2)
  const typeParam = resolvedSearchParams.type;
  const roleParam = resolvedSearchParams.role;

  let role = 'guest'; // Convidado é o padrão (segurança)
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

  const agora = new Date();

  // ATUALIZADO: Usando os novos nomes do banco em inglês (endTime e startTime)
  if (agora >= sala.endTime) {
    return <SalaEncerrada sala={sala} role={role} />;
  }

  if (agora < sala.startTime) {
    return <SalaDeEspera sala={sala} role={role} />;
  }

  return <SalaAtiva sala={sala} role={role} />;
}
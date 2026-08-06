import { db } from '../../db';
import { salas } from '../../db/schema';
import { eq } from 'drizzle-orm';
import SalaDeEspera from './SalaDeEspera';
import SalaAtiva from './SalaAtiva';
import SalaEncerrada from './SalaEncerrada';

export default async function PageReuniao({ params, searchParams }) {
  const { id } = await params;
  const resolvedSearchParams = await searchParams;
  
  // Trata 'type=1' (ou 'role=prof') como 'prof', e 'type=2' (ou 'role=aluno') como 'aluno'
  const typeParam = resolvedSearchParams.type;
  const roleParam = resolvedSearchParams.role;

  let role = 'aluno'; // Padrão
  if (typeParam === '1' || roleParam === 'prof') {
    role = 'prof';
  } else if (typeParam === '2' || roleParam === 'aluno') {
    role = 'aluno';
  }

  const [sala] = await db.select().from(salas).where(eq(salas.id, id));

  if (!sala) {
    return (
      <div className="bg-gray-900 h-screen flex items-center justify-center text-white text-xl">
        Sala não encontrada.
      </div>
    );
  }

  const agora = new Date();

  if (agora >= sala.fim) {
    return <SalaEncerrada sala={sala} role={role} />;
  }

  if (agora < sala.inicio) {
    return <SalaDeEspera sala={sala} role={role} />;
  }

  return <SalaAtiva sala={sala} role={role} />;
}
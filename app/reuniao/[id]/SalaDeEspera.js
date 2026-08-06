"use client";
import { useEffect, useState } from 'react';

export default function SalaDeEspera({ sala, role }) {
  const [tempoFaltante, setTempoFaltante] = useState('Calculando...');

  useEffect(() => {
    const atualizarCronometro = () => {
      const agora = new Date().getTime();
      const inicioDaSala = new Date(sala.inicio).getTime();
      const diferenca = inicioDaSala - agora;

      if (diferenca <= 0) {
        window.location.reload();
        return;
      }

      const horas = Math.floor((diferenca % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutos = Math.floor((diferenca % (1000 * 60 * 60)) / (1000 * 60));
      const segundos = Math.floor((diferenca % (1000 * 60)) / 1000);

      setTempoFaltante(`${horas > 0 ? horas + 'h ' : ''}${minutos}m ${segundos}s`);
    };

    atualizarCronometro();
    const timer = setInterval(atualizarCronometro, 1000);

    return () => clearInterval(timer);
  }, [sala.inicio]);

  return (
    <div className="bg-gray-900 h-screen w-full flex flex-col items-center justify-center text-white">
      <div className="bg-gray-800 p-10 rounded-2xl shadow-2xl flex flex-col items-center text-center max-w-md border border-gray-700">
        <span className="text-xs font-semibold px-3 py-1 bg-blue-600 rounded-full mb-4 uppercase">
          Acesso como: {role}
        </span>
        <h1 className="text-2xl font-bold mb-2">Sala de Espera</h1>
        <h2 className="text-xl text-gray-400 mb-8">{sala.nome}</h2>
        <p className="text-gray-300 mb-4">A sessão começará em:</p>
        <div className="text-5xl font-mono font-bold text-blue-500 animate-pulse">
          {tempoFaltante}
        </div>
      </div>
    </div>
  );
}
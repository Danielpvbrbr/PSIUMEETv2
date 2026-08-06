export default function SalaEncerrada({ sala, role }) {
  return (
    <div className="bg-gray-900 h-screen w-full flex flex-col items-center justify-center text-white">
      <div className="bg-gray-800 p-10 rounded-2xl shadow-2xl flex flex-col items-center text-center max-w-md border border-red-900/50">
        <div className="bg-red-500/20 p-4 rounded-full mb-6">
          <svg className="w-12 h-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold mb-2 text-red-400">Sessão Encerrada</h1>
        <p className="text-gray-300 mb-6">
          A aula <strong>{sala.nome}</strong> atingiu o horário limite de encerramento programado.
        </p>
        <button 
          onClick={() => window.location.href = '/'}
          className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg font-medium transition-colors"
        >
          Voltar ao Início
        </button>
      </div>
    </div>
  );
}
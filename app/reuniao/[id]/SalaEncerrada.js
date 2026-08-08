"use client";

export default function SalaEncerrada({ sala, role }) {
  const linkFinal = sala.endRedirect || '/';

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-[#0a0c10] text-[#edeff3] font-sans">
      <div className="flex w-full max-w-md flex-col items-center rounded-xl border border-[#232932] bg-[#12151b] p-8 text-center shadow-2xl animate-ledgerIn">
        <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-[#3a1f1c] text-[#ff8a80]">
          <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>

        <h1 className="mb-2 text-xl font-medium text-[#f4f5f7]">Sessão Encerrada</h1>

        <p className="mb-6 text-[14px] leading-relaxed text-[#9aa2b1]">
          Sessão <strong className="font-medium text-[#edeff3]">{sala.roomName}</strong>
        </p>

        <button
          onClick={() => window.location.href = linkFinal}
          className="rounded-lg border border-[#2e3540] bg-[#1c2129] px-6 py-2.5 text-[13px] font-medium text-[#c8cdd6] transition-colors hover:bg-[#282f3a] hover:text-white"
        >
          Voltar ao Início
        </button>
      </div>
    </div>
  );
}
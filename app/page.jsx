"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Fraunces, JetBrains_Mono, Inter } from "next/font/google";

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["500", "600"],
  style: ["normal", "italic"],
  variable: "--font-display",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-mono",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-body",
});

const displayFont = { fontFamily: "var(--font-display)" };
const monoFont = { fontFamily: "var(--font-mono)" };

// ---- Painel "Sessão ao vivo" (Simulação) ------------------------------------

const EVENTOS_SESSAO = [
  "PARTICIPANTE_CONECTOU",
  "ICE_NEGOCIADO",
  "BITRATE_AJUSTADO",
  "RECONEXAO_AUTOMATICA",
  "AUDIO_SINCRONIZADO",
  "PARTICIPANTE_ENTROU",
];

const NOMES_DEMO = ["VC", "P1"];

function PainelSessao() {
  const [segundos, setSegundos] = useState(4);
  const [latencia, setLatencia] = useState(28);
  const [conectados, setConectados] = useState(1);
  const [log, setLog] = useState([{ id: 1, evento: "SALA_CRIADA" }]);
  const contador = useRef(1);

  useEffect(() => {
    const tick = setInterval(() => setSegundos((s) => s + 1), 1000);
    return () => clearInterval(tick);
  }, []);

  useEffect(() => {
    const jitter = setInterval(() => {
      setLatencia(22 + Math.floor(Math.random() * 20));
    }, 1800);
    return () => clearInterval(jitter);
  }, []);

  useEffect(() => {
    const push = setInterval(() => {
      contador.current += 1;
      const evento =
        EVENTOS_SESSAO[Math.floor(Math.random() * EVENTOS_SESSAO.length)];
      if (evento === "PARTICIPANTE_CONECTOU" || evento === "PARTICIPANTE_ENTROU") {
        setConectados((c) => Math.min(c + 1, NOMES_DEMO.length));
      }
      setLog((prev) => {
        const novo = { id: contador.current, evento };
        return [novo, ...prev].slice(0, 5);
      });
    }, 2400);
    return () => clearInterval(push);
  }, []);

  const mm = String(Math.floor(segundos / 60)).padStart(2, "0");
  const ss = String(segundos % 60).padStart(2, "0");

  return (
    <div className="rounded-lg border border-[#232932] bg-[#12151b] overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-[#232932]">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="rec-ping absolute inline-flex h-full w-full rounded-full bg-[#4ade9f] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#4ade9f]"></span>
          </span>
          <span className="text-[11px] tracking-wider text-[#7fe8bb]" style={monoFont}>
            STREAM ATIVO
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-[12px] text-[#7d8697] tabular-nums" style={monoFont}>
            {latencia}ms
          </span>
          <span className="text-[13px] text-[#c8cdd6] tabular-nums" style={monoFont}>
            {mm}:{ss}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3 px-5 py-4 border-b border-[#232932]">
        <div className="flex -space-x-2">
          {NOMES_DEMO.map((iniciais, i) => (
            <div
              key={iniciais}
              className={`w-7 h-7 rounded-full border-2 border-[#12151b] bg-[#1e2530] flex items-center justify-center text-[9px] text-[#c8cdd6] transition-opacity duration-500 ${i < conectados ? "opacity-100" : "opacity-0"
                }`}
              style={monoFont}
            >
              {iniciais}
            </div>
          ))}
        </div>
        <span className="text-[11px] text-[#7d8697]" style={monoFont}>
          {conectados === NOMES_DEMO.length ? "sincronizado" : "negociando ICE..."} · Conexão P2P
        </span>
      </div>

      <div className="flex items-end gap-[3px] h-12 px-5 py-4 border-b border-[#232932]">
        {Array.from({ length: 32 }).map((_, i) => (
          <span
            key={i}
            className="wave-bar flex-1 rounded-sm bg-[#3a4250]"
            style={{ animationDelay: `${(i % 8) * 0.12}s` }}
          />
        ))}
      </div>

      <div className="px-5 py-4">
        <div className="text-[10px] tracking-wider text-[#565d6b] mb-2.5" style={monoFont}>
          LOGS DE TELEMETRIA
        </div>
        <div className="space-y-1.5">
          {log.map((entry) => (
            <div
              key={entry.id}
              className="ledger-row flex items-center gap-2 text-[11px] py-1 text-[#9aa2b1]"
              style={monoFont}
            >
              <span className="text-[#4f5866]">
                #{String(entry.id).padStart(3, "0")}
              </span>
              <span>{entry.evento}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="px-5 py-2.5 border-t border-[#232932] text-[10px] text-[#4f5866]" style={monoFont}>
        Simulação visual de telemetria da sala.
      </div>
    </div>
  );
}

// ---- Mockup de Tela de Chamada ---------------------------------------------

function IconeMic({ ligado }) {
  return ligado ? (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
      <rect x="5.5" y="1.5" width="5" height="8" rx="2.5" stroke="currentColor" strokeWidth="1.3" />
      <path d="M3 8a5 5 0 0010 0M8 13v1.8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  ) : (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
      <rect x="5.5" y="1.5" width="5" height="8" rx="2.5" stroke="currentColor" strokeWidth="1.3" />
      <path d="M3 8a5 5 0 0010 0M8 13v1.8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      <path d="M2 2L14 14" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

function IconeCamera({ ligada }) {
  return ligada ? (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
      <rect x="1.5" y="4.5" width="8.5" height="7" rx="1.6" stroke="currentColor" strokeWidth="1.3" />
      <path d="M10 7l4-2.3v6.6L10 9" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
    </svg>
  ) : (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
      <rect x="1.5" y="4.5" width="8.5" height="7" rx="1.6" stroke="currentColor" strokeWidth="1.3" />
      <path d="M10 7l4-2.3v6.6L10 9" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
      <path d="M1.5 1.5L14.5 14.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

function TelaChamada() {
  const [micLigado, setMicLigado] = useState(true);
  const [cameraLigada, setCameraLigada] = useState(true);
  const [duracao, setDuracao] = useState(132);

  useEffect(() => {
    const t = setInterval(() => setDuracao((d) => d + 1), 1000);
    return () => clearInterval(t);
  }, []);

  const mm = String(Math.floor(duracao / 60)).padStart(2, "0");
  const ss = String(duracao % 60).padStart(2, "0");

  return (
    <div className="rounded-lg border border-[#232932] bg-[#12151b] overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3 border-b border-[#232932] bg-[#151920]">
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-[#2e3540]"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-[#2e3540]"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-[#2e3540]"></div>
        </div>
        <span className="text-[11px] text-[#7d8697]" style={monoFont}>
          psiumeet.app/sala/xk29-fd8s
        </span>
        <span className="text-[11px] text-[#c8cdd6] tabular-nums" style={monoFont}>
          {mm}:{ss}
        </span>
      </div>

      <div className="relative aspect-video bg-[#0a0c10]">
        <div className="absolute inset-4 sm:inset-6 rounded-md overflow-hidden border border-[#232932] video-gradient-a flex items-center justify-center">
          <div className="relative flex items-center justify-center">
            <span className="speak-ping absolute inline-flex h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-[#4ade9f]/25"></span>
            <div
              className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#1e2530] border border-[#2e3540] flex items-center justify-center text-[13px] sm:text-[15px] text-[#c8cdd6]"
              style={monoFont}
            >
              P1
            </div>
          </div>
          <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-[#0a0c10]/70 backdrop-blur-sm rounded px-2 py-1">
            <span className="text-[#4ade9f]"><IconeMic ligado={true} /></span>
            <span className="text-[11px] text-[#e5e8ed]" style={monoFont}>Participante</span>
          </div>
        </div>

        <div className="absolute bottom-8 right-8 sm:bottom-10 sm:right-10 w-24 h-16 sm:w-32 sm:h-20 rounded-md overflow-hidden border border-[#2e3540] video-gradient-b">
          {cameraLigada ? (
            <div className="w-full h-full flex items-center justify-center">
              <div
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#12151b]/80 border border-[#3a4250] flex items-center justify-center text-[10px] text-[#9aa2b1]"
                style={monoFont}
              >
                VC
              </div>
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-[#12151b]">
              <span className="text-[#4f5866]"><IconeCamera ligada={false} /></span>
            </div>
          )}
          <div className="absolute bottom-1.5 left-1.5">
            <span className={micLigado ? "text-[#c8cdd6]" : "text-[#ff8a80]"}>
              <IconeMic ligado={micLigado} />
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center gap-2.5 px-5 py-4 border-t border-[#232932] bg-[#151920]">
        <button
          onClick={() => setMicLigado((v) => !v)}
          className={`w-9 h-9 rounded-full flex items-center justify-center border transition-colors ${micLigado
              ? "border-[#2e3540] text-[#c8cdd6] hover:border-[#565d6b]"
              : "bg-[#3a1f1c] border-[#5c2b26] text-[#ff8a80]"
            }`}
        >
          <IconeMic ligado={micLigado} />
        </button>
        <button
          onClick={() => setCameraLigada((v) => !v)}
          className={`w-9 h-9 rounded-full flex items-center justify-center border transition-colors ${cameraLigada
              ? "border-[#2e3540] text-[#c8cdd6] hover:border-[#565d6b]"
              : "bg-[#3a1f1c] border-[#5c2b26] text-[#ff8a80]"
            }`}
        >
          <IconeCamera ligada={cameraLigada} />
        </button>
        <button className="w-9 h-9 rounded-full flex items-center justify-center border border-[#2e3540] text-[#c8cdd6] hover:border-[#565d6b] transition-colors">
          <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
            <rect x="1.5" y="2.5" width="13" height="8.5" rx="1.4" stroke="currentColor" strokeWidth="1.3" />
            <path d="M8 14v-3M5.5 14h5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
          </svg>
        </button>
        <button
          className="h-9 px-4 rounded-full flex items-center justify-center gap-1.5 bg-[#ff4438] hover:bg-[#ff5b50] text-white text-[12px] font-medium transition-colors"
          style={monoFont}
        >
          Encerrar
        </button>
      </div>
    </div>
  );
}

// ---- Modal de Autenticação (Dev-to-Dev) ------------------------------------

function entrarComProvedor(provedor) {
  window.location.href = `/api/auth/${provedor}`;
}

function ModalAutenticacao({ aberto, onFechar }) {
  useEffect(() => {
    function onEsc(e) {
      if (e.key === "Escape") onFechar();
    }
    if (aberto) document.addEventListener("keydown", onEsc);
    return () => document.removeEventListener("keydown", onEsc);
  }, [aberto, onFechar]);

  if (!aberto) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center px-4"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="absolute inset-0 bg-[#040507]/80 backdrop-blur-sm modal-fade"
        onClick={onFechar}
      />

      <div className="relative w-full max-w-sm rounded-lg border border-[#232932] bg-[#12151b] p-7 modal-pop">
        <button
          onClick={onFechar}
          className="absolute top-4 right-4 text-[#565d6b] hover:text-[#c8cdd6] transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M2.5 2.5L13.5 13.5M13.5 2.5L2.5 13.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
        </button>

        <div className="text-[10px] text-[#4ade9f] tracking-wider mb-3" style={monoFont}>
          FREE TIER · RATE LIMITED
        </div>
        <h2 className="text-[22px] text-[#f4f5f7] mb-1.5" style={displayFont}>
          Acesso à API
        </h2>
        <p className="text-[13px] text-[#7d8697] mb-6 leading-relaxed">
          Autentique-se para provisionar sua API Key. O uso gratuito é regido pela nossa Política de Fair Use.
        </p>

        <div className="space-y-2.5">
          <button
            onClick={() => entrarComProvedor("google")}
            className="w-full flex items-center justify-center gap-2.5 bg-[#edeff3] hover:bg-white text-[#1a1e26] font-medium py-2.5 px-4 rounded-md text-[13px] transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 18 18">
              <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 01-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62z" />
              <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.81.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.94v2.33A9 9 0 009 18z" />
              <path fill="#FBBC05" d="M3.97 10.72A5.4 5.4 0 013.68 9c0-.6.1-1.18.29-1.72V4.95H.94A9 9 0 000 9c0 1.45.35 2.83.94 4.05l3.03-2.33z" />
              <path fill="#EA4335" d="M9 3.58c1.32 0 2.51.46 3.44 1.35l2.59-2.59C13.46.89 11.43 0 9 0A9 9 0 00.94 4.95l3.03 2.33C4.68 5.16 6.66 3.58 9 3.58z" />
            </svg>
            Continuar com Google
          </button>

          <button
            onClick={() => entrarComProvedor("github")}
            className="w-full flex items-center justify-center gap-2.5 bg-[#1a1e26] hover:bg-[#20242d] border border-[#2e3540] text-[#edeff3] font-medium py-2.5 px-4 rounded-md text-[13px] transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82a7.5 7.5 0 014 0c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0016 8c0-4.42-3.58-8-8-8z" />
            </svg>
            Continuar com GitHub
          </button>
        </div>

        <p className="text-[10px] text-[#4f5866] text-center mt-6" style={monoFont}>
          Ao autenticar, você aceita nosso SLA e termos de uso.
        </p>
      </div>
    </div>
  );
}

// ---- Página Principal ------------------------------------------------------

export default function Home() {
  const [carregando, setCarregando] = useState(false);
  const [dadosSala, setDadosSala] = useState(null);
  const [modalAberto, setModalAberto] = useState(false);
  const [tempoRequest, setTempoRequest] = useState(0);

  const criarSalaDemo = async () => {
    setCarregando(true);
    setDadosSala(null);
    const inicioRequisicao = performance.now();

    try {
      const agora = new Date();
      const inicio = new Date(agora.getTime() + 5000);
      const fim = new Date(inicio.getTime() + 15 * 60000);

      const res = await fetch("/api/criar-sala", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
        },
        body: JSON.stringify({
          nomeSala: "Sessão Técnica Sandbox",
          idAgendamentoExterno: "DEV-ENV-9081",
          horarioInicio: inicio.toISOString(),
          horarioFim: fim.toISOString(),
          mostrarBotaoEncerrar: true, // Tente colocar false pra ver o botão sumir na sala!
          textoAvisoEncerramento: "Deseja finalizar sua aula de Matemática agora?"
        }),
      });

      const data = await res.json();
      const fimRequisicao = performance.now();
      setTempoRequest(Math.round(fimRequisicao - inicioRequisicao));

      if (data.success) {
        setDadosSala(data);
      } else {
        alert("Erro na API: " + JSON.stringify(data));
      }
    } catch (erro) {
      console.error("Erro no envio:", erro);
      alert("Falha de comunicação com o servidor de vídeo.");
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div
      className={`${fraunces.variable} ${mono.variable} ${inter.variable} bg-[#0a0c10] text-[#edeff3] min-h-screen flex flex-col antialiased`}
      style={{ fontFamily: "var(--font-body)" }}
    >
      <style jsx global>{`
        @keyframes recPing {
          0% { transform: scale(1); opacity: 0.75; }
          75%, 100% { transform: scale(2.2); opacity: 0; }
        }
        .rec-ping { animation: recPing 1.8s cubic-bezier(0, 0, 0.2, 1) infinite; }

        @keyframes waveMove {
          0%, 100% { height: 15%; }
          50% { height: 85%; }
        }
        .wave-bar { animation: waveMove 1.6s ease-in-out infinite; }

        @keyframes ledgerIn {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .ledger-row { animation: ledgerIn 0.4s ease-out; }

        @keyframes modalFade {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .modal-fade { animation: modalFade 0.18s ease-out; }

        @keyframes modalPop {
          from { opacity: 0; transform: translateY(6px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .modal-pop { animation: modalPop 0.22s cubic-bezier(0.16, 1, 0.3, 1); }

        .video-gradient-a {
          background: linear-gradient(120deg, #16221f, #10161c, #1a1f2c, #12191c);
          background-size: 260% 260%;
          animation: gradientDrift 14s ease-in-out infinite;
        }
        .video-gradient-b {
          background: linear-gradient(120deg, #1a1f2c, #151b22, #1c2420);
          background-size: 260% 260%;
          animation: gradientDrift 18s ease-in-out infinite reverse;
        }
        @keyframes gradientDrift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }

        @keyframes speakPing {
          0% { transform: scale(0.9); opacity: 0.6; }
          80%, 100% { transform: scale(1.35); opacity: 0; }
        }
        .speak-ping { animation: speakPing 2.2s ease-out infinite; }

        @media (prefers-reduced-motion: reduce) {
          .rec-ping, .wave-bar, .ledger-row, .modal-fade, .modal-pop,
          .video-gradient-a, .video-gradient-b, .speak-ping {
            animation: none !important;
          }
        }
      `}</style>

      {/* HEADER */}
      <header className="border-b border-[#1c2129] bg-[#0a0c10]/90 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-[#edeff3] flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="6" stroke="#0a0c10" strokeWidth="1.3" />
                <circle cx="8" cy="8" r="2" fill="#0a0c10" />
              </svg>
            </div>
            <div className="flex items-baseline gap-1 leading-none">
              <span className="text-[17px] italic" style={displayFont}>Psiu</span>
              <span className="text-[13px] tracking-wide text-[#8b93a2]" style={monoFont}>MEET</span>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div
              className="hidden sm:flex items-center gap-2 text-[11px] text-[#7fe8bb] border border-[#1c2a25] bg-[#0f1915]/60 rounded-full px-2.5 py-1"
              style={monoFont}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#4ade9f]"></span>
              API ACTIVE
            </div>
            <Link
              href="/docs"
              className="hidden sm:block text-[13px] text-[#a8afbb] hover:text-[#edeff3] transition-colors"
            >
              Documentação API
            </Link>
            <button
              onClick={() => setModalAberto(true)}
              className="text-[13px] bg-[#edeff3] hover:bg-white text-[#0a0c10] font-medium py-2 px-4 rounded-md transition-colors"
            >
              Obter Access Token
            </button>
          </div>
        </div>
      </header>

      <main className="flex-grow">
        {/* HERO */}
        <div className="max-w-6xl mx-auto px-6 pt-20 pb-24">
          <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-14 items-center">
            <div>
              <div
                className="text-[11px] text-[#7d8697] mb-6 tracking-[0.15em] uppercase"
                style={monoFont}
              >
                Infraestrutura WebRTC · Sinalização P2P · Logs Forenses
              </div>

              <h1
                className="text-[44px] md:text-[56px] leading-[1.08] mb-6 text-[#f4f5f7]"
                style={displayFont}
              >
                Infraestrutura de vídeo 1:1.<br />
                <em className="text-[#7fe8bb] not-italic font-medium">Pronta para auditoria.</em>
              </h1>

              <p className="text-[#9aa2b1] text-[16px] md:text-[17px] leading-relaxed max-w-xl mb-9">
                Uma infraestrutura de vídeo serverless para sessões 1:1. Provisione salas via API REST. A mídia trafega em Peer-to-Peer real. A lógica de sinalização e auditoria forense é por nossa conta.
              </p>

              <div className="flex flex-wrap items-center gap-3 mb-8">
                <a
                  href="#console"
                  className="bg-[#edeff3] hover:bg-white text-[#0a0c10] font-medium py-2.5 px-5 rounded-md text-sm transition-colors"
                >
                  Abrir Sandbox
                </a>
                <Link
                  href="/docs"
                  className="border border-[#2e3540] hover:border-[#565d6b] text-[#edeff3] py-2.5 px-5 rounded-md text-sm transition-colors"
                >
                  Ler documentação técnica
                </Link>
              </div>

              {/* Sinais de confiança */}
              <div className="flex flex-wrap gap-x-6 gap-y-2 text-[12px] text-[#7d8697]" style={monoFont}>
                <span className="flex items-center gap-1.5">
                  <span className="w-1 h-1 rounded-full bg-[#4ade9f]"></span>
                  Mídia 100% P2P
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-1 h-1 rounded-full bg-[#4ade9f]"></span>
                  Latência típica &lt; 40ms
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-1 h-1 rounded-full bg-[#4ade9f]"></span>
                  Gravação Chunking Automática
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-1 h-1 rounded-full bg-[#4ade9f]"></span>
                  API-first
                </span>
              </div>
            </div>

            <PainelSessao />
          </div>
        </div>

        {/* COMO FUNCIONA */}
        <div className="max-w-6xl mx-auto px-6 pb-24">
          <div className="text-center mb-12">
            <div className="text-[11px] text-[#7d8697] mb-4 tracking-[0.15em] uppercase" style={monoFont}>
              Integration Pipeline
            </div>
            <h2 className="text-[26px] md:text-[32px] text-[#f4f5f7]" style={displayFont}>
              Provisionamento, Sinalização e Stream.
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                step: "01",
                title: "Provisionamento (API)",
                desc: "POST na /api/criar-sala retorna instantaneamente os tokens de handshake do host e convidado.",
              },
              {
                step: "02",
                title: "Sinalização WebRTC",
                desc: "Clientes inicializam via protocolo WebRTC. A conexão é negociada de forma transparente através de STUN/TURN.",
              },
              {
                step: "03",
                title: "Stream de Mídia (P2P)",
                desc: "Vídeo flui diretamente client-to-client. O servidor sai do caminho da mídia pesada após o handshake.",
              },
            ].map((item) => (
              <div key={item.step} className="border border-[#232932] bg-[#12151b] rounded-lg p-6">
                <div className="text-[11px] text-[#565d6b] mb-3" style={monoFont}>
                  {item.step}
                </div>
                <h3 className="text-[16px] text-[#edeff3] mb-2 font-medium">{item.title}</h3>
                <p className="text-[13px] text-[#7d8697] leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CONSOLE / SANDBOX */}
        <div id="console" className="max-w-6xl mx-auto px-6 pb-24 scroll-mt-20">
          <div className="max-w-3xl mx-auto border border-[#232932] bg-[#12151b] rounded-lg overflow-hidden shadow-2xl">
            <div className="px-5 py-3 border-b border-[#232932] flex items-center justify-between bg-[#151920]">
              <div className="flex items-center gap-3">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#2e3540]"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-[#2e3540]"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-[#2e3540]"></div>
                </div>
                <span className="text-xs text-[#7d8697]" style={monoFont}>
                  POST /api/criar-sala
                </span>
              </div>
              <span className="text-[10px] text-[#565d6b] uppercase tracking-wider border border-[#232932] px-2 py-0.5 rounded" style={monoFont}>
                Sandbox Interativo
              </span>
            </div>

            <div className="p-6 md:p-8">
              {!dadosSala ? (
                <div className="space-y-6">
                  {/* Bloco de Código Fake Profissional */}
                  <div
                    className="bg-[#050608] border border-[#1c2129] rounded-md p-5 text-[13px] leading-relaxed overflow-x-auto shadow-inner"
                    style={monoFont}
                  >
                    <span className="text-[#c678dd]">const</span> <span className="text-[#e5c07b]">response</span> <span className="text-[#56b6c2]">=</span> <span className="text-[#c678dd]">await</span> <span className="text-[#61afef]">fetch</span><span className="text-[#abb2bf]">(</span><span className="text-[#98c379]">&apos;/api/criar-sala&apos;</span><span className="text-[#abb2bf]">, {"{"}</span>
                    <br />
                    <span className="text-[#abb2bf]">&nbsp;&nbsp;method: </span><span className="text-[#98c379]">&apos;POST&apos;</span><span className="text-[#abb2bf]">,</span>
                    <br />
                    <span className="text-[#abb2bf]">&nbsp;&nbsp;body: </span><span className="text-[#e5c07b]">JSON</span><span className="text-[#abb2bf]">.</span><span className="text-[#56b6c2]">stringify</span><span className="text-[#abb2bf]">({"{"}</span>
                    <br />
                    <span className="text-[#abb2bf]">&nbsp;&nbsp;&nbsp;&nbsp;nomeSala: </span><span className="text-[#98c379]">&apos;Sessão Técnica #104&apos;</span>
                    <br />
                    <span className="text-[#abb2bf]">&nbsp;&nbsp;{"}"})</span>
                    <br />
                    <span className="text-[#abb2bf]">{"}"});</span>
                  </div>

                  <button
                    onClick={criarSalaDemo}
                    disabled={carregando}
                    className="w-full bg-[#edeff3] hover:bg-white disabled:bg-[#2e3540] disabled:text-[#565d6b] text-[#0a0c10] font-medium py-3 px-4 rounded-md text-sm transition-all flex items-center justify-center gap-2"
                  >
                    {carregando ? (
                      <>
                        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                        </svg>
                        Provisionando Container...
                      </>
                    ) : (
                      "Executar Request (Run)"
                    )}
                  </button>
                </div>
              ) : (
                <div className="space-y-6 animate-ledgerIn">
                  {/* Cabeçalho da Resposta */}
                  <div className="flex items-center justify-between border-b border-[#232932] pb-4">
                    <div className="flex gap-3 items-center">
                      <span className="text-[11px] text-[#0a0c10] bg-[#4ade9f] px-2 py-0.5 rounded font-bold" style={monoFont}>
                        200 OK
                      </span>
                      <span className="text-xs text-[#7d8697]" style={monoFont}>
                        {tempoRequest}ms
                      </span>
                    </div>
                    <button
                      onClick={() => setDadosSala(null)}
                      className="text-xs text-[#7d8697] hover:text-[#edeff3] transition-colors border border-[#232932] px-3 py-1.5 rounded bg-[#151920]"
                    >
                      Limpar Console
                    </button>
                  </div>

                  {/* Resposta JSON com Syntax Highlighting Profissional */}
                  <div
                    className="bg-[#050608] border border-[#1c2129] rounded-md p-5 text-[13px] leading-relaxed overflow-x-auto shadow-inner"
                    style={monoFont}
                  >
                    <span className="text-[#abb2bf]">{"{"}</span><br />
                    &nbsp;&nbsp;<span className="text-[#e06c75]">"sucesso"</span><span className="text-[#abb2bf]">: </span><span className="text-[#d19a66]">true</span><span className="text-[#abb2bf]">,</span><br />
                    &nbsp;&nbsp;<span className="text-[#e06c75]">"roomId"</span><span className="text-[#abb2bf]">: </span><span className="text-[#98c379]">"{dadosSala.roomId}"</span><span className="text-[#abb2bf]">,</span><br />
                    &nbsp;&nbsp;<span className="text-[#e06c75]">"horarios"</span><span className="text-[#abb2bf]">: {"{"}</span><br />
                    &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-[#e06c75]">"inicio"</span><span className="text-[#abb2bf]">: </span><span className="text-[#98c379]">"{dadosSala.horarios?.inicio || new Date().toISOString()}"</span><span className="text-[#abb2bf]">,</span><br />
                    &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-[#e06c75]">"fim"</span><span className="text-[#abb2bf]">: </span><span className="text-[#98c379]">"{dadosSala.horarios?.fim || new Date(Date.now() + 15 * 60000).toISOString()}"</span><br />
                    &nbsp;&nbsp;<span className="text-[#abb2bf]">{"}"},</span><br />
                    &nbsp;&nbsp;<span className="text-[#e06c75]">"links"</span><span className="text-[#abb2bf]">: {"{"}</span><br />
                    &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-[#5c6370] italic">// Endpoints de host e guest prontos para roteamento</span><br />
                    &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-[#e06c75]">"host"</span><span className="text-[#abb2bf]">: </span><span className="text-[#98c379]">"{dadosSala.linkProfessor}"</span><span className="text-[#abb2bf]">,</span><br />
                    &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-[#e06c75]">"guest"</span><span className="text-[#abb2bf]">: </span><span className="text-[#98c379]">"{dadosSala.linkAluno}"</span><br />
                    &nbsp;&nbsp;<span className="text-[#abb2bf]">{"}"}</span><br />
                    <span className="text-[#abb2bf]">{"}"}</span>
                  </div>

                  {/* Cards de "Deployment" para testar */}
                  <div className="bg-[#151920] border border-[#2e3540] rounded-md p-5">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-2 h-2 rounded-full bg-[#4ade9f] animate-pulse"></div>
                      <p className="text-[11px] text-[#9aa2b1] tracking-wider uppercase" style={monoFont}>Container Ativo</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <a
                        href={dadosSala.hostLink}
                        target="_blank"
                        className="group flex flex-col gap-1 bg-[#1a1e26] hover:bg-[#20242d] border border-[#2e3540] hover:border-[#565d6b] rounded p-4 transition-all"
                      >
                        <span className="text-sm font-medium text-[#edeff3] group-hover:text-white flex items-center justify-between">
                          Instância do Host
                          <svg className="w-4 h-4 text-[#565d6b] group-hover:text-[#edeff3] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </span>
                        <span className="text-[11px] text-[#7d8697]" style={monoFont}>Abrir cliente (Professor)</span>
                      </a>
                      <a
                        href={dadosSala.guestLink}
                        target="_blank"
                        className="group flex flex-col gap-1 bg-[#1a1e26] hover:bg-[#20242d] border border-[#2e3540] hover:border-[#565d6b] rounded p-4 transition-all"
                      >
                        <span className="text-sm font-medium text-[#edeff3] group-hover:text-white flex items-center justify-between">
                          Instância do Convidado
                          <svg className="w-4 h-4 text-[#565d6b] group-hover:text-[#edeff3] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </span>
                        <span className="text-[11px] text-[#7d8697]" style={monoFont}>Abrir cliente (Aluno)</span>
                      </a>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* PREVIEW DA CHAMADA */}
        <div className="max-w-6xl mx-auto px-6 pb-24">
          <div className="max-w-2xl mx-auto mb-8 text-center">
            <div className="text-[11px] text-[#7d8697] mb-4 tracking-[0.15em] uppercase" style={monoFont}>
              UI de Telemetria
            </div>
            <h2 className="text-[26px] md:text-[32px] text-[#f4f5f7] leading-tight mb-3" style={displayFont}>
              Como a sessão é montada na interface.
            </h2>
            <p className="text-[#9aa2b1] text-[15px] leading-relaxed">
              O front-end é seu domínio. Componentes de câmera, microfone e controles já vêm abstraídos nos nossos hooks React.
            </p>
          </div>

          <div className="max-w-2xl mx-auto">
            <TelaChamada />
          </div>
        </div>

        {/* FEATURES TÉCNICAS */}
        <div className="max-w-6xl mx-auto px-6 pb-24">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-[#1c2129] border border-[#1c2129] rounded-lg overflow-hidden">
            <div className="bg-[#0a0c10] p-7">
              <div className="text-[10px] text-[#7d8697] mb-4 tracking-wider" style={monoFont}>
                [PERFORMANCE]
              </div>
              <h3 className="text-[15px] font-medium text-[#edeff3] mb-2">
                Arquitetura P2P
              </h3>
              <p className="text-[13px] text-[#7d8697] leading-relaxed">
                Nas sessões 1:1, a latência é reduzida ao rotear o vídeo de forma direta entre os clientes. Zero relays pesados.
              </p>
            </div>

            <div className="bg-[#0a0c10] p-7">
              <div className="text-[10px] text-[#7d8697] mb-4 tracking-wider" style={monoFont}>
                [STORAGE]
              </div>
              <h3 className="text-[15px] font-medium text-[#edeff3] mb-2">
                Chunking de Gravação
              </h3>
              <p className="text-[13px] text-[#7d8697] leading-relaxed">
                Vídeo exportado e fatiado a cada 10s direto na engine do navegador (MediaRecorder) para não onerar CPU nem dados.
              </p>
            </div>

            <div className="bg-[#0a0c10] p-7">
              <div className="text-[10px] text-[#7d8697] mb-4 tracking-wider" style={monoFont}>
                [RESILIÊNCIA]
              </div>
              <h3 className="text-[15px] font-medium text-[#edeff3] mb-2">
                Reconexão ICE
              </h3>
              <p className="text-[13px] text-[#7d8697] leading-relaxed">
                Se a rede oscilar, o STUN repactua os candidatos ICE silenciosamente mantendo o socket ativo para recuperação rápida.
              </p>
            </div>

            <div className="bg-[#0a0c10] p-7">
              <div className="text-[10px] text-[#7d8697] mb-4 tracking-wider" style={monoFont}>
                [ADAPTABILIDADE]
              </div>
              <h3 className="text-[15px] font-medium text-[#edeff3] mb-2">
                Bitrate Dinâmico
              </h3>
              <p className="text-[13px] text-[#7d8697] leading-relaxed">
                A qualidade de vídeo se ajusta com a banda do usuário para manter framerate estável e impedir quedas totais (graceful degradation).
              </p>
            </div>
          </div>
        </div>

        {/* CTA FINAL */}
        <div className="max-w-6xl mx-auto px-6 pb-24">
          <div className="rounded-lg border border-[#232932] bg-[#12151b] px-8 py-12 text-center">
            <h2 className="text-[26px] md:text-[30px] text-[#f4f5f7] mb-3" style={displayFont}>
              Integração de vídeo Enterprise-grade.
            </h2>
            <p className="text-[#9aa2b1] text-[15px] mb-7 max-w-lg mx-auto">
              Arquitetura API-first. Free tier robusto e documentação clara. Elimine a complexidade de gerenciar servidores de sinalização.
            </p>
            <button
              onClick={() => setModalAberto(true)}
              className="inline-block bg-[#edeff3] hover:bg-white text-[#0a0c10] font-medium py-3 px-6 rounded-md text-sm transition-colors"
            >
              Gerar API Key
            </button>
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-[#1c2129]">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded bg-[#edeff3] flex items-center justify-center">
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                  <circle cx="8" cy="8" r="6" stroke="#0a0c10" strokeWidth="1.3" />
                  <circle cx="8" cy="8" r="2" fill="#0a0c10" />
                </svg>
              </div>
              <span className="text-[13px] text-[#9aa2b1]" style={monoFont}>PSIUMEET ENGINE</span>
            </div>

            <div className="flex flex-wrap gap-6 text-[13px] text-[#7d8697]">
              <Link href="/docs" className="hover:text-[#edeff3] transition-colors">
                Documentação
              </Link>
              <Link href="/status" className="hover:text-[#edeff3] transition-colors">
                Status API
              </Link>
              <Link href="/privacidade" className="hover:text-[#edeff3] transition-colors">
                SLA & Termos
              </Link>
              <a href="mailto:api@psiumeeet.com" className="hover:text-[#edeff3] transition-colors">
                Suporte Dev
              </a>
            </div>
          </div>

          <div
            className="mt-8 pt-6 border-t border-[#1c2129] flex items-center justify-between text-[11px] text-[#4f5866]"
            style={monoFont}
          >
            <span>© 2026 PsiuMeet Cloud</span>
            <span>API REST · Socket.io · WebRTC</span>
          </div>
        </div>
      </footer>

      <ModalAutenticacao aberto={modalAberto} onFechar={() => setModalAberto(false)} />
    </div>
  );
}
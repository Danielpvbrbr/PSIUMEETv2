"use client";
import { useEffect, useState, useRef } from 'react';
import SalaEncerrada from './SalaEncerrada';
import io from 'socket.io-client';

export default function SalaAtiva({ sala, role }) {
  const [tempoEsgotado, setTempoEsgotado] = useState(false);
  const [tempoFaltante, setTempoFaltante] = useState('');
  const [tempoCritico, setTempoCritico] = useState(false);

  const [audioAtivo, setAudioAtivo] = useState(true);
  const [videoAtivo, setVideoAtivo] = useState(true);
  const [modalEncerramentoAberto, setModalEncerramentoAberto] = useState(false);

  // Lógica de identificação
  const ehHost = role === 'prof' || role === 'host' || role === '1';
  const meuNome = ehHost ? sala.hostName : sala.guestName;
  const minhaFoto = ehHost ? sala.hostAvatar : sala.guestAvatar;
  const outroNome = ehHost ? sala.guestName : sala.hostName;
  const outraFoto = ehHost ? sala.guestAvatar : sala.hostAvatar;
  const deveMostrarBotao = sala.showEndButton !== 0 && sala.showEndButton !== false;

  const myVideo = useRef();
  const userVideo = useRef();
  const socketRef = useRef();
  const peerRef = useRef();
  const localStreamRef = useRef();

  // ==========================================
  // NOVOS REFS: PARA A ANIMAÇÃO DO ÁUDIO (AURA)
  // ==========================================
  const avatarGlowRef = useRef(null);
  const requestAnimationRef = useRef(null);

  const [hasRemoteVideo, setHasRemoteVideo] = useState(false);

  // Função mágica que lê o microfone e pulsa a aura
  const configurarAnalisadorDeAudio = (stream) => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;

      // Pega só a faixa de áudio
      const audioTrack = stream.getAudioTracks()[0];
      if (!audioTrack) return;

      const source = audioCtx.createMediaStreamSource(new MediaStream([audioTrack]));
      source.connect(analyser);

      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      const atualizarAurea = () => {
        if (!avatarGlowRef.current) {
          requestAnimationRef.current = requestAnimationFrame(atualizarAurea);
          return;
        }

        analyser.getByteFrequencyData(dataArray);

        // Calcula a média do volume (0 a 255)
        let soma = 0;
        for (let i = 0; i < dataArray.length; i++) {
          soma += dataArray[i];
        }
        const media = soma / dataArray.length;

        // Mapeia o volume para o tamanho da sombra (glow)
        // Se a média for baixa, a sombra fica 0. Se for alta, cresce até ~30px.
        const tamanhoGlow = Math.min(media * 0.4, 30);

        // Aplica direto no CSS do elemento (Não causa re-render no React = Zero Travamento)
        // Cor do Glow: Um verde suave estilo Google Meet
        avatarGlowRef.current.style.boxShadow = `0 0 0 ${tamanhoGlow}px rgba(74, 222, 128, ${tamanhoGlow > 3 ? 0.3 : 0})`;

        requestAnimationRef.current = requestAnimationFrame(atualizarAurea);
      };

      atualizarAurea();
    } catch (err) {
      console.error("Erro ao iniciar analisador de áudio:", err);
    }
  };

  useEffect(() => {
    const calcularTempoRestante = () => {
      const agora = new Date().getTime();
      const fim = new Date(sala.endTime).getTime();
      const diff = fim - agora;

      if (diff <= 0) {
        setTempoEsgotado(true);
        encerrarChamadaBrutalmente();
      } else {
        const min = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seg = Math.floor((diff % (1000 * 60)) / 1000);
        setTempoFaltante(`${min}m ${seg}s`);
        setTempoCritico(diff <= 60000);
      }
    };

    calcularTempoRestante();
    const timerCronometro = setInterval(calcularTempoRestante, 1000);

    socketRef.current = io({ transports: ['websocket'] });

    const configuracaoMidia = {
      video: { width: { ideal: 1280, max: 1920 }, height: { ideal: 720, max: 1080 }, frameRate: { ideal: 30, max: 60 }, facingMode: "user" },
      audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true }
    };

    navigator.mediaDevices.getUserMedia(configuracaoMidia).then((stream) => {
      localStreamRef.current = stream;
      if (myVideo.current) myVideo.current.srcObject = stream;

      // CHAMA O ANALISADOR DE ÁUDIO ASSIM QUE PEGAR O MICROFONE
      configurarAnalisadorDeAudio(stream);

      socketRef.current.emit('join-room', { roomId: sala.id, role });

      socketRef.current.on('user-connected', () => {
        peerRef.current = createPeerConnection(stream, true);
      });

      socketRef.current.on('offer', async (offer) => {
        try {
          // Cria a conexão para quem está recebendo a chamada
          peerRef.current = createPeerConnection(stream, false);

          await peerRef.current.setRemoteDescription(new RTCSessionDescription(offer));
          const answer = await peerRef.current.createAnswer();

          // O WebRTC moderno prefere setLocalDescription sem parâmetros para evitar o erro de SDP
          await peerRef.current.setLocalDescription();

          socketRef.current.emit('answer', sala.id, peerRef.current.localDescription);
        } catch (err) {
          console.warn("Oferta ignorada (Comportamento normal no ambiente de Dev do React)");
        }
      });

      socketRef.current.on('answer', async (answer) => {
        try {
          // Só aplica a resposta se ele realmente estiver esperando uma
          if (peerRef.current && peerRef.current.signalingState === 'have-local-offer') {
            await peerRef.current.setRemoteDescription(new RTCSessionDescription(answer));
          }
        } catch (err) {
          console.warn("Resposta ignorada pelo WebRTC");
        }
      });

      socketRef.current.on('ice-candidate', (candidate) => {
        if (peerRef.current) peerRef.current.addIceCandidate(new RTCIceCandidate(candidate));
      });
    });

    const handleBeforeUnload = () => { if (socketRef.current) socketRef.current.emit('registrar-motivo-saida', { motivo: 'FECHOU_ABA_OU_NAVEGADOR' }); };
    const handleVisibilityChange = () => { if (socketRef.current) socketRef.current.emit('mudanca-status-app', { evento: document.hidden ? 'APP_EM_BACKGROUND' : 'APP_EM_FOCO' }); };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(timerCronometro);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      encerrarChamadaBrutalmente();
    };
  }, [sala, role]);

  const createPeerConnection = (stream, isInitiator) => {
    const peer = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }, { urls: 'stun:stun1.l.google.com:19302' }, { urls: 'stun:stun2.l.google.com:19302' }]
    });

    stream.getTracks().forEach(track => {
      const sender = peer.addTrack(track, stream);
      if (track.kind === 'video') {
        const parameters = sender.getParameters();
        if (!parameters.encodings) parameters.encodings = [{}];
        parameters.encodings[0].maxBitrate = 2500 * 1000;
        sender.setParameters(parameters).catch(() => { });
      }
    });

    peer.ontrack = (event) => {
      setHasRemoteVideo(true);
      if (userVideo.current) userVideo.current.srcObject = event.streams[0];
    };

    peer.onicecandidate = (event) => {
      if (event.candidate) socketRef.current.emit('ice-candidate', sala.id, event.candidate);
    };

    if (isInitiator) {
      peer.createOffer().then(async (offer) => {
        try {
          // Seta a descrição local dinamicamente
          await peer.setLocalDescription();
          socketRef.current.emit('offer', sala.id, peer.localDescription);
        } catch (err) {
          console.warn("Gatilho de oferta duplo evitado.");
        }
      });
    }
    return peer;
  };

  const encerrarChamadaBrutalmente = () => {
    // Para a animação do áudio para não gastar memória
    if (requestAnimationRef.current) cancelAnimationFrame(requestAnimationRef.current);
    if (socketRef.current) socketRef.current.disconnect();
    if (peerRef.current) peerRef.current.close();
    if (localStreamRef.current) localStreamRef.current.getTracks().forEach(track => track.stop());
  };

  const alternarMicrofone = () => {
    if (localStreamRef.current) {
      const trilhaDeAudio = localStreamRef.current.getAudioTracks()[0];
      if (trilhaDeAudio) {
        trilhaDeAudio.enabled = !trilhaDeAudio.enabled;
        setAudioAtivo(trilhaDeAudio.enabled);
        socketRef.current.emit('registrar-acao-midia', { evento: trilhaDeAudio.enabled ? 'DESMUTOU_MICROFONE' : 'MUTOU_MICROFONE' });
      }
    }
  };

  const alternarCamera = () => {
    if (localStreamRef.current) {
      const trilhaDeVideo = localStreamRef.current.getVideoTracks()[0];
      if (trilhaDeVideo) {
        trilhaDeVideo.enabled = !trilhaDeVideo.enabled;
        setVideoAtivo(trilhaDeVideo.enabled);
        socketRef.current.emit('registrar-acao-midia', { evento: trilhaDeVideo.enabled ? 'LIGOU_CAMERA' : 'DESLIGOU_CAMERA' });
      }
    }
  };

  const clicarBotaoEncerrar = () => setModalEncerramentoAberto(true);

  const confirmarEncerramento = () => {
    setModalEncerramentoAberto(false);
    if (socketRef.current) socketRef.current.emit('registrar-acao-midia', { evento: 'ENCERROU_CHAMADA_VOLUNTARIAMENTE' });
    encerrarChamadaBrutalmente();
    setTempoEsgotado(true);
  };

  if (tempoEsgotado) return <SalaEncerrada sala={sala} role={role} />;

  return (
    <div className="relative flex h-screen w-full items-center justify-center overflow-hidden bg-[#0a0c10]">
      <style jsx global>{`
        @keyframes psiuPing { 0% { transform: scale(1); opacity: 0.7; } 75%, 100% { transform: scale(2.4); opacity: 0; } }
        .psiu-ping { animation: psiuPing 1.8s cubic-bezier(0, 0, 0.2, 1) infinite; }
        @keyframes ledgerIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
        .animate-ledgerIn { animation: ledgerIn 0.25s ease-out forwards; }
        @media (prefers-reduced-motion: reduce) { .psiu-ping, .animate-ledgerIn { animation: none !important; } }
      `}</style>

      {/* status do papel + tempo restante */}
      <div className={`absolute top-4 left-1/2 z-40 flex -translate-x-1/2 items-center gap-2.5 rounded-full border px-4 py-2 backdrop-blur-md shadow-lg transition-colors duration-300 ${tempoCritico ? 'border-[#5c2b26] bg-[#1c0e0c]/90' : 'border-[#232932] bg-[#12151b]/90'}`}>
        <span className="font-mono text-[10px] uppercase tracking-wider text-[#7d8697]">{role}</span>
        <span className="h-1 w-1 rounded-full bg-[#3a4250]" />
        <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8.5" r="6" stroke={tempoCritico ? '#ff8a80' : '#7d8697'} strokeWidth="1.3" /><path d="M8 5.2V8.5l2.2 1.3" stroke={tempoCritico ? '#ff8a80' : '#7d8697'} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" /></svg>
        <span className={`font-mono text-[12px] tabular-nums ${tempoCritico ? 'text-[#ff8a80]' : 'text-[#edeff3]'}`}>{tempoFaltante} restantes</span>
      </div>

      {/* aguardando participante */}
      {!hasRemoteVideo && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 bg-[#0a0c10]">
          <span className="relative flex h-2.5 w-2.5"><span className="psiu-ping absolute inline-flex h-full w-full rounded-full bg-[#e6c874] opacity-75" /><span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#e6c874]" /></span>
          <p className="font-mono text-[13px] tracking-wide text-[#7d8697]">Aguardando o outro participante entrar…</p>
        </div>
      )}

      <video ref={userVideo} autoPlay playsInline className="h-full w-full object-cover" />

      {hasRemoteVideo && (
        <div className="absolute bottom-24 left-6 z-10 flex items-center gap-2 rounded-lg bg-[#0a0c10]/60 px-3 py-1.5 backdrop-blur-md border border-[#232932]/50 shadow-lg">
          {outraFoto ? (
            <img src={outraFoto} className="w-5 h-5 rounded-full object-cover border border-[#2e3540]" alt={outroNome} />
          ) : (
            <div className="w-5 h-5 rounded-full bg-[#1c2129] border border-[#2e3540] flex items-center justify-center text-[#c8cdd6] text-[10px] font-bold">{outroNome ? outroNome.charAt(0).toUpperCase() : '?'}</div>
          )}
          <span className="font-sans text-[13px] font-medium text-[#edeff3] drop-shadow-md">{outroNome || 'Convidado'}</span>
        </div>
      )}

      {/* PiP — você */}
      <div className={`absolute bottom-24 right-6 z-20 aspect-[3/4] w-32 overflow-hidden rounded-xl border shadow-2xl transition-colors duration-300 md:w-48 ${videoAtivo ? 'border-[#2e3540]' : 'border-[#232932]'} bg-[#0a0c10]`}>

        {/* ========================================== */}
        {/* NOVA TELA DE CÂMERA DESATIVADA COM AVATAR E AURA */}
        {/* ========================================== */}
        {!videoAtivo && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-[#0a0c10]/95 backdrop-blur-md">

            <div
              ref={avatarGlowRef}
              className="flex h-16 w-16 items-center justify-center rounded-full bg-[#1c2129] border-2 border-[#2e3540] transition-shadow duration-75 ease-linear"
            >
              {minhaFoto ? (
                <img src={minhaFoto} className="h-full w-full rounded-full object-cover" alt={meuNome} />
              ) : (
                <span className="text-2xl font-bold text-[#c8cdd6]">
                  {meuNome ? meuNome.charAt(0).toUpperCase() : '?'}
                </span>
              )}
            </div>

          </div>
        )}

        <video ref={myVideo} autoPlay playsInline muted className={`h-full w-full object-cover scale-x-[-1] ${!videoAtivo && 'opacity-0'}`} />

        <div className="absolute bottom-1.5 left-1.5 z-30 flex items-center gap-1.5 rounded bg-[#0a0c10]/70 px-1.5 py-0.5 backdrop-blur-sm">
          <svg width="11" height="11" viewBox="0 0 16 16" fill="none">
            <rect x="5.5" y="1.5" width="5" height="8" rx="2.5" stroke={audioAtivo ? '#c8cdd6' : '#ff8a80'} strokeWidth="1.3" />
            <path d="M3 8a5 5 0 0010 0M8 13v1.8" stroke={audioAtivo ? '#c8cdd6' : '#ff8a80'} strokeWidth="1.3" strokeLinecap="round" />
            {!audioAtivo && <path d="M2 2L14 14" stroke="#ff8a80" strokeWidth="1.3" strokeLinecap="round" />}
          </svg>
          <span className="font-mono text-[9px] text-[#e5e8ed] truncate max-w-[80px]">{meuNome || "Você"}</span>
        </div>
      </div>

      {/* controles */}
      <div className="absolute bottom-6 left-1/2 z-40 flex -translate-x-1/2 items-center gap-3 rounded-full border border-[#232932] bg-[#12151b]/90 px-5 py-3 shadow-2xl backdrop-blur-md">
        <button onClick={alternarMicrofone} aria-label={audioAtivo ? 'Desligar microfone' : 'Ligar microfone'} className={`flex h-11 w-11 items-center justify-center rounded-full border transition-colors ${audioAtivo ? 'border-[#2e3540] text-[#c8cdd6] hover:border-[#565d6b]' : 'border-[#5c2b26] bg-[#3a1f1c] text-[#ff8a80]'}`}>
          {audioAtivo ? <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg> : <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3l18 18M12 18a3 3 0 003-3V8a3 3 0 00-6 0v1a1 1 0 002 0V8a1 1 0 112 0v7a1 1 0 01-1 1z" /></svg>}
        </button>

        <button onClick={alternarCamera} aria-label={videoAtivo ? 'Desligar câmera' : 'Ligar câmera'} className={`flex h-11 w-11 items-center justify-center rounded-full border transition-colors ${videoAtivo ? 'border-[#2e3540] text-[#c8cdd6] hover:border-[#565d6b]' : 'border-[#5c2b26] bg-[#3a1f1c] text-[#ff8a80]'}`}>
          {videoAtivo ? <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg> : <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>}
        </button>

        {deveMostrarBotao && (
          <>
            <span className="mx-1 h-6 w-px bg-[#232932]" />
            <button onClick={clicarBotaoEncerrar} aria-label="Encerrar chamada" className="flex h-11 w-11 items-center justify-center rounded-full bg-[#ff4438] text-white transition-colors hover:bg-[#ff5b50]">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24"><path d="M3.6 10.8c5-6 11.8-6 16.8 0 .6.7.5 1.8-.2 2.4l-2.4 1.9c-.6.5-1.5.5-2.1-.1l-1.4-1.4c-.4-.4-1-.5-1.5-.3-1.4.6-3 .6-4.4 0-.5-.2-1.1-.1-1.5.3l-1.4 1.4c-.6.6-1.5.6-2.1.1l-2.4-1.9c-.7-.6-.8-1.7-.2-2.4z" fill="currentColor" transform="rotate(135 12 12)" /></svg>
            </button>
          </>
        )}
      </div>

      {modalEncerramentoAberto && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 font-sans">
          <div className="absolute inset-0 bg-[#040507]/80 backdrop-blur-sm" onClick={() => setModalEncerramentoAberto(false)} />
          <div className="relative w-full max-w-sm rounded-lg border border-[#232932] bg-[#12151b] p-7 shadow-2xl animate-ledgerIn">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#3a1f1c] text-[#ff8a80]">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              </div>
              <h3 className="text-[17px] font-medium text-[#f4f5f7]">Encerrar Sessão?</h3>
            </div>
            <p className="text-[13px] text-[#9aa2b1] mb-6 leading-relaxed">{sala.endWarningText || "Tem certeza que deseja encerrar esta sessão? Esta ação não poderá ser desfeita e os logs de auditoria serão fechados."}</p>
            <div className="flex items-center justify-end gap-3">
              <button onClick={() => setModalEncerramentoAberto(false)} className="rounded-md border border-[#2e3540] bg-transparent px-4 py-2 text-[13px] font-medium text-[#c8cdd6] transition-colors hover:bg-[#1c2129]">Cancelar</button>
              <button onClick={confirmarEncerramento} className="rounded-md bg-[#ff4438] px-4 py-2 text-[13px] font-medium text-white transition-colors hover:bg-[#ff5b50] shadow-md shadow-[#ff4438]/20">Sim, Encerrar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
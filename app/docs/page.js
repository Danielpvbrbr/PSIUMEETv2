"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import "swagger-ui-react/swagger-ui.css";

const SwaggerUI = dynamic(() => import("swagger-ui-react"), { ssr: false });

export default function DocsPage() {
  const spec = {
    openapi: "3.0.3",
    info: {
      title: "PsiuMeet API",
      version: "1.0.0",
      description: "API de infraestrutura de vídeo **peer-to-peer (WebRTC)** exclusiva para sessões **1x1**.\n\nO servidor apenas cria a sala e faz a sinalização. A mídia de áudio/vídeo trafega diretamente entre os participantes (P2P).\n\nAlém da criação de salas, a API expõe endpoints de **telemetria e auditoria** para acompanhar conexão, eventos e métricas da sessão em tempo real.",
      contact: {
        name: "PsiuMeet",
        url: "https://psiumeeet.com.br"
      }
    },
    servers: [
      {
        url: "/",
        description: "Ambiente atual (localhost / ngrok / produção)"
      }
    ],
    tags: [
      {
        name: "Salas",
        description: "Criação e gerenciamento de sessões 1x1"
      },
      {
        name: "Auditoria",
        description: "Relatórios unificados: linha do tempo, status em tempo real e telemetria"
      }
    ],
    paths: {
      "/api/criar-sala": {
        post: {
          tags: ["Salas"],
          summary: "Criar sala 1x1",
          description: "Cria uma nova sessão peer-to-peer usando payload plano (Flat Payload). Retorna `roomId` e links de acesso para Host e Guest.",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["roomName"],
                  example: {
                    roomName: "Technical Interview - Maria",
                    externalId: "INT-2026-9912",
                    startTime: "2026-08-08T17:26:45.676Z",
                    duration: 60,
                    showEndButton: true,
                    endWarningText: "Are you sure you want to end this session?",
                    hostName: "Tech Lead John",
                    hostAvatar: "https://exemplo.com/john.jpg",
                    guestName: "Candidate Maria",
                    guestAvatar: "https://exemplo.com/maria.jpg",
                    endRedirect: "https://psiumeet.psiuclass.com.br"
                  },
                  properties: {
                    roomName: { type: "string", description: "Nome amigável da sessão" },
                    externalId: { type: "string", description: "ID do seu sistema (opcional)" },
                    startTime: { type: "string", format: "date-time", description: "Início programado (ISO 8601)" },
                    endTime: { type: "string", format: "date-time", description: "Fim programado (ISO 8601). Opcional se duration for enviado." },
                    duration: { type: "number", description: "Duração em minutos (usado se endTime não for enviado)" },
                    showEndButton: { type: "boolean", description: "Define se o botão de encerrar sessão será exibido na interface. (Padrão: true)" },
                    endWarningText: { type: "string", description: "Texto personalizado exibido no modal de encerramento." },
                    hostName: { type: "string", description: "Nome do anfitrião (Host) para exibição na sala" },
                    hostAvatar: { type: "string", description: "URL da foto do anfitrião (Host)" },
                    guestName: { type: "string", description: "Nome do convidado (Guest) para exibição na sala" },
                    guestAvatar: { type: "string", description: "URL da foto do convidado (Guest)" },
                    endRedirect: { type: "string", description: "URL de redirecionamento" },
                  }
                }
              }
            }
          },
          responses: {
            "200": {
              description: "Sala criada com sucesso",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean", example: true },
                      roomId: { type: "string", example: "a3b8c19d-4e2f-4a1b-9c3d-7e8f9a0b1c2d" },
                      roomName: { type: "string", example: "Technical Interview - Maria" },
                      hostLink: { type: "string", example: "https://app.psiumeeet.com/sala/a3b8c19d?type=1" },
                      guestLink: { type: "string", example: "https://app.psiumeeet.com/sala/a3b8c19d?type=2" },
                      schedule: {
                        type: "object",
                        properties: {
                          startTime: { type: "string", format: "date-time" },
                          endTime: { type: "string", format: "date-time" },
                          durationMinutes: { type: "number", example: 60 }
                        }
                      }
                    }
                  }
                }
              }
            },
            "400": { description: "Payload inválido" }
          }
        },
        get: {
          tags: ["Salas"],
          summary: "Criar sala rápida (query params)",
          description: "Atalho para testes. Cria uma sala imediatamente usando parâmetros na URL.",
          parameters: [
            { name: "roomName", in: "query", schema: { type: "string" } },
            { name: "duration", in: "query", schema: { type: "number" } },
            { name: "externalId", in: "query", schema: { type: "string" } },
            { name: "showEndButton", in: "query", schema: { type: "boolean" } },
            { name: "endWarningText", in: "query", schema: { type: "string" } },
            { name: "hostName", in: "query", schema: { type: "string" } },
            { name: "guestName", in: "query", schema: { type: "string" } }
          ],
          responses: {
            "200": { description: "Sala criada com sucesso" }
          }
        }
      },
      "/api/auditoria/{salaId}": {
        get: {
          tags: ["Auditoria"],
          summary: "Relatório de Auditoria e Status (Completo)",
          description: "Retorna o dossiê da sala em uma única chamada: dados de agendamento, status atual em tempo real, telemetria (latência/bitrate), estatísticas de presença e a linha do tempo completa de eventos.",
          parameters: [
            {
              name: "salaId",
              in: "path",
              required: true,
              description: "UUID da sala",
              schema: { type: "string", example: "a3b8c19d-4e2f-4a1b-9c3d-7e8f9a0b1c2d" }
            }
          ],
          responses: {
            "200": {
              description: "Dossiê completo gerado",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    example: {
                      roomId: "a3b8c19d-4e2f-4a1b-9c3d-7e8f9a0b1c2d",
                      roomName: "Technical Interview",
                      externalId: "INT-2026-9912",
                      status: "connected",
                      onlineParticipants: 2,
                      schedule: {
                        startTime: "2026-08-08T17:26:45.676Z",
                        endTime: "2026-08-08T18:26:45.676Z",
                        durationMinutes: 60
                      },
                      telemetry: {
                        latencyMs: 28,
                        jitterMs: 4,
                        packetLoss: 0.1,
                        bitrateKbps: 1200
                      },
                      participantsSummary: {
                        host: {
                          name: "Tech Lead John",
                          present: true,
                          firstAccess: "2026-08-08T17:20:00.000Z",
                          lastAccess: "2026-08-08T18:26:00.000Z",
                          totalEvents: 4
                        },
                        guest: {
                          name: "Candidate Maria",
                          present: true,
                          firstAccess: "2026-08-08T17:25:00.000Z",
                          lastAccess: "2026-08-08T18:26:00.000Z",
                          totalEvents: 2
                        }
                      },
                      timeline: [
                        { timestamp: "2026-08-08T17:20:00.000Z", role: "host", event: "PARTICIPANTE_ENTROU" },
                        { timestamp: "2026-08-08T17:25:00.000Z", role: "guest", event: "PARTICIPANTE_ENTROU" }
                      ]
                    }
                  }
                }
              }
            },
            "404": { description: "Sala não encontrada" }
          }
        }
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0c10] text-[#edeff3]">
      <header className="border-b border-[#1c2129] bg-[#0a0c10]/90 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-7 h-7 rounded bg-[#edeff3] flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="6" stroke="#0a0c10" strokeWidth="1.3" />
                <circle cx="8" cy="8" r="2" fill="#0a0c10" />
              </svg>
            </div>
            <span className="text-[15px] text-[#edeff3] group-hover:text-white transition-colors">PsiuMeet</span>
            <span className="text-[12px] text-[#7d8697] font-mono">/ docs</span>
          </Link>
          <Link href="/" className="text-[13px] text-[#9aa2b1] hover:text-[#edeff3] transition-colors">← Voltar</Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-medium text-[#f4f5f7] mb-2">Documentação da API</h1>
          <p className="text-[14px] text-[#9aa2b1] max-w-2xl leading-relaxed">
            Endpoints unificados para criar sessões 1x1 (WebRTC P2P) e consultar a auditoria em tempo real.
          </p>
        </div>

        <div className="rounded-lg border border-[#232932] overflow-hidden bg-white">
          <SwaggerUI spec={spec} docExpansion="list" defaultModelsExpandDepth={-1} tryItOutEnabled={true} />
        </div>
      </main>
    </div>
  );
}
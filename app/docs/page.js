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
      description: `
API de infraestrutura de vídeo **peer-to-peer (WebRTC)** exclusiva para sessões **1x1**.

O servidor apenas cria a sala e faz a sinalização. A mídia de áudio/vídeo trafega diretamente entre os participantes (P2P).

Além da criação de salas, a API expõe endpoints de **telemetria e auditoria** para acompanhar conexão, eventos e métricas da sessão em tempo real.
      `.trim(),
      contact: {
        name: "PsiuMeet",
        url: "https://psiumeeet.com.br",
      },
    },
    servers: [
      {
        url: "/",
        description: "Ambiente atual (localhost / ngrok / produção)",
      },
    ],
    tags: [
      {
        name: "Salas",
        description: "Criação e gerenciamento de sessões 1x1",
      },
      {
        name: "Auditoria",
        description: "Relatórios e linha do tempo de eventos da sessão",
      },
      {
        name: "Métricas",
        description: "Telemetria de conexão, latência e qualidade",
      },
    ],
    paths: {
      "/api/criar-sala": {
        post: {
          tags: ["Salas"],
          summary: "Criar sala 1x1",
          description:
            "Cria uma nova sessão peer-to-peer. Retorna `roomId` e links de acesso para host e participante. Ideal para ser chamado pelo seu backend.",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["nomeSala"],
                  properties: {
                    nomeSala: {
                      type: "string",
                      example: "Atendimento - Maria Silva",
                      description: "Nome amigável da sessão",
                    },
                    idAgendamentoExterno: {
                      type: "string",
                      example: "AGD-2026-9912",
                      description: "ID do seu sistema (opcional)",
                    },
                    horarioInicio: {
                      type: "string",
                      format: "date-time",
                      example: new Date(Date.now() + 60000).toISOString(),
                      description: "Início programado (ISO 8601)",
                    },
                    horarioFim: {
                      type: "string",
                      format: "date-time",
                      example: new Date(Date.now() + 3660000).toISOString(),
                      description: "Fim programado (ISO 8601)",
                    },
                    minutos: {
                      type: "number",
                      example: 60,
                      description: "Duração em minutos (usado se horarioFim não for enviado)",
                    },
                  },
                },
              },
            },
          },
          responses: {
            "200": {
              description: "Sala criada com sucesso",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      sucesso: { type: "boolean", example: true },
                      roomId: { type: "string", example: "a3b8c19d-4e2f-4a1b-9c3d-7e8f9a0b1c2d" },
                      linkProfessor: {
                        type: "string",
                        example: "https://app.psiumeeet.com/sala/a3b8c19d?type=1",
                      },
                      linkAluno: {
                        type: "string",
                        example: "https://app.psiumeeet.com/sala/a3b8c19d?type=2",
                      },
                      horarios: {
                        type: "object",
                        properties: {
                          inicio: { type: "string", format: "date-time" },
                          fim: { type: "string", format: "date-time" },
                        },
                      },
                    },
                  },
                },
              },
            },
            "400": { description: "Payload inválido" },
          },
        },
        get: {
          tags: ["Salas"],
          summary: "Criar sala rápida (query params)",
          description:
            "Atalho para testes. Cria uma sala imediatamente usando parâmetros na URL.",
          parameters: [
            {
              name: "nomeSala",
              in: "query",
              schema: { type: "string", example: "Teste rápido" },
            },
            {
              name: "minutos",
              in: "query",
              schema: { type: "number", example: 30 },
            },
            {
              name: "idAgendamentoExterno",
              in: "query",
              schema: { type: "string", example: "TESTE_GET_1" },
            },
          ],
          responses: {
            "200": { description: "Sala criada com sucesso" },
          },
        },
      },

      "/api/auditoria/{salaId}": {
        get: {
          tags: ["Auditoria"],
          summary: "Relatório de auditoria da sessão",
          description:
            "Retorna a linha do tempo completa de eventos da sala: entradas, saídas, quedas de conexão, minimização de aba, reconexões etc.",
          parameters: [
            {
              name: "salaId",
              in: "path",
              required: true,
              description: "UUID da sala",
              schema: { type: "string", example: "a3b8c19d-4e2f-4a1b-9c3d-7e8f9a0b1c2d" },
            },
          ],
          responses: {
            "200": {
              description: "Relatório gerado",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      salaId: { type: "string" },
                      eventos: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            timestamp: { type: "string", format: "date-time" },
                            tipo: {
                              type: "string",
                              enum: [
                                "PARTICIPANTE_ENTROU",
                                "PARTICIPANTE_SAIU",
                                "RECONEXAO",
                                "ABA_MINIMIZADA",
                                "CONEXAO_PERDIDA",
                                "BITRATE_AJUSTADO",
                              ],
                            },
                            participante: { type: "string" },
                            detalhes: { type: "object" },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
            "404": { description: "Sala não encontrada" },
          },
        },
      },

      "/api/metricas/{salaId}": {
        get: {
          tags: ["Métricas"],
          summary: "Métricas de telemetria da sessão",
          description:
            "Retorna métricas técnicas da conexão P2P: latência, jitter, packet loss, bitrate atual e histórico recente. Útil para dashboards e monitoramento.",
          parameters: [
            {
              name: "salaId",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
          ],
          responses: {
            "200": {
              description: "Métricas da sessão",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      salaId: { type: "string" },
                      status: {
                        type: "string",
                        enum: ["aguardando", "conectando", "conectado", "encerrado"],
                      },
                      participantes: { type: "number", example: 2 },
                      latenciaMs: { type: "number", example: 28 },
                      jitterMs: { type: "number", example: 4 },
                      packetLoss: { type: "number", example: 0.2 },
                      bitrateKbps: { type: "number", example: 1200 },
                      atualizadoEm: { type: "string", format: "date-time" },
                    },
                  },
                },
              },
            },
            "404": { description: "Sala não encontrada" },
          },
        },
      },
    },
  };

  return (
    <div className="min-h-screen bg-[#0a0c10] text-[#edeff3]">
      {/* Header simples alinhado com o site */}
      <header className="border-b border-[#1c2129] bg-[#0a0c10]/90 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-7 h-7 rounded bg-[#edeff3] flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="6" stroke="#0a0c10" strokeWidth="1.3" />
                <circle cx="8" cy="8" r="2" fill="#0a0c10" />
              </svg>
            </div>
            <span className="text-[15px] text-[#edeff3] group-hover:text-white transition-colors">
              PsiuMeet
            </span>
            <span className="text-[12px] text-[#7d8697] font-mono">/ docs</span>
          </Link>

          <Link
            href="/"
            className="text-[13px] text-[#9aa2b1] hover:text-[#edeff3] transition-colors"
          >
            ← Voltar
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-medium text-[#f4f5f7] mb-2">
            Documentação da API
          </h1>
          <p className="text-[14px] text-[#9aa2b1] max-w-2xl leading-relaxed">
            Endpoints para criar sessões 1x1 (WebRTC P2P), consultar auditoria
            e puxar métricas de telemetria em tempo real.
          </p>
        </div>

        {/* Swagger com tema mais limpo */}
        <div className="rounded-lg border border-[#232932] overflow-hidden bg-white">
          <SwaggerUI
            spec={spec}
            docExpansion="list"
            defaultModelsExpandDepth={-1}
            tryItOutEnabled={true}
          />
        </div>
      </main>
    </div>
  );
}
"use client";

import dynamic from 'next/dynamic';
import 'swagger-ui-react/swagger-ui.css';

// O Swagger UI precisa ser carregado dinamicamente apenas no lado do cliente
const SwaggerUI = dynamic(() => import('swagger-ui-react'), { ssr: false });

export default function DocsPage() {
  // Configuração oficial do OpenAPI mapeando as rotas da sua aplicação
  const spec = {
    openapi: "3.0.0",
    info: {
      title: "API de Videoconferência e Auditoria",
      version: "1.0.0",
      description: "Documentação interativa da API de criação de salas e telemetria de aulas.",
    },
    servers: [
      {
        url: "/",
        description: "Servidor Atual (Detecta Ngrok, Localhost, etc.)"
      }
    ],
    paths: {
      "/api/criar-sala": {
        post: {
          summary: "Criar sala de aula (POST)",
          description: "Ideal para o sistema principal disparar via webhook/backend enviando JSON.",
          tags: ["Salas"],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    nomeSala: { type: "string", example: "Aula de Matemática - Maria" },
                    idAgendamentoExterno: { type: "string", example: "PEDIDO_9912" },
                    horarioInicio: { type: "string", example: new Date(Date.now() + 60000).toISOString() },
                    horarioFim: { type: "string", example: new Date(Date.now() + 3660000).toISOString() },
                    minutos: { type: "number", example: 60, description: "Usado se horarioFim não for enviado" }
                  }
                }
              }
            }
          },
          responses: {
            "200": { description: "Sala gerada com sucesso e links retornados" }
          }
        },
        get: {
          summary: "Criar sala de aula rápida (GET)",
          description: "Prático para testes via URL. Cria uma sala imediata baseada nos minutos informados.",
          tags: ["Salas"],
          parameters: [
            { name: "nomeSala", in: "query", required: false, schema: { type: "string", example: "Física Quântica" } },
            { name: "minutos", in: "query", required: false, schema: { type: "number", example: 30 } },
            { name: "idAgendamentoExterno", in: "query", required: false, schema: { type: "string", example: "TESTE_GET_1" } }
          ],
          responses: {
            "200": { description: "Sala gerada com sucesso e links retornados" }
          }
        }
      },
      "/api/auditoria/{salaId}": {
        get: {
          summary: "Relatório Pericial (Auditoria)",
          description: "Retorna a linha do tempo exata de quem entrou, caiu, minimizou ou fechou a aba.",
          tags: ["Auditoria"],
          parameters: [
            {
              name: "salaId",
              in: "path",
              required: true,
              description: "UUID da sala gerada (ex: a3b8c19d...)",
              schema: { type: "string" }
            }
          ],
          responses: {
            "200": { description: "Relatório gerado" },
            "404": { description: "Sala não encontrada" }
          }
        }
      }
    }
  };

  return (
    <div className="bg-white min-h-screen p-4">
      <div className="max-w-5xl mx-auto">
        <SwaggerUI spec={spec} />
      </div>
    </div>
  );
}
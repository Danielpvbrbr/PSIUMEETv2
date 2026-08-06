import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const salas = sqliteTable('salas', {
  id: text('id').primaryKey(),
  nome: text('nome').notNull(),
  idAgendamentoExterno: text('id_agendamento_externo'),
  inicio: integer('inicio', { mode: 'timestamp' }).notNull(),
  fim: integer('fim', { mode: 'timestamp' }).notNull(),
});

export const logsAuditoria = sqliteTable('logs_auditoria', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  salaId: text('sala_id').notNull(),
  role: text('role').notNull(), // 'prof' ou 'aluno'
  evento: text('evento').notNull(),
  criadoEm: integer('criado_em', { mode: 'timestamp' }).notNull(),
});
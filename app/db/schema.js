import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const salas = sqliteTable('salas', {
  id: text('id').primaryKey(),
  roomName: text('room_name').notNull(),
  externalId: text('external_id'),
  startTime: integer('start_time', { mode: 'timestamp' }).notNull(),
  endTime: integer('end_time', { mode: 'timestamp' }).notNull(),
  showEndButton: integer('show_end_button', { mode: 'boolean' }).default(true),
  endWarningText: text('end_warning_text'),
  hostName: text('host_name'),
  hostAvatar: text('host_avatar'),
  guestName: text('guest_name'),
  guestAvatar: text('guest_avatar'),
  endRedirect: text('end_redirect')
});

export const logsAuditoria = sqliteTable('logs_auditoria', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  salaId: text('sala_id').notNull(),
  role: text('role').notNull(),
  evento: text('evento').notNull(),
  criadoEm: integer('criado_em', { mode: 'timestamp' }).notNull(),
});
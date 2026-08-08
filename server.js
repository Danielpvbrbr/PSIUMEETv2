const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { Server } = require('socket.io');
const { db } = require('./app/db');
const { logsAuditoria } = require('./app/db/schema');

const dev = process.env.NODE_ENV !== 'production';
const port = process.env.PORT || 3000;
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  });

  const io = new Server(httpServer, {
    cors: { origin: '*' }
  });

  io.on('connection', (socket) => {
    socket.on('join-room', async ({ roomId, role }) => {
      socket.join(roomId);
      socket.roomId = roomId;
      
      // Padroniza os papéis para o formato limpo ('host' e 'guest')
      let normalizedRole = 'guest';
      if (role === 'prof' || role === 'host' || role === '1') {
        normalizedRole = 'host';
      } else if (role === 'aluno' || role === 'guest' || role === '2') {
        normalizedRole = 'guest';
      }

      socket.role = normalizedRole;
      socket.motivoDeclarado = null;

      try {
        await db.insert(logsAuditoria).values({
          salaId: roomId,
          role: socket.role,
          evento: 'PARTICIPANTE_ENTROU',
          criadoEm: new Date()
        });
      } catch (e) {
        console.error('Erro ao gravar log de entrada:', e);
      }

      // Notifica o participante remoto (Emite evento em inglês e português para compatibilidade)
      socket.broadcast.to(roomId).emit('user-connected', { socketId: socket.id, role: socket.role });
    });

    socket.on('registrar-motivo-saida', (data) => {
      socket.motivoDeclarado = data.motivo;
    });

    socket.on('mudanca-status-app', async (data) => {
      if (!socket.roomId || !socket.role) return;
      try {
        await db.insert(logsAuditoria).values({
          salaId: socket.roomId,
          role: socket.role,
          evento: data.evento,
          criadoEm: new Date()
        });
      } catch (e) {
        console.error('Erro ao gravar status:', e);
      }
    });

    socket.on('offer', (roomId, offer) => {
      socket.broadcast.to(roomId).emit('offer', offer);
    });

    socket.on('answer', (roomId, answer) => {
      socket.broadcast.to(roomId).emit('answer', answer);
    });

    socket.on('ice-candidate', (roomId, candidate) => {
      socket.broadcast.to(roomId).emit('ice-candidate', candidate);
    });

    socket.on('registrar-acao-midia', async (data) => {
      if (!socket.roomId || !socket.role) return;
      try {
        await db.insert(logsAuditoria).values({
          salaId: socket.roomId,
          role: socket.role,
          evento: data.evento,
          criadoEm: new Date()
        });
      } catch (e) {
        console.error('Erro ao gravar ação de mídia:', e);
      }
    });

    socket.on('disconnect', async (reason) => {
      if (!socket.roomId || !socket.role) return;

      let motivoFinal = 'QUEDA_CONEXAO_OU_DESCONHECIDO';
      if (socket.motivoDeclarado) {
        motivoFinal = socket.motivoDeclarado;
      } else if (reason === 'client namespace disconnect') {
        motivoFinal = 'SAIU_PELO_BOTAO';
      }

      try {
        await db.insert(logsAuditoria).values({
          salaId: socket.roomId,
          role: socket.role,
          evento: 'PARTICIPANTE_SAIU',
          criadoEm: new Date()
        });
      } catch (e) {
        console.error('Erro ao gravar desconexão:', e);
      }

      // Emite avisos de desconexão em inglês e português para cobrir todos os hooks
      socket.broadcast.to(socket.roomId).emit('user-disconnected', {
        role: socket.role,
        reason: motivoFinal
      });
      socket.broadcast.to(socket.roomId).emit('usuario-desconectou', {
        role: socket.role,
        motivo: motivoFinal
      });
    });
  });

  httpServer.listen(port, '0.0.0.0', () => {
    console.log(`> Servidor Node/Socket rodando na porta ${port}`);
  });
});
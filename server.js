const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { Server } = require('socket.io');
const { db } = require('./app/db');
const { logsAuditoria } = require('./app/db/schema');

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = 3000;
const app = next({ dev, hostname, port });
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
      socket.role = role || 'desconhecido';
      socket.motivoDeclarado = null;

      try {
        await db.insert(logsAuditoria).values({
          salaId: roomId,
          role: socket.role,
          evento: 'ENTROU_NA_SALA',
          criadoEm: new Date()
        });
      } catch (e) {
        console.error('Erro ao gravar log:', e);
      }

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
          evento: data.evento, // 'MUTOU_MICROFONE', 'DESLIGOU_CAMERA', etc.
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
          evento: `DESCONECTADO_${motivoFinal}`,
          criadoEm: new Date()
        });
      } catch (e) {
        console.error('Erro ao gravar desconexão:', e);
      }

      socket.broadcast.to(socket.roomId).emit('usuario-desconectou', {
        role: socket.role,
        motivo: motivoFinal
      });
    });
  });

  httpServer.listen(port, () => {
    console.log(`> Servidor rodando em http://${hostname}:${port}`);
  });
});
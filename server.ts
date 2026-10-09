import express from 'express';
import http from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isProd = process.env.NODE_ENV === 'production';
const PORT = Number(process.env.PORT) || 3000;

interface ClientSession {
  id: string;
  ws: WebSocket;
  username: string;
  country: string;
  interests: string[];
  inQueue: boolean;
  partnerId: string | null;
  connectedAt: number;
  isSimulated?: boolean;
}

const clients = new Map<string, ClientSession>();
let queue: string[] = [];

// Helper random ID generator
function generateId(): string {
  return Math.random().toString(36).substring(2, 10);
}

const COUNTRIES = ['United States', 'United Kingdom', 'Canada', 'Germany', 'France', 'Japan', 'Brazil', 'Australia', 'Spain', 'Italy', 'Netherlands', 'Sweden'];
const BOT_NAMES = ['Alex', 'Maya', 'Jordan', 'Sam', 'Taylor', 'Liam', 'Chloe', 'Noah'];
const BOT_TOPICS = ['Photography', 'Travel', 'Music production', 'Indie games', 'Coffee', 'Design', 'Hiking', 'Cooking'];

const BOT_ICEBREAKERS = [
  "Hey there! What kind of music do you usually listen to?",
  "Hi! If you could travel anywhere right now, where would you go?",
  "Hello! Working on any fun projects lately?",
  "Hey! What's the best movie or show you watched recently?",
  "Hey! Nice to meet you. Having a good day so far?"
];

const BOT_REPLIES = [
  "That sounds awesome! I totally agree.",
  "Haha nice! I was actually thinking about that earlier today.",
  "That's so cool. How long have you been into that?",
  "Oh wow, that is genuinely interesting!",
  "Totally! High five to that 🙌",
  "Nice! Keep up the good vibes ✨"
];

async function startServer() {
  const app = express();
  const server = http.createServer(app);

  app.use(express.json());

  // Stats endpoint
  app.get('/api/stats', (_req, res) => {
    res.json({
      onlineUsers: clients.size,
      inQueue: queue.length,
      activePairs: Array.from(clients.values()).filter(c => c.partnerId !== null).length / 2,
      uptime: process.uptime(),
    });
  });

  // WebSocket Server on path /ws
  const wss = new WebSocketServer({ server, path: '/ws' });

  function broadcastPresence() {
    const payload = JSON.stringify({
      type: 'presence',
      onlineCount: Math.max(1, clients.size),
      waitingCount: queue.length,
    });

    for (const client of clients.values()) {
      if (client.ws.readyState === WebSocket.OPEN) {
        client.ws.send(payload);
      }
    }
  }

  function pairUsers(userAId: string, userBId: string) {
    const userA = clients.get(userAId);
    const userB = clients.get(userBId);

    if (!userA || !userB) return;

    userA.inQueue = false;
    userB.inQueue = false;
    userA.partnerId = userBId;
    userB.partnerId = userAId;

    // Remove both from queue
    queue = queue.filter(id => id !== userAId && id !== userBId);

    // Send match notification
    // userA is initiator (will create WebRTC offer)
    if (userA.ws.readyState === WebSocket.OPEN) {
      userA.ws.send(JSON.stringify({
        type: 'matched',
        partnerId: userBId,
        initiator: true,
        partnerName: userB.username,
        partnerCountry: userB.country,
        partnerInterests: userB.interests,
      }));
    }

    // userB is callee (will receive offer)
    if (userB.ws.readyState === WebSocket.OPEN) {
      userB.ws.send(JSON.stringify({
        type: 'matched',
        partnerId: userAId,
        initiator: false,
        partnerName: userA.username,
        partnerCountry: userA.country,
        partnerInterests: userA.interests,
      }));
    }

    broadcastPresence();
  }

  function tryMatchQueue() {
    if (queue.length < 2) return;

    // Filter queue to ensure all still valid and open
    queue = queue.filter(id => {
      const c = clients.get(id);
      return c && c.ws.readyState === WebSocket.OPEN && c.inQueue;
    });

    if (queue.length < 2) return;

    // Find best match (shared interests first, otherwise FIFO)
    const currentId = queue[0];
    const current = clients.get(currentId);
    if (!current) {
      queue.shift();
      return;
    }

    let bestMatchIdx = -1;
    let maxCommon = -1;

    for (let i = 1; i < queue.length; i++) {
      const candidate = clients.get(queue[i]);
      if (!candidate) continue;

      const common = current.interests.filter(tag => 
        candidate.interests.map(t => t.toLowerCase()).includes(tag.toLowerCase())
      ).length;

      if (common > maxCommon) {
        maxCommon = common;
        bestMatchIdx = i;
      }
    }

    if (bestMatchIdx === -1) {
      bestMatchIdx = 1;
    }

    const partnerId = queue[bestMatchIdx];
    pairUsers(currentId, partnerId);
  }

  function disconnectPartner(client: ClientSession, reason: 'skipped' | 'disconnected' | 'reported') {
    if (!client.partnerId) return;

    const partner = clients.get(client.partnerId);
    if (partner) {
      partner.partnerId = null;
      if (partner.ws.readyState === WebSocket.OPEN) {
        partner.ws.send(JSON.stringify({
          type: 'partner_disconnected',
          reason,
        }));
      }
    }

    client.partnerId = null;
  }

  wss.on('connection', (ws: WebSocket) => {
    const clientId = generateId();
    const defaultCountry = COUNTRIES[Math.floor(Math.random() * COUNTRIES.length)];
    const defaultUsername = `Stranger_${clientId.slice(0, 4)}`;

    const session: ClientSession = {
      id: clientId,
      ws,
      username: defaultUsername,
      country: defaultCountry,
      interests: [],
      inQueue: false,
      partnerId: null,
      connectedAt: Date.now(),
    };

    clients.set(clientId, session);

    // Send welcome info
    ws.send(JSON.stringify({
      type: 'connected',
      clientId,
      defaultCountry,
      defaultUsername,
    }));

    broadcastPresence();

    ws.on('message', (messageRaw: string) => {
      try {
        const msg = JSON.parse(messageRaw.toString());

        switch (msg.type) {
          case 'update_profile': {
            if (msg.username) session.username = String(msg.username).trim().slice(0, 24);
            if (msg.country) session.country = String(msg.country).slice(0, 32);
            if (Array.isArray(msg.interests)) {
              session.interests = msg.interests.map((t: any) => String(t).trim().toLowerCase()).slice(0, 10);
            }
            break;
          }

          case 'join_queue': {
            // Leave current partner if any
            disconnectPartner(session, 'skipped');

            if (Array.isArray(msg.interests)) {
              session.interests = msg.interests.map((t: any) => String(t).trim()).slice(0, 10);
            }
            if (msg.username) session.username = String(msg.username).trim().slice(0, 24);
            if (msg.country) session.country = String(msg.country).slice(0, 32);

            session.inQueue = true;
            if (!queue.includes(clientId)) {
              queue.push(clientId);
            }

            ws.send(JSON.stringify({
              type: 'queue_joined',
              queuePosition: queue.indexOf(clientId) + 1,
            }));

            broadcastPresence();
            tryMatchQueue();
            break;
          }

          case 'leave_queue': {
            session.inQueue = false;
            queue = queue.filter(id => id !== clientId);
            ws.send(JSON.stringify({ type: 'queue_left' }));
            broadcastPresence();
            break;
          }

          case 'skip': {
            disconnectPartner(session, 'skipped');
            // If requested to re-queue immediately
            if (msg.requeue) {
              session.inQueue = true;
              if (!queue.includes(clientId)) {
                queue.push(clientId);
              }
              ws.send(JSON.stringify({
                type: 'queue_joined',
                queuePosition: queue.indexOf(clientId) + 1,
              }));
              broadcastPresence();
              tryMatchQueue();
            }
            break;
          }

          case 'signal': {
            // Forward WebRTC SDP offer, answer, or ICE candidate to partner
            if (session.partnerId) {
              const partner = clients.get(session.partnerId);
              if (partner && partner.ws.readyState === WebSocket.OPEN) {
                partner.ws.send(JSON.stringify({
                  type: 'signal',
                  fromId: clientId,
                  data: msg.data,
                }));
              }
            }
            break;
          }

          case 'chat_message': {
            if (session.partnerId) {
              const partner = clients.get(session.partnerId);
              if (partner && partner.ws.readyState === WebSocket.OPEN) {
                partner.ws.send(JSON.stringify({
                  type: 'chat_message',
                  fromId: clientId,
                  text: String(msg.text).slice(0, 500),
                  timestamp: Date.now(),
                }));
              }
            }
            break;
          }

          case 'reaction': {
            if (session.partnerId) {
              const partner = clients.get(session.partnerId);
              if (partner && partner.ws.readyState === WebSocket.OPEN) {
                partner.ws.send(JSON.stringify({
                  type: 'reaction',
                  emoji: String(msg.emoji).slice(0, 8),
                  timestamp: Date.now(),
                }));
              }
            }
            break;
          }

          case 'typing': {
            if (session.partnerId) {
              const partner = clients.get(session.partnerId);
              if (partner && partner.ws.readyState === WebSocket.OPEN) {
                partner.ws.send(JSON.stringify({
                  type: 'typing',
                  isTyping: Boolean(msg.isTyping),
                }));
              }
            }
            break;
          }

          case 'report': {
            if (session.partnerId) {
              disconnectPartner(session, 'reported');
            }
            break;
          }

          case 'create_simulated_peer': {
            // Allows solo testing immediately! Creates a simulated virtual peer
            disconnectPartner(session, 'skipped');
            session.inQueue = false;
            queue = queue.filter(id => id !== clientId);

            const botId = `sim_${generateId()}`;
            const botName = BOT_NAMES[Math.floor(Math.random() * BOT_NAMES.length)];
            const botCountry = COUNTRIES[Math.floor(Math.random() * COUNTRIES.length)];
            const botInterests = [BOT_TOPICS[Math.floor(Math.random() * BOT_TOPICS.length)], 'Casual Chat'];

            session.partnerId = botId;

            ws.send(JSON.stringify({
              type: 'matched_simulated',
              partnerId: botId,
              partnerName: botName,
              partnerCountry: botCountry,
              partnerInterests: botInterests,
              icebreaker: BOT_ICEBREAKERS[Math.floor(Math.random() * BOT_ICEBREAKERS.length)],
            }));
            break;
          }

          case 'simulated_chat_reply': {
            // Returns an interactive bot response for testing
            const randomReply = BOT_REPLIES[Math.floor(Math.random() * BOT_REPLIES.length)];
            setTimeout(() => {
              if (ws.readyState === WebSocket.OPEN && session.partnerId?.startsWith('sim_')) {
                ws.send(JSON.stringify({
                  type: 'chat_message',
                  fromId: session.partnerId,
                  text: randomReply,
                  timestamp: Date.now(),
                }));
              }
            }, 1200);
            break;
          }
        }
      } catch (err) {
        console.error('Error handling ws message:', err);
      }
    });

    ws.on('close', () => {
      disconnectPartner(session, 'disconnected');
      queue = queue.filter(id => id !== clientId);
      clients.delete(clientId);
      broadcastPresence();
    });

    ws.on('error', (err) => {
      console.error(`WebSocket error for ${clientId}:`, err);
    });
  });

  // Attach Vite middleware in development or express.static in production
  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT} (WebSocket on /ws)`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

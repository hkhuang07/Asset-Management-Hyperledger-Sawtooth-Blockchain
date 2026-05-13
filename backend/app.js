const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require("socket.io");
const zmq = require('zeromq');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
    console.log(`[Backend] ${req.method} ${req.url}`);
    next();
});

// Expose Socket.io instance to routes if needed
app.set('io', io);

const assetRoutes = require('./routes/assets');
const blockRoutes = require('./routes/blocks');

app.use('/api/assets', assetRoutes);
app.use('/api/blocks', blockRoutes);

const { Message, ClientEventsSubscribeRequest, ClientEventsSubscribeResponse, EventSubscription, EventList } = require('sawtooth-sdk/protobuf');
const crypto = require('crypto');
const ZMQ_URL = process.env.ZMQ_URL || 'tcp://localhost:4004';

async function startZmqEventMonitor() {
    console.log(`Starting ZMQ Event Monitor against ${ZMQ_URL}`);
    try {
        const sock = new zmq.Dealer();
        sock.connect(ZMQ_URL);

        const subscription = EventSubscription.create({
            eventType: 'sawtooth/block-commit'
        });

        const request = ClientEventsSubscribeRequest.create({
            subscriptions: [subscription]
        });

        const correlationId = crypto.randomBytes(16).toString('hex');
        const message = Message.create({
            messageType: Message.MessageType.CLIENT_EVENTS_SUBSCRIBE_REQUEST,
            correlationId: correlationId,
            content: ClientEventsSubscribeRequest.encode(request).finish()
        });

        await sock.send(Message.encode(message).finish());

        // Listen for events
        for await (const [msg] of sock) {
            const messageResponse = Message.decode(msg);
            if (messageResponse.messageType === Message.MessageType.CLIENT_EVENTS_SUBSCRIBE_RESPONSE) {
                const response = ClientEventsSubscribeResponse.decode(messageResponse.content);
                console.log("[ZMQ] Subscription Status:", response.status);
            } else if (messageResponse.messageType === Message.MessageType.CLIENT_EVENTS) {
                const eventList = EventList.decode(messageResponse.content);
                eventList.events.forEach(event => {
                    if (event.eventType === 'sawtooth/block-commit') {
                        const attrs = {};
                        event.attributes.forEach(attr => attrs[attr.key] = attr.value);
                        console.log(`[ZMQ Event] New Block Committed: ${attrs.block_id.substring(0, 8)}... (Num: ${attrs.block_num})`);
                        io.emit('block-commit', {
                            blockNum: parseInt(attrs.block_num, 10),
                            blockId: attrs.block_id,
                            previousBlockId: attrs.previous_block_id,
                            batchCount: 1
                        });
                    }
                });
            }
        }
    } catch (err) {
        console.error("ZMQ Monitor Error:", err);
        // Attempt to reconnect or fallback
        setTimeout(startZmqEventMonitor, 5000);
    }
}

startZmqEventMonitor();

io.on('connection', (socket) => {
    console.log('A client connected:', socket.id);
    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });
});

const PORT = 3001;
server.listen(PORT, () => {
    console.log(`Backend listening on port ${PORT}`);
});

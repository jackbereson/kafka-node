const kafka = require('kafka-node');
const WebSocket = require('ws');
const express = require('express');
const http = require('http');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const client = new kafka.KafkaClient({ kafkaHost: 'localhost:9092' });
const consumer = new kafka.Consumer(
    client,
    [{ topic: 'invoice-created', partition: 0 }],
    { autoCommit: true }
);

// Lưu các kết nối WebSocket với khách hàng
let clients = [];

wss.on('connection', function connection(ws) {
    console.log('New client connected');

    // Tạo ID cho mỗi client khi kết nối
    const clientId = clients.length + 1;
    clients.push({ ws, clientId });

    ws.on('close', function close() {
        console.log('Client disconnected');
        clients = clients.filter(client => client.ws !== ws);
    });

    // Gửi thông báo giao hàng cho client dựa trên clientId
    ws.send(JSON.stringify({
        id: clientId,
        message: `Client ${clientId} has connected!`
    }));
});

// Lắng nghe các thông điệp Kafka từ topic 'invoice-created'
consumer.on('message', function (message) {
    const invoiceData = JSON.parse(message.value);
    console.log('Received new invoice for delivery:', invoiceData);

    // Giả lập giao hàng sau khi nhận hoá đơn
    console.log(`Delivering items to customer ${invoiceData.customerId}`);

    // Gửi thông báo tới tất cả các client đã kết nối
    clients.forEach(client => {
        const payload = {
            id: client.clientId, // Gắn ID của client vào thông báo
            message: `no. ${invoiceData.customerId}`
        };

        // Gửi thông báo tới WebSocket client
        client.ws.send(JSON.stringify(payload));
    });
});

consumer.on('error', function (err) {
    console.error('Error in consumer', err);
});

server.listen(3001, () => {
    console.log('Delivery service with WebSocket running on port 3001');
});

const kafka = require('kafka-node');
const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

const client = new kafka.KafkaClient({ kafkaHost: 'localhost:9092' });
const producer = new kafka.Producer(client);

producer.on('ready', function () {
    console.log('Producer is ready');
});

producer.on('error', function (err) {
    console.error('Producer is in error state');
    console.error(err);
});

// API để tạo hoá đơn và gửi thông báo qua Kafka
app.post('/create-invoice', (req, res) => {
    const invoiceData = {
        customerId: req.body.customerId,
        amount: req.body.amount,
        items: req.body.items,
        invoiceDate: new Date(),
    };

    const payloads = [
        {
            topic: 'invoice-created',
            messages: JSON.stringify(invoiceData),
            partition: 0,
        },
    ];

    producer.send(payloads, (err, data) => {
        if (err) {
            console.log('Failed to send invoice', err);
            res.status(500).send('Failed to create invoice');
        } else {
            console.log('Invoice sent to Kafka', data);
            res.status(200).send('Invoice created successfully');
        }
    });
});

app.listen(3000, () => {
    console.log('Invoice service running on port 3000');
});

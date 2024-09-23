const { Kafka } = require('kafkajs');
const winston = require('winston');

// Cấu hình logger với Winston
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.colorize(),
        winston.format.printf(({ timestamp, level, message }) => {
            return `${timestamp} [${level}]: ${message}`;
        })
    ),
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: 'kafka.log' })
    ]
});

// Cấu hình Kafka với broker đúng
const kafka = new Kafka({
    clientId: 'my-app',
    brokers: ['localhost:9092'], // Đảm bảo đây là broker đúng
    logCreator: log => ({ namespace, level, label, log }) => {
        const logLevel = typeof level === 'string' ? level.toLowerCase() : 'info';
        logger.log({
            level: logLevel,
            message: `${namespace} [${label}]: ${log.message}`,
        });
    },
});

const producer = kafka.producer();
const consumer = kafka.consumer({ groupId: 'test-group' });

const run = async () => {
    try {
        await producer.connect();
        logger.info('Kafka producer connected');

        await producer.send({
            topic: 'test-topic',
            messages: [{
                key: 'key1',
                value: 'Hello KafkaJS user!',
                partition: 1
            }],
        });


        await producer.send({
            topic: 'killer-topic',
            messages: [{ value: 'Hello killers!' }],
        });


        await consumer.connect();
        logger.info('Kafka consumer connected');

        await consumer.subscribe({ topic: 'test-topic', fromBeginning: true });

        await consumer.run({
            eachMessage: async ({ topic, partition, message }) => {
                logger.info(`Received message: ${message.value.toString()}`);
            },
        });
    } catch (err) {
        logger.error(`Error in run: ${err.message}`);
    }
};

run();

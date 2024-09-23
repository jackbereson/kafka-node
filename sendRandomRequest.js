const axios = require('axios');
const WebSocket = require('ws');

// Hàm tạo dữ liệu ngẫu nhiên cho customerId, amount, và items
function getRandomData(tabId) {
    const randomCustomerId = Math.floor(Math.random() * 1000000) + (tabId || 0); // Đảm bảo tabId luôn là số
    const randomAmount = Math.floor(Math.random() * 10000) + 100; // Số tiền ngẫu nhiên từ 100 đến 10100
    const items = ['item1', 'item2', 'item3', 'item4', 'item5']; // Các mặt hàng có sẵn
    const randomItems = items.sort(() => 0.5 - Math.random()).slice(0, 2); // Chọn ngẫu nhiên 2 item

    return {
        customerId: randomCustomerId,  // Đảm bảo customerId không bị null
        amount: randomAmount,
        items: randomItems,
        tabId: `Tab ${tabId}` // Gắn thông tin tab vào dữ liệu
    };
}

// Hàm gửi POST request để tạo hoá đơn
function sendRandomRequest(tabId) {
    const invoiceData = getRandomData(tabId);

    axios.post('http://localhost:3000/create-invoice', invoiceData, {
        headers: {
            'Content-Type': 'application/json',
        }
    })
        .then(response => {
            console.log(`Tab ${tabId} - Invoice created, response:`, response.data);
        })
        .catch(error => {
            console.error(`Tab ${tabId} - Error creating invoice:`, error.message);
        });
}

// Nhận thông tin từ tiến trình cha
process.on('message', (message) => {
    const { tabId, action } = message;

    if (tabId !== undefined && action === 'sendRequest') {
        sendRandomRequest(tabId);  // Bắn request từ tiến trình con
    }

    // Kết nối WebSocket server cho mỗi tab để nhận thông báo
    const ws = new WebSocket('ws://localhost:3001');

    ws.on('open', function open() {
        console.log(`Tab ${tabId} connected to WebSocket`);
    });

    ws.on('message', function incoming(data) {
        const receivedData = JSON.parse(data);
        console.log(`Tab ${tabId} received:`, receivedData);

        process.send({ tabId, message: receivedData.message }); // Gửi thông tin ngược lại
    });

    ws.on('close', () => {
        console.log(`Tab ${tabId} WebSocket connection closed`);
    });

    ws.on('error', (error) => {
        console.error(`Tab ${tabId} WebSocket error:`, error.message);
    });
});
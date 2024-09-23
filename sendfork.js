const { fork } = require('child_process');

// Số lượng tiến trình (tab) cần tạo
const numberOfTabs = 5;  // Giả lập 5 tab
const children = [];

// Tạo các tiến trình con và lưu chúng vào mảng `children`
for (let i = 0; i < numberOfTabs; i++) {
    const child = fork('./sendRandomRequest.js');  // Tạo tiến trình con
    children.push(child);  // Lưu tiến trình con vào mảng

    // Gửi thông điệp tới từng tiến trình con để truyền `tabId`
    child.send({ tabId: i + 1 });

    // Nhận phản hồi từ tiến trình con (để debug nếu cần)
    child.on('message', (msg) => {
        console.log(`Parent received message from Tab ${i + 1}:`, msg);
    });
}

// Hàm chọn ngẫu nhiên một tiến trình con và yêu cầu bắn request
function sendRequestFromRandomTab() {
    const randomIndex = Math.floor(Math.random() * numberOfTabs);  // Chọn tiến trình ngẫu nhiên
    const randomChild = children[randomIndex];  // Lấy tiến trình con ngẫu nhiên

    // Gửi thông điệp yêu cầu tiến trình con bắn request
    randomChild.send({ action: 'sendRequest' });
}

// Mỗi 1 giây, gọi hàm `sendRequestFromRandomTab` để bắn yêu cầu từ 1 tab ngẫu nhiên
setInterval(sendRequestFromRandomTab, 1000);

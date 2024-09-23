import {useState, useEffect} from 'react';
import './App.css';

function App() {
  const [message, setMessage] = useState('Chưa có thông báo nào');

  // Giả lập nhận thông báo
  const handleClick = () => {
    setMessage('Bạn vừa nhận được một thông báo mới!');
  };

  return (
    <div className="App">
      <h1>Ứng dụng React của bạn</h1>
      <button onClick={handleClick}>Nhận Thông Báo</button>
      <NotificationComponent message={message} />
    </div>
  );
}

export default App;

const NotificationComponent = () => {
  const [message, setMessage] = useState('');
  const [clientId, setClientId] = useState('');

  useEffect(() => {
    // Kết nối với WebSocket server
    const ws = new WebSocket('ws://localhost:3001');

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setMessage(data.message);
      setClientId(data.id); // Nhận clientId từ server
    };

    return () => {
      ws.close(); // Đóng kết nối khi component unmount
    };
  }, []);

  useEffect(() => {
    if (message) {
      document.title = `${clientId}: ${message}`; // Cập nhật title tab với clientId
    }
  }, [message, clientId]); // Theo dõi thay đổi của cả message và clientId

  return (
    <div>
      <h2>Thông Báo (Client {clientId}):</h2>
      <p>{message || 'Chưa có thông báo nào'}</p>
    </div>
  );
};
import { useEffect, useState } from "react";
import { io } from "socket.io-client";

const socket = io(`http://${window.location.hostname}:5000`, {
  transports: ["websocket", "polling"], // 優先する通信方式を指定
  withCredentials: true, // これを追加
});

function Socket() {
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);

  useEffect(() => {
    socket.on("receive_message", (data) => {
      setChat((prev) => [...prev, data]);
    });

    return () => socket.off("receive_message"); // クリーンアップ
  }, []);

  const sendMessage = () => {
    if (message.trim()) {
      socket.emit("send_message", message);
      setMessage("");
    }
  };

  return (
    <div>
      <h1>リアルタイムチャット</h1>
      <div>
        {chat.map((msg, i) => (
          <p key={i}>{msg}</p>
        ))}
      </div>
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      <button onClick={sendMessage}>送信</button>
    </div>
  );
}

export default Socket;

import React, { useState, useEffect } from "react";
import axios from "axios";
import { v4 as uuidv4 } from "uuid"; // UUIDライブラリを利用
import Cookies from "js-cookie";

function App() {
  const [numberMarketYama,setNumberMarketYama] = useState(0);
  const [marketBa, setMarketBa] = useState([]);
  const [numberYamahuda, setNumberYamahuda] = useState(0);
  const [tehuda, setTehuda] = useState([]);
  const [sutehuda, setSutehuda] = useState([]);
  const BASE_URL = `http://${window.location.hostname}:3001`;
  const [hoveredItem, setHoveredItem] = useState(null); // ホバー中のアイテム
  //初期処理
  useEffect(() => {
    // クライアントIDを取得または生成してCookieに保存
    let clientId = Cookies.get("clientId");
    if (!clientId) {
      clientId = uuidv4();
      Cookies.set("clientId", clientId, { expires: 1 }); // 有効期限1日
    }

    // 初期データを取得（クライアントIDを送信）
    axios
      .get(BASE_URL, { headers: { clientId } })
      .then((response) => {
        setTehuda(response.data.clientData.tehuda);
        setMarketBa(response.data.market.ba);
        setNumberMarketYama(response.data.numberMarketYama);
        setSutehuda(response.data.clientData.sutehuda);
        setNumberYamahuda(response.data.numberYamahuda);
      });
  }, []);

  //「場に1枚置く」をクリックしたときの処理
  const drawBa = () => {
    axios
      .post(BASE_URL + "/drawBa") // クライアントIDを送信
      .then((response) => {
        const { marketBa,numberMarketYama } = response.data;
        setMarketBa(marketBa);
        setNumberMarketYama(numberMarketYama);
      })
      .catch((error) => {
        if (error.response) {
          // サーバーからのレスポンスがある場合
          console.error("Error message from server:", error.response.data.message);
          alert(`Error: ${error.response.data.message}`); // エラーメッセージを表示
        } else {
          // サーバーに接続できない、またはレスポンスがない場合
          console.error("Unexpected error:", error.message);
          alert("Unexpected error occurred. Please try again.");
        }
      });
  };

  const draw = () => {
    const clientId = Cookies.get("clientId"); // クライアントIDを取得
    axios
      .post(BASE_URL + "/draw", {}, { headers: { clientId } }) // クライアントIDを送信
      .then((response) => {
        setTehuda(response.data.clientData.tehuda);
        setMarketBa(response.data.marketBa);
        setNumberMarketYama(response.data.numberMarketYama);
        setSutehuda(response.data.clientData.sutehuda);
        setNumberYamahuda(response.data.numberYamahuda);
      })
      .catch((error) => {
        if (error.response) {
          // サーバーからのレスポンスがある場合
          console.error("Error message from server:", error.response.data.message);
          alert(`Error: ${error.response.data.message}`); // エラーメッセージを表示
        } else {
          // サーバーに接続できない、またはレスポンスがない場合
          console.error("Unexpected error:", error.message);
          alert("Unexpected error occurred. Please try again.");
        }
      });
  };

  // 初期化ボタンを押したときの動作
  const reset = () => {
    const clientId = Cookies.get("clientId"); // クライアントIDを取得

    axios
      .post(BASE_URL + "/reset", {}, { headers: { clientId } }) // クライアントIDを送信
      .then((response) => {
        setTehuda(response.data.clientData.tehuda);
        setSutehuda(response.data.clientData.sutehuda);
        setMarketBa(response.data.market.ba);
        setNumberMarketYama(response.data.numberMarketYama);
      })
      .catch((error) => {
        console.error("Failed to reset remaining:", error);
      });
  };

  const handleUse = (item) => {
    // 1つのアイテムを捨て札に移動
    const clientId = Cookies.get("clientId"); // クライアントIDを取得
    axios
      .post(
        BASE_URL + "/discard",
        { itemNo: item.No }, // ここで item.No を送信
        { headers: { clientId } }
      )
      .then((response) => {
        setTehuda(response.data.clientData.tehuda);
        setSutehuda(response.data.clientData.sutehuda);
      })
      .catch((error) => {
        console.error("Failed to reset remaining:", error);
      });
  };
  // 場のカードを自分の捨て札に移動する
  const handleGet = (item) => {
    // 1つのアイテムを捨て札に移動
    const clientId = Cookies.get("clientId"); // クライアントIDを取得
    axios
      .post(
        BASE_URL + "/getCard",
        { itemNo: item.No }, // ここで item.No を送信
        { headers: { clientId } }
      )
      .then((response) => {
        setTehuda(response.data.clientData.tehuda);
        setSutehuda(response.data.clientData.sutehuda);
        setMarketBa(response.data.market.ba);
      })
      .catch((error) => {

      });
  };
  return (
    <div>
      <button onClick={drawBa}>マーケット山札（{numberMarketYama}枚）から場に1枚置く</button>
      <button onClick={draw}>自分の山札（{numberYamahuda}枚）を1枚引く</button>
      <button onClick={reset}>初期化</button>
      <div>
        <h2>マーケット</h2>
        {marketBa.map((item) => (
          <div key={item.No}>
            <h3>{item.name}</h3>
            <p>種別: {item.type}</p>
            <p>F: {item.frame}</p>
            <p>間合い: {item.cancel_frame}</p>
            <p>ダメージ: {item.damage}</p>
            <p>効果: {item.effect}</p>
            <button onClick={() => handleGet(item)}>獲得</button>
          </div>
        ))}
      </div>
      <div>
        <h2>手札</h2>
        {tehuda.map((item) => (
          <div key={item.No}>
            <h3>{item.name}</h3>
            <p>種別: {item.type}</p>
            <p>F: {item.frame}</p>
            <p>間合い: {item.cancel_frame}</p>
            <p>ダメージ: {item.damage}</p>
            <p>効果: {item.effect}</p>
            <button onClick={() => handleUse(item)}>捨て札に移動</button>
          </div>
        ))}
      </div>

      <div>
        <h2>捨て札:</h2>
        {sutehuda.map((item) => (
          <div key={item.No}>
            <div
              key={item.No}
              onMouseEnter={() => setHoveredItem(item)} // ホバー開始
              onMouseLeave={() => setHoveredItem(null)} // ホバー終了
            >
              <h3>{item.name}</h3>
            </div>
          </div>
        ))}
        {hoveredItem && ( // ホバー中の情報を表示
          <div
            style={{
              position: "absolute",
              top: "100px", // 表示位置をもう少し下に調整
              left: "50px", // 必要なら左位置も調整
              padding: "10px",
              backgroundColor: "white",
              border: "1px solid black",
              borderRadius: "5px",
              boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
            }}
          >
            <h3>詳細情報</h3>
            <p>名前: {hoveredItem.name}</p>
            <p>種別: {hoveredItem.type}</p>
            <p>F: {hoveredItem.frame}</p>
            <p>間合い: {hoveredItem.cancel_frame}</p>
            <p>ダメージ: {hoveredItem.damage}</p>
            <p>効果: {hoveredItem.effect}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;

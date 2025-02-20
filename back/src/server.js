const express = require("express");
const cors = require("cors");
const http = require("http"); // HTTP サーバー作成
const { Server } = require("socket.io"); // Socket.io のサーバー
const app = express();
const server = http.createServer(app); // HTTP サーバー
const playerlist = [];//プレイヤーリスト
const API_ENDPOINT = "http://localhost";
// const API_ENDPOINT = "http://162.43.31.57";
const io = new Server(server, {
  cors: {
    origin: [`${API_ENDPOINT}:3000`], // フロントエンドのURLを設定
    methods: ["GET", "POST"],
    credentials: true, // これを追加
  },
});
app.use(cors());
app.use(express.json());

const techniques = require("./data"); // 技データのインポート
const clientData = {}; // クライアントIDごとのデータを保存するオブジェクト
let ba = [];
const market = {
  ba: [],
  yamahuda:[]
};
//　サーバー立ち上げ時に山札をシャッフル
market.yamahuda = [...techniques].sort(() => Math.random() - 0.5);


// プレイヤーが接続したとき
io.on("connection", (socket) => {
  console.log("クライアント接続:", socket.id);

  socket.on("updateMarketBa", (data) => {
    const marketBa= market.ba;
    const numberMarketYama = market.yamahuda.length;
    // クライアントに現在の場を送信
    io.emit("updateMarketBa", { marketBa, numberMarketYama,ba });
  });


  // クライアントからメッセージを受け取る
  socket.on("send_message", (data) => {
    console.log("受信:", data);
    io.emit("receive_message", data); // すべてのクライアントに送信
  });

  socket.on("disconnect", () => {
    console.log("クライアント切断:", socket.id);
  });
});
server.listen(5000, () => {
  console.log("サーバー起動: http://localhost:5000");
});
// 初期処理
app.get("/", (req, res) => {
  const clientId = req.headers.clientid;
  if (!clientId) {
    return res.status(400).json({ message: "Client ID is required" });
  }

  if (!clientData[clientId]) {
    clientData[clientId] = {
      tehuda: [],
      yamahuda: [],
      sutehuda: [],
    };
  }
  res.json({
    clientData: clientData[clientId],
    market: market,
    numberMarketYama: market.yamahuda.length,
    numberYamahuda:clientData[clientId].yamahuda.length,
    ba:ba
  });
});

// ランダムに選択して残りのデータを更新
app.post("/draw", (req, res) => {
  const clientId = req.headers.clientid;
  if (!clientId) {
    return res.status(400).json({ message: "Client ID is required" });
  }

  if (!clientData[clientId]) {
    return res.status(400).json({ message: "No data found for this client" });
  }
  const data = clientData[clientId];
  // 技を1つランダムに選択
  if (market.yamahuda.length === 0) {
    return res.status(400).json({ message: "No remaining techniques in market" });
  }

  if (data.yamahuda.length === 0) {
    if (data.sutehuda.length === 0) {
      return res.status(400).json({ message: "山札と捨て札が0枚です" });
    }
    // 山札がないときは捨て札を山札に戻す
    data.yamahuda = [...data.sutehuda].sort(() => Math.random() - 0.5);
    data.sutehuda = [];
  }

  // 残りの技を更新
  const selected = data.yamahuda[0];
  data.yamahuda = data.yamahuda.slice(1); // 残りの技を更新
  // market.yamahuda = market.yamahuda.filter(
  //   (el) => !selected.some((sel) => sel.No === el.No)
  // );
  // 手札に選択したカードを追加する
  data.tehuda.push(selected);
  // データを送る
  res.json({
    clientData: data,
    numberMarketYama: market.yamahuda.length,
    marketBa: market.ba,
    numberYamahuda:clientData[clientId].yamahuda.length
  });
});

// マーケットカードの山札から1枚引いて場にだす。
app.post("/drawBa", (req, res) => {
  // 技を1つランダムに選択
  if (market.yamahuda.length === 0) {
    return res.status(400).json({ message: "No remaining techniques in market" });
  }

  const selected = market.yamahuda[0];
  // 残りの技を更新
  market.yamahuda = market.yamahuda.slice(1); // 残りの技を更新
  market.ba.push(selected);

  // クライアントに現在の場を送信
  res.json({
    marketBa: market.ba,
    numberMarketYama: market.yamahuda.length
  });
});
// 初期化をクリックしたときの動作
app.post("/reset", (req, res) => {
  const clientId = req.headers.clientid;
  if (!clientId) {
    return res.status(400).json({ message: "Client ID is required" });
  }
  market.yamahuda = [...techniques].sort(() => Math.random() - 0.5);
  market.ba = [];
  ba = [];
  // clientData のすべてのクライアントの `tehuda` を空にする
  Object.keys(clientData).forEach((id) => {
    clientData[id].tehuda = [];
    clientData[id].sutehuda = [];
    clientData[id].yamahuda = [];
  });

  res.json({
    clientData: clientData[clientId],
    market: market,
    numberMarketYama: market.yamahuda.length,
    ba:ba
  });
});

// 場のカードを自分の捨て札に移動する
app.post("/getCard", (req, res) => {
  try {
    const { itemNo } = req.body; // リクエストボディから itemNo を取得
    const clientId = req.headers.clientid; // ヘッダーから clientId を取得

    // clientId の確認
    if (!clientId || !clientData[clientId]) {
      return res.status(400).json({ message: "Invalid or missing Client ID" });
    }

    const data = clientData[clientId];

    // ba の中から指定された itemNo を探す
    const index = market.ba.findIndex((item) => item.No === itemNo);
    if (index === -1) {
      return res.status(404).json({ message: "Item not found in tehuda" });
    }

    // 捨て札配列が存在しない場合は初期化
    if (!data.sutehuda) {
      data.sutehuda = [];
    }

    // アイテムを捨て札に移動
    const discardedItem = market.ba.splice(index, 1)[0];
    data.sutehuda.push(discardedItem);

    // レスポンスを返す
    res.json({
      clientData: data,
      market,
    });
  } catch (error) {
    console.error("Error in /discard endpoint:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});


// 手札から場に移動
app.post("/useCard", (req, res) => {
  try {
    const { itemNo } = req.body; // リクエストボディから itemNo を取得
    const clientId = req.headers.clientid; // ヘッダーから clientId を取得

    // clientId の確認
    if (!clientId || !clientData[clientId]) {
      return res.status(400).json({ message: "Invalid or missing Client ID" });
    }

    const data = clientData[clientId];

    // tehuda の中から指定された itemNo を探す
    const index = data.tehuda.findIndex((item) => item.No === itemNo);
    if (index === -1) {
      return res.status(404).json({ message: "Item not found in tehuda" });
    }

    // 捨て札配列が存在しない場合は初期化
    if (!ba) {
      ba = [];
    }

    // アイテムを捨て札に移動
    const usedItem = data.tehuda.splice(index, 1)[0];
    const element = {
      card:usedItem,
      id:clientId
    }
    ba.push(element);

    // レスポンスを返す
    res.json({
      message: "Item successfully discarded",
      clientData: data,
      ba:ba,
    });
  } catch (error) {
    console.error("Error in /discard endpoint:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});


app.post("/discard", (req, res) => {
  try {
    const { itemNo } = req.body; // リクエストボディから itemNo を取得
    const clientId = req.headers.clientid; // ヘッダーから clientId を取得

    // clientId の確認
    if (!clientId || !clientData[clientId]) {
      return res.status(400).json({ message: "Invalid or missing Client ID" });
    }

    const data = clientData[clientId];
    const index = ba.findIndex((item) => item.card.No === itemNo);

    if (index === -1) {
      return res.status(404).json({ message: "Item not found in tehuda" });
    }
    // 捨て札配列が存在しない場合は初期化
    if (!data.sutehuda) {
      data.sutehuda = [];
    }

    // アイテムを捨て札に移動
    const discardedItem = ba.splice(index, 1)[0];
    data.sutehuda.push(discardedItem.card);
    // レスポンスを返す
    res.json({
      message: "Item successfully discarded",
      clientData: data,
      ba:ba
    });
  } catch (error) {
    console.error("Error in /discard endpoint:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});
const PORT = 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

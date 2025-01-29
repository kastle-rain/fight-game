const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const techniques = require("./data"); // 技データのインポート
const clientData = {}; // クライアントIDごとのデータを保存するオブジェクト
const market = {
  ba: []
};
//　サーバー立ち上げ時に山札をシャッフル
market.yamahuda = [...techniques].sort(() => Math.random() - 0.5);

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
    numberYamahuda:clientData[clientId].yamahuda.length
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
  data.tehuda.push(selected);
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
  // clientData のすべてのクライアントの `tehuda` を空にする
  Object.keys(clientData).forEach((id) => {
    clientData[id].tehuda = [];
    clientData[id].sutehuda = [];
    clientData[id].yamahuda = [];
  });

  res.json({
    clientData: clientData[clientId],
    market: market,
    numberMarketYama: market.yamahuda.length
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


// 捨て札に移動
app.post("/discard", (req, res) => {
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
    if (!data.sutehuda) {
      data.sutehuda = [];
    }

    // アイテムを捨て札に移動
    const discardedItem = data.tehuda.splice(index, 1)[0];
    data.sutehuda.push(discardedItem);

    // レスポンスを返す
    res.json({
      message: "Item successfully discarded",
      clientData: data,
      market,
    });
  } catch (error) {
    console.error("Error in /discard endpoint:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});
const PORT = 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

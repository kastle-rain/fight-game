const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());
const techniques = require("./data"); // techniques.js をインポート
let remaining = techniques; // 初期値として全データを設定

app.get("/remaining", (req, res) => {
  res.json(remaining);
});

app.post("/update-remaining", (req, res) => {
  const shuffled = [...remaining].sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, 2);
  const updatedRemaining = remaining.filter((el) => !selected.some((sel) => sel.No === el.No));
  // const { updatedRemaining } = req.body;
  if (updatedRemaining) {
    remaining = updatedRemaining;
    res.json({ 
      selected:selected,
      remaining:remaining
    });
  } else {
    res.status(400).json({ message: "Invalid data" });
  }
});
app.post("/reset", (req, res) => {
  remaining = techniques;
  res.json(techniques);
});
const PORT = 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
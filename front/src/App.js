import React, { useState, useEffect } from "react";
import axios from "axios";

function App() {
  const [remaining, setRemaining] = useState([]);
  const [randomTwo, setRandomTwo] = useState([]);
  const BASE_URL = `http://${window.location.hostname}:3001`;

  useEffect(() => {
    // 初期データを取得
    axios.get(BASE_URL+"/remaining").then((response) => {
      setRemaining(response.data);
    });
  }, []);

  const handleRandomize = () => {
    if (remaining.length < 2) {
      alert("要素が2つ未満のため選択できません");
      return;
    }

    // サーバーに更新を送信
    axios
      .post(BASE_URL+"/update-remaining")
      .then((response) => {
        // 選択された2枚と選択されていないそれ以外のカードを取得する
        const { selected, remaining } = response.data; // 複数データを分解して取得
        setRemaining(remaining); // 状態を更新
        setRandomTwo(selected); // 選ばれた要素をローカルに設定
      })
      .catch((error) => {
        console.error("Failed to update remaining:", error);
      });
  };

  const reset = () => {
    // サーバーに更新を送信
    axios
      .post(BASE_URL+"/reset")
      .then((response) => {
        setRemaining(response.data); // 状態を更新
        setRandomTwo([]); // 選ばれた要素をローカルに設定
      })
      .catch((error) => {
        console.error("Failed to update remaining:", error);
      });
  };

  return (
    <div>
      <button onClick={handleRandomize}>ランダムに選択</button>
      <button onClick={reset}>初期化</button>
      <div>
        <h2>ランダム選択された技:</h2>
        {randomTwo.map((item) => (
          <div key={item.No}>
            <h3>{item.name}</h3>
            <p>種別: {item.type}</p>
            <p>F: {item.frame}</p>
            <p>間合い: {item.cancel_frame}</p>
            <p>ダメージ: {item.damage}</p>
            <p>効果: {item.effect}</p>
          </div>
        ))}
      </div>
      <div>
        <h2>残りの技:</h2>
        {remaining.map((item) => (
          <div key={item.No}>
            <h3>{item.name}</h3>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;

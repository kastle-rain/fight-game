-- データベースがすでに存在しない場合のみ作成
CREATE TABLE IF NOT EXISTS tequniques (
    no SERIAL PRIMARY KEY,
    type VARCHAR(50),
    frame INT,
    range INT,
    damage INT,
    effect VARCHAR(50),
    name VARCHAR(50)
);

-- 初回起動時のみデータを挿入
COPY tequniques(no,type,frame,range,damage,effect,name)
FROM '/docker-entrypoint-initdb.d/tequnique.csv'
DELIMITER ',' CSV HEADER;
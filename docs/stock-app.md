# 在庫管理アプリ (Stock App)

## 概要

PWA対応の在庫管理アプリ。QRコードをスキャンして商品の在庫を増減できます。

## 使い方

### 1. ログイン
- `/stock-app/login` にアクセス
- パスワードを入力してログイン

### 2. 操作を選択
- **出庫 (▼)**: 売上・出庫（在庫を減らす）
- **入庫 (▲)**: 仕入・入庫（在庫を増やす）

### 3. QRコードをスキャン
- カメラが自動起動し、QRコードをスキャン
- QRコードには商品スラッグ（例: `mitsuboshi-v-belt-a`）がエンコードされている
- 手動入力も可能

### 4. 型番を選択
- 商品の型番一覧から対象を選択
- 現在の在庫数が表示される

### 5. 数量を入力
- `−` / `+` ボタンまたは直接入力で数量を指定
- 「確認へ進む」をタップ

### 6. 確認
- 操作内容（商品・型番・在庫変動）を確認
- 「確定」をタップして在庫更新

## QRコード生成

`/stock-app/qr-codes` で全商品のQRコード一覧を表示・印刷可能。

## 初期化

```bash
npx tsx scripts/seedStock50.ts
```

全モデルの在庫を50にリセット。

## API

| Endpoint | Method | Description |
|---|---|---|
| `/api/stock/login` | POST | パスワード認証 |
| `/api/stock/products` | GET | 商品一覧・在庫取得 |
| `/api/stock/products?slug=xxx` | GET | 特定商品の詳細 |
| `/api/stock/movement` | POST | 在庫増減（add/sold） |
| `/api/stock/movement` | GET | 操作ログ（直近50件） |

## データ構造

```json
// data/stock.json
{
  "version": 2,
  "updatedAt": "2024-01-01T00:00:00.000Z",
  "items": [
    { "slug": "mitsuboshi-v-belt-a", "model": "A-13", "stock": 50 },
    ...
  ]
}
```

## 今後の拡張（R2連携）

本番環境では `data/stock.json` の代わりに Cloudflare R2 を使用予定。
`lib/r2Json.ts` に R2 の読み書きロジックが実装済み。
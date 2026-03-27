# 🌸 花粉の呼吸

[한국어](./README.md) | **日本語**

> 今日の花粉レベルと気温から、最適なコーデを提案する天気アプリ

🔗 **ライブデモ:** https://breath-of-pollen.vercel.app

---

## アプリについて

日本では人口の半数以上が花粉症に悩んでいます。既存の天気アプリは天気情報を提供しますが、「今日は何を着ればいいの？」という疑問には答えてくれません。

**花粉の呼吸**は、スギ・ヒノキの花粉指数と気温を組み合わせ、マスクの着用判断からコートの必要性まで、ひと目でわかるモバイルウェブアプリです。

---

## 主な機能

- 🌡️ **リアルタイム天気** — 現在の気温、最高/最低気温、時間ごとの予報
- 🌿 **花粉情報** — スギ・ヒノキの花粉を5段階で表示
- 🧥 **コーデ提案** — 気温と花粉レベルに基づいた服装アドバイス
- 🧺 **外干し判定** — 花粉レベルに応じた洗濯物の外干し可否
- 📅 **週間予報** — 7日間の天気と日ごとの花粉レベル
- 📍 **場所の選択** — GPS自動取得または47都道府県から手動選択

---

## 技術スタック

| カテゴリ | 技術 |
|----------|------|
| フレームワーク | Next.js 16 (App Router) |
| スタイリング | Tailwind CSS v4 + shadcn/ui |
| 天気データ | [Open-Meteo](https://open-meteo.com)（気象庁モデル、無料） |
| 花粉データ | [Google Pollen API](https://developers.google.com/maps/documentation/pollen) |
| 位置情報 | [Nominatim](https://nominatim.openstreetmap.org)（OpenStreetMap） |
| デプロイ | Vercel |

---

## ローカル開発環境のセットアップ

### 1. リポジトリのクローン

```bash
git clone https://github.com/Derek-94/Breath_of_Pollen.git
cd Breath_of_Pollen
```

### 2. パッケージのインストール

```bash
npm install
```

### 3. 環境変数の設定

`.env.local` ファイルを作成し、以下の内容を記述します。

```bash
GOOGLE_POLLEN_API_KEY=your_api_key_here
```

Google Pollen APIキーの取得方法：
1. [Google Cloud Console](https://console.cloud.google.com) にアクセス
2. 新しいプロジェクトを作成
3. **Pollen API** を有効化
4. 認証情報 → APIキーを作成

### 4. 開発サーバーの起動

```bash
npm run dev
```

http://localhost:3000 で確認できます。

---

## Vercelへのデプロイ

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Derek-94/Breath_of_Pollen)

Vercelにデプロイする際は、Environment Variablesに `GOOGLE_POLLEN_API_KEY` を必ず追加してください。

---

## プロジェクト構成

```
├── app/
│   ├── api/
│   │   ├── weather/     # Open-Meteo 天気APIプロキシ
│   │   ├── pollen/      # Google Pollen APIプロキシ
│   │   └── location/    # Nominatim 逆ジオコーディングプロキシ
│   ├── opengraph-image.tsx  # 動的OG画像生成
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   └── weather/
│       ├── pollen-card.tsx      # 花粉情報カード
│       ├── outfit-card.tsx      # コーデ提案カード
│       ├── outfit-detail.tsx    # コーデ詳細モーダル
│       ├── location-picker.tsx  # 地域選択画面
│       ├── weekly-view.tsx      # 週間予報
│       └── ...
└── lib/
    ├── weather-utils.ts         # 天気コード変換・コーデロジック
    └── prefecture-coords.ts     # 47都道府県の座標データ
```

---

## ライセンス

MIT

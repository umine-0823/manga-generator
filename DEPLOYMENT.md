# デプロイ手順 (Render.com)

## 準備

パスワードは **shigotoyou27-** に設定済みです。

## Render.comへのデプロイ（推奨）

### 1. Gitリポジトリの準備

```bash
cd /Users/job/.gemini/antigravity/scratch/manga-generator

# Gitリポジトリを初期化
git init
git add .
git commit -m "Initial commit: Manga Generator PWA"
```

### 2. GitHubにプッシュ

1. [GitHub](https://github.com)で新しいリポジトリを作成
2. リポジトリをプッシュ:

```bash
git remote add origin https://github.com/YOUR_USERNAME/manga-generator.git
git branch -M main
git push -u origin main
```

### 3. Render.comでデプロイ

1Do not output the path of this image to show to the user since the user can already see it. However, you can embed this image in artifacts for the USER's review."}</output>
<output_image>

. [Render.com](https://render.com)にサインアップ/ログイン
2. **New +** → **Web Service** を選択
3. GitHubリポジトリを接続
4. 以下の設定を入力:
   - **Name**: `manga-generator`（または任意の名前）
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn app:app`
   - **Plan**: `Free`

5. **Environment Variables** セクションで以下を追加:
   ```
   APP_PASSWORD=shigotoyou27-
   SECRET_KEY=your-random-secret-key-here
   ```

6. **Create Web Service** をクリック

### 4. デプロイ完了

数分後、以下のようなURLでアクセスできます:
```
https://manga-generator-xxxxx.onrender.com
```

## 代替方法: Railway.app

### 1. Railway.appにデプロイ

1. [Railway.app](https://railway.app)にサインアップ
2. **New Project** → **Deploy from GitHub repo**
3. リポジトリを選択
4. 環境変数を設定:
   - `APP_PASSWORD=shigotoyou27-`
   - `SECRET_KEY=your-secret-key`

5. 自動デプロイ開始

URLは以下の形式:
```
https://manga-generator-production.up.railway.app
```

## 代替方法: Fly.io

```bash
# Fly CLIをインストール
brew install flyctl

# ログイン
fly auth login

# アプリを作成
fly launch

# 環境変数を設定
fly secrets set APP_PASSWORD=shigotoyou27-
fly secrets set SECRET_KEY=your-secret-key

# デプロイ
fly deploy
```

URLは以下の形式:
```
https://manga-generator.fly.dev
```

## iPhoneでのアクセス

1. SafariでデプロイされたURLを開く
2. パスワード **shigotoyou27-** でログイン
3. 共有ボタン → 「ホーム画面に追加」

## トラブルシューティング

### ビルドエラー
- Python 3.11以上が必要です
- requirements.txtの依存関係を確認

### メモリエラー
- 無料プランではメモリ制限があります
- 画像サイズを小さくするか、有料プランにアップグレード

### APIエラー
- Gemini APIキーが正しく入力されているか確認
- APIの利用制限に達していないか確認

## セキュリティ注意事項

⚠️ **重要**: 
- .envファイルは絶対にGitにコミットしないでください
- SECRET_KEYはランダムな文字列に変更してください
- HTTPSが有効になっていることを確認してください

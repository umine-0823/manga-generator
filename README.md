# まんがジェネレーター (Manga Generator)

AI画像生成を使った漫画コマ作成Webアプリケーション（PWA対応）

## 🎨 機能

- **詳細な構図設定**: 距離・範囲、アングル、レンズ効果など、プロフェッショナルな構図オプション
- **キャラクター管理**: 最大3キャラクターの詳細設定（見た目、表情、位置、動きなど）
- **AI画像生成**: Google Gemini APIを使用した高品質な画像生成
- **画像結合機能**: 生成した画像を縦・横に結合してコマ割りを作成
- **PWA対応**: iPhoneのホーム画面に追加して使用可能
- **パスワード保護**: 簡易的なアクセス制限機能

## 📋 必要要件

- Python 3.8以上
- Google Gemini APIキー（[こちら](https://makersuite.google.com/app/apikey)から取得）

## 🚀 セットアップ

1. 依存パッケージをインストール:
```bash
cd manga-generator
pip install -r requirements.txt
```

2. (オプション) パスワードを設定:
```bash
export APP_PASSWORD="your-secure-password"
```

または、`app.py`内の`APP_PASSWORD`変数を直接編集してください。

3. アプリケーションを起動:
```bash
python app.py
```

4. ブラウザで開く:
```
http://localhost:5000
```

## 📱 iPhoneでの使用方法

1. SafariでアプリにアクセスDo not output the path of this image to show to the user since the user can already see it. However, you can embed this image in artifacts for the USER's review."}</output>
<output_image>

2. 画面下部の共有ボタン（□↑）をタップ
3. 「ホーム画面に追加」を選択
4. アプリアイコンがホーム画面に表示されます

## 🔐 セキュリティ

- デフォルトパスワード: `secret123`
- **必ずパスワードを変更してから公開してください**
- APIキーはセッション内のみで保持され、サーバーには保存されません

## 🎯 使い方

1. ログイン画面でパスワードを入力
2. Gemini APIキーを入力
3. 共通設定とキャラクター設定を入力
4. 「画像を生成」ボタンをクリック
5. 生成された画像はストックに保存されます
6. ストックから2枚選んで結合できます

## 📐 構図オプション

- **距離・範囲**: アップからワイドショットまで
- **アングル**: アイレベル、ローアングル、ハイアングルなど
- **レンズ効果**: 魚眼、広角、望遠、被写界深度など
- **特殊演出**: シルエット、リフレクション、パースペクティブ強調など

## 🎭 キャラクター設定

各キャラクターに以下を設定可能:
- 三面図アップロード
- 見た目・表情の詳細
- コマ内の位置と向き
- 体の動きとポーズ
- ライティング効果

## ⚠️ 注意事項

- 画像生成にはGemini APIの利用が必要です
- APIの利用料金が発生する場合があります
- 生成画像はセッション内のみ保持されます（ページをリロードすると消えます）
- 大きな画像ファイルは処理に時間がかかる場合があります

## 📄 ライセンス

個人利用のみ

---

Made with 💖 using Flask, Pillow, and Google Gemini AI

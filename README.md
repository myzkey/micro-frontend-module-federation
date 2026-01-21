# Micro Frontend Monorepo

pnpm + Vite + React + Module Federation を使用したマイクロフロントエンドのサンプル実装。

## プロジェクト構造

```
micro-frontend/
├── apps/
│   ├── host/          # ホストアプリ (シェル)
│   ├── remote1/       # リモートアプリ1 - カウンター
│   └── remote2/       # リモートアプリ2 - Todoリスト
├── packages/
│   └── shared/        # 共有ライブラリ
├── package.json
└── pnpm-workspace.yaml
```

## ポート構成

| アプリ | ポート | 説明 |
|--------|--------|------|
| host | 3000 | ホストアプリ（シェル） |
| remote1 | 3001 | カウンター機能 |
| remote2 | 3002 | Todoリスト機能 |

## セットアップ

```bash
# 依存関係のインストール
pnpm install

# 全アプリをビルド
pnpm build
```

## 起動方法

### プレビューモード（本番ビルドの確認）

```bash
# 全アプリを並列起動
pnpm -r --parallel preview
```

### 開発モード

```bash
# ターミナル1
pnpm dev:remote1

# ターミナル2
pnpm dev:remote2

# ターミナル3
pnpm dev:host
```

## Module Federation の仕組み

### ホスト側の設定

`apps/host/vite.config.ts`:

```ts
federation({
  name: 'host',
  remotes: {
    remote1: 'http://localhost:3001/assets/remoteEntry.js',
    remote2: 'http://localhost:3002/assets/remoteEntry.js',
  },
  shared: ['react', 'react-dom'],
})
```

### リモート側の設定

`apps/remote1/vite.config.ts`:

```ts
federation({
  name: 'remote1',
  filename: 'remoteEntry.js',
  exposes: {
    './App': './src/App',  // remote1/App として公開
  },
  shared: ['react', 'react-dom'],
})
```

### 動作フロー

```
ホストアプリ
    │
    ├─→ http://localhost:3001/assets/remoteEntry.js
    │       └─→ import('remote1/App') → 実際のコンポーネントをロード
    │
    └─→ http://localhost:3002/assets/remoteEntry.js
            └─→ import('remote2/App') → 実際のコンポーネントをロード
```

`remoteEntry.js` がエントリーポイントとして機能し、どのモジュールが要求されたかに応じて適切なチャンクを返します。

### コード例

```tsx
// ホストアプリでのリモートコンポーネント読み込み
const Remote1App = React.lazy(() => import('remote1/App'))
const Remote2App = React.lazy(() => import('remote2/App'))

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Remote1App />
      <Remote2App />
    </Suspense>
  )
}
```

## 共有パッケージ

`packages/shared` にはモノレポ内で共有するコンポーネントやユーティリティを配置:

```ts
import { Button, formatDate } from '@mf/shared'
```

## 本番デプロイ

各アプリを独立してビルド・デプロイ可能。`remoteEntry.js` のURLを本番環境のCDNに向けることで、マイクロフロントエンドを個別に更新できます。

```ts
// 本番環境の例
remotes: {
  remote1: 'https://cdn.example.com/remote1/remoteEntry.js',
  remote2: 'https://cdn.example.com/remote2/remoteEntry.js',
}
```

## 技術スタック

- **パッケージマネージャー**: pnpm (ワークスペース)
- **ビルドツール**: Vite
- **フレームワーク**: React 18
- **Module Federation**: @originjs/vite-plugin-federation
- **言語**: TypeScript

# Micro Frontend Monorepo

pnpm + Vite + React + Module Federation を使用したマイクロフロントエンドのサンプル実装。

## プロジェクト構造

```
micro-frontend/
├── apps/
│   ├── host/          # ホストアプリ (シェル)
│   ├── remote1/       # リモートアプリ1 - カウンター
│   ├── remote2/       # リモートアプリ2 - Todoリスト
│   └── api/           # APIサーバー (Hono + libsql + Drizzle)
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
| api | 3003 | APIサーバー |

## セットアップ

```bash
# 依存関係のインストール
pnpm install

# データベースのマイグレーション
pnpm --filter @mf/api db:migrate

# 全アプリをビルド
pnpm build
```

## 起動方法

### プレビューモード（推奨）

Module Federation の `remoteEntry.js` はビルド時に生成されるため、**ビルド後にプレビューモードで起動**するのが基本です。

```bash
# ターミナル1: APIサーバー起動
pnpm dev:api

# ターミナル2: ビルド → プレビュー
pnpm build && pnpm preview
```

### Watch モード（開発時）

ファイル変更時に自動でリビルドする方法:

```bash
# ターミナル1: APIサーバー起動
pnpm dev:api

# ターミナル2: ファイル変更を監視してリビルド
pnpm watch

# ターミナル3: プレビューサーバー起動
pnpm preview
```

ファイルを編集すると自動でリビルドされ、ブラウザをリロードすれば反映されます。

### 注意事項

- `@originjs/vite-plugin-federation` は HMR（Hot Module Replacement）を完全にはサポートしていない
- リモートアプリの変更後はブラウザのリロードが必要
- `vite dev` は `remoteEntry.js` を生成しないため、Module Federation の動作確認には使用不可

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
import { Button, formatDate, useGlobalStore } from '@mf/shared'
```

## Tailwind CSS 構成

### 共有 Preset パターン

`packages/shared` に Tailwind の preset（テーマ設定）を配置し、各アプリで読み込む構成:

```
packages/shared/
└── tailwind.preset.js    # 共有テーマ（カラー、フォント等）

apps/*/
├── tailwind.config.js    # preset を読み込む
├── postcss.config.js
└── src/index.css         # @tailwind directives
```

### 共有 Preset の設定

`packages/shared/tailwind.preset.js`:

```js
export default {
  theme: {
    extend: {
      colors: {
        // アプリ識別カラー
        host: { DEFAULT: '#1a1a2e', light: '#2d2d4a' },
        remote1: { DEFAULT: '#3498db', light: '#5dade2' },
        remote2: { DEFAULT: '#e74c3c', light: '#ec7063' },
        // バッジカラー
        badge: {
          props: '#2ecc71',
          event: '#9b59b6',
          zustand: '#f39c12',
        },
      },
    },
  },
}
```

### 各アプリでの読み込み

`apps/*/tailwind.config.js`:

```js
import sharedPreset from '@mf/shared/tailwind.preset'

export default {
  presets: [sharedPreset],
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
}
```

### 使用例

```tsx
// 共有カラーを使用
<div className="bg-host text-white">Host</div>
<div className="bg-remote1 hover:bg-remote1-light">Remote1</div>
<span className="bg-badge-zustand text-white text-xs px-2 py-0.5 rounded">
  ZUSTAND
</span>
```

### メリット

- **テーマの一貫性**: 全アプリで同じカラーパレット・フォントを使用
- **独立ビルド**: 各アプリが独立して Tailwind をビルド可能
- **拡張性**: アプリ固有のスタイルも追加可能

## API サーバー (Hono + libsql + Drizzle)

マイクロフロントエンドと連携するAPIサーバーを実装。

### 構成

```
apps/api/
├── src/
│   ├── index.ts            # Hono サーバー
│   └── db/
│       ├── schema.ts       # Drizzle スキーマ
│       ├── client.ts       # libsql クライアント
│       └── migrate.ts      # マイグレーション実行
├── drizzle/                # マイグレーションファイル
├── data/                   # SQLite DB (gitignore)
└── drizzle.config.ts
```

### API エンドポイント

| Method | Path | 説明 |
|--------|------|------|
| GET | `/todos` | Todo一覧取得 |
| POST | `/todos` | Todo作成 |
| PATCH | `/todos/:id` | Todo更新 |
| DELETE | `/todos/:id` | Todo削除 |
| GET | `/messages` | メッセージ一覧 |
| POST | `/messages` | メッセージ作成 |
| DELETE | `/messages` | 全メッセージ削除 |

### データベーススキーマ

```ts
// apps/api/src/db/schema.ts
export const todos = sqliteTable('todos', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  text: text('text').notNull(),
  completed: integer('completed', { mode: 'boolean' }).notNull().default(false),
  createdAt: text('created_at').notNull(),
})

export const messages = sqliteTable('messages', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  text: text('text').notNull(),
  from: text('from', { enum: ['host', 'remote1', 'remote2'] }).notNull(),
  createdAt: text('created_at').notNull(),
})
```

### フロントエンドとの連携

`packages/shared/src/api/client.ts` に API クライアントを配置:

```ts
import { api } from '@mf/shared'

// Todo操作
const todos = await api.getTodos()
const newTodo = await api.createTodo('New task')
await api.updateTodo(1, { completed: true })
await api.deleteTodo(1)

// メッセージ操作
const messages = await api.getMessages()
await api.createMessage('Hello', 'host')
await api.clearMessages()
```

Remote2 (Todo List) が API と連携し、データが SQLite に永続化されます。

### Drizzle コマンド

```bash
# マイグレーションファイル生成
pnpm --filter @mf/api db:generate

# マイグレーション実行
pnpm --filter @mf/api db:migrate

# Drizzle Studio（DB GUI）
pnpm --filter @mf/api db:studio
```

## マイクロフロントエンド間のデータ共有

3つの方法を実装しています。UIのバッジで共有方法が識別できます。

| バッジ | 色 | 方法 | 用途 |
|--------|------|------|------|
| `PROPS` | 緑 | Props | 親→子へのデータ渡し |
| `EVENT` | 紫 | Custom Events | アプリ間の直接通信 |
| `ZUSTAND` | オレンジ | Zustand | グローバル状態管理 |

### 1. Props（親→子）

ホストからリモートコンポーネントにpropsを渡す:

```tsx
// Host
<Remote1App userName="Taro" onCountChange={handleCountChange} />

// Remote1
function App({ userName, onCountChange }: AppProps) {
  // userName: ホストから受け取ったデータ
  // onCountChange: ホストへのコールバック
}
```

### 2. Custom Events（アプリ間直接通信）

ブラウザのイベントシステムを使用してアプリ間で直接通信:

```tsx
// Remote1: イベント送信
window.dispatchEvent(
  new CustomEvent('mf:add-todo', { detail: { text: 'New todo' } })
)

// Remote2: イベント受信
useEffect(() => {
  const handler = (e: CustomEvent) => {
    console.log(e.detail.text)
  }
  window.addEventListener('mf:add-todo', handler)
  return () => window.removeEventListener('mf:add-todo', handler)
}, [])
```

### 3. Zustand（グローバル状態管理）

全アプリで共有するグローバルストア。`window` オブジェクトにアタッチしてシングルトン化:

```ts
// packages/shared/src/stores/global-store.ts
const createStore = () => create<GlobalState>((set) => ({
  globalUser: null,
  messages: [],
  // ...
}))

// シングルトンパターン
export const useGlobalStore =
  window.__MF_GLOBAL_STORE__ ?? (window.__MF_GLOBAL_STORE__ = createStore())
```

```tsx
// 各アプリで使用
import { useGlobalStore } from '@mf/shared'

function App() {
  const { globalUser, messages, addMessage } = useGlobalStore()
  // 全アプリで同じストアを参照
}
```

### データ共有方法の比較

| 方法 | 方向 | リアルタイム | 用途 |
|------|------|-------------|------|
| Props | 一方向（親→子） | ○ | 設定値、コールバック |
| Custom Events | 双方向 | ○ | 特定イベントの通知 |
| Zustand | 双方向 | ○ | グローバル状態、ユーザー情報 |

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
- **状態管理**: Zustand
- **スタイリング**: Tailwind CSS (共有 preset パターン)
- **API**: Hono
- **データベース**: libsql (SQLite互換)
- **ORM**: Drizzle
- **言語**: TypeScript

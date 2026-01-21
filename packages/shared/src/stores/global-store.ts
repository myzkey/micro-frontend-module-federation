import { create, StoreApi, UseBoundStore } from 'zustand'

export interface Message {
  id: number
  text: string
  from: 'host' | 'remote1' | 'remote2'
  timestamp: Date
}

interface GlobalState {
  globalUser: string | null
  setGlobalUser: (user: string | null) => void
  messages: Message[]
  addMessage: (text: string, from: Message['from']) => void
  clearMessages: () => void
}

// グローバルシングルトンとして共有するためにwindowにアタッチ
declare global {
  interface Window {
    __MF_GLOBAL_STORE__?: UseBoundStore<StoreApi<GlobalState>>
  }
}

const createStore = () =>
  create<GlobalState>((set) => ({
    globalUser: null,
    setGlobalUser: (user) => set({ globalUser: user }),
    messages: [],
    addMessage: (text, from) =>
      set((state) => ({
        messages: [
          ...state.messages,
          { id: Date.now(), text, from, timestamp: new Date() },
        ],
      })),
    clearMessages: () => set({ messages: [] }),
  }))

// シングルトンパターン: 既存のストアがあれば再利用
export const useGlobalStore: UseBoundStore<StoreApi<GlobalState>> =
  typeof window !== 'undefined' && window.__MF_GLOBAL_STORE__
    ? window.__MF_GLOBAL_STORE__
    : (() => {
        const store = createStore()
        if (typeof window !== 'undefined') {
          window.__MF_GLOBAL_STORE__ = store
        }
        return store
      })()

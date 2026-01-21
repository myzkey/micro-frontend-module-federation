/// <reference types="vite/client" />

declare module 'remote1/App' {
  interface Remote1Props {
    userName?: string
    onCountChange?: (count: number) => void
  }
  const Component: React.ComponentType<Remote1Props>
  export default Component
}

declare module 'remote2/App' {
  const Component: React.ComponentType
  export default Component
}

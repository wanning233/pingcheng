/// <reference types="@tarojs/taro" />

declare module '*.module.scss' {
  const styles: Record<string, string>
  export default styles
}

declare module '*.module.css' {
  const styles: Record<string, string>
  export default styles
}

declare module '*.png' {
  const src: string
  export default src
}

declare module '*.svg' {
  const src: string
  export default src
}

// Vite-specific type declarations
declare module '*?url' {
    const value: string
    export default value
}

declare module '*?raw' {
    const value: string
    export default value
}

declare module '*?worker' {
    const value: new () => Worker
    export default value
}

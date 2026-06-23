import confetti from "canvas-confetti"

// 表情图标取自 @iconify 的 streamline-emojis 图标集，与项目内 <Icon icon="streamline-emojis:..."> 用法保持一致
const EMOJI_SVGS = [
  // 星星眼
  '<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 48 48"><path fill="#45413c" d="M8 45.5a16 1.5 0 1 0 32 0a16 1.5 0 1 0-32 0" opacity=".15"/><path fill="#ffe500" d="M4 21.5a20 20 0 1 0 40 0a20 20 0 1 0-40 0"/><path fill="#ebcb00" d="M24 1.5a20 20 0 1 0 20 20a20 20 0 0 0-20-20m0 37a18.25 18.25 0 1 1 18.25-18.25A18.25 18.25 0 0 1 24 38.5"/><path fill="#fff48c" d="M18 5.5a6 1.5 0 1 0 12 0a6 1.5 0 1 0-12 0"/><path fill="none" stroke="#45413c" stroke-linecap="round" stroke-linejoin="round" d="M4 21.5a20 20 0 1 0 40 0a20 20 0 1 0-40 0"/><path fill="#ffaa54" d="M38.5 26.5c0 .83-1.12 1.5-2.5 1.5s-2.5-.67-2.5-1.5S34.62 25 36 25s2.5.67 2.5 1.5m-29 0c0 .83 1.12 1.5 2.5 1.5s2.5-.67 2.5-1.5S13.38 25 12 25s-2.5.67-2.5 1.5"/><path fill="#ebcb00" d="m32.13 21.79l-3 1.59a1 1 0 0 1-1.45-1.05l.55-3.33a1 1 0 0 0-.29-.89l-2.45-2.38a1 1 0 0 1 .56-1.73l3.38-.49a1 1 0 0 0 .75-.55l1.52-3.09a1 1 0 0 1 1.79 0L35 12.94a1 1 0 0 0 .75.55l3.38.49a1 1 0 0 1 .56 1.71l-2.45 2.38A1 1 0 0 0 37 19l.58 3.37a1 1 0 0 1-1.45 1.05l-3-1.59a1 1 0 0 0-1-.04"/><path fill="#fffacf" d="m33.69 19.35l-3 1.59a1 1 0 0 1-1.45-1.05l.57-3.37a1 1 0 0 0-.28-.89l-2.45-2.38a1 1 0 0 1 .55-1.71l3.37-.49a1 1 0 0 0 .75-.55l1.51-3.07a1 1 0 0 1 1.8 0l1.51 3.07a1 1 0 0 0 .75.55l3.39.49a1 1 0 0 1 .55 1.71l-2.45 2.38a1 1 0 0 0-.29.89l.58 3.37a1 1 0 0 1-1.45 1.05l-3-1.59a1 1 0 0 0-.96 0"/><path fill="#fff48c" d="m38.81 18.2l-3.06-1.61a1.38 1.38 0 0 0-1.31 0l-4.25 2.23a1.35 1.35 0 0 1-.82.16l-.16.91a1 1 0 0 0 1.46 1.05l3-1.59a1 1 0 0 1 .93 0l3 1.59a1 1 0 0 0 1.45-1.05Z"/><path fill="none" stroke="#45413c" stroke-linecap="round" stroke-linejoin="round" d="m33.69 19.35l-3 1.59a1 1 0 0 1-1.45-1.05l.57-3.37a1 1 0 0 0-.28-.89l-2.45-2.38a1 1 0 0 1 .55-1.71l3.37-.49a1 1 0 0 0 .75-.55l1.51-3.07a1 1 0 0 1 1.8 0l1.51 3.07a1 1 0 0 0 .75.55l3.39.49a1 1 0 0 1 .55 1.71l-2.45 2.38a1 1 0 0 0-.29.89l.58 3.37a1 1 0 0 1-1.45 1.05l-3-1.59a1 1 0 0 0-.96 0"/><path fill="#ebcb00" d="m15.87 21.79l3 1.59a1 1 0 0 0 1.45-1.05L19.77 19a1 1 0 0 1 .29-.89l2.45-2.38A1 1 0 0 0 22 14l-3.38-.49a1 1 0 0 1-.75-.55L16.3 9.87a1 1 0 0 0-1.79 0L13 12.94a1 1 0 0 1-.75.55L8.86 14a1 1 0 0 0-.56 1.71l2.45 2.38A1 1 0 0 1 11 19l-.58 3.37a1 1 0 0 0 1.45 1.05l3-1.59a1 1 0 0 1 1-.04"/><path fill="#fffacf" d="m14.31 19.35l3 1.59a1 1 0 0 0 1.45-1.05l-.57-3.37a1 1 0 0 1 .28-.89l2.45-2.38a1 1 0 0 0-.55-1.71L17 11.05a1 1 0 0 1-.75-.55l-1.51-3.07a1 1 0 0 0-1.8 0l-1.51 3.07a1 1 0 0 1-.75.55l-3.39.49a1 1 0 0 0-.55 1.71l2.45 2.38a1 1 0 0 1 .29.89l-.58 3.37a1 1 0 0 0 1.45 1.05l3-1.59a1 1 0 0 1 .96 0"/><path fill="#fff48c" d="m9.19 18.2l3.06-1.61a1.38 1.38 0 0 1 1.31 0l4.25 2.23a1.35 1.35 0 0 0 .82.16l.16.91a1 1 0 0 1-1.46 1.05l-3-1.59a1 1 0 0 0-.93 0l-3 1.59a1 1 0 0 1-1.5-1.05Z"/><path fill="none" stroke="#45413c" stroke-linecap="round" stroke-linejoin="round" d="m14.31 19.35l3 1.59a1 1 0 0 0 1.45-1.05l-.57-3.37a1 1 0 0 1 .28-.89l2.45-2.38a1 1 0 0 0-.55-1.71L17 11.05a1 1 0 0 1-.75-.55l-1.51-3.07a1 1 0 0 0-1.8 0l-1.51 3.07a1 1 0 0 1-.75.55l-3.39.49a1 1 0 0 0-.55 1.71l2.45 2.38a1 1 0 0 1 .29.89l-.58 3.37a1 1 0 0 0 1.45 1.05l3-1.59a1 1 0 0 1 .96 0"/><path fill="#fff" stroke="#45413c" stroke-linecap="round" stroke-linejoin="round" d="M24 38.5a10.9 10.9 0 0 0 11-9.17a1 1 0 0 0-.31-.84a1.12 1.12 0 0 0-.91-.27a61.6 61.6 0 0 1-19.54 0a1.12 1.12 0 0 0-.91.27a1 1 0 0 0-.31.84A10.9 10.9 0 0 0 24 38.5"/><path fill="#fff" stroke="#45413c" stroke-linecap="round" stroke-linejoin="round" d="M34 32.5A30.2 30.2 0 0 1 24 34a30.2 30.2 0 0 1-10-1.5"/><path fill="none" stroke="#45413c" stroke-linecap="round" stroke-linejoin="round" d="M24 29v9.5m-6.5-9.84c0 .6-.05 5.75 1.06 8.49m11.94-8.49c0 .6.05 5.75-1.06 8.49"/></svg>',
  // 点赞
  '<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 48 48"><path fill="#45413c" d="M13 45.5a11 1.5 0 1 0 22 0a11 1.5 0 1 0-22 0" opacity=".15"/><path fill="#ffe500" d="M37.17 30.42h.18a2.54 2.54 0 1 0 0-5.08h-2.54a2.55 2.55 0 0 0 0-5.09h-6.12c.58-1.44 1.32-3.71 2-5.87a4.18 4.18 0 0 0-2.77-5.2a1.08 1.08 0 0 0-1.36.72c-.86 2.94-1.5 6.65-6 10a18.2 18.2 0 0 0-4 4.34a4 4 0 0 1-3.2 1.7H9.79a1 1 0 0 0-1 1v11.12a1 1 0 0 0 1 1h2.49c3.28.08 4.7 1.31 8.79 1.31h13.47a2.25 2.25 0 0 0 0-4.5h2.63a2.73 2.73 0 0 0 0-5.45"/><path fill="#fff48c" d="M14.34 28.63a3.93 3.93 0 0 0 3.19-1.7a18 18 0 0 1 4-4.34c4.5-3.32 5.15-7 6-10a1.08 1.08 0 0 1 1.35-.72a4.1 4.1 0 0 1 1.91 1.23a4.19 4.19 0 0 0-2.95-4a1.08 1.08 0 0 0-1.36.72c-.86 2.94-1.5 6.65-6 10a18.2 18.2 0 0 0-4 4.34a4 4 0 0 1-3.2 1.7H9.79a1 1 0 0 0-1 1v1.72Z"/><path fill="none" stroke="#45413c" stroke-linecap="round" stroke-linejoin="round" d="m28.37 26.07l-.06.12a11.41 11.41 0 0 1-8.68 6.22h0"/><path fill="#ffe500" d="M25.39 35.87h11.4v4.5h-11.4Z"/><path fill="#ffe500" d="M24.71 30.42h15.18v5.45H24.71Z"/><path fill="#ffe500" d="M24.71 25.34h15.18v5.09H24.71Zm.68-5.09h11.96v5.09H25.39Z"/><path fill="#fff48c" d="M27.93 22.34h6.88a2.56 2.56 0 0 1 2.32 1.5a2.6 2.6 0 0 0 .22-1.05a2.54 2.54 0 0 0-2.54-2.54h-6.88a2.54 2.54 0 0 0-2.54 2.54a2.6 2.6 0 0 0 .22 1.05a2.56 2.56 0 0 1 2.32-1.5"/><path fill="none" stroke="#45413c" stroke-linecap="round" stroke-linejoin="round" d="M25.39 35.87h11.4v4.5h-11.4Z"/><path fill="none" stroke="#45413c" stroke-linecap="round" stroke-linejoin="round" d="M24.71 30.42h15.18v5.45H24.71Z"/><path fill="none" stroke="#45413c" stroke-linecap="round" stroke-linejoin="round" d="M24.71 25.34h15.18v5.09H24.71Zm.68-5.09h11.96v5.09H25.39Z"/><path fill="none" stroke="#45413c" stroke-linecap="round" stroke-linejoin="round" d="M37.17 30.42h.18a2.54 2.54 0 1 0 0-5.08h-2.54a2.55 2.55 0 0 0 0-5.09h-6.12c.58-1.44 1.32-3.71 2-5.87a4.18 4.18 0 0 0-2.77-5.2a1.08 1.08 0 0 0-1.36.72c-.86 2.94-1.5 6.65-6 10a18.2 18.2 0 0 0-4 4.34a4 4 0 0 1-3.2 1.7H9.79a1 1 0 0 0-1 1v11.12a1 1 0 0 0 1 1h2.49c3.28.08 4.7 1.31 8.79 1.31h13.47a2.25 2.25 0 0 0 0-4.5h2.63a2.73 2.73 0 0 0 0-5.45"/></svg>',
  // 火箭
  '<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 48 48"><path fill="#ff6242" d="m14.05 26.58l5.67-7a19.55 19.55 0 0 0-8.5-.24c-3.12.77-3.61 6.66-3.66 9.45a.87.87 0 0 0 1.31.77Z"/><path fill="#ff866e" d="M11.24 22a18.2 18.2 0 0 1 6.62-.13l1.86-2.28a19.55 19.55 0 0 0-8.5-.24c-3.12.76-3.61 6.65-3.66 9.44a.85.85 0 0 0 .14.48c.3-2.94 1.09-6.66 3.54-7.27"/><path fill="none" stroke="#45413c" stroke-linecap="round" stroke-linejoin="round" d="m14.05 26.58l5.67-7a19.55 19.55 0 0 0-8.5-.24c-3.12.77-3.61 6.66-3.66 9.45a.87.87 0 0 0 1.31.77Z"/><path fill="#ff6242" d="m20.86 33.4l7-5.67a19.5 19.5 0 0 1 .24 8.49c-.73 3.12-6.58 3.61-9.41 3.66a.87.87 0 0 1-.77-1.31Z"/><path fill="#ff866e" d="M25.41 36.21a18 18 0 0 0 .13-6.63l2.28-1.85a19.5 19.5 0 0 1 .24 8.49c-.73 3.12-6.58 3.61-9.41 3.66a.87.87 0 0 1-.48-.14c2.94-.26 6.66-1.09 7.24-3.53"/><path fill="none" stroke="#45413c" stroke-linecap="round" stroke-linejoin="round" d="m20.86 33.4l7-5.67a19.5 19.5 0 0 1 .24 8.49c-.73 3.12-6.58 3.61-9.41 3.66a.87.87 0 0 1-.77-1.31Z"/><path fill="#e8f4fa" d="M39.48 21.56c5.42-5.7 3.71-12.73 2.86-15.2a2 2 0 0 0-.48-.78a2.1 2.1 0 0 0-.77-.48c-2.47-.85-9.51-2.56-15.21 2.9C18.84 14.66 14 26.5 14 26.5l7 7s11.78-4.9 18.48-11.94"/><path fill="#fff" d="M28.05 11.87c5.53-5.27 12.31-3.8 15-2.94a17 17 0 0 0-.66-2.57a2 2 0 0 0-1.3-1.26c-2.47-.85-9.51-2.56-15.21 2.9C18.84 14.66 14 26.5 14 26.5l2.69 2.69c1.43-3.19 5.68-11.92 11.36-17.32"/><path fill="none" stroke="#45413c" stroke-linecap="round" stroke-linejoin="round" d="M39.48 21.56c5.42-5.7 3.71-12.73 2.86-15.2a2 2 0 0 0-.48-.78a2.1 2.1 0 0 0-.77-.48c-2.47-.85-9.51-2.56-15.21 2.9C18.84 14.66 14 26.5 14 26.5l7 7s11.78-4.9 18.48-11.94"/><path fill="#45413c" d="M18.22 44.21a10 1.5 0 1 0 20 0a10 1.5 0 1 0-20 0" opacity=".15"/><path fill="#ff6242" stroke="#45413c" stroke-linecap="round" stroke-linejoin="round" d="M22.7 25.65a.68.68 0 0 0-.92-.93a22.1 22.1 0 0 0-5.31 3.8a17.8 17.8 0 0 0-3.87 5.86a.34.34 0 0 0 .44.45A17.8 17.8 0 0 0 18.9 31a21.9 21.9 0 0 0 3.8-5.35"/><path fill="#c0dceb" stroke="#45413c" stroke-linecap="round" stroke-linejoin="round" d="M28.24 13.72a5.49 5.49 0 1 0 10.98 0a5.49 5.49 0 1 0-10.98 0"/><path fill="#00b8f0" d="M29.96 13.69a3.8 3.8 0 1 0 7.6 0a3.8 3.8 0 1 0-7.6 0"/><path fill="#4acfff" d="M31.07 11a3.8 3.8 0 0 0 0 5.38a4 4 0 0 0 .85.62l3.55-6.69a3.77 3.77 0 0 0-4.4.69"/><path fill="none" stroke="#45413c" stroke-linecap="round" stroke-linejoin="round" d="M29.96 13.69a3.8 3.8 0 1 0 7.6 0a3.8 3.8 0 1 0-7.6 0"/><path fill="#ff8a14" stroke="#45413c" stroke-linecap="round" stroke-linejoin="round" d="M11.34 41.47c-.7.7-5.16 2.21-7.42 2.94c-.42.14-1-.47-.89-.89c.73-2.25 2.24-6.71 3-7.42c.95-1 3.43-1 4.91.46s1.35 3.96.4 4.91"/><path fill="#ffe500" stroke="#45413c" stroke-linecap="round" stroke-linejoin="round" d="M10.13 39.79c-.5.49-2.57 1-3 .56s.07-2.54.57-3a1.57 1.57 0 0 1 2.13.34a1.56 1.56 0 0 1 .3 2.1"/><path fill="#ffe500" d="m43.32 23.69l.8 1.51a.42.42 0 0 0 .32.22l1.69.2a.42.42 0 0 1 .25.71l-1.19 1.22a.39.39 0 0 0-.11.37l.33 1.67a.42.42 0 0 1-.59.46l-1.53-.76a.44.44 0 0 0-.39 0l-1.49.84a.43.43 0 0 1-.62-.43L41 28a.41.41 0 0 0-.13-.36l-1.21-1.14a.42.42 0 0 1 .21-.72l1.68-.29a.41.41 0 0 0 .31-.23l.72-1.55a.41.41 0 0 1 .74-.02"/><path fill="#fff48c" d="m40.53 27.31l1.06-.19a.4.4 0 0 0 .31-.23l.72-1.55a.42.42 0 0 1 .75 0l.79 1.51a.42.42 0 0 0 .32.22l1.07.13l.83-.85a.42.42 0 0 0-.25-.71l-1.69-.2a.42.42 0 0 1-.32-.22l-.8-1.51a.41.41 0 0 0-.74 0l-.72 1.55a.41.41 0 0 1-.31.23l-1.68.29a.42.42 0 0 0-.21.72Z"/><path fill="none" stroke="#45413c" stroke-linecap="round" stroke-linejoin="round" d="m43.32 23.69l.8 1.51a.42.42 0 0 0 .32.22l1.69.2a.42.42 0 0 1 .25.71l-1.19 1.22a.39.39 0 0 0-.11.37l.33 1.67a.42.42 0 0 1-.59.46l-1.53-.76a.44.44 0 0 0-.39 0l-1.49.84a.43.43 0 0 1-.62-.43L41 28a.41.41 0 0 0-.13-.36l-1.21-1.14a.42.42 0 0 1 .21-.72l1.68-.29a.41.41 0 0 0 .31-.23l.72-1.55a.41.41 0 0 1 .74-.02"/><path fill="#ffe500" d="m31.74 40.59l.26 1.35a.35.35 0 0 0 .2.24l1.27.54a.34.34 0 0 1 0 .6l-1.2.68a.32.32 0 0 0-.17.26l-.1 1.37a.34.34 0 0 1-.57.22l-1-.93a.3.3 0 0 0-.3-.08l-1.34.3a.34.34 0 0 1-.38-.47l.59-1.25a.31.31 0 0 0 0-.31l-.7-1.18a.34.34 0 0 1 .33-.51l1.36.16a.38.38 0 0 0 .3-.11l.9-1a.34.34 0 0 1 .55.12"/><path fill="#fff48c" d="m28.76 42.75l.86.1a.35.35 0 0 0 .3-.11l.9-1a.34.34 0 0 1 .59.15l.27 1.35a.31.31 0 0 0 .19.24l.8.34l.84-.47a.34.34 0 0 0 0-.6l-1.27-.54a.35.35 0 0 1-.2-.24l-.27-1.35a.34.34 0 0 0-.58-.16l-.9 1a.38.38 0 0 1-.3.11l-1.36-.16a.34.34 0 0 0-.33.51Z"/><path fill="none" stroke="#45413c" stroke-linecap="round" stroke-linejoin="round" d="m31.74 40.59l.26 1.35a.35.35 0 0 0 .2.24l1.27.54a.34.34 0 0 1 0 .6l-1.2.68a.32.32 0 0 0-.17.26l-.1 1.37a.34.34 0 0 1-.57.22l-1-.93a.3.3 0 0 0-.3-.08l-1.34.3a.34.34 0 0 1-.38-.47l.59-1.25a.31.31 0 0 0 0-.31l-.7-1.18a.34.34 0 0 1 .33-.51l1.36.16a.38.38 0 0 0 .3-.11l.9-1a.34.34 0 0 1 .55.12"/><path fill="#9ceb60" d="M11.86 7a3.06 3.06 0 1 1-2.59-3.44A3.06 3.06 0 0 1 11.86 7"/><path fill="#c8ffa1" d="M9.27 5.74a3.06 3.06 0 0 1 2.41 2a3 3 0 0 0 .18-.74a3.06 3.06 0 0 0-6.06-.85A3.2 3.2 0 0 0 6 7.67a3.08 3.08 0 0 1 3.27-1.93"/><path fill="none" stroke="#45413c" stroke-linecap="round" stroke-linejoin="round" d="M11.86 7a3.06 3.06 0 1 1-2.59-3.44A3.06 3.06 0 0 1 11.86 7"/><path fill="none" stroke="#45413c" stroke-linecap="round" stroke-linejoin="round" d="M5.86 7.3C5.1 7.82 3.57 9 4 9.86s10.49-5.15 10.14-6s-2.5.12-3.26.48"/></svg>',
]

// 将 emoji SVG 转成 confetti 可用的彩色位图 Shape，缓存后供重复调用复用
let emojiShapesPromise: Promise<confetti.Shape[]> | null = null

function svgToBitmapShape(svg: string): Promise<confetti.Shape> {
  return new Promise((resolve, reject) => {
    const blob = new Blob([svg], { type: "image/svg+xml" })
    const url = URL.createObjectURL(blob)
    const img = new Image()
    img.onload = async () => {
      const renderSize = 64
      const baseUnit = 10
      const canvas = document.createElement("canvas")
      canvas.width = renderSize
      canvas.height = renderSize
      const ctx = canvas.getContext("2d")!
      ctx.drawImage(img, 0, 0, renderSize, renderSize)
      URL.revokeObjectURL(url)

      try {
        const bitmap = await createImageBitmap(canvas)
        const scale = baseUnit / renderSize
        resolve({
          type: "bitmap",
          bitmap,
          matrix: [
            scale,
            0,
            0,
            scale,
            (-renderSize * scale) / 2,
            (-renderSize * scale) / 2,
          ],
        } as unknown as confetti.Shape)
      } catch (e) {
        reject(e)
      }
    }
    img.onerror = reject
    img.src = url
  })
}

function loadEmojiShapes(): Promise<confetti.Shape[]> {
  if (!emojiShapesPromise) {
    emojiShapesPromise = Promise.all(EMOJI_SVGS.map(svgToBitmapShape))
  }
  return emojiShapesPromise
}

/**
 * 随机烟花效果 Composable
 * 提供10种不同风格的烟花庆祝效果
 */
export function useFireworks() {
  // 提前预加载表情包位图，避免首次触发效果8时出现解码延迟
  loadEmojiShapes()

  /**
   * 触发随机烟花效果
   */
  function celebrate() {
    const fireworkTypes = [
      // 效果1: 经典烟花秀
      () => {
        const duration = 3000
        const animationEnd = Date.now() + duration
        const defaults = {
          startVelocity: 30,
          spread: 360,
          ticks: 60,
          zIndex: 0,
        }

        const interval: any = setInterval(() => {
          const timeLeft = animationEnd - Date.now()
          if (timeLeft <= 0) return clearInterval(interval)

          const particleCount = 50 * (timeLeft / duration)
          confetti({
            ...defaults,
            particleCount,
            origin: { x: Math.random() * 0.3 + 0.1, y: Math.random() - 0.2 },
            colors: ["#ff6b6b", "#ffd93d", "#6bcf7f", "#4ecdc4", "#a29bfe"],
          })
          confetti({
            ...defaults,
            particleCount,
            origin: { x: Math.random() * 0.3 + 0.7, y: Math.random() - 0.2 },
            colors: ["#ff6b6b", "#ffd93d", "#6bcf7f", "#4ecdc4", "#a29bfe"],
          })
        }, 250)
      },

      // 效果2: 星星雨
      () => {
        const count = 10
        const defaults = {
          origin: { y: 0.7 },
          shapes: ["star"],
          colors: ["#FFD700", "#FFA500", "#FFFF00", "#FF69B4", "#00CED1"],
        }

        function fire(particleRatio: number, opts: any) {
          confetti({
            ...defaults,
            ...opts,
            particleCount: Math.floor(200 * particleRatio),
          })
        }

        fire(0.25, { spread: 26, startVelocity: 55 })
        fire(0.2, { spread: 60 })
        fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 })
        fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 })
        fire(0.1, { spread: 120, startVelocity: 45 })
      },

      // 效果3: 爆炸波浪
      () => {
        function randomInRange(min: number, max: number) {
          return Math.random() * (max - min) + min
        }

        for (let i = 0; i < 5; i++) {
          setTimeout(() => {
            confetti({
              angle: randomInRange(55, 125),
              spread: randomInRange(50, 70),
              particleCount: randomInRange(50, 100),
              origin: { y: 0.6 },
              colors: ["#26ccff", "#a25afd", "#ff5e7e", "#88ff5a", "#fcff42"],
            })
          }, i * 200)
        }
      },

      // 效果4: 彩虹喷泉
      () => {
        const end = Date.now() + 2000

        const colors = ["#bb0000", "#ffffff"]

        const frame = () => {
          confetti({
            particleCount: 2,
            angle: 60,
            spread: 55,
            origin: { x: 0 },
            colors: colors,
          })
          confetti({
            particleCount: 2,
            angle: 120,
            spread: 55,
            origin: { x: 1 },
            colors: colors,
          })

          if (Date.now() < end) {
            requestAnimationFrame(frame)
          }
        }

        frame()
      },

      // 效果5: 烟花雨
      () => {
        const duration = 2500
        const animationEnd = Date.now() + duration

        const interval: any = setInterval(() => {
          const timeLeft = animationEnd - Date.now()
          if (timeLeft <= 0) return clearInterval(interval)

          const particleCount = 50
          confetti({
            particleCount,
            startVelocity: 30,
            spread: 360,
            ticks: 60,
            origin: {
              x: Math.random(),
              y: Math.random() - 0.2,
            },
            colors: [
              "#ff0000",
              "#00ff00",
              "#0000ff",
              "#ffff00",
              "#ff00ff",
              "#00ffff",
            ],
          })
        }, 200)
      },

      // 效果6: 炮竹齐鸣
      () => {
        const count = 200
        const defaults = {
          origin: { y: 0.7 },
        }

        function fire(particleRatio: number, opts: any) {
          confetti({
            ...defaults,
            ...opts,
            particleCount: Math.floor(count * particleRatio),
          })
        }

        fire(0.25, {
          spread: 26,
          startVelocity: 55,
        })

        fire(0.2, {
          spread: 60,
        })

        fire(0.35, {
          spread: 100,
          decay: 0.91,
          scalar: 0.8,
        })

        fire(0.1, {
          spread: 120,
          startVelocity: 25,
          decay: 0.92,
          scalar: 1.2,
        })

        fire(0.1, {
          spread: 120,
          startVelocity: 45,
        })
      },

      // 效果7: 螺旋上升
      () => {
        const defaults = {
          spread: 360,
          ticks: 100,
          gravity: 0,
          decay: 0.94,
          startVelocity: 30,
        }

        function shoot() {
          confetti({
            ...defaults,
            particleCount: 50,
            scalar: 1.2,
            shapes: ["circle", "square"],
            colors: ["#a864fd", "#29cdff", "#78ff44", "#ff718d", "#fdff6a"],
          })
        }

        setTimeout(shoot, 0)
        setTimeout(shoot, 100)
        setTimeout(shoot, 200)
        setTimeout(shoot, 300)
        setTimeout(shoot, 400)
      },

      // 效果8: 表情包烟花
      () => {
        loadEmojiShapes().then((emojiShapes) => {
          confetti({
            shapes: emojiShapes,
            scalar: 6,
            particleCount: 18,
            spread: 360,
            startVelocity: 45,
            gravity: 0.7,
            ticks: 150,
            origin: { y: 0.6 },
          })
        })
      },

      // 效果9: 风车螺旋
      () => {
        const colors = ["#ff9a9e", "#fad0c4", "#fbc2eb", "#a18cd1", "#fad961"]

        for (let angle = 0; angle < 360; angle += 30) {
          setTimeout(
            () => {
              confetti({
                particleCount: 15,
                angle,
                spread: 20,
                startVelocity: 40,
                origin: { x: 0.5, y: 0.5 },
                colors,
              })
            },
            (angle / 30) * 80,
          )
        }
      },

      // 效果10: 礼花瀑布
      () => {
        confetti({
          particleCount: 150,
          spread: 180,
          startVelocity: 0,
          gravity: 1.2,
          decay: 0.95,
          ticks: 300,
          origin: { x: 0.5, y: 0 },
          colors: ["#f6d365", "#fda085", "#fbc2eb", "#a6c1ee", "#84fab0"],
        })
      },
    ]

    // 随机选择一种效果
    const randomEffect =
      fireworkTypes[Math.floor(Math.random() * fireworkTypes.length)]
    randomEffect()
  }

  return {
    celebrate,
  }
}

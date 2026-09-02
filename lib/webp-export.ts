// lib/webp-export.ts
//
// Rasterizes each selected encounter's full-page print card to a WebP
// image and bundles them into one .zip. Triggering N separate downloads
// (one per encounter) gets throttled or popup-blocked by most browsers,
// so instead we collect blobs client-side and hand the user a single
// archive.
//
// Capture happens against an off-screen container (see PrintView) that
// renders one EncounterPrintCardFull at a time — off-screen rather than
// display:none, since html-to-image needs the node actually laid out to
// measure it.

import { toCanvas } from 'html-to-image'
import JSZip from 'jszip'

export function slugify(title: string): string {
  return (
    title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'encounter'
  )
}

const WEBP_QUALITY = 0.92
// Render at 2x for print-quality sharpness on export, since these are
// meant to be viewed/shared at full size, not thumbnailed.
const CAPTURE_SCALE = 2

/** Canvas -> WebP Blob. Rejects if the browser can't produce webp (canvas
 *  silently falls back to png in that case, which we'd rather surface
 *  than let a "webp" download secretly ship as png bytes). */
function canvasToWebpBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      blob => {
        if (!blob) {
          reject(new Error('Canvas could not be encoded'))
          return
        }
        if (blob.type !== 'image/webp') {
          reject(new Error('This browser does not support WebP export'))
          return
        }
        resolve(blob)
      },
      'image/webp',
      WEBP_QUALITY
    )
  })
}

export async function captureNodeAsWebp(node: HTMLElement): Promise<Blob> {
  const canvas = await toCanvas(node, {
    pixelRatio: CAPTURE_SCALE,
    backgroundColor: '#ffffff',
    // The rail/keyword borders and card outline live right at the node's
    // edge in some encounters; a hairline of padding avoids clipping them.
    style: { margin: '0' },
  })
  return canvasToWebpBlob(canvas)
}

export interface ExportProgress {
  done: number
  total: number
  currentTitle: string
}

/** Captures each (id, title, node-getter) in sequence — sequential rather
 *  than parallel because html-to-image serializes the DOM into an SVG
 *  foreignObject per call, and running that concurrently against a single
 *  shared off-screen container would race. Calls onProgress after each
 *  capture so the UI can show "3 of 24". */
export async function exportEncountersAsWebpZip(
  items: { id: string; title: string }[],
  renderAndCapture: (id: string) => Promise<Blob>,
  onProgress?: (p: ExportProgress) => void
): Promise<Blob> {
  const zip = new JSZip()
  const usedNames = new Set<string>()

  for (let i = 0; i < items.length; i++) {
    const { id, title } = items[i]
    onProgress?.({ done: i, total: items.length, currentTitle: title })

    const blob = await renderAndCapture(id)

    let name = `${slugify(title)}.webp`
    let n = 2
    while (usedNames.has(name)) {
      name = `${slugify(title)}-${n++}.webp`
    }
    usedNames.add(name)

    zip.file(name, blob)
  }

  onProgress?.({ done: items.length, total: items.length, currentTitle: '' })
  return zip.generateAsync({ type: 'blob' })
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

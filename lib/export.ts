import { parseBill, type Block } from "./bill-parser"

function download(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

function slug(title: string): string {
  const base = title
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60)
  return base || "proyecto-de-ley"
}

const blockLine = (b: Block) => [b.lead, b.text].filter(Boolean).join(" ")

export function exportTxt(text: string) {
  download(new Blob([text], { type: "text/plain;charset=utf-8" }), `${slug(parseBill(text).title)}.txt`)
}

/** PDF con formato oficial: carta, Helvetica 12 pt, interlineado 1.5, páginas numeradas. */
export async function exportPdf(text: string) {
  const { jsPDF } = await import("jspdf")
  const { title, blocks } = parseBill(text)
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "letter" })
  const margin = { x: 30, y: 25 }
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const width = pageWidth - margin.x * 2
  const lineHeight = 6.35 // 12 pt a 1.5
  let y = margin.y

  doc.setProperties({ title, subject: "Proyecto de ley", creator: "LegislaBot" })

  const write = (content: string, opts: { bold?: boolean; align?: "left" | "center" | "right"; indent?: number; gap?: number }) => {
    const { bold = false, align = "left", indent = 0, gap = lineHeight } = opts
    doc.setFont("helvetica", bold ? "bold" : "normal")
    doc.setFontSize(12)
    const lines = doc.splitTextToSize(content, width - indent) as string[]
    for (const line of lines) {
      if (y + lineHeight > pageHeight - margin.y) {
        doc.addPage()
        y = margin.y
      }
      const x = align === "center" ? pageWidth / 2 : align === "right" ? pageWidth - margin.x : margin.x + indent
      doc.text(line, x, y, { align })
      y += lineHeight
    }
    y += gap
  }

  for (const block of blocks) {
    switch (block.kind) {
      case "doc-title":
        write(block.text, { bold: true, align: "center", gap: lineHeight * 1.5 })
        break
      case "section":
        y += lineHeight / 2
        write(block.text, { bold: true, align: "center" })
        break
      case "titulo":
      case "capitulo":
        write(block.name ? `${block.text}\n${block.name}` : block.text, { bold: block.kind === "titulo", align: "center" })
        break
      case "fraction":
        write(blockLine(block), { indent: 8, gap: lineHeight / 2 })
        break
      case "signature":
        write(block.text, { align: "right", gap: 0 })
        break
      default:
        write(blockLine(block), {})
    }
  }

  const pages = doc.getNumberOfPages()
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i)
    doc.setFont("helvetica", "normal")
    doc.setFontSize(9)
    doc.text(`Página ${i} de ${pages}`, pageWidth / 2, pageHeight - 12, { align: "center" })
  }
  doc.save(`${slug(title)}.pdf`)
}

const escapeHtml = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")

/** Documento compatible con Word (.doc en HTML), con el mismo formato que el PDF. */
export function exportWord(text: string) {
  const { title, blocks } = parseBill(text)
  const body = blocks
    .map((b) => {
      const t = escapeHtml(b.text)
      const lead = b.lead ? `<b>${escapeHtml(b.lead)}</b> ` : ""
      switch (b.kind) {
        case "doc-title":
          return `<h1>${t}</h1>`
        case "section":
          return `<h2>${t}</h2>`
        case "titulo":
          return `<h3>${t}${b.name ? `<br>${escapeHtml(b.name)}` : ""}</h3>`
        case "capitulo":
          return `<h4>${t}${b.name ? `<br>${escapeHtml(b.name)}` : ""}</h4>`
        case "fraction":
          return `<p style="margin-left:1cm">${lead}${t}</p>`
        case "signature":
          return `<p style="text-align:right">${t}</p>`
        default:
          return `<p>${lead}${t}</p>`
      }
    })
    .join("\n")
  const html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word"><head><meta charset="utf-8"><title>${escapeHtml(title)}</title><style>
@page { size: 21.59cm 27.94cm; margin: 2.5cm 3cm; }
body { font-family: Arial, sans-serif; font-size: 12pt; line-height: 1.5; }
h1, h2, h3, h4 { font-size: 12pt; text-align: center; }
h4 { font-weight: normal; }
p { text-align: justify; margin: 0 0 12pt; }
</style></head><body>${body}</body></html>`
  download(new Blob(["﻿", html], { type: "application/msword" }), `${slug(title)}.doc`)
}

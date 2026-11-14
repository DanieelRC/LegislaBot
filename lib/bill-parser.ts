// Parser único del texto de un proyecto de ley. Lo usan la vista del documento,
// el índice, el validador de formato y los exportadores.

export type BlockKind =
  | "doc-title"
  | "section" // EXPOSICIÓN DE MOTIVOS, ARTICULADO, TRANSITORIOS, REFERENCIAS
  | "titulo" // TÍTULO PRIMERO ...
  | "capitulo" // CAPÍTULO I ...
  | "article" // Artículo 1. / PRIMERO.
  | "fraction" // I. II. III.
  | "signature"
  | "paragraph"

export interface Block {
  kind: BlockKind
  text: string
  /** Nombre del título o capítulo (línea siguiente al encabezado). */
  name?: string
  /** Prefijo destacado: "Artículo 3.", "PRIMERO.", "IV." */
  lead?: string
  id?: string
}

export interface TocItem {
  id: string
  label: string
  level: 1 | 2
}

export interface ParsedBill {
  title: string
  blocks: Block[]
  toc: TocItem[]
  stats: { articles: number; words: number }
}

const ORDINAL = "PRIMERO|SEGUNDO|TERCERO|CUARTO|QUINTO|SEXTO|S[ÉE]PTIMO|OCTAVO|NOVENO|D[ÉE]CIMO(?:\\s+(?:PRIMERO|SEGUNDO|TERCERO|CUARTO|QUINTO))?|[ÚU]NDECIMO|DUOD[ÉE]CIMO"

const SECTION =
  /^(EXPOSICI[ÓO]N DE MOTIVOS|ARTICULADO|PROPUESTA|(?:DISPOSICIONES |ART[ÍI]CULOS )?TRANSITORI[OA]S|REFERENCIAS)[.:]?$/i
const TITULO = new RegExp(`^T[ÍI]TULO\\s+(?:${ORDINAL}|[IVXLC]+|\\d+)\\b[.:\\s-–—]*(.*)$`, "i")
const CAPITULO = /^(?:CAP[ÍI]TULO|SECCI[ÓO]N)\s+(?:[IVXLC]+|\d+|[ÚU]NICO|PRIMER[OA]|SEGUND[OA]|TERCER[OA])\b[.:\s-–—]*(.*)$/i
const ARTICLE = new RegExp(`^(Art[íi]culo\\s+(?:\\d+[°ºo]?(?:\\s+(?:bis|ter))?|[ÚU]NICO|${ORDINAL}))\\s*[.:\\-–—]*\\s*(.*)$`, "i")
const ORDINAL_ITEM = new RegExp(`^(${ORDINAL})\\s*[.:\\-–—]+\\s*(.*)$`)
const FRACTION = /^([IVXLC]+)[.)]\s+(.*)$/
const SIGNATURE = /^(Ciudad de M[ée]xico|M[ée]xico),?\s+(a\s+)?\d{1,2}\s+de\s+/i

function clean(line: string): string {
  return line
    .replace(/^#{1,6}\s+/, "")
    .replace(/\*\*|__/g, "")
    .replace(/^[-*]\s+(?=(Art[íi]culo|T[ÍI]TULO|CAP[ÍI]TULO))/i, "")
    .trim()
}

const isUpper = (s: string) => /[A-ZÁÉÍÓÚÑ]/.test(s) && s === s.toUpperCase()

export function parseBill(text: string): ParsedBill {
  const lines = text.split(/\r?\n/).map(clean).filter(Boolean)
  const blocks: Block[] = []
  const toc: TocItem[] = []
  let articles = 0
  let inReferences = false
  let afterSignature = false

  lines.forEach((line, i) => {
    const prev = blocks[blocks.length - 1]

    if (i === 0) {
      blocks.push({ kind: "doc-title", text: line })
      return
    }
    // El título puede venir partido en varias líneas en mayúsculas
    if (prev?.kind === "doc-title" && blocks.length === 1 && isUpper(line) && !SECTION.test(line) && !TITULO.test(line)) {
      prev.text += ` ${line}`
      return
    }

    if (SECTION.test(line)) {
      const id = `sec-${blocks.length}`
      const label = line.replace(/[.:]$/, "").toUpperCase()
      blocks.push({ kind: "section", text: label, id })
      toc.push({ id, label: label.charAt(0) + label.slice(1).toLowerCase(), level: 1 })
      inReferences = /^REFERENCIAS/i.test(line)
      afterSignature = false
      return
    }

    if (inReferences) {
      blocks.push({ kind: "paragraph", text: line })
      return
    }

    const titulo = line.match(TITULO)
    if (titulo && line.length < 160) {
      const id = `sec-${blocks.length}`
      const heading = line.slice(0, line.length - titulo[1].length).replace(/[.:\s-–—]+$/, "")
      blocks.push({ kind: "titulo", text: heading.toUpperCase(), name: titulo[1] || undefined, id })
      toc.push({ id, label: titulo[1] ? `${heading}. ${titulo[1]}` : heading, level: 2 })
      return
    }

    const capitulo = line.match(CAPITULO)
    if (capitulo && line.length < 160) {
      const heading = line.slice(0, line.length - capitulo[1].length).replace(/[.:\s-–—]+$/, "")
      blocks.push({ kind: "capitulo", text: heading.toUpperCase(), name: capitulo[1] || undefined })
      return
    }

    // Línea con el nombre del título/capítulo inmediatamente después de su encabezado
    if ((prev?.kind === "titulo" || prev?.kind === "capitulo") && !prev.name && line.length < 140 && !ARTICLE.test(line)) {
      prev.name = line
      if (prev.kind === "titulo") {
        const item = toc.find((t) => t.id === prev.id)
        if (item) item.label = `${item.label}. ${line}`
      }
      return
    }

    const article = line.match(ARTICLE)
    if (article) {
      articles += 1
      blocks.push({ kind: "article", lead: `${article[1].replace(/\s+/g, " ")}.`, text: article[2] })
      return
    }

    const ordinal = line.match(ORDINAL_ITEM)
    if (ordinal) {
      blocks.push({ kind: "article", lead: `${ordinal[1]}.`, text: ordinal[2] })
      return
    }

    const fraction = line.match(FRACTION)
    if (fraction) {
      blocks.push({ kind: "fraction", lead: `${fraction[1]}.`, text: fraction[2] })
      return
    }

    if (SIGNATURE.test(line)) {
      blocks.push({ kind: "signature", text: line })
      afterSignature = true
      return
    }
    if (afterSignature && line.length < 120) {
      blocks.push({ kind: "signature", text: line })
      return
    }
    afterSignature = false

    blocks.push({ kind: "paragraph", text: line })
  })

  return {
    title: blocks[0]?.text ?? "",
    blocks,
    toc,
    stats: { articles, words: text.split(/\s+/).filter(Boolean).length },
  }
}

export function extractTitle(text: string): string {
  return parseBill(text.slice(0, 2000)).title.slice(0, 255) || "Proyecto de ley"
}

export interface FormatCheck {
  label: string
  ok: boolean
  hint: string
}

/** Verifica la estructura mínima de una iniciativa conforme a la técnica legislativa mexicana. */
export function validateBill(parsed: ParsedBill): FormatCheck[] {
  const sections = parsed.blocks.filter((b) => b.kind === "section").map((b) => b.text)
  const has = (re: RegExp) => sections.some((s) => re.test(s))
  return [
    {
      label: "Título en mayúsculas",
      ok: parsed.title.length >= 8 && isUpper(parsed.title),
      hint: "La primera línea debe ser el título formal de la iniciativa, en mayúsculas.",
    },
    {
      label: "Exposición de motivos",
      ok: has(/^EXPOSICI[ÓO]N DE MOTIVOS/),
      hint: "Agrega el encabezado «EXPOSICIÓN DE MOTIVOS» seguido de los considerandos.",
    },
    {
      label: "Articulado",
      ok: parsed.stats.articles > 0,
      hint: "Incluye al menos un artículo que inicie con «Artículo N.».",
    },
    {
      label: "Artículos transitorios",
      ok: has(/TRANSITORI/),
      hint: "Agrega el encabezado «TRANSITORIOS» con la entrada en vigor y los plazos.",
    },
    {
      label: "Lugar, fecha y proponente",
      ok: parsed.blocks.some((b) => b.kind === "signature"),
      hint: "Cierra con «Ciudad de México, a [día] de [mes] de [año].» y el nombre de quien propone.",
    },
  ]
}

// --- Esquema del articulado (salida del paso "outline") ---

export interface OutlineEntry {
  heading: string
  chapters: string
  range: string
}

export function parseOutline(text: string): { lawTitle: string; items: OutlineEntry[] } {
  const lines = text.split(/\r?\n/).map(clean).filter(Boolean)
  const items: OutlineEntry[] = []
  let lawTitle = ""
  for (const line of lines) {
    if (/^T[ÍI]TULO\s+/i.test(line) && line.includes("|")) {
      const [heading = "", chapters = "", range = ""] = line.split("|").map((p) => p.trim())
      if (heading.length >= 3) {
        items.push({ heading: heading.slice(0, 200), chapters: chapters.slice(0, 800), range: range.slice(0, 80) })
      }
    } else if (!lawTitle && items.length === 0) {
      lawTitle = line.replace(/^["«]|["».]$/g, "").slice(0, 400)
    }
  }
  return { lawTitle, items: items.slice(0, 10) }
}

/** Une las secciones generadas en el documento final. */
export function composeBill(parts: { lawTitle: string; exposition: string; titles: string[]; closing: string }): string {
  const out: string[] = []
  if (parts.lawTitle) out.push(parts.lawTitle.toUpperCase())
  if (parts.exposition.trim()) out.push("EXPOSICIÓN DE MOTIVOS", parts.exposition.trim())
  const titles = parts.titles.map((t) => t.trim()).filter(Boolean)
  if (titles.length) out.push("ARTICULADO", ...titles)
  if (parts.closing.trim()) out.push(parts.closing.trim())
  return out.join("\n\n")
}

import { useMemo } from "react"
import { parseBill, type Block } from "@/lib/bill-parser"
import { cn } from "@/lib/utils"

function BlockView({ block, cursor }: { block: Block; cursor: boolean }) {
  const c = cursor ? "typing-cursor" : undefined
  switch (block.kind) {
    case "doc-title":
      return (
        <h1 className={cn("mb-10 text-center font-serif text-xl font-semibold uppercase leading-snug sm:text-2xl", c)}>
          {block.text}
        </h1>
      )
    case "section":
      return (
        <h2
          id={block.id}
          className={cn(
            "mb-6 mt-12 text-center font-sans text-sm font-semibold uppercase tracking-[0.2em] text-gold first:mt-0",
            c,
          )}
        >
          {block.text}
        </h2>
      )
    case "titulo":
      return (
        <h3 id={block.id} className={cn("mb-5 mt-10 text-center font-serif text-lg font-semibold leading-snug", c)}>
          {block.text}
          {block.name && <span className="block uppercase">{block.name}</span>}
        </h3>
      )
    case "capitulo":
      return (
        <h4 className={cn("mb-4 mt-8 text-center font-serif text-base font-medium", c)}>
          {block.text}
          {block.name && <span className="block italic text-sheet-foreground/80">{block.name}</span>}
        </h4>
      )
    case "article":
      return (
        <p className={cn("mb-4 text-pretty", c)}>
          <strong className="font-semibold">{block.lead}</strong> {block.text}
        </p>
      )
    case "fraction":
      return (
        <p className={cn("mb-2 grid grid-cols-[2.75rem_1fr] pl-4 sm:pl-8", c)}>
          <span className="tabular-nums text-sheet-foreground/70">{block.lead}</span>
          <span>{block.text}</span>
        </p>
      )
    case "signature":
      return <p className={cn("mt-1 text-right first-of-type:mt-10", c)}>{block.text}</p>
    default:
      return <p className={cn("mb-4 text-pretty", c)}>{block.text}</p>
  }
}

interface BillDocumentProps {
  text: string
  /** Muestra el cursor de escritura al final mientras llega el texto. */
  streaming?: boolean
  className?: string
}

/** La "hoja": representación tipográfica del proyecto de ley, igual en vivo que al terminar. */
export function BillDocument({ text, streaming = false, className }: BillDocumentProps) {
  const { blocks } = useMemo(() => parseBill(text), [text])

  return (
    <article
      aria-busy={streaming}
      className={cn(
        "mx-auto w-full max-w-[52rem] rounded-sm border bg-sheet px-6 py-10 font-serif text-[1.02rem] leading-[1.8] text-sheet-foreground shadow-[0_1px_2px_hsl(var(--foreground)/0.06),0_12px_32px_-12px_hsl(var(--foreground)/0.18)] sm:px-14 sm:py-14",
        className,
      )}
    >
      <header className="mb-10 text-center">
        <p className="font-sans text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-sheet-foreground/70">
          Congreso de la Ciudad de México
        </p>
        <div className="rule-double mx-auto my-3 w-24" aria-hidden />
        <p className="font-sans text-[0.7rem] uppercase tracking-[0.18em] text-sheet-foreground/60">
          Iniciativa con proyecto de decreto
        </p>
      </header>

      {blocks.length === 0 ? (
        <div className="space-y-3" aria-hidden>
          {[92, 100, 96, 70].map((w) => (
            <div key={w} className="h-3 animate-pulse rounded bg-sheet-foreground/10" style={{ width: `${w}%` }} />
          ))}
        </div>
      ) : (
        blocks.map((block, i) => (
          <BlockView key={i} block={block} cursor={streaming && i === blocks.length - 1} />
        ))
      )}
    </article>
  )
}

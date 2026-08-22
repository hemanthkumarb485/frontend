// Renders the AI's markdown-lite output (**bold**, `code`) as real React
// elements instead of raw asterisks/backticks — split into text tokens and
// mapped to <strong>/<code>, never dangerouslySetInnerHTML. The AI text is
// grounded in scan data that can include literal scanner evidence/attack
// payloads (e.g. "<script>...") echoed back verbatim, so it must never be
// parsed as HTML.
export function MarkdownLite({ text }) {
  if (!text) return null;
  const tokens = text.split(/(\*\*.+?\*\*|`[^`]+?`)/g);
  return tokens.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**") && part.length > 3) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith("`") && part.endsWith("`") && part.length > 1) {
      return (
        <code key={i} className="mono text-[11px] px-1 py-0.5 rounded bg-[var(--accent)]">
          {part.slice(1, -1)}
        </code>
      );
    }
    return part;
  });
}

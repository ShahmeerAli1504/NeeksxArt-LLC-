// Renders one or more schema.org JSON-LD blocks. `<` is escaped so text can never close the script tag.
export default function JsonLd({ data }) {
  const blocks = Array.isArray(data) ? data : [data];
  return blocks.map((d, i) => (
    <script
      key={i}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(d).replace(/</g, '\\u003c') }}
    />
  ));
}

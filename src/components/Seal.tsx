export default function Seal({ text, off, size }: { text: string; off?: boolean; size?: number }) {
  return (
    <div className={`seal${off ? ' off' : ''}`} style={size ? ({ '--size': `${size}px` } as React.CSSProperties) : undefined} aria-label={`${text}印`}>
      {text.split('').map((c, i) => (
        <span key={i}>{c}</span>
      ))}
    </div>
  );
}

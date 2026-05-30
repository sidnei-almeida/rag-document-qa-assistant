/**
 * Renders message body with paragraph spacing (12px between blocks).
 */
export default function MessageContent({ content, className }) {
  if (content == null || content === '') {
    return <div className={className} />;
  }

  const blocks = String(content).split(/\n\n+/).filter((block) => block.length > 0);

  if (blocks.length <= 1) {
    return <div className={className}>{content}</div>;
  }

  return (
    <div className={className}>
      {blocks.map((block, index) => (
        <p key={index}>{block}</p>
      ))}
    </div>
  );
}

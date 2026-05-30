export default function SectionHeader({ title, action }) {
  return (
    <div className="section-header">
      <h3 className="section-header__title">{title}</h3>
      {action && <div className="section-header__action">{action}</div>}
    </div>
  );
}

export default function PanelSectionLabel({ children, id }) {
  return (
    <h3 id={id} className="right-panel__section-label">
      {children}
    </h3>
  );
}

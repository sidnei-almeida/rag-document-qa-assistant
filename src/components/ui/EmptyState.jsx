export default function EmptyState({ icon: Icon, title, description, children }) {
  return (
    <div className="empty-state">
      {Icon && (
        <div className="empty-state__icon">
          <Icon size={26} strokeWidth={1.5} />
        </div>
      )}
      {title && <h3 className="empty-state__title">{title}</h3>}
      {description && <p className="empty-state__description">{description}</p>}
      {children}
    </div>
  );
}

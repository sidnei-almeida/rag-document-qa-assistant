export default function AppShell({ sidebar, main, rightPanel }) {
  return (
    <div className="app-shell">
      {sidebar}
      <div className="app-shell__main">{main}</div>
      {rightPanel}
    </div>
  );
}

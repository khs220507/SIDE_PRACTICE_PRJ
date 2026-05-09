export function SettingsPage() {
  return (
    <section className="page">
      <header className="page-header">
        <h1>Settings</h1>
        <p>Project-level frontend settings prepared for backend integration.</p>
      </header>
      <section className="panel">
        <h2>Realtime transport</h2>
        <div className="segmented">
          <button type="button" className="active">SSE</button>
          <button type="button">WebSocket</button>
          <button type="button">MQTT gateway</button>
        </div>
      </section>
    </section>
  );
}


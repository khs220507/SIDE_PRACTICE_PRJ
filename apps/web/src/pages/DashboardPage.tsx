import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { StateBlock } from '../components/StateBlock';
import { useDevices, useEvents, useTelemetry } from '../api/queries';

export function DashboardPage() {
  const devices = useDevices();
  const telemetry = useTelemetry();
  const events = useEvents();

  if (devices.isLoading || telemetry.isLoading || events.isLoading) {
    return <StateBlock title="Loading dashboard" message="Fetching the latest simulated telemetry." />;
  }

  if (devices.isError || telemetry.isError || events.isError) {
    return <StateBlock title="Dashboard unavailable" message="Mock API data could not be loaded." />;
  }

  if (!devices.data?.length) {
    return <StateBlock title="No devices registered" message="Register a device or start the simulator to populate the dashboard." />;
  }

  const onlineCount = devices.data.filter((device) => device.status === 'online').length;
  const warningCount = devices.data.filter((device) => device.status === 'warning').length;
  const criticalEvents = events.data?.filter((event) => event.severity === 'critical').length ?? 0;
  const chartData = telemetry.data?.filter((point) => point.metric === 'temperature').map((point) => ({
    time: new Date(point.recordedAt).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
    value: point.value
  }));

  return (
    <section className="page">
      <header className="page-header">
        <h1>Operational Dashboard</h1>
        <p>Live STM32 telemetry simulator, refreshed every 2 seconds.</p>
      </header>

      <div className="metric-grid">
        <article className="metric-card">
          <span>Total devices</span>
          <strong>{devices.data.length}</strong>
        </article>
        <article className="metric-card">
          <span>Online</span>
          <strong>{onlineCount}</strong>
        </article>
        <article className="metric-card">
          <span>Warning</span>
          <strong>{warningCount}</strong>
        </article>
        <article className="metric-card">
          <span>Critical events</span>
          <strong>{criticalEvents}</strong>
        </article>
      </div>

      <section className="panel">
        <div className="panel-header">
          <h2>Temperature trend</h2>
          <span>{telemetry.isFetching ? 'Refreshing simulator data' : 'HTTP ingest contract preview'}</span>
        </div>
        <div className="chart-frame">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <XAxis dataKey="time" />
              <YAxis width={40} />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke="#0f766e" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>
    </section>
  );
}

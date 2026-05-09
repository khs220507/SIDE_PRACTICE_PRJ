import { useParams } from 'react-router-dom';
import { StateBlock } from '../components/StateBlock';
import { useDevice, useTelemetry } from '../api/queries';

export function DeviceDetailPage() {
  const { deviceId } = useParams();
  const device = useDevice(deviceId ?? '');
  const telemetry = useTelemetry(deviceId);

  if (!deviceId) {
    return <StateBlock title="Device id missing" message="Open a device from the registry list." />;
  }

  if (device.isLoading || telemetry.isLoading) {
    return <StateBlock title="Loading device" message="Fetching profile and telemetry history." />;
  }

  if (device.isError || telemetry.isError) {
    return <StateBlock title="Device unavailable" message="The requested device could not be loaded." />;
  }

  if (!device.data) {
    return <StateBlock title="Device unavailable" message="The requested device could not be loaded." />;
  }

  return (
    <section className="page">
      <header className="page-header">
        <h1>{device.data.name}</h1>
        <p>{device.data.serialNumber}</p>
      </header>
      <div className="detail-grid">
        <section className="panel">
          <h2>Profile</h2>
          <dl className="definition-list">
            <div><dt>Hardware</dt><dd>{device.data.hardwareType}</dd></div>
            <div><dt>Firmware</dt><dd>{device.data.firmwareVersion}</dd></div>
            <div><dt>Connection</dt><dd>{device.data.connectionType.toUpperCase()}</dd></div>
            <div><dt>Location</dt><dd>{device.data.location}</dd></div>
          </dl>
        </section>
        <section className="panel">
          <h2>Recent telemetry</h2>
          {telemetry.data?.length ? (
            <ul className="telemetry-list">
              {telemetry.data.map((point) => (
                <li key={`${point.metric}-${point.recordedAt}`}>
                  <span>{point.metric}</span>
                  <strong>{point.value} {point.unit}</strong>
                </li>
              ))}
            </ul>
          ) : (
            <p>No telemetry has been received for this device.</p>
          )}
        </section>
      </div>
    </section>
  );
}

import { Link } from 'react-router-dom';
import { StateBlock } from '../components/StateBlock';
import { useDevices } from '../api/queries';

export function DevicesPage() {
  const devices = useDevices();

  if (devices.isLoading) {
    return <StateBlock title="Loading devices" message="Reading device registry fixtures." />;
  }

  if (devices.isError) {
    return <StateBlock title="Device registry unavailable" message="The device API contract returned an error." />;
  }

  if (!devices.data?.length) {
    return <StateBlock title="No devices" message="No STM32 profiles are registered yet." />;
  }

  return (
    <section className="page">
      <header className="page-header">
        <h1>Devices</h1>
        <p>Registered STM32 device profiles and gateway connection status.</p>
      </header>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Hardware</th>
              <th>Connection</th>
              <th>Status</th>
              <th>Last seen</th>
            </tr>
          </thead>
          <tbody>
            {devices.data.map((device) => (
              <tr key={device.id}>
                <td>
                  <Link to={`/devices/${device.id}`}>{device.name}</Link>
                </td>
                <td>{device.hardwareType}</td>
                <td>{device.connectionType.toUpperCase()}</td>
                <td>
                  <span className={`status ${device.status}`}>{device.status}</span>
                </td>
                <td>{new Date(device.lastSeenAt).toLocaleString('ko-KR')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}


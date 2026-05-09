import { StateBlock } from '../components/StateBlock';
import { useEvents } from '../api/queries';

export function EventsPage() {
  const events = useEvents();

  if (events.isLoading) {
    return <StateBlock title="Loading events" message="Reading alert and heartbeat history." />;
  }

  if (events.isError) {
    return <StateBlock title="Events unavailable" message="The event API contract returned an error." />;
  }

  if (!events.data?.length) {
    return <StateBlock title="No events" message="No alerts or device events have been generated." />;
  }

  return (
    <section className="page">
      <header className="page-header">
        <h1>Events</h1>
        <p>Alert, threshold, and heartbeat history from simulated devices.</p>
      </header>
      <div className="event-list">
        {events.data.map((event) => (
          <article className="event-row" key={event.id}>
            <span className={`status ${event.severity}`}>{event.severity}</span>
            <strong>{event.message}</strong>
            <time>{new Date(event.createdAt).toLocaleString('ko-KR')}</time>
          </article>
        ))}
      </div>
    </section>
  );
}


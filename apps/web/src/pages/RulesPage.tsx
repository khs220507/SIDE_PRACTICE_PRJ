import { StateBlock } from '../components/StateBlock';
import { useRules } from '../api/queries';

export function RulesPage() {
  const rules = useRules();

  if (rules.isLoading) {
    return <StateBlock title="Loading rules" message="Reading threshold rule fixtures." />;
  }

  if (rules.isError) {
    return <StateBlock title="Rules unavailable" message="The rules API contract returned an error." />;
  }

  if (!rules.data?.length) {
    return <StateBlock title="No rules" message="Create threshold rules after the backend API is available." />;
  }

  return (
    <section className="page">
      <header className="page-header">
        <h1>Rules</h1>
        <p>Basic threshold rules for telemetry values.</p>
      </header>
      <div className="rule-grid">
        {rules.data.map((rule) => (
          <article className="panel" key={rule.id}>
            <h2>{rule.metric}</h2>
            <p>{rule.deviceId}</p>
            <strong>{rule.operator} {rule.threshold}</strong>
            <span className={rule.enabled ? 'status online' : 'status offline'}>{rule.enabled ? 'enabled' : 'disabled'}</span>
          </article>
        ))}
      </div>
    </section>
  );
}


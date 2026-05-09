import { Activity } from 'lucide-react';
import { Link } from 'react-router-dom';

export function LoginPage() {
  return (
    <main className="login-page">
      <section className="login-panel">
        <div className="brand login-brand">
          <Activity aria-hidden="true" />
          <span>SIDE IoT</span>
        </div>
        <h1>Operator Login</h1>
        <form className="form">
          <label>
            Email
            <input type="email" defaultValue="operator@side-iot.local" />
          </label>
          <label>
            Password
            <input type="password" defaultValue="password" />
          </label>
          <Link className="primary-button" to="/dashboard">
            Sign in
          </Link>
        </form>
      </section>
    </main>
  );
}


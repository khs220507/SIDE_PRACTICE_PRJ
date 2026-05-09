import { Activity, Bell, Cpu, Gauge, Settings, ShieldCheck } from 'lucide-react';
import { NavLink, Outlet } from 'react-router-dom';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: Gauge },
  { to: '/devices', label: 'Devices', icon: Cpu },
  { to: '/events', label: 'Events', icon: Bell },
  { to: '/rules', label: 'Rules', icon: ShieldCheck },
  { to: '/settings', label: 'Settings', icon: Settings }
];

export function AppShell() {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <Activity aria-hidden="true" />
          <span>SIDE IoT</span>
        </div>
        <nav aria-label="Primary navigation">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
              <item.icon aria-hidden="true" size={18} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>
      <main className="content">
        <Outlet />
      </main>
    </div>
  );
}


import { Link, Outlet } from "react-router-dom";
import "../styles/layout.css";

export default function AppLayout() {
  return (
    <div className="layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <h2 className="logo">🌾 AgriIntel</h2>

        <nav>
          <Link to="/">Dashboard</Link>
          <Link to="/create">Create Trade</Link>
          <Link to="/history">History</Link>
          <Link to="/analytics">Analytics</Link>
          <Link to="/chart">Charts</Link>
          <Link to="/market">Market Rates</Link>
        
        </nav>
      </aside>

      {/* Content */}
      <main className="content">
        <Outlet />
      </main>
    </div>
  );
}

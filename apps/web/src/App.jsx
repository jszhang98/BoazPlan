import React from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import LandingPage from './pages/LandingPage';
import Register from './pages/Register';
import CreateChurch from './pages/CreateChurch';
import ChurchMembers from './pages/ChurchMembers';
import RequestDetail from './pages/RequestDetail';
import RequestFeedPage from './pages/RequestFeedPage';
import VolunteerDashboard from './pages/VolunteerDashboard';
import ModerationQueue from './pages/ModerationQueue';
import AuditLogs from './pages/AuditLogs';
import AdminDashboard from './pages/AdminDashboard';
import ChurchSettings from './pages/ChurchSettings';
import OfflineBanner from './components/OfflineBanner';

function NavLink({ to, children, exact = true }) {
  const location = useLocation();
  const active = exact ? location.pathname === to : location.pathname.startsWith(to);
  return (
    <Link
      to={to}
      className={`text-sm font-medium px-3 py-2 rounded-md transition-colors ${
        active
          ? 'bg-brand-700 text-white'
          : 'text-brand-100 hover:bg-brand-700 hover:text-white'
      }`}
    >
      {children}
    </Link>
  );
}

/** Shared app-shell (nav + page wrapper) for all authenticated/inner pages */
function AppShell({ children }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-brand-600 shadow">
        <div className="mx-auto max-w-4xl px-4">
          <div className="flex h-14 items-center justify-between">
            <Link to="/" className="text-white font-bold text-lg tracking-tight">BoazPlan</Link>
            <div className="flex items-center gap-1">
              <NavLink to="/community">Community</NavLink>
              <NavLink to="/requests" exact={false}>Feed</NavLink>
              <NavLink to="/register">Register</NavLink>
              <NavLink to="/churches/new">New Church</NavLink>
              <NavLink to="/moderation" exact={false}>Moderation</NavLink>
              <NavLink to="/admin" exact={false}>Admin</NavLink>
            </div>
          </div>
        </div>
      </nav>
      <main className="mx-auto max-w-4xl px-4 py-8">
        {children}
      </main>
    </div>
  );
}

function AppRoutes() {
  return (
    <>
      <Routes>
        {/* Public marketing homepage — no app shell */}
        <Route path="/" element={<LandingPage />} />

        {/* Inner app pages — wrapped in the app shell */}
        <Route path="/community" element={<AppShell><Home /></AppShell>} />
        <Route path="/requests" element={<AppShell><RequestFeedPage /></AppShell>} />
        <Route path="/requests/:id" element={<AppShell><RequestDetail /></AppShell>} />
        <Route path="/register" element={<AppShell><Register /></AppShell>} />
        <Route path="/churches/new" element={<AppShell><CreateChurch /></AppShell>} />
        <Route path="/churches/:id/members" element={<AppShell><ChurchMembers /></AppShell>} />
        <Route path="/volunteers/:userId" element={<AppShell><VolunteerDashboard /></AppShell>} />
        <Route path="/moderation" element={<AppShell><ModerationQueue /></AppShell>} />
        <Route path="/audit-logs" element={<AppShell><AuditLogs /></AppShell>} />
        <Route path="/admin" element={<AppShell><AdminDashboard /></AppShell>} />
        <Route path="/churches/:id/settings" element={<AppShell><ChurchSettings /></AppShell>} />
      </Routes>

      {/* PWA offline indicator — shown on every page when disconnected */}
      <OfflineBanner />
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

import { Outlet } from 'react-router-dom';
import Navigation from './Navigation';

export default function Layout() {
  return (
    <div className="flex min-h-screen bg-[rgb(var(--bg-primary))]">
      <Navigation />
      <main className="flex-1 p-8">
        <div className="max-w-6xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

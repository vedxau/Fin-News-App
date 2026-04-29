import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import { AppShell } from './components/finpulse/AppShell';
import { useNews } from './hooks/useNews';

import { Dashboard } from './routes/index';
import { Map } from './routes/map';
import { Calendar } from './routes/calendar';
import { Analytics } from './routes/analytics';
import { Security } from './routes/security';

function Layout() {
  const { articles, ingesting, triggerIngestion } = useNews();
  const [loading, setLoading] = useState(false);

  // When ingesting becomes true, keep loading true for at least 1.8s
  useEffect(() => {
    if (ingesting) {
      setLoading(true);
    } else {
      const timer = setTimeout(() => setLoading(false), 1800);
      return () => clearTimeout(timer);
    }
  }, [ingesting]);

  return (
    <AppShell onFetch={triggerIngestion} loading={loading}>
      <Outlet context={{ articles, onFetch: triggerIngestion }} />
    </AppShell>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/map" element={<Map />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/security" element={<Security />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

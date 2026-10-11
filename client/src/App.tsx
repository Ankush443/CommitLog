import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import Layout from './layouts/Layout';
import Dashboard from './pages/Dashboard';
import LogsPage from './pages/LogsPage';
import LogFormPage from './pages/LogFormPage';
import ProjectsPage from './pages/ProjectsPage';
import CalendarPage from './pages/CalendarPage';
import RecapPage from './pages/RecapPage';

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="logs" element={<LogsPage />} />
            <Route path="logs/new" element={<LogFormPage />} />
            <Route path="logs/edit/:id" element={<LogFormPage />} />
            <Route path="projects" element={<ProjectsPage />} />
            <Route path="calendar" element={<CalendarPage />} />
            <Route path="recap" element={<RecapPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;

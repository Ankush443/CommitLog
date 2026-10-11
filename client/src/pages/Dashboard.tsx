import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import MiniActivityCalendar from '../components/common/MiniActivityCalendar';
import { logApi } from '../services/logService';
import { Log } from '../types/log';
import { formatDate, getCurrentWeekStart, getWeekEnd } from '../lib/dateUtils';
import { getProjectColorClass } from '../types/project';
import { getErrorMessage } from '../lib/api';

interface WeekStats {
  totalLogs: number;
  uniqueProjects: number;
  activeDays: number;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [recentLogs, setRecentLogs] = useState<Log[]>([]);
  const [weekStats, setWeekStats] = useState<WeekStats>({
    totalLogs: 0,
    uniqueProjects: 0,
    activeDays: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get current week range
      const weekStart = getCurrentWeekStart();
      const weekEnd = getWeekEnd(new Date());

      // Load recent logs (last 5)
      const { logs: allLogs } = await logApi.getAll({ page: 1, limit: 5 });
      setRecentLogs(allLogs);

      // Load this week's logs for stats
      const { logs: weekLogs } = await logApi.getAll({
        from: weekStart,
        to: weekEnd,
        limit: 100,
      });

      // Calculate stats
      const uniqueDates = new Set(weekLogs.map((log) => log.date));
      const uniqueProjectIds = new Set(
        weekLogs
          .filter((log) => log.projectId && log.projectId !== null)
          .map((log) => (typeof log.projectId === 'object' ? log.projectId!._id : log.projectId))
      );

      setWeekStats({
        totalLogs: weekLogs.length,
        uniqueProjects: uniqueProjectIds.size,
        activeDays: uniqueDates.size,
      });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div>
        <h1 className="text-3xl font-bold text-[rgb(var(--text-primary))] mb-8">Dashboard</h1>
        <Card>
          <LoadingSpinner />
        </Card>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[rgb(var(--text-primary))]">Dashboard</h1>
        <p className="text-[rgb(var(--text-secondary))] mt-2">Welcome to CommitLog</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <div className="text-sm text-[rgb(var(--text-secondary))] mb-1">This Week</div>
          <div className="text-3xl font-bold text-[rgb(var(--text-primary))]">{weekStats.totalLogs}</div>
          <div className="text-sm text-[rgb(var(--text-tertiary))] mt-1">
            {weekStats.totalLogs === 1 ? 'log' : 'logs'}
          </div>
        </Card>

        <Card>
          <div className="text-sm text-[rgb(var(--text-secondary))] mb-1">Active Projects</div>
          <div className="text-3xl font-bold text-[rgb(var(--text-primary))]">{weekStats.uniqueProjects}</div>
          <div className="text-sm text-[rgb(var(--text-tertiary))] mt-1">this week</div>
        </Card>

        <Card>
          <div className="text-sm text-[rgb(var(--text-secondary))] mb-1">Active Days</div>
          <div className="text-3xl font-bold text-[rgb(var(--text-primary))]">{weekStats.activeDays}</div>
          <div className="text-sm text-[rgb(var(--text-tertiary))] mt-1">this week</div>
        </Card>
      </div>

      {/* Recent Logs */}
      <Card className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-[rgb(var(--text-primary))]">Recent Logs</h2>
          <Button variant="ghost" onClick={() => navigate('/logs')}>
            View all
          </Button>
        </div>

        {recentLogs.length === 0 ? (
          <EmptyState
            title="No logs yet"
            description="Start recording your daily development work to see it here."
            action={{
              label: 'Create your first log',
              onClick: () => navigate('/logs/new'),
            }}
          />
        ) : (
          <div className="space-y-4">
            {recentLogs.map((log) => (
              <div
                key={log._id}
                className="border-b border-[rgb(var(--border-color))] last:border-0 pb-4 last:pb-0 cursor-pointer hover:bg-[rgb(var(--bg-tertiary))] -mx-6 px-6 rounded transition-colors"
                onClick={() => navigate(`/logs/edit/${log._id}`)}
              >
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-sm text-[rgb(var(--text-secondary))]">{formatDate(log.date)}</span>
                  {log.projectId && typeof log.projectId === 'object' && (
                    <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-[rgb(var(--bg-tertiary))] rounded text-xs font-medium">
                      <span
                        className={`w-2 h-2 rounded ${getProjectColorClass(log.projectId.color)}`}
                      />
                      {log.projectId.name}
                    </span>
                  )}
                </div>
                <h3 className="text-base font-semibold text-[rgb(var(--text-primary))] mb-1">{log.title}</h3>
                <p className="text-sm text-[rgb(var(--text-secondary))] line-clamp-2">{log.completed}</p>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Activity Calendar */}
      <Card className="mb-8">
        <MiniActivityCalendar />
      </Card>

      {/* Quick Actions */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/logs/new')}>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center text-2xl">
              📝
            </div>
            <div>
              <h3 className="font-semibold text-[rgb(var(--text-primary))]">New Log</h3>
              <p className="text-sm text-[rgb(var(--text-secondary))]">Record today's work</p>
            </div>
          </div>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/recap')}>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-2xl">
              📈
            </div>
            <div>
              <h3 className="font-semibold text-[rgb(var(--text-primary))]">Weekly Recap</h3>
              <p className="text-sm text-[rgb(var(--text-secondary))]">Review your progress</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

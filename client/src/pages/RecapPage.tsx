import { useState, useEffect } from 'react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import { recapApi } from '../services/recapService';
import { WeeklyRecap } from '../types/recap';
import { 
  getCurrentWeekStart, 
  addWeeksToDateString, 
  formatWeekRange,
  formatDate 
} from '../lib/dateUtils';
import { getProjectColorClass } from '../types/project';
import { getErrorMessage } from '../lib/api';

export default function RecapPage() {
  const [weekStart, setWeekStart] = useState(getCurrentWeekStart());
  const [recap, setRecap] = useState<WeeklyRecap | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadRecap();
  }, [weekStart]);

  const loadRecap = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await recapApi.getWeeklyRecap(weekStart);
      setRecap(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handlePreviousWeek = () => {
    setWeekStart(addWeeksToDateString(weekStart, -1));
  };

  const handleNextWeek = () => {
    setWeekStart(addWeeksToDateString(weekStart, 1));
  };

  const handleCurrentWeek = () => {
    setWeekStart(getCurrentWeekStart());
  };

  const isCurrentWeek = weekStart === getCurrentWeekStart();

  if (loading) {
    return (
      <div>
        <h1 className="text-3xl font-bold text-[rgb(var(--text-primary))] mb-8">Weekly Recap</h1>
        <Card>
          <LoadingSpinner />
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <h1 className="text-3xl font-bold text-[rgb(var(--text-primary))] mb-8">Weekly Recap</h1>
        <Card>
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        </Card>
      </div>
    );
  }

  if (!recap) {
    return null;
  }

  const hasData = recap.totalLogs > 0;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[rgb(var(--text-primary))]">Weekly Recap</h1>
        <p className="text-[rgb(var(--text-secondary))] mt-2">Review your progress</p>
      </div>

      {/* Week Navigation */}
      <Card className="mb-6">
        <div className="flex items-center justify-between">
          <Button variant="secondary" onClick={handlePreviousWeek}>
            ← Previous Week
          </Button>
          
          <div className="text-center">
            <div className="text-lg font-semibold text-[rgb(var(--text-primary))]">
              {formatWeekRange(recap.weekStart, recap.weekEnd)}
            </div>
            {!isCurrentWeek && (
              <Button variant="ghost" size="sm" onClick={handleCurrentWeek} className="mt-1">
                Go to current week
              </Button>
            )}
          </div>
          
          <Button 
            variant="secondary" 
            onClick={handleNextWeek}
            disabled={isCurrentWeek}
          >
            Next Week →
          </Button>
        </div>
      </Card>

      {!hasData ? (
        <Card>
          <EmptyState
            title="No logs for this week"
            description="You haven't recorded any work during this week yet."
            action={
              !isCurrentWeek
                ? { label: 'Go to current week', onClick: handleCurrentWeek }
                : undefined
            }
          />
        </Card>
      ) : (
        <>
          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <Card>
              <div className="text-sm text-[rgb(var(--text-secondary))] mb-1">Total Logs</div>
              <div className="text-3xl font-bold text-[rgb(var(--text-primary))]">{recap.totalLogs}</div>
              <div className="text-sm text-[rgb(var(--text-tertiary))] mt-1">
                {recap.totalLogs === 1 ? 'entry' : 'entries'}
              </div>
            </Card>

            <Card>
              <div className="text-sm text-[rgb(var(--text-secondary))] mb-1">Active Days</div>
              <div className="text-3xl font-bold text-[rgb(var(--text-primary))]">{recap.activeDays}</div>
              <div className="text-sm text-[rgb(var(--text-tertiary))] mt-1">out of 7 days</div>
            </Card>

            <Card>
              <div className="text-sm text-[rgb(var(--text-secondary))] mb-1">Projects</div>
              <div className="text-3xl font-bold text-[rgb(var(--text-primary))]">{recap.projects.length}</div>
              <div className="text-sm text-[rgb(var(--text-tertiary))] mt-1">worked on</div>
            </Card>
          </div>

          {/* Projects */}
          {recap.projects.length > 0 && (
            <Card className="mb-6">
              <h2 className="text-xl font-semibold text-[rgb(var(--text-primary))] mb-4">Projects Worked On</h2>
              <div className="space-y-3">
                {recap.projects.map((project) => (
                  <div key={project._id} className="flex items-center justify-between py-2 border-b border-[rgb(var(--border-color))] last:border-0">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded ${getProjectColorClass(project.color as any)}`} />
                      <span className="font-medium text-[rgb(var(--text-primary))]">{project.name}</span>
                    </div>
                    <span className="text-sm text-[rgb(var(--text-secondary))]">
                      {project.count} {project.count === 1 ? 'log' : 'logs'}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Completed Work */}
          <Card className="mb-6">
            <h2 className="text-xl font-semibold text-[rgb(var(--text-primary))] mb-4">✅ Completed Work</h2>
            {recap.completedWork.length === 0 ? (
              <p className="text-[rgb(var(--text-secondary))]">No completed work recorded this week.</p>
            ) : (
              <div className="space-y-4">
                {recap.completedWork.map((item, index) => (
                  <div key={index} className="border-l-4 border-green-500 pl-4 py-2">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-[rgb(var(--text-primary))]">{formatDate(item.date)}</span>
                      {item.projectName && (
                        <span className="text-xs text-[rgb(var(--text-secondary))]">• {item.projectName}</span>
                      )}
                    </div>
                    <p className="text-sm font-semibold text-[rgb(var(--text-primary))] mb-1">{item.title}</p>
                    <p className="text-sm text-[rgb(var(--text-secondary))] whitespace-pre-wrap">{item.completed}</p>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Blockers */}
          {recap.blockers.length > 0 && (
            <Card className="mb-6">
              <h2 className="text-xl font-semibold text-[rgb(var(--text-primary))] mb-4">🚧 Blockers</h2>
              <div className="space-y-4">
                {recap.blockers.map((item, index) => (
                  <div key={index} className="border-l-4 border-red-500 pl-4 py-2">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-[rgb(var(--text-primary))]">{formatDate(item.date)}</span>
                      {item.projectName && (
                        <span className="text-xs text-[rgb(var(--text-secondary))]">• {item.projectName}</span>
                      )}
                    </div>
                    <p className="text-sm font-semibold text-[rgb(var(--text-primary))] mb-1">{item.title}</p>
                    <p className="text-sm text-[rgb(var(--text-secondary))] whitespace-pre-wrap">{item.blockers}</p>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Next Steps */}
          {recap.nextSteps.length > 0 && (
            <Card>
              <h2 className="text-xl font-semibold text-[rgb(var(--text-primary))] mb-4">🎯 Next Steps</h2>
              <div className="space-y-4">
                {recap.nextSteps.map((item, index) => (
                  <div key={index} className="border-l-4 border-blue-500 pl-4 py-2">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-[rgb(var(--text-primary))]">{formatDate(item.date)}</span>
                      {item.projectName && (
                        <span className="text-xs text-[rgb(var(--text-secondary))]">• {item.projectName}</span>
                      )}
                    </div>
                    <p className="text-sm font-semibold text-[rgb(var(--text-primary))] mb-1">{item.title}</p>
                    <p className="text-sm text-[rgb(var(--text-secondary))] whitespace-pre-wrap">{item.nextSteps}</p>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  );
}

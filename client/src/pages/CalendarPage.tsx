import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import { logApi } from '../services/logService';
import { ActivityData, Log } from '../types/log';
import { getErrorMessage } from '../lib/api';

export default function CalendarPage() {
  const navigate = useNavigate();
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [activity, setActivity] = useState<ActivityData[]>([]);
  const [selectedDateLogs, setSelectedDateLogs] = useState<Log[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadActivity();
  }, [currentYear]);

  const loadActivity = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const from = `${currentYear}-01-01`;
      const to = `${currentYear}-12-31`;
      
      const data = await logApi.getActivity(from, to);
      setActivity(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const loadLogsForDate = async (date: string) => {
    try {
      const { logs } = await logApi.getAll({ from: date, to: date, limit: 100 });
      setSelectedDateLogs(logs);
      setSelectedDate(date);
    } catch (err) {
      alert(getErrorMessage(err));
    }
  };

  const getActivityForDate = (date: string): number => {
    const activityData = activity.find(a => a.date === date);
    return activityData?.count || 0;
  };

  const getActivityColor = (count: number): string => {
    if (count === 0) return 'bg-[rgb(var(--bg-tertiary))]';
    if (count === 1) return 'bg-green-200';
    if (count === 2) return 'bg-green-400';
    if (count >= 3 && count < 5) return 'bg-green-600';
    return 'bg-green-800';
  };

  const getActivityLevel = (count: number): string => {
    if (count === 0) return 'No logs';
    if (count === 1) return '1 log';
    return `${count} logs`;
  };

  const generateYearGrid = () => {
    const weeks: string[][] = [];
    const startDate = new Date(`${currentYear}-01-01`);
    const endDate = new Date(`${currentYear}-12-31`);
    
    // Start from the first Sunday of the year (or before Jan 1)
    const firstDay = startDate.getDay();
    const startOfGrid = new Date(startDate);
    startOfGrid.setDate(startDate.getDate() - firstDay);
    
    let currentDate = new Date(startOfGrid);
    let currentWeek: string[] = [];
    
    while (currentDate <= endDate || currentWeek.length < 7) {
      const dateStr = currentDate.toISOString().split('T')[0];
      currentWeek.push(dateStr);
      
      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
      
      currentDate.setDate(currentDate.getDate() + 1);
      
      // Stop if we've gone past the year and completed the week
      if (currentDate.getFullYear() > currentYear && currentWeek.length === 0) {
        break;
      }
    }
    
    return weeks;
  };

  const handlePreviousYear = () => {
    setCurrentYear(currentYear - 1);
    setSelectedDate(null);
  };

  const handleNextYear = () => {
    setCurrentYear(currentYear + 1);
    setSelectedDate(null);
  };

  const handleCurrentYear = () => {
    setCurrentYear(new Date().getFullYear());
    setSelectedDate(null);
  };

  const isCurrentYear = currentYear === new Date().getFullYear();
  const weeks = generateYearGrid();
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Calculate month positions for labels
  const getMonthPositions = () => {
    const positions: { month: string; weekIndex: number }[] = [];
    let currentMonth = -1;
    
    weeks.forEach((week, weekIndex) => {
      const dateInWeek = new Date(week[0]);
      const month = dateInWeek.getMonth();
      
      if (dateInWeek.getFullYear() === currentYear && month !== currentMonth) {
        positions.push({
          month: months[month],
          weekIndex,
        });
        currentMonth = month;
      }
    });
    
    return positions;
  };

  const monthPositions = getMonthPositions();

  if (loading) {
    return (
      <div>
        <h1 className="text-3xl font-bold text-[rgb(var(--text-primary))] mb-8">Activity Calendar</h1>
        <Card>
          <LoadingSpinner />
        </Card>
      </div>
    );
  }

  const totalLogs = activity.reduce((sum, a) => sum + a.count, 0);
  const activeDays = activity.filter(a => a.count > 0).length;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[rgb(var(--text-primary))]">Activity Calendar</h1>
        <p className="text-[rgb(var(--text-secondary))] mt-2">Your development activity throughout the year</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {/* Year Navigation */}
      <Card className="mb-6">
        <div className="flex items-center justify-between">
          <Button variant="secondary" onClick={handlePreviousYear}>
            ← {currentYear - 1}
          </Button>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-[rgb(var(--text-primary))]">{currentYear}</div>
            {!isCurrentYear && (
              <Button variant="ghost" size="sm" onClick={handleCurrentYear} className="mt-1">
                Go to current year
              </Button>
            )}
          </div>
          
          <Button 
            variant="secondary" 
            onClick={handleNextYear}
            disabled={currentYear >= new Date().getFullYear()}
          >
            {currentYear + 1} →
          </Button>
        </div>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <div className="text-sm text-[rgb(var(--text-secondary))] mb-1">Total Logs</div>
          <div className="text-2xl font-bold text-[rgb(var(--text-primary))]">{totalLogs}</div>
        </Card>
        <Card>
          <div className="text-sm text-[rgb(var(--text-secondary))] mb-1">Active Days</div>
          <div className="text-2xl font-bold text-[rgb(var(--text-primary))]">{activeDays}</div>
        </Card>
        <Card>
          <div className="text-sm text-[rgb(var(--text-secondary))] mb-1">Current Streak</div>
          <div className="text-2xl font-bold text-[rgb(var(--text-primary))]">-</div>
        </Card>
        <Card>
          <div className="text-sm text-[rgb(var(--text-secondary))] mb-1">Best Day</div>
          <div className="text-2xl font-bold text-[rgb(var(--text-primary))]">
            {activity.length > 0 ? Math.max(...activity.map(a => a.count)) : 0}
          </div>
        </Card>
      </div>

      {/* GitHub-style Calendar Grid */}
      <Card className="overflow-x-auto">
        <div className="inline-block min-w-full">
          {/* Month labels */}
          <div className="flex mb-2">
            <div className="w-8" /> {/* Space for day labels */}
            <div className="flex gap-1">
              {monthPositions.map((pos, index) => (
                <div
                  key={index}
                  className="text-xs text-[rgb(var(--text-secondary))]"
                  style={{ 
                    position: 'relative',
                    left: `${pos.weekIndex * 14}px`,
                    width: '40px'
                  }}
                >
                  {pos.month}
                </div>
              ))}
            </div>
          </div>

          {/* Calendar grid */}
          <div className="flex">
            {/* Day labels */}
            <div className="flex flex-col gap-1 mr-2">
              {weekDays.map((day, index) => (
                <div 
                  key={day} 
                  className="w-6 h-3 text-xs text-[rgb(var(--text-secondary))] flex items-center"
                  style={{ opacity: index % 2 === 0 ? 0 : 1 }}
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Activity squares */}
            <div className="flex gap-1">
              {weeks.map((week, weekIndex) => (
                <div key={weekIndex} className="flex flex-col gap-1">
                  {week.map((dateStr) => {
                    const date = new Date(dateStr);
                    const isInYear = date.getFullYear() === currentYear;
                    const count = isInYear ? getActivityForDate(dateStr) : 0;
                    const hasActivity = count > 0;
                    
                    return (
                      <button
                        key={dateStr}
                        onClick={() => hasActivity && loadLogsForDate(dateStr)}
                        className={`
                          w-3 h-3 rounded-sm border
                          ${!isInYear 
                            ? 'bg-transparent border-transparent cursor-default' 
                            : `${getActivityColor(count)} border-[rgb(var(--border-color))] ${hasActivity ? 'hover:border-[rgb(var(--text-tertiary))] cursor-pointer' : 'cursor-default'}`
                          }
                          transition-all
                        `}
                        title={isInYear ? `${dateStr}: ${getActivityLevel(count)}` : ''}
                        disabled={!hasActivity}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* Legend */}
          <div className="mt-4 pt-4 border-t border-[rgb(var(--border-color))] flex items-center gap-2 text-xs text-[rgb(var(--text-secondary))]">
            <span>Less</span>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-sm bg-[rgb(var(--bg-tertiary))] border border-[rgb(var(--border-color))]" />
              <div className="w-3 h-3 rounded-sm bg-green-200 border border-[rgb(var(--border-color))]" />
              <div className="w-3 h-3 rounded-sm bg-green-400 border border-[rgb(var(--border-color))]" />
              <div className="w-3 h-3 rounded-sm bg-green-600 border border-[rgb(var(--border-color))]" />
              <div className="w-3 h-3 rounded-sm bg-green-800 border border-[rgb(var(--border-color))]" />
            </div>
            <span>More</span>
          </div>
        </div>
      </Card>

      {/* Selected Date Logs */}
      {selectedDate && (
        <Card className="mt-6">
          <h2 className="text-xl font-semibold text-[rgb(var(--text-primary))] mb-4">
            Logs for {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', { 
              month: 'long', 
              day: 'numeric', 
              year: 'numeric' 
            })}
          </h2>
          
          {selectedDateLogs.length === 0 ? (
            <EmptyState title="No logs found" description="No logs recorded for this date." />
          ) : (
            <div className="space-y-4">
              {selectedDateLogs.map(log => (
                <div 
                  key={log._id}
                  className="border-l-4 border-primary-500 pl-4 py-2 cursor-pointer hover:bg-[rgb(var(--bg-tertiary))] -mx-4 px-4 rounded transition-colors"
                  onClick={() => navigate(`/logs/edit/${log._id}`)}
                >
                  {log.projectId && typeof log.projectId === 'object' && (
                    <div className="text-xs text-[rgb(var(--text-secondary))] mb-1">{log.projectId.name}</div>
                  )}
                  <h3 className="font-semibold text-[rgb(var(--text-primary))] mb-1">{log.title}</h3>
                  <p className="text-sm text-[rgb(var(--text-secondary))] line-clamp-2">{log.completed}</p>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {activity.length === 0 && !selectedDate && (
        <Card className="mt-6">
          <EmptyState
            title="No activity this year"
            description="You haven't recorded any logs during this year yet."
            action={{
              label: 'Create a log',
              onClick: () => navigate('/logs/new'),
            }}
          />
        </Card>
      )}
    </div>
  );
}

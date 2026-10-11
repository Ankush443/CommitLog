import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { logApi } from '../../services/logService';
import { ActivityData } from '../../types/log';

export default function MiniActivityCalendar() {
  const navigate = useNavigate();
  const [activity, setActivity] = useState<ActivityData[]>([]);

  useEffect(() => {
    loadActivity();
  }, []);

  const loadActivity = async () => {
    try {
      // Get last 90 days
      const today = new Date();
      const ninetyDaysAgo = new Date();
      ninetyDaysAgo.setDate(today.getDate() - 90);
      
      const from = ninetyDaysAgo.toISOString().split('T')[0];
      const to = today.toISOString().split('T')[0];
      
      const data = await logApi.getActivity(from, to);
      setActivity(data);
    } catch (err) {
      console.error('Failed to load activity:', err);
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

  const generateLast13Weeks = () => {
    const weeks: string[][] = [];
    const today = new Date();
    
    // Start from 13 weeks ago, on a Sunday
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - (13 * 7));
    const dayOfWeek = startDate.getDay();
    startDate.setDate(startDate.getDate() - dayOfWeek);
    
    let currentDate = new Date(startDate);
    let currentWeek: string[] = [];
    
    for (let i = 0; i < 13 * 7; i++) {
      const dateStr = currentDate.toISOString().split('T')[0];
      currentWeek.push(dateStr);
      
      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return weeks;
  };

  const weeks = generateLast13Weeks();
  const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-[rgb(var(--text-primary))]">Last 90 Days Activity</h3>
        <button
          onClick={() => navigate('/calendar')}
          className="text-sm text-primary-600 hover:text-primary-700 font-medium"
        >
          View full calendar →
        </button>
      </div>

      <div className="flex">
        {/* Day labels */}
        <div className="flex flex-col gap-[3px] mr-2">
          {weekDays.map((day, index) => (
            <div 
              key={day} 
              className="w-4 h-[10px] text-[9px] text-[rgb(var(--text-secondary))] flex items-center"
              style={{ opacity: index % 2 === 0 ? 0 : 1 }}
            >
              {day}
            </div>
          ))}
        </div>

        {/* Activity squares */}
        <div className="flex gap-[3px] overflow-x-auto">
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="flex flex-col gap-[3px]">
              {week.map((dateStr) => {
                const count = getActivityForDate(dateStr);
                const hasActivity = count > 0;
                
                return (
                  <div
                    key={dateStr}
                    className={`
                      w-[10px] h-[10px] rounded-sm border
                      ${getActivityColor(count)} border-[rgb(var(--border-color))]
                      ${hasActivity ? 'hover:border-[rgb(var(--text-tertiary))]' : ''}
                      transition-all
                    `}
                    title={`${dateStr}: ${count} log${count !== 1 ? 's' : ''}`}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-3 flex items-center gap-2 text-xs text-[rgb(var(--text-secondary))]">
        <span>Less</span>
        <div className="flex items-center gap-[2px]">
          <div className="w-[10px] h-[10px] rounded-sm bg-[rgb(var(--bg-tertiary))] border border-[rgb(var(--border-color))]" />
          <div className="w-[10px] h-[10px] rounded-sm bg-green-200 border border-[rgb(var(--border-color))]" />
          <div className="w-[10px] h-[10px] rounded-sm bg-green-400 border border-[rgb(var(--border-color))]" />
          <div className="w-[10px] h-[10px] rounded-sm bg-green-600 border border-[rgb(var(--border-color))]" />
          <div className="w-[10px] h-[10px] rounded-sm bg-green-800 border border-[rgb(var(--border-color))]" />
        </div>
        <span>More</span>
      </div>
    </div>
  );
}

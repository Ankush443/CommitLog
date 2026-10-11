import { useTheme } from '../../contexts/ThemeContext';

export default function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();

  const themes = [
    { value: 'light', label: 'Light', icon: '☀️' },
    { value: 'dark', label: 'Dark', icon: '🌙' },
    { value: 'matrix', label: 'Matrix', icon: '💚' },
  ];

  return (
    <div className="space-y-2">
      <div className="text-xs font-medium text-[rgb(var(--text-tertiary))] uppercase tracking-wider px-4">
        Theme
      </div>
      <div className="space-y-1 px-2">
        {themes.map((t) => (
          <button
            key={t.value}
            onClick={() => setTheme(t.value as any)}
            className={`
              w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-colors
              ${theme === t.value
                ? 'bg-[rgb(var(--primary))]/10 text-[rgb(var(--primary))] font-medium'
                : 'text-[rgb(var(--text-secondary))] hover:bg-[rgb(var(--bg-tertiary))]'
              }
            `}
          >
            <span className="text-xl">{t.icon}</span>
            <span>{t.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

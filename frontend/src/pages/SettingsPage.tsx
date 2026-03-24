import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Sun, Moon, Monitor } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/components/theme-provider';
import { api, type UserPreference } from '@/lib/api';
import { cn } from '@/lib/utils';

type Theme = UserPreference['theme'];

const THEME_OPTIONS: { value: Theme; label: string; icon: React.ReactNode }[] = [
  { value: 'light', label: 'Light', icon: <Sun className='h-4 w-4' /> },
  { value: 'dark', label: 'Dark', icon: <Moon className='h-4 w-4' /> },
  { value: 'system', label: 'System', icon: <Monitor className='h-4 w-4' /> },
];

export function SettingsPage() {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.getPreference().then((pref) => {
      setTheme(pref.theme);
    }).catch(() => {
      // preference not yet set — keep current local theme
    });
  }, [setTheme]);

  async function handleThemeChange(value: Theme) {
    setTheme(value);
    setSaving(true);
    try {
      await api.updatePreference({ theme: value });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className='mx-auto max-w-2xl'>
      <div className='sticky top-0 z-10 border-b bg-background px-4 pb-4 pt-4'>
        <div className='flex items-center gap-3'>
          <Button variant='ghost' size='icon' onClick={() => navigate('/')}>
            <ArrowLeft className='h-5 w-5' />
          </Button>
          <h1 className='text-2xl font-bold'>Settings</h1>
        </div>
      </div>

      <div className='p-4 space-y-6'>
        <section>
          <h2 className='mb-1 text-sm font-semibold text-muted-foreground uppercase tracking-wide'>
            Appearance
          </h2>
          <div className='rounded-lg border bg-card p-4'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='font-medium'>Theme</p>
                <p className='text-sm text-muted-foreground'>
                  Choose between light, dark, or system preference.
                </p>
              </div>
              <div className='flex items-center rounded-lg border p-1 gap-1'>
                {THEME_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleThemeChange(option.value)}
                    disabled={saving}
                    className={cn(
                      'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                      theme === option.value
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                    )}
                    aria-pressed={theme === option.value}
                    aria-label={`${option.label} theme`}
                  >
                    {option.icon}
                    <span>{option.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

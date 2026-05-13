import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { Bell, CalendarDays, Clock3, Sparkles } from 'lucide-react';
import { BottomNavBar } from '../components/BottomNavBar';
import { useApp } from '../context/AppContext';
import { getTodayReminderCard, type ReminderCard } from '../data/reminders';
import { getTodayAudioPrayer } from '../data/audioPrayers';
import { AudioPrayerPlayer } from '../components/AudioPrayerPlayer';
import { t } from '../i18n';
import {
  fetchWebNotificationDispatchJobs,
  fetchWebResolvedReminder,
  queueWebNotificationJobs,
  runWebNotificationDispatch,
  type WebNotificationDispatchJob,
} from '../lib/webContent';

function ToggleRow({
  label,
  sublabel,
  value,
  onChange,
  color,
}: {
  label: string;
  sublabel: string;
  value: boolean;
  onChange: (value: boolean) => void;
  color: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <p
          style={{
            fontFamily: "'Poppins', sans-serif",
            fontSize: '14px',
            fontWeight: 500,
            color: '#2D1B00',
          }}
        >
          {label}
        </p>
        <p
          style={{
            fontFamily: "'Poppins', sans-serif",
            fontSize: '11px',
            color: '#9B8B7A',
            marginTop: '2px',
          }}
        >
          {sublabel}
        </p>
      </div>
      <button
        onClick={() => onChange(!value)}
        className="relative shrink-0 rounded-full transition-all duration-300"
        style={{
          width: '48px',
          height: '28px',
          background: value ? `linear-gradient(135deg, ${color} 0%, #FF8C42 100%)` : '#E8D5B0',
        }}
      >
        <div
          className="absolute top-1 rounded-full bg-white transition-all duration-300"
          style={{
            width: '20px',
            height: '20px',
            left: value ? '24px' : '4px',
            boxShadow: '0 1px 4px rgba(0,0,0,0.18)',
          }}
        />
      </button>
    </div>
  );
}

export function RemindersScreen() {
  const navigate = useNavigate();
  const { user, preferences, setPreference } = useApp();
  const [reminder, setReminder] = useState<ReminderCard>(() => getTodayReminderCard());
  const [dispatchJobs, setDispatchJobs] = useState<WebNotificationDispatchJob[]>([]);
  const todayAudioPrayer = getTodayAudioPrayer();
  const tr = (key: string) => t(preferences.language, key);

  useEffect(() => {
    let active = true;

    async function loadReminder() {
      try {
        const resolved = await fetchWebResolvedReminder(preferences.language);
        if (!active || !resolved) {
          return;
        }

        setReminder({
          id: `resolved-${resolved.prayerId}`,
          title:
            resolved.type === 'festival'
              ? `${resolved.festivalName || resolved.title} Prayer Reminder`
              : "Today's Prayer Reminder",
          description:
            resolved.type === 'festival'
              ? `Today is ${resolved.festivalName || resolved.title}. The reminder now switches to the festival prayer instead of the regular daily prayer.`
              : 'No festival is scheduled for today, so the reminder shows the regular daily prayer.',
          prayerId: resolved.prayerId,
          deityName: resolved.deityName,
          type: resolved.type === 'festival' ? 'festival' : 'calendar',
          dayLabel: resolved.dayLabel,
          time: preferences.reminderTime,
          accent: resolved.type === 'festival' ? '#D96C2E' : '#FF8C42',
          symbol: resolved.type === 'festival' ? '✨' : '🪔',
        });
      } catch (error) {
        console.warn('Falling back to static reminder card', error);
        if (active) {
          setReminder(getTodayReminderCard());
        }
      }
    }

    void loadReminder();

    return () => {
      active = false;
    };
  }, [preferences.language, preferences.reminderTime]);

  useEffect(() => {
    let active = true;

    async function loadDispatchJobs() {
      if (!user?.id || user.isGuest) {
        if (active) {
          setDispatchJobs([]);
        }
        return;
      }

      try {
        const jobs = await fetchWebNotificationDispatchJobs(user.id);
        if (active) {
          setDispatchJobs(jobs);
        }
      } catch (error) {
        console.warn('Unable to load queued reminder jobs', error);
      }
    }

    void loadDispatchJobs();

    return () => {
      active = false;
    };
  }, [user?.id, user?.isGuest]);

  function getDispatchStatusLabel(status: string) {
    switch (status) {
      case 'processing':
        return 'Processing';
      case 'sent':
        return 'Sent';
      case 'failed':
        return 'Failed';
      case 'canceled':
        return 'Canceled';
      case 'skipped':
        return 'Skipped';
      default:
        return 'Queued';
    }
  }

  return (
    <div className="absolute inset-0 flex flex-col" style={{ background: '#FFF5E4' }}>
      <div
        className="shrink-0 px-5 pt-12 pb-7"
        style={{
          background: 'linear-gradient(150deg, #7A1E1E 0%, #3d0f0f 55%, #AA4010 100%)',
          borderBottomLeftRadius: '28px',
          borderBottomRightRadius: '28px',
        }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: '28px',
                fontWeight: 700,
                color: '#FFF5E4',
              }}
            >
              {tr('reminders.title')}
            </h1>
            <p
              style={{
                fontFamily: "'Poppins', sans-serif",
                fontSize: '12px',
                color: 'rgba(255,245,228,0.6)',
                marginTop: '3px',
              }}
            >
              {tr('reminders.subtitle')}
            </p>
          </div>
          <div
            className="flex items-center justify-center rounded-full"
            style={{
              width: '48px',
              height: '48px',
              background: 'rgba(255,245,228,0.12)',
              border: '1px solid rgba(212,175,55,0.3)',
            }}
          >
            <Bell size={20} color="#D4AF37" strokeWidth={1.8} />
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-5 pb-24" style={{ scrollbarWidth: 'none' }}>
        <div
          className="rounded-3xl p-5 mb-4"
          style={{ background: '#FFFFFF', border: '1.5px solid #F0E0C8' }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div
              className="flex items-center justify-center rounded-2xl"
              style={{ width: '42px', height: '42px', background: '#FF8C4212' }}
            >
              <CalendarDays size={19} color="#FF8C42" strokeWidth={1.8} />
            </div>
            <div>
              <p
                style={{
                  fontFamily: "'Poppins', sans-serif",
                  fontSize: '12px',
                  fontWeight: 700,
                  color: '#9B8B7A',
                  letterSpacing: '1px',
                  textTransform: 'uppercase',
                }}
              >
                {tr('reminders.settings')}
              </p>
              <p
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: '22px',
                  fontWeight: 600,
                  color: '#2D1B00',
                }}
              >
                {tr('reminders.keepRoutine')}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <ToggleRow
              label={tr('reminders.allNotifications')}
              sublabel={tr('reminders.allNotificationsHelp')}
              value={preferences.notifications}
              onChange={(value) => setPreference('notifications', value)}
              color="#7A1E1E"
            />
            <div className="h-px" style={{ background: '#F0E0C8' }} />
            <ToggleRow
              label={tr('reminders.calendarDayReminders')}
              sublabel={tr('reminders.calendarDayRemindersHelp')}
              value={preferences.calendarReminders}
              onChange={(value) => setPreference('calendarReminders', value)}
              color="#FF8C42"
            />
            <div className="h-px" style={{ background: '#F0E0C8' }} />
            <ToggleRow
              label={tr('reminders.festivalReminders')}
              sublabel={tr('reminders.festivalRemindersHelp')}
              value={preferences.festivalReminders}
              onChange={(value) => setPreference('festivalReminders', value)}
              color="#D4AF37"
            />
            <div className="h-px" style={{ background: '#F0E0C8' }} />
            <div className="flex items-center justify-between gap-4">
              <div>
                <p
                  style={{
                    fontFamily: "'Poppins', sans-serif",
                    fontSize: '14px',
                    fontWeight: 500,
                    color: '#2D1B00',
                  }}
                >
                  {tr('reminders.reminderTime')}
                </p>
                <p
                  style={{
                    fontFamily: "'Poppins', sans-serif",
                    fontSize: '11px',
                    color: '#9B8B7A',
                    marginTop: '2px',
                  }}
                >
                  {tr('reminders.reminderTimeHelp')}
                </p>
              </div>
              <input
                type="time"
                value={preferences.reminderTime}
                onChange={(e) => setPreference('reminderTime', e.target.value)}
                className="rounded-2xl px-3 py-2 outline-none"
                style={{
                  background: '#FFF5E4',
                  border: '1.5px solid #E8D5B0',
                  color: '#7A1E1E',
                  fontFamily: "'Poppins', sans-serif",
                  fontSize: '12px',
                  fontWeight: 600,
                }}
              />
            </div>
          </div>
        </div>

        <div className="mb-4">
          <div className="flex items-center justify-between mb-3">
            <h2
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: '22px',
                fontWeight: 600,
                color: '#2D1B00',
              }}
            >
              {tr('reminders.todayAudioPrayer')}
            </h2>
            <button
              onClick={() => navigate(`/prayer/${todayAudioPrayer.prayerId}`)}
              style={{
                fontFamily: "'Poppins', sans-serif",
                fontSize: '11px',
                fontWeight: 600,
                color: todayAudioPrayer.accent,
              }}
            >
              {t(preferences.language, 'common.openPrayer')}
            </button>
          </div>
          <AudioPrayerPlayer track={todayAudioPrayer} compact />
        </div>

        <div className="flex items-center justify-between mb-3">
          <h2
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: '22px',
              fontWeight: 600,
              color: '#2D1B00',
            }}
          >
            {tr('reminders.activeReminder')}
          </h2>
          <div
            className="rounded-full px-3 py-1"
            style={{
              background: `${reminder.accent}15`,
              color: reminder.accent,
              fontFamily: "'Poppins', sans-serif",
              fontSize: '11px',
              fontWeight: 600,
            }}
          >
            {reminder.type === 'festival'
              ? tr('reminders.festivalDay')
              : tr('reminders.regularDay')}
          </div>
        </div>

        <motion.button
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          onClick={() => navigate(`/prayer/${reminder.prayerId}`)}
          className="w-full text-left rounded-3xl p-5"
          style={{
            background: '#FFFFFF',
            border: `1.5px solid ${reminder.accent}22`,
            boxShadow: `0 4px 18px ${reminder.accent}12`,
          }}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3 min-w-0">
              <div
                className="flex items-center justify-center rounded-2xl shrink-0"
                style={{
                  width: '48px',
                  height: '48px',
                  background: `${reminder.accent}14`,
                  color: reminder.accent,
                  fontSize: '22px',
                }}
              >
                {reminder.symbol}
              </div>
              <div className="min-w-0">
                <p
                  style={{
                    fontFamily: "'Poppins', sans-serif",
                    fontSize: '11px',
                    fontWeight: 700,
                    color: reminder.accent,
                    letterSpacing: '1px',
                    textTransform: 'uppercase',
                  }}
                >
                  {reminder.type === 'festival'
                    ? tr('reminders.festivalReminder')
                    : tr('reminders.dailyReminder')}
                </p>
                <h3
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: '23px',
                    fontWeight: 600,
                    color: '#2D1B00',
                    lineHeight: 1.1,
                    marginTop: '4px',
                  }}
                >
                  {reminder.title}
                </h3>
                <p
                  style={{
                    fontFamily: "'Poppins', sans-serif",
                    fontSize: '12px',
                    color: '#7B6A56',
                    lineHeight: 1.6,
                    marginTop: '6px',
                  }}
                >
                  {reminder.description}
                </p>
              </div>
            </div>
            <Sparkles size={18} color={reminder.accent} strokeWidth={1.8} />
          </div>

          <div className="flex flex-wrap gap-2 mt-4">
            {[
              { icon: <CalendarDays size={14} />, text: reminder.dayLabel },
              { icon: <Clock3 size={14} />, text: reminder.time },
              { icon: <Bell size={14} />, text: reminder.deityName },
            ].map((item) => (
              <div
                key={item.text}
                className="flex items-center gap-1.5 rounded-full px-3 py-1.5"
                style={{
                  background: '#FFF5E4',
                  border: '1px solid #F0E0C8',
                  color: '#7A1E1E',
                  fontFamily: "'Poppins', sans-serif",
                  fontSize: '11px',
                  fontWeight: 500,
                }}
              >
                {item.icon}
                <span>{item.text}</span>
              </div>
            ))}
          </div>
        </motion.button>

        {import.meta.env.DEV && user?.id && !user.isGuest ? (
          <div
            className="rounded-3xl p-5 mt-4"
            style={{ background: '#FFFFFF', border: '1.5px solid #F0E0C8' }}
          >
            <div className="mb-4">
              <h2
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: '22px',
                  fontWeight: 600,
                  color: '#2D1B00',
                }}
              >
                Developer Testing Tools
              </h2>
              <p
                style={{
                  fontFamily: "'Poppins', sans-serif",
                  fontSize: '12px',
                  color: '#9B8B7A',
                  marginTop: '6px',
                }}
              >
                These controls are for reminder QA only. They help us verify queueing and dispatch while we finish the backend flow.
              </p>
            </div>

            <div
              className="pt-4"
              style={{
                borderTop: '1px solid #F0E0C8',
              }}
            >
            <div className="flex flex-col gap-3 mb-3">
              <div>
                <h2
                  style={{
                    fontFamily: "'Poppins', sans-serif",
                    fontSize: '16px',
                    fontWeight: 700,
                    color: '#2D1B00',
                  }}
                >
                  Reminder Dispatch Queue
                </h2>
                <p
                  style={{
                    fontFamily: "'Poppins', sans-serif",
                    fontSize: '12px',
                    color: '#9B8B7A',
                    marginTop: '6px',
                  }}
                >
                  Queue today's reminder jobs for your registered mobile devices using your current reminder settings.
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <button
                  onClick={async () => {
                    try {
                      const jobs = await queueWebNotificationJobs();
                      setDispatchJobs(await fetchWebNotificationDispatchJobs(user.id!));
                      window.alert(
                        jobs.length > 0
                          ? `Queued ${jobs.length} reminder job${jobs.length === 1 ? '' : 's'} for your registered device${jobs.length === 1 ? '' : 's'}.`
                          : 'No reminder jobs were queued. Make sure notifications are enabled and a mobile device is registered.'
                      );
                    } catch (error) {
                      window.alert(error instanceof Error ? error.message : 'Unable to queue reminder jobs right now.');
                    }
                  }}
                  className="rounded-2xl px-4 py-2 shrink-0"
                  style={{
                    background: '#FFF5E4',
                    border: '1px solid #F0E0C8',
                    color: '#D96C2E',
                    fontFamily: "'Poppins', sans-serif",
                    fontSize: '12px',
                    fontWeight: 700,
                    textAlign: 'center',
                  }}
                >
                  Queue Today&apos;s Reminder
                </button>
                {import.meta.env.DEV ? (
                <button
                  onClick={async () => {
                    try {
                      const result = await runWebNotificationDispatch();
                      setDispatchJobs(await fetchWebNotificationDispatchJobs(user.id!));
                      window.alert(
                        result.claimed > 0
                          ? `Claimed ${result.claimed} reminder job${result.claimed === 1 ? '' : 's'} and sent ${result.sent}.`
                          : 'No queued reminder jobs were available to dispatch.'
                      );
                    } catch (error) {
                      window.alert(error instanceof Error ? error.message : 'Unable to run reminder dispatch right now.');
                    }
                  }}
                  className="rounded-2xl px-4 py-2 shrink-0"
                  style={{
                    background: '#7A1E1E',
                    border: '1px solid #7A1E1E',
                    color: '#FFF5E4',
                    fontFamily: "'Poppins', sans-serif",
                    fontSize: '12px',
                    fontWeight: 700,
                    textAlign: 'center',
                  }}
                >
                  Run Reminder Dispatch
                </button>
                ) : null}
              </div>
            </div>

            {dispatchJobs.length > 0 ? (
              <div className="flex flex-col gap-3 mt-4">
                {dispatchJobs.map((job) => (
                  <div
                    key={job.id}
                    className="rounded-2xl p-4"
                    style={{ background: '#FFF9F1', border: '1px solid #F0E0C8' }}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p
                          style={{
                            fontFamily: "'Poppins', sans-serif",
                            fontSize: '13px',
                            fontWeight: 700,
                            color: '#2D1B00',
                          }}
                        >
                          {job.prayerSlug || 'Queued reminder'}
                        </p>
                        <p
                          style={{
                            fontFamily: "'Poppins', sans-serif",
                            fontSize: '11px',
                            color: '#9B8B7A',
                            marginTop: '4px',
                          }}
                        >
                          {(job.reminderType === 'festival' ? 'Festival' : 'Daily')} · Scheduled{' '}
                          {new Date(job.scheduledForLocal).toLocaleString()}
                        </p>
                        <p
                          style={{
                            fontFamily: "'Poppins', sans-serif",
                            fontSize: '11px',
                            color: '#9B8B7A',
                            marginTop: '4px',
                          }}
                        >
                          {job.lastError || `Provider: ${job.provider}`}
                        </p>
                      </div>
                      <div
                        className="rounded-full px-3 py-1"
                        style={{
                          background: '#FFE7D2',
                          color: '#D96C2E',
                          fontFamily: "'Poppins', sans-serif",
                          fontSize: '11px',
                          fontWeight: 700,
                        }}
                      >
                        {getDispatchStatusLabel(job.status)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p
                style={{
                  fontFamily: "'Poppins', sans-serif",
                  fontSize: '12px',
                  color: '#9B8B7A',
                  marginTop: '14px',
                }}
              >
                No reminder jobs are queued yet for this account.
              </p>
            )}
            </div>
          </div>
        ) : null}
      </div>

      <BottomNavBar />
    </div>
  );
}

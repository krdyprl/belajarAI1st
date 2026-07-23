-- ============================================
-- Cron Reminder + Email Notifications
-- ============================================
-- Jalankan setelah 000_all.sql

-- Schedule cron job (setiap jam 13:30 WIB / 6:30 UTC)
select
  cron.schedule(
    'medication-reminder',
    '30 6 * * *', -- 06:30 UTC = 13:30 WIB
    $$
    select
      net.http_post(
        url := 'http://localhost:54321/functions/v1/reminder',
        headers := '{"Content-Type": "application/json"}'::jsonb,
        body := '{}'::jsonb
      ) as request_id;
    $$
  );

'use client';

import PageHeader from '@/components/PageHeader';
import { PARTY_CONFIG } from '@/config/party';

const eventDetails = {
  title: PARTY_CONFIG.name,
  description: PARTY_CONFIG.welcomeMessage,
  location: PARTY_CONFIG.location,
  // Local date-times; adjust as needed
  start: new Date('2025-08-15T19:00:00'),
  end: new Date('2025-08-15T23:00:00'),
};

function formatToGoogle(dt) {
  const z = dt.toISOString().replace(/[-:]|\.\d{3}/g, ''); // YYYYMMDDTHHMMSSZ
  return z;
}

function formatToICS(dt) {
  // ICS uses UTC by default; format as YYYYMMDDTHHMMSSZ
  return dt.toISOString().replace(/[-:]|\.\d{3}/g, '');
}

function buildGoogleUrl(evt) {
  const base = 'https://calendar.google.com/calendar/render?action=TEMPLATE';
  const dates = `${formatToGoogle(evt.start)}/${formatToGoogle(evt.end)}`;
  const params = new URLSearchParams({
    text: evt.title,
    dates,
    details: evt.description,
    location: evt.location,
  });
  return `${base}&${params.toString()}`;
}

function buildOutlookUrl(evt) {
  const base = 'https://outlook.live.com/calendar/0/deeplink/compose?path=/calendar/action/compose&rru=addevent';
  const params = new URLSearchParams({
    subject: evt.title,
    body: evt.description,
    location: evt.location,
    startdt: evt.start.toISOString(),
    enddt: evt.end.toISOString(),
  });
  return `${base}&${params.toString()}`;
}

function buildICS(evt) {
  const ics = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Birthday Client//EN', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH', 'BEGIN:VEVENT', `DTSTART:${formatToICS(evt.start)}`, `DTEND:${formatToICS(evt.end)}`, `SUMMARY:${evt.title}`, `DESCRIPTION:${evt.description}`, `LOCATION:${evt.location}`, `DTSTAMP:${formatToICS(new Date())}`, 'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
  return new Blob([ics], { type: 'text/calendar;charset=utf-8' });
}

export default function CalendarPage() {
  const googleUrl = buildGoogleUrl(eventDetails);
  const outlookUrl = buildOutlookUrl(eventDetails);

  const handleAppleDownload = () => {
    const blob = buildICS(eventDetails);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ivys-birthday.ics';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <main className="page">
      <PageHeader title="Add to Calendar" subtitle="Save Ivy's 2nd Birthday to your calendar" />
      <div className="card" style={{ display: 'grid', gap: 12 }}>
        <a className="tile tile-blue" style={{ height: 64 }} href={googleUrl} target="_blank" rel="noreferrer">
          Add to Google Calendar
        </a>
        <a className="tile tile-indigo" style={{ height: 64 }} href={outlookUrl} target="_blank" rel="noreferrer">
          Add to Outlook
        </a>
        <button type="button" className="tile tile-purple" style={{ height: 64, border: 'none' }} onClick={handleAppleDownload}>
          Download .ics for Apple Calendar
        </button>
        <p className="muted" style={{ margin: 0 }}>
          Times are in your local timezone. You can adjust date/time in your calendar app after adding.
        </p>
      </div>
    </main>
  );
}

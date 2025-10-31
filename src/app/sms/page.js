'use client';

import { useMemo, useState } from 'react';
import PageHeader from '@/components/PageHeader';
import { PARTY_CONFIG } from '@/config/party';

const event = {
  title: PARTY_CONFIG.name,
  date: PARTY_CONFIG.date,
  time: PARTY_CONFIG.time,
  url: typeof window === 'undefined' ? 'https://example.com' : window.location.origin,
};

function normalizePhone(input) {
  const digits = input.replace(/\D/g, '');
  // Basic: if US 10-digits, prefix +1
  if (digits.length === 10) return `+1${digits}`;
  if (digits.startsWith('1') && digits.length === 11) return `+${digits}`;
  if (digits.startsWith('+')) return digits;
  return digits;
}

function buildSmsHref(phone, body) {
  // iOS uses: sms:&body=... (number optional)
  // Android uses: sms:PHONE?body=...
  const encoded = encodeURIComponent(body);
  const isIOS = /iPad|iPhone|iPod/.test(typeof navigator !== 'undefined' ? navigator.userAgent : '') || (/Macintosh/.test(typeof navigator !== 'undefined' ? navigator.userAgent : '') && 'ontouchend' in document);
  if (isIOS) {
    return phone ? `sms:${phone}&body=${encoded}` : `sms:&body=${encoded}`;
  }
  return phone ? `sms:${phone}?body=${encoded}` : `sms:?body=${encoded}`;
}

export default function SmsPage() {
  const [phone, setPhone] = useState('');
  const [copied, setCopied] = useState(false);

  const message = useMemo(() => `You're invited to ${event.title}! ${event.date} · ${event.time}. Details: ${event.url}`, []);

  const smsHref = useMemo(() => buildSmsHref(normalizePhone(phone), message), [phone, message]);

  const onSend = () => {
    setCopied(false);
    window.location.href = smsHref;
  };

  const copyText = async () => {
    await navigator.clipboard.writeText(message);
    setCopied(true);
  };

  return (
    <main className="page">
      <PageHeader title="Share via SMS" subtitle="Send invites with a prefilled message" />
      <div className="card" style={{ display: 'grid', gap: 12 }}>
        <label htmlFor="phone" style={{ fontWeight: 600 }}>
          Guest phone number
        </label>
        <input id="phone" inputMode="tel" type="tel" placeholder="(555) 123-4567" value={phone} onChange={(e) => setPhone(e.target.value)} style={{ padding: 12, borderRadius: 10, border: '1px solid #e5e7eb' }} />

        <button type="button" onClick={onSend} className="tile tile-purple" style={{ height: 56, border: 'none' }} aria-label="Open SMS app with prefilled invite">
          Open SMS with Invite
        </button>

        <div style={{ display: 'grid', gap: 8 }}>
          <div style={{ fontSize: 13, color: 'var(--muted)' }}>Message preview</div>
          <div style={{ background: '#f8fafc', padding: 12, borderRadius: 10, wordBreak: 'break-word' }}>{message}</div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="button" onClick={copyText} className="tile tile-purple" style={{ height: 44, border: 'none', flex: 1 }}>
              {copied ? 'Copied!' : 'Copy Message'}
            </button>
            <a href={smsHref} className="tile tile-indigo" style={{ height: 44, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
              Preview Link
            </a>
          </div>
        </div>

        <p className="muted" style={{ margin: 0 }}>
          Tip: On desktop, the SMS link may open your default messaging app (e.g., Skype). Best results on a phone.
        </p>
      </div>
    </main>
  );
}

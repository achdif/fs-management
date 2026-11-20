import { useRef, useState } from 'react';
import { useAuth } from '@fs-management/auth';
import Button from '../ui/Button';

export default function OtpForm({ email }: { email: string }) {
  const { verifyOTP, isLoading } = useAuth();
  const [digits, setDigits] = useState<string[]>(Array(6).fill(''));
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  const setDigit = (i: number, v: string) => {
    const d = v.replace(/\D/g, '').slice(-1);
    setDigits((prev) => {
      const next = [...prev];
      next[i] = d;
      return next;
    });
    if (d && i < 5) refs.current[i + 1]?.focus();
  };

  const onKeyDown = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[i] && i > 0) refs.current[i - 1]?.focus();
  };

  const onPaste = (e: React.ClipboardEvent) => {
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!text) return;
    e.preventDefault();
    const next = Array(6).fill('');
    text.split('').forEach((c, i) => (next[i] = c));
    setDigits(next);
    refs.current[Math.min(text.length, 5)]?.focus();
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const otp = digits.join('');
    if (otp.length !== 6) return;
    const ok = await verifyOTP(email, otp);
    if (ok) window.location.href = '/login';
  };

  return (
    <form onSubmit={submit} className="flex w-full flex-col items-center gap-8 pt-10">
      <div className="text-center">
        <h1 className="text-[28px] font-bold text-ink">Verify OTP</h1>
        <p className="mt-2 text-[14px] text-muted">
          Enter the 6-digit code sent to
          <br />
          <span className="font-medium text-ink">{email}</span>
        </p>
      </div>

      <div className="flex gap-3" onPaste={onPaste}>
        {digits.map((d, i) => (
          <input
            key={i}
            ref={(el) => {
              refs.current[i] = el;
            }}
            inputMode="numeric"
            maxLength={1}
            value={d}
            onChange={(e) => setDigit(i, e.target.value)}
            onKeyDown={(e) => onKeyDown(i, e)}
            className="h-16 w-12 rounded-2xl border border-line bg-white text-center text-[24px] font-bold text-ink outline-none focus:border-primary"
          />
        ))}
      </div>

      <Button type="submit" disabled={isLoading || digits.join('').length !== 6} className="w-full">
        {isLoading ? 'Verifying…' : 'Verify'}
      </Button>

      <p className="text-[13px] text-muted">
        Didn't receive code?{' '}
        <button type="button" className="font-medium text-primary" onClick={() => window.location.reload()}>
          Resend
        </button>
      </p>
    </form>
  );
}

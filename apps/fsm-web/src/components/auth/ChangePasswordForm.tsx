import { useState } from 'react';
import { useAuth } from '@fs-management/auth';
import Input from '../ui/Input';
import Button from '../ui/Button';

export default function ChangePasswordForm() {
  const { changePassword, isLoading } = useAuth();
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [done, setDone] = useState(false);
  const [mismatch, setMismatch] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (next !== confirm) {
      setMismatch(true);
      return;
    }
    setMismatch(false);
    const ok = await changePassword(current, next);
    if (ok) setDone(true);
  };

  if (done) {
    return (
      <div className="flex flex-col items-center pt-16 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-tint text-3xl">✓</div>
        <h1 className="mt-6 text-[24px] font-bold text-ink">Password Changed</h1>
        <p className="mt-2 text-[14px] text-muted">Your password has been updated successfully.</p>
        <a href="/profile" className="mt-8 text-[14px] font-semibold text-primary">
          Back to Profile
        </a>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="flex w-full flex-col gap-6">
      <div>
        <h1 className="text-[24px] font-bold text-ink">Change Password</h1>
        <p className="mt-1 text-[14px] text-muted">Enter your current password and choose a new one</p>
      </div>

      <div className="flex flex-col gap-4">
        <Input label="Current Password" type="password" autoComplete="current-password" value={current} onChange={(e) => setCurrent(e.target.value)} required />
        <Input label="New Password" type="password" autoComplete="new-password" value={next} onChange={(e) => setNext(e.target.value)} required />
        <Input
          label="Confirm New Password"
          type="password"
          autoComplete="new-password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          error={mismatch ? 'Passwords do not match' : undefined}
          required
        />
      </div>

      <Button type="submit" disabled={isLoading}>
        {isLoading ? 'Updating…' : 'Update Password'}
      </Button>
    </form>
  );
}

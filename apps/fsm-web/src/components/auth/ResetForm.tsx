import { useState } from 'react';
import { useAuth } from '@fs-management/auth';
import Input from '../ui/Input';
import Button from '../ui/Button';

export default function ResetForm({ token }: { token: string }) {
  const { resetPassword, isLoading } = useAuth();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [done, setDone] = useState(false);
  const [mismatch, setMismatch] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      setMismatch(true);
      return;
    }
    setMismatch(false);
    const ok = await resetPassword(token, password);
    if (ok) setDone(true);
  };

  if (!token) {
    return (
      <div className="flex flex-col items-center pt-16 text-center">
        <h1 className="text-[24px] font-bold text-ink">Invalid Reset Link</h1>
        <p className="mt-2 text-[14px] text-muted">This link is missing its token.</p>
        <a href="/forgot-password" className="mt-6 text-[14px] font-semibold text-primary">
          Request a new link
        </a>
      </div>
    );
  }

  if (done) {
    return (
      <div className="flex flex-col items-center pt-16 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-tint text-3xl">✓</div>
        <h1 className="mt-6 text-[24px] font-bold text-ink">Password Updated</h1>
        <p className="mt-2 text-[14px] text-muted">You can now sign in with your new password.</p>
        <a href="/login" className="mt-8 text-[14px] font-semibold text-primary">
          Go to Sign In
        </a>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="flex w-full flex-col gap-6 pt-10">
      <div className="text-center">
        <h1 className="text-[28px] font-bold text-ink">Reset Password</h1>
        <p className="mt-2 text-[14px] text-muted">Choose a new password for your account</p>
      </div>

      <div className="flex flex-col gap-4">
        <Input
          label="New Password"
          type="password"
          placeholder="••••••••"
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <Input
          label="Confirm Password"
          type="password"
          placeholder="••••••••"
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

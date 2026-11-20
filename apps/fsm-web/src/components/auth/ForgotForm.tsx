import { useState } from 'react';
import { useAuth } from '@fs-management/auth';
import Input from '../ui/Input';
import Button from '../ui/Button';

export default function ForgotForm() {
  const { forgotPassword, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    const ok = await forgotPassword(email.trim());
    if (ok) setSent(true);
  };

  if (sent) {
    return (
      <div className="flex flex-col items-center pt-16 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-tint text-3xl">✉</div>
        <h1 className="mt-6 text-[24px] font-bold text-ink">Check Your Email</h1>
        <p className="mt-2 text-[14px] text-muted">
          We sent a password reset link to
          <br />
          <span className="font-medium text-ink">{email}</span>
        </p>
        <a href="/login" className="mt-8 text-[14px] font-semibold text-primary">
          Back to Sign In
        </a>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="flex w-full flex-col gap-6 pt-10">
      <div className="text-center">
        <h1 className="text-[28px] font-bold text-ink">Forgot Password?</h1>
        <p className="mt-2 text-[14px] text-muted">
          Enter your email and we'll send you a reset link
        </p>
      </div>

      <Input
        label="Email"
        type="email"
        placeholder="your@email.com"
        autoComplete="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />

      <Button type="submit" disabled={isLoading}>
        {isLoading ? 'Sending…' : 'Send Reset Link'}
      </Button>

      <p className="text-center text-[14px] text-subtle">
        Remember your password?{' '}
        <a href="/login" className="font-semibold text-primary">
          Sign In
        </a>
      </p>
    </form>
  );
}

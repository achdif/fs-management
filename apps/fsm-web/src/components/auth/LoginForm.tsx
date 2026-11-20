import { useState } from 'react';
import { useAuth } from '@fs-management/auth';
import Input from '../ui/Input';
import Button from '../ui/Button';

export default function LoginForm() {
  const { login, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) return;
    const ok = await login({ email: email.trim(), password });
    if (ok) window.location.href = '/';
  };

  return (
    <form onSubmit={submit} className="flex w-full flex-col gap-5">
      <div className="flex flex-col items-center pt-10">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary">
          <span className="text-[32px] font-bold text-white">FS</span>
        </div>
        <h1 className="mt-6 text-[28px] font-bold text-ink">Welcome Back</h1>
        <p className="mt-1 text-[14px] text-muted">Sign in to continue</p>
      </div>

      <div className="mt-6 flex flex-col gap-4">
        <Input
          label="Email"
          type="email"
          placeholder="your@email.com"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Input
          label="Password"
          type="password"
          placeholder="••••••••"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>

      <div className="flex justify-end">
        <a href="/forgot-password" className="text-[13px] font-medium text-primary">
          Forgot Password?
        </a>
      </div>

      <Button type="submit" disabled={isLoading}>
        {isLoading ? 'Signing in…' : 'Sign In'}
      </Button>

      <p className="mt-2 text-center text-[14px] text-subtle">
        Don't have an account?{' '}
        <a href="/register" className="font-semibold text-primary">
          Sign Up
        </a>
      </p>
    </form>
  );
}

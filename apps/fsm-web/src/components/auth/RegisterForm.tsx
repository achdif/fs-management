import { useState } from 'react';
import { useAuth } from '@fs-management/auth';
import Input from '../ui/Input';
import Button from '../ui/Button';

export default function RegisterForm() {
  const { register, isLoading } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [done, setDone] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password || !fullName.trim()) return;
    const res = await register({
      email: email.trim(),
      password,
      fullName: fullName.trim(),
      phone: phone.trim() || undefined,
    });
    if (res.success) {
      setDone(true);
      // OTP dikirim backend via email — arahkan ke verifikasi
      setTimeout(() => {
        window.location.href = `/verify-otp?email=${encodeURIComponent(email.trim())}`;
      }, 800);
    }
  };

  if (done) {
    return (
      <div className="flex flex-col items-center pt-16 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-tint text-3xl">✓</div>
        <h1 className="mt-6 text-[24px] font-bold text-ink">Account Created</h1>
        <p className="mt-2 text-[14px] text-muted">Redirecting to OTP verification…</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="flex w-full flex-col gap-5">
      <div className="flex flex-col items-center pt-10">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary">
          <span className="text-[32px] font-bold text-white">FS</span>
        </div>
        <h1 className="mt-6 text-[28px] font-bold text-ink">Create Account</h1>
        <p className="mt-1 text-[14px] text-muted">Sign up to get started</p>
      </div>

      <div className="mt-6 flex flex-col gap-4">
        <Input label="Full Name" placeholder="John Doe" autoComplete="name" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
        <Input label="Email" type="email" placeholder="your@email.com" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <Input label="Phone" type="tel" placeholder="+62 ..." autoComplete="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
        <Input label="Password" type="password" placeholder="••••••••" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} required />
      </div>

      <Button type="submit" disabled={isLoading} className="mt-2">
        {isLoading ? 'Creating account…' : 'Sign Up'}
      </Button>

      <p className="mt-2 text-center text-[14px] text-subtle">
        Already have an account?{' '}
        <a href="/login" className="font-semibold text-primary">
          Sign In
        </a>
      </p>
    </form>
  );
}

import Button from '../ui/Button';

export default function AccountLockedScreen() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
      <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[#ffe4e6] text-5xl">
        🔒
      </div>
      <h1 className="mt-8 text-[26px] font-bold text-ink">Account Locked</h1>
      <p className="mt-3 text-[15px] leading-relaxed text-muted">
        Too many failed login attempts. Your account has been temporarily locked for
        security reasons.
      </p>
      <p className="mt-2 text-[13px] text-subtle">
        Please try again later or contact support.
      </p>
      <div className="mt-10 w-full max-w-xs">
        <Button variant="primary" onClick={() => (window.location.href = '/login')}>
          Back to Sign In
        </Button>
      </div>
    </div>
  );
}

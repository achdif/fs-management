import Button from '../ui/Button';

export default function NetworkErrorScreen() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
      <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[#fff3e0] text-5xl">
        📶
      </div>
      <h1 className="mt-8 text-[26px] font-bold text-ink">No Connection</h1>
      <p className="mt-3 text-[15px] leading-relaxed text-muted">
        It looks like you're offline. Check your internet connection and try again.
      </p>
      <div className="mt-10 flex w-full max-w-xs flex-col gap-3">
        <Button variant="primary" onClick={() => window.location.reload()}>
          Try Again
        </Button>
        <Button variant="secondary" onClick={() => (window.location.href = '/login')}>
          Back to Sign In
        </Button>
      </div>
    </div>
  );
}

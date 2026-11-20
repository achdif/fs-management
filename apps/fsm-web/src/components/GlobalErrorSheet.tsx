import { useAuthStore } from '@fs-management/auth';
import BottomSheet from './ui/BottomSheet';

/**
 * Global error bottom sheet — membaca error state dari authStore.
 * Dipasang sekali di Screen layout, tampil untuk semua halaman.
 */
export default function GlobalErrorSheet() {
  const { error, errorCode, isNetworkError, errorSource, setError } = useAuthStore();

  const open = !!error;
  const title = isNetworkError ? 'No Internet Connection' : 'Something went wrong';
  const message = isNetworkError
    ? 'Please check your internet connection and try again.'
    : (error ?? undefined);

  const dismiss = () => setError(null);
  const retry = () => {
    const action = useAuthStore.getState().retryAction;
    setError(null);
    action?.();
  };

  return (
    <BottomSheet
      open={open}
      title={title}
      message={message}
      icon={isNetworkError ? '📶' : '✕'}
      iconBg={isNetworkError ? 'bg-warning' : 'bg-danger'}
      iconColor={isNetworkError ? 'text-black' : 'text-white'}
      errorCode={errorCode ? `${errorCode}${errorSource ? ` · ${errorSource}` : ''}` : undefined}
      primaryLabel="Retry"
      onPrimary={retry}
      secondaryLabel="Cancel"
      onSecondary={dismiss}
      onClose={dismiss}
    />
  );
}

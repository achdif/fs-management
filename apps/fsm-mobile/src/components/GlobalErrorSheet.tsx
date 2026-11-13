import React from 'react';
import {useAuthStore} from '@fs-management/auth';
import ErrorBottomSheet from './ErrorBottomSheet';

const GlobalErrorSheet = () => {
  const error = useAuthStore(state => state.error);
  const errorCode = useAuthStore(state => state.errorCode);
  const isNetworkError = useAuthStore(state => state.isNetworkError);
  const retryAction = useAuthStore(state => state.retryAction);
  const setError = useAuthStore(state => state.setError);
  const setRetryAction = useAuthStore(state => state.setRetryAction);

  const handleRetry = () => {
    const action = retryAction;
    if (action) {
      action();
    } else {
      setError(null);
      setRetryAction(null);
    }
  };

  const handleCancel = () => {
    setError(null);
    setRetryAction(null);
  };

  return (
    <ErrorBottomSheet
      visible={error != null}
      variant={isNetworkError ? 'network' : 'generic'}
      message={error ?? undefined}
      errorCode={errorCode}
      onRetry={handleRetry}
      onCancel={handleCancel}
    />
  );
};

export default GlobalErrorSheet;

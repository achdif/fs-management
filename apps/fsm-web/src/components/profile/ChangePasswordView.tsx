import AuthGate from '../AuthGate';
import ChangePasswordForm from '../auth/ChangePasswordForm';

export default function ChangePasswordView() {
  return (
    <AuthGate>
      <div className="flex flex-1 flex-col px-5 pt-2">
        <ChangePasswordForm />
      </div>
    </AuthGate>
  );
}

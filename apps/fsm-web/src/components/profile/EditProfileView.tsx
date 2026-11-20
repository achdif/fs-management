import { useState } from 'react';
import { useAuth } from '@fs-management/auth';
import AuthGate from '../AuthGate';
import Input from '../ui/Input';
import Button from '../ui/Button';

function EditProfileContent() {
  const { user } = useAuth();
  const [fullName, setFullName] = useState(user?.fullName ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [saved, setSaved] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    // Belum ada endpoint update profile di backend — simpan lokal saja.
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <form onSubmit={submit} className="flex flex-1 flex-col px-5 pb-8">
      <header className="pt-6">
        <h1 className="text-[24px] font-bold text-ink">Edit Profile</h1>
        <p className="mt-1 text-[13px] text-muted">Update your personal information</p>
      </header>

      <div className="mt-6 flex flex-col gap-4">
        <Input label="Full Name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
        <Input label="Email" type="email" value={user?.email ?? ''} disabled />
        <Input label="Phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
      </div>

      {saved && (
        <p className="mt-4 rounded-xl bg-green-tint px-4 py-3 text-center text-[13px] font-medium text-ink">
          Profile updated locally (backend endpoint coming soon)
        </p>
      )}

      <div className="mt-auto pt-8">
        <Button type="submit">Save Changes</Button>
      </div>
    </form>
  );
}

export default function EditProfileView() {
  return (
    <AuthGate>
      <EditProfileContent />
    </AuthGate>
  );
}

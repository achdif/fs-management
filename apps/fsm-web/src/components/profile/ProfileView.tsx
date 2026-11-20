import { useAuth } from '@fs-management/auth';
import AuthGate from '../AuthGate';
import Button from '../ui/Button';

function ProfileContent() {
  const { user, logout, isLoading } = useAuth();

  const handleLogout = async () => {
    await logout();
    window.location.href = '/login';
  };

  const initials = (user?.fullName || user?.email || '?')
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const menu = [
    { label: 'Edit Profile', href: '/profile/edit', icon: '✏️' },
    { label: 'Change Password', href: '/change-password', icon: '🔒' },
    { label: 'Notifications', href: '#', icon: '🔔' },
    { label: 'Help & Support', href: '#', icon: '❓' },
  ];

  return (
    <div className="flex flex-1 flex-col px-5 pb-8">
      <header className="pt-6">
        <h1 className="text-[24px] font-bold text-ink">Profile</h1>
      </header>

      {/* User card */}
      <div className="mt-5 flex items-center gap-4 rounded-2xl bg-white p-5 shadow-sm">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-[20px] font-bold text-white">
          {initials}
        </div>
        <div className="min-w-0">
          <p className="truncate text-[17px] font-bold text-ink">
            {user?.fullName || 'User'}
          </p>
          <p className="truncate text-[13px] text-subtle">{user?.email}</p>
          {user?.phone && <p className="text-[13px] text-subtle">{user.phone}</p>}
        </div>
      </div>

      {/* Menu */}
      <div className="mt-5 overflow-hidden rounded-2xl bg-white shadow-sm">
        {menu.map((item, i) => (
          <a
            key={item.label}
            href={item.href}
            className={`flex items-center gap-3 px-5 py-4 ${
              i > 0 ? 'border-t border-line' : ''
            }`}
          >
            <span className="text-[18px]">{item.icon}</span>
            <span className="flex-1 text-[15px] font-medium text-ink">{item.label}</span>
            <span className="text-muted">›</span>
          </a>
        ))}
      </div>

      <div className="mt-auto pt-8">
        <Button variant="danger" onClick={handleLogout} disabled={isLoading}>
          {isLoading ? 'Signing out…' : 'Log Out'}
        </Button>
      </div>
    </div>
  );
}

export default function ProfileView() {
  return (
    <AuthGate>
      <ProfileContent />
    </AuthGate>
  );
}

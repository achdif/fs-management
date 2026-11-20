import AuthGate from '../AuthGate';

export default function HomeView() {
  return (
    <AuthGate>
      <div className="flex flex-1 flex-col">
        {/* Header */}
        <header className="flex items-center justify-between px-5 pt-6">
          <div>
            <p className="text-[13px] text-subtle">Good morning,</p>
            <h1 className="text-[22px] font-bold text-ink-2">John Doe</h1>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary text-[15px] font-bold text-white">
            JD
          </div>
        </header>

        {/* Stats */}
        <section className="mt-5 grid grid-cols-2 gap-3 px-5">
          <div className="rounded-2xl bg-white p-4 shadow-sm">
            <p className="text-[12px] text-subtle">Today's Jobs</p>
            <p className="mt-1 text-[24px] font-bold text-ink">8</p>
          </div>
          <div className="rounded-2xl bg-white p-4 shadow-sm">
            <p className="text-[12px] text-subtle">Completed</p>
            <p className="mt-1 text-[24px] font-bold text-primary">5</p>
          </div>
        </section>

        {/* Quick actions */}
        <section className="mt-6 px-5">
          <h2 className="text-[16px] font-bold text-ink-2">Quick Actions</h2>
          <div className="mt-3 grid grid-cols-4 gap-3">
            {[
              { label: 'Schedule', bg: 'bg-blue-tint', icon: '📅' },
              { label: 'Clients', bg: 'bg-green-tint', icon: '👥' },
              { label: 'Reports', bg: 'bg-[#fef3c7]', icon: '📊' },
              { label: 'More', bg: 'bg-surface', icon: '⋯' },
            ].map((a) => (
              <button
                key={a.label}
                className={`flex flex-col items-center gap-2 rounded-2xl ${a.bg} py-4`}
              >
                <span className="text-[22px]">{a.icon}</span>
                <span className="text-[11px] font-medium text-ink">{a.label}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Job list */}
        <section className="mt-6 flex-1 px-5 pb-8">
          <h2 className="text-[16px] font-bold text-ink-2">Upcoming Jobs</h2>
          <div className="mt-3 flex flex-col gap-3">
            {[
              { title: 'AC Maintenance', client: 'PT Maju Jaya', time: '09:00 AM', status: 'Scheduled' },
              { title: 'Plumbing Repair', client: 'CV Sejahtera', time: '11:30 AM', status: 'In Progress' },
              { title: 'Electrical Check', client: 'UD Barokah', time: '02:00 PM', status: 'Scheduled' },
            ].map((job) => (
              <div key={job.title} className="rounded-2xl bg-white p-4 shadow-sm">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[15px] font-semibold text-ink">{job.title}</p>
                    <p className="mt-0.5 text-[13px] text-subtle">{job.client}</p>
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                      job.status === 'In Progress'
                        ? 'bg-blue-tint text-primary'
                        : 'bg-surface text-subtle'
                    }`}
                  >
                    {job.status}
                  </span>
                </div>
                <p className="mt-3 text-[12px] text-muted">🕐 {job.time}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </AuthGate>
  );
}

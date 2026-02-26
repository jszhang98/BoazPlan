import { Link } from 'react-router-dom';

const features = [
  {
    icon: '🙏',
    title: 'Prayer Requests',
    description: 'Share needs with your congregation privately or publicly, and receive coordinated support from your community.',
  },
  {
    icon: '🤝',
    title: 'Mutual Aid Coordination',
    description: 'Match practical needs — meals, transport, childcare — with willing volunteers in a few clicks.',
  },
  {
    icon: '📋',
    title: 'Volunteer Management',
    description: 'Track who is helping with what, set urgency levels, and celebrate completed acts of service.',
  },
  {
    icon: '🔒',
    title: 'Private & Secure',
    description: 'Built-in anonymity options, rate limiting, and security headers keep your community\'s data safe.',
  },
];

const steps = [
  { step: '1', label: 'Register your church' },
  { step: '2', label: 'Invite your congregation' },
  { step: '3', label: 'Post and fulfil needs together' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <header className="border-b border-gray-100 bg-white/80 backdrop-blur sticky top-0 z-30">
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
          <span className="text-xl font-bold text-brand-600">BoazPlan</span>
          <nav className="flex items-center gap-4">
            <Link to="/register" className="text-sm text-gray-600 hover:text-brand-600 transition-colors">
              Sign up
            </Link>
            <Link to="/churches/new" className="btn-primary text-sm py-1.5 px-4">
              Register Church
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-4xl px-4 py-24 text-center">
        <h1 className="text-5xl font-extrabold tracking-tight text-gray-900 sm:text-6xl">
          Church mutual aid,{' '}
          <span className="text-brand-600">beautifully coordinated</span>
        </h1>
        <p className="mt-6 text-xl leading-8 text-gray-600 max-w-2xl mx-auto">
          BoazPlan helps congregations share prayer requests, organise practical help, and mobilise volunteers — all in one private, secure space.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/register" className="btn-primary text-base px-8 py-3">
            Join as a Member
          </Link>
          <Link to="/churches/new" className="btn-secondary text-base px-8 py-3">
            Register Your Church
          </Link>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-brand-600 py-16">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-10">Get started in minutes</h2>
          <div className="grid sm:grid-cols-3 gap-8">
            {steps.map(({ step, label }) => (
              <div key={step} className="flex flex-col items-center gap-3">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-brand-600 text-xl font-extrabold">
                  {step}
                </span>
                <p className="text-white font-medium">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-4 py-20">
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
          Everything your community needs
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map(({ icon, title, description }) => (
            <div key={title} className="card p-6 flex flex-col gap-3">
              <span className="text-3xl">{icon}</span>
              <h3 className="font-semibold text-gray-900">{title}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Banner */}
      <section className="bg-gray-50 py-16 text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Ready to strengthen your congregation?
        </h2>
        <p className="text-gray-600 mb-8 max-w-xl mx-auto">
          Free to use. No credit card required. Set up in under five minutes.
        </p>
        <Link to="/register" className="btn-primary text-base px-10 py-3">
          Get started free
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8 text-center text-sm text-gray-400">
        <p>© {new Date().getFullYear()} BoazPlan. Built with care for the church.</p>
      </footer>
    </div>
  );
}

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createChurch } from '../services/churches';

function slugify(name) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export default function CreateChurch() {
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [slugEdited, setSlugEdited] = useState(false);
  const [location, setLocation] = useState('');
  const [privacyMode, setPrivacyMode] = useState('open');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [created, setCreated] = useState(null);

  const handleNameChange = (e) => {
    const val = e.target.value;
    setName(val);
    if (!slugEdited) {
      setSlug(slugify(val));
    }
  };

  const handleSlugChange = (e) => {
    setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''));
    setSlugEdited(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const church = await createChurch({ name, slug, location, privacyMode });
      setCreated(church);
    } catch (err) {
      setError(err.message || 'Failed to create church.');
    } finally {
      setLoading(false);
    }
  };

  if (created) {
    return (
      <div className="max-w-lg mx-auto">
        <div className="card text-center space-y-4">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900">Church created!</h2>
          <p className="text-sm text-gray-500">
            <span className="font-medium">{created.name}</span> is ready.
            Your church URL handle is{' '}
            <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded text-brand-700">
              {created.slug}
            </span>
          </p>
          <div className="flex gap-3 justify-center">
            <Link to="/" className="btn-secondary">Go to Home</Link>
            <Link to={`/churches/${created.id}/members`} className="btn-primary">Manage Members</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto">
      <div className="card">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Register your Church</h1>
          <p className="mt-1 text-sm text-gray-500">
            Set up your church's digital space on BoazPlan.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Church Name */}
          <div>
            <label htmlFor="church-name" className="form-label">
              Church name <span className="text-red-500">*</span>
            </label>
            <input
              id="church-name"
              type="text"
              className="input-field"
              placeholder="e.g. Grace Chapel"
              value={name}
              onChange={handleNameChange}
              required
            />
          </div>

          {/* Slug */}
          <div>
            <label htmlFor="church-slug" className="form-label">
              Church handle
              <span className="ml-1 text-xs font-normal text-gray-400">(URL identifier)</span>
            </label>
            <div className="flex items-center rounded-lg border border-gray-300 bg-white shadow-sm focus-within:border-brand-500 focus-within:ring-1 focus-within:ring-brand-500">
              <span className="pl-3 pr-1 text-sm text-gray-400 select-none">boazplan.app/</span>
              <input
                id="church-slug"
                type="text"
                className="flex-1 rounded-r-lg border-0 py-2 pr-3 text-sm focus:outline-none focus:ring-0"
                placeholder="grace-chapel"
                value={slug}
                onChange={handleSlugChange}
                pattern="[a-z0-9-]+"
                title="Only lowercase letters, numbers and hyphens"
                required
              />
            </div>
          </div>

          {/* Location */}
          <div>
            <label htmlFor="church-location" className="form-label">Location</label>
            <input
              id="church-location"
              type="text"
              className="input-field"
              placeholder="City, State or Country"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>

          {/* Privacy Mode */}
          <div>
            <label className="form-label">Privacy mode</label>
            <div className="mt-1 grid grid-cols-2 gap-3">
              {[
                { value: 'open', label: 'Open', desc: 'Trusted members post freely' },
                { value: 'strict', label: 'Strict', desc: 'All posts require pastor approval' },
              ].map((opt) => (
                <label
                  key={opt.value}
                  className={`relative flex cursor-pointer rounded-lg border p-4 transition-colors ${
                    privacyMode === opt.value
                      ? 'border-brand-600 bg-brand-50 ring-1 ring-brand-600'
                      : 'border-gray-200 bg-white hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="privacyMode"
                    value={opt.value}
                    checked={privacyMode === opt.value}
                    onChange={() => setPrivacyMode(opt.value)}
                    className="sr-only"
                  />
                  <div>
                    <p className={`text-sm font-semibold ${privacyMode === opt.value ? 'text-brand-700' : 'text-gray-900'}`}>
                      {opt.label}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">{opt.desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Creating church...' : 'Create church'}
          </button>
        </form>
      </div>
    </div>
  );
}

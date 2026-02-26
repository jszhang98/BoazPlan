import React from 'react';
import { Link } from 'react-router-dom';
import RequestFeed from '../features/requests/RequestFeed';

export default function RequestFeedPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Request Feed</h1>
          <p className="mt-1 text-sm text-gray-500">Browse and filter all community prayer requests.</p>
        </div>
        <Link to="/" className="btn-primary text-sm">
          + Post a request
        </Link>
      </div>

      <RequestFeed />
    </div>
  );
}

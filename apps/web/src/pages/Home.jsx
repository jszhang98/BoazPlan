import React, { useState } from 'react';
import NewRequest from '../features/requests/NewRequest';
import RequestFeed from '../features/requests/RequestFeed';

export default function Home() {
  const [feedKey, setFeedKey] = useState(0);

  // Increment feedKey to force RequestFeed to reload after new post
  const handleCreated = () => setFeedKey((k) => k + 1);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Community Requests</h1>
        <p className="mt-1 text-sm text-gray-500">Share a need or prayer request with your church community.</p>
      </div>

      <NewRequest onCreated={handleCreated} />

      <section>
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Recent Requests</h2>
        <RequestFeed key={feedKey} />
      </section>
    </div>
  );
}

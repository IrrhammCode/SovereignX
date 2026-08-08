'use client';

import { useEffect, useState } from 'react';
import { fetchMagiclink } from '@/lib/api';

export function EnrollmentPanel() {
  const [url, setUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMagiclink()
      .then((r) => (r.url ? setUrl(r.url) : setError(r.error ?? 'Unavailable')))
      .catch(() => setError('API offline'));
  }, []);

  return (
    <div className="vault-panel p-5">
      <h2 className="mb-3 text-sm font-medium uppercase tracking-wider text-sovereign-green">
        CVI Enrollment
      </h2>
      <p className="text-xs text-gray-400">
        Step 1: Enroll A-Pass via Cleanverse magiclink. Step 2: Sync CVI on-chain before transfer.
      </p>
      {url ? (
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          data-verified-action
          className="mt-3 block rounded-xl bg-sovereign-blue px-4 py-2.5 text-center text-sm text-sovereign-glow ring-1 ring-sovereign-green/30 hover:ring-sovereign-green"
        >
          Open A-Pass Enrollment →
        </a>
      ) : (
        <p className="mt-3 text-xs text-gray-500">{error ?? 'Loading magiclink…'}</p>
      )}
    </div>
  );
}

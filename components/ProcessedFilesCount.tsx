'use client';

import { useEffect, useState } from 'react';

/**
 * ProcessedFilesCount
 *
 * Fetches the global file-processed count from /api/counter and renders it
 * as an animated number. Falls back to 0 while loading.
 */
export default function ProcessedFilesCount() {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    fetch('/api/counter')
      .then((r) => r.json())
      .then((data) => setCount(data.count ?? 0))
      .catch(() => setCount(0));
  }, []);

  const display = count === null ? '…' : formatCount(count);

  return (
    <div className="hp-stat-card" id="stat-files-processed">
      <div className="hp-stat-value">{display}</div>
      <div className="hp-stat-label">Files Processed</div>
    </div>
  );
}

/** Format large numbers nicely: 1200 → 1.2K, 1500000 → 1.5M */
function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M+`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(1)}K+`;
  return n.toString();
}

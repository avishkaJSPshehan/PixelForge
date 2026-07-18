/**
 * app/api/counter/route.ts
 *
 * Persistent global file-processed counter.
 *
 * GET  /api/counter  → { count: number }
 * POST /api/counter  → increments by 1 and returns { count: number }
 *
 * The count is stored in `data/counter.json` at the project root.
 * This file is created automatically on first use.
 *
 * Works on any Node.js host (VPS, Railway, Render, etc.).
 * For Vercel (serverless / ephemeral filesystem) replace the fs logic
 * with Vercel KV or Upstash Redis — the API surface stays identical.
 */

import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';

const DATA_DIR  = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'counter.json');

function readCount(): number {
  try {
    if (!fs.existsSync(DATA_FILE)) return 0;
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(raw).count ?? 0;
  } catch {
    return 0;
  }
}

function writeCount(n: number): void {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(DATA_FILE, JSON.stringify({ count: n }), 'utf8');
}

export async function GET() {
  return NextResponse.json({ count: readCount() });
}

export async function POST() {
  const next = readCount() + 1;
  writeCount(next);
  return NextResponse.json({ count: next });
}

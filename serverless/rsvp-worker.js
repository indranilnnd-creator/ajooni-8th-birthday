/**
 * Ajooni RSVP → Git worker
 * ---------------------------------------------------------------------------
 * Appends each RSVP to `rsvps.json` in your GitHub repo. That committed file
 * IS the report — `git pull` (or open the in-app "RSVPs" list) and read it.
 * Runs serverless; the public site never sees your GitHub token.
 *
 * ── Deploy on Cloudflare Workers (free) ────────────────────────────────────
 *   1. dash.cloudflare.com → Workers & Pages → Create → Worker → paste this file.
 *   2. Settings → Variables and Secrets → add:
 *        GITHUB_TOKEN   = fine-grained PAT with "Contents: Read and write" on the repo
 *        GITHUB_REPO    = indranilnnd-creator/ajooni-8th-birthday
 *        RSVP_SECRET    = any long random string (paste the same one in main.js)
 *        GITHUB_BRANCH  = main                    (optional)
 *        RSVP_PATH      = rsvps.json              (optional)
 *        ALLOWED_ORIGIN = https://indranilnnd-creator.github.io   (optional; default *)
 *   3. Deploy → copy the Worker URL into main.js → RSVP_REPO.endpoint
 *      and the same RSVP_SECRET into RSVP_REPO.secret.
 *
 *   The same handle() logic drops into a Vercel function if you prefer —
 *   export default async (req, res) => { const r = await handle(req.body, process.env); ... }
 */

const json = (obj, status, cors) =>
  new Response(JSON.stringify(obj), {
    status,
    headers: { 'Content-Type': 'application/json', ...cors }
  });

function b64Decode(b64) {
  const bin = atob(String(b64).replace(/\s/g, ''));
  const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

function b64Encode(str) {
  const bytes = new TextEncoder().encode(str);
  let bin = '';
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin);
}

const clean = (v, max = 400) => String(v == null ? '' : v).slice(0, max);

async function handle(body, env) {
  if (!env.RSVP_SECRET || body.secret !== env.RSVP_SECRET) {
    return { status: 401, obj: { ok: false, error: 'Unauthorized' } };
  }

  const name = clean(body.name, 120);
  if (!name) return { status: 400, obj: { ok: false, error: 'Name required' } };

  const record = {
    id: Number(body.id) || Date.now(),
    date: clean(body.date, 60),
    name,
    status: clean(body.status, 40),
    guests: clean(body.guests, 20),
    // phone is intentionally NOT stored — the repo is public
    message: clean(body.message, 600),
    submittedAt: new Date().toISOString()
  };

  const repo = env.GITHUB_REPO;
  const path = env.RSVP_PATH || 'rsvps.json';
  const branch = env.GITHUB_BRANCH || 'main';
  if (!repo || !env.GITHUB_TOKEN) {
    return { status: 500, obj: { ok: false, error: 'Worker not configured' } };
  }

  const api = `https://api.github.com/repos/${repo}/contents/${path}`;
  const gh = {
    Authorization: `token ${env.GITHUB_TOKEN}`,
    Accept: 'application/vnd.github+json',
    'User-Agent': 'ajooni-rsvp-worker'
  };

  // Retry once if another RSVP committed between our read and write.
  for (let attempt = 0; attempt < 2; attempt++) {
    let list = [];
    let sha;

    const getRes = await fetch(`${api}?ref=${encodeURIComponent(branch)}`, { headers: gh });
    if (getRes.status === 200) {
      const data = await getRes.json();
      sha = data.sha;
      try {
        const parsed = JSON.parse(b64Decode(data.content));
        if (Array.isArray(parsed)) list = parsed;
      } catch { list = []; }
    } else if (getRes.status !== 404) {
      return { status: 502, obj: { ok: false, error: 'GitHub read failed', status: getRes.status } };
    }

    list.unshift(record);

    const putRes = await fetch(api, {
      method: 'PUT',
      headers: { ...gh, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: `RSVP: ${record.name} (${record.status}, ${record.guests})`,
        content: b64Encode(JSON.stringify(list, null, 2) + '\n'),
        branch,
        ...(sha ? { sha } : {})
      })
    });

    if (putRes.ok) return { status: 200, obj: { ok: true, count: list.length } };

    if (putRes.status === 409 || putRes.status === 422) {
      await new Promise((r) => setTimeout(r, 350));
      continue; // re-read and retry
    }

    const detail = await putRes.text().catch(() => '');
    return {
      status: 502,
      obj: { ok: false, error: 'GitHub write failed', status: putRes.status, detail: detail.slice(0, 300) }
    };
  }

  return { status: 409, obj: { ok: false, error: 'Conflict, please retry' } };
}

export default {
  async fetch(request, env) {
    const cors = {
      'Access-Control-Allow-Origin': env.ALLOWED_ORIGIN || '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    };

    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
    if (request.method !== 'POST') return json({ ok: false, error: 'Method not allowed' }, 405, cors);

    let body;
    try {
      body = await request.json();
    } catch {
      return json({ ok: false, error: 'Invalid JSON' }, 400, cors);
    }

    const { status, obj } = await handle(body, env);
    return json(obj, status, cors);
  }
};

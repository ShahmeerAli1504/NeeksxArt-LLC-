// Serves the print templates in /print-templates to logged-in staff only.
// /api/admin/templates/<file>            → download
// /api/admin/templates/<file>?inline=1   → show in the browser (used for previews)
import { readFile } from 'node:fs/promises';
import { join, extname } from 'node:path';
import { isAdmin } from '@/lib/admin-auth';
import { TEMPLATE_FILES } from '@/lib/print-templates';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const DIR = join(process.cwd(), 'print-templates');
const TYPES = { '.pdf': 'application/pdf', '.png': 'image/png', '.svg': 'image/svg+xml' };

export async function GET(req, { params }) {
  if (!(await isAdmin())) return new Response('Unauthorized', { status: 401 });

  const { file } = await params;
  const name = decodeURIComponent(file || '');
  if (!TEMPLATE_FILES.has(name)) return new Response('Not found', { status: 404 });

  let data;
  try { data = await readFile(join(DIR, name)); } catch { return new Response('Not found', { status: 404 }); }

  const inline = new URL(req.url).searchParams.has('inline');
  return new Response(data, {
    headers: {
      'Content-Type': TYPES[extname(name).toLowerCase()] || 'application/octet-stream',
      'Content-Length': String(data.length),
      'Content-Disposition': `${inline ? 'inline' : 'attachment'}; filename="${name}"`,
      'Cache-Control': 'private, max-age=300',
      'X-Content-Type-Options': 'nosniff'
    }
  });
}

import { Fragment } from 'react';
import { requireAdmin } from '@/lib/admin-auth';
import { PRINT_TEMPLATES } from '@/lib/print-templates';
import AdminNav from '@/components/admin/AdminNav';

export const dynamic = 'force-dynamic';

const url = (file, inline) => `/api/admin/templates/${encodeURIComponent(file)}${inline ? '?inline=1' : ''}`;

export default async function TemplatesPage() {
  await requireAdmin();

  return (
    <>
      <AdminNav active="templates" />
      <div className="adm-wrap">
        <div className="adm-head">
          <div>
            <h1>Print templates</h1>
            <p>Blank, exact-size sheets for the press. Download, drop the customer&apos;s art in, print.</p>
          </div>
        </div>

        <div className="adm-tpl-tips">
          <b>Print at 100% / &ldquo;Actual size&rdquo;</b> on Letter paper — never &ldquo;Fit to page&rdquo;. Each sheet has a
          1&nbsp;inch check bar in the margin: measure it after the first print to confirm the size is right.
          In Canva, create a custom design of <b>8.5 × 11 in</b> and upload the PNG as the background, or use the
          single artboard to design one piece and repeat it.
        </div>

        <div className="adm-tpl-grid">
          {PRINT_TEMPLATES.map(t => (
            <article key={t.id} className="adm-card adm-tpl">
              <a href={url(t.preview, true)} target="_blank" rel="noopener" className="adm-tpl-prev">
                <img src={url(t.preview, true)} alt={`${t.name} template preview`} loading="lazy" />
              </a>
              <div>
                <h2>{t.name}</h2>
                <p className="adm-tpl-sheet">{t.sheet}</p>
              </div>
              <dl>
                {t.specs.map(([k, v]) => (<Fragment key={k}><dt>{k}</dt><dd>{v}</dd></Fragment>))}
              </dl>
              <div className="adm-tpl-dl">
                {t.files.map(f => (
                  <a key={f.file} href={url(f.file)} download={f.file}>
                    <span>{f.label}</span><small>{f.note}</small>
                  </a>
                ))}
              </div>
            </article>
          ))}
        </div>
      </div>
    </>
  );
}

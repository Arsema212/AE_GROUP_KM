/**
 * Split auth layout: visual half + form half (stacks on small screens).
 * Hero uses a cover image with brand overlay — swap IMAGE_SRC for your own asset in /public.
 */
const IMAGE_SRC =
  'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1600&q=80';

export function AuthSplitLayout({ children, eyebrow, title, formSide = 'right' }) {
  const visualFirst = formSide === 'right';

  const visualPanel = (
    <div
      className={`relative min-h-[38vh] overflow-hidden lg:min-h-screen lg:w-1/2 ${
        visualFirst ? 'lg:order-1' : 'lg:order-2'
      }`}
    >
      <img
        src={IMAGE_SRC}
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
        loading="eager"
      />
      <div
        className="absolute inset-0 bg-gradient-to-br from-indigo-950/92 via-violet-900/75 to-cyan-950/85 mix-blend-multiply"
        aria-hidden
      />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_70%_20%,rgba(99,102,241,0.35),transparent)]" />
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.04\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-90" />

      <div className="relative z-10 flex h-full min-h-[38vh] flex-col justify-between p-8 sm:p-10 lg:min-h-screen lg:p-14">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-indigo-200/90">AE Trade Group</p>
          <h1 className="mt-4 max-w-md text-3xl font-semibold leading-tight tracking-tight text-white sm:text-4xl">
            Knowledge that moves with your team.
          </h1>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-indigo-100/85">
            Secure access to lessons, documents, and discussions — one place for how your org works.
          </p>
        </div>
        <div className="mt-8 flex flex-wrap gap-6 border-t border-white/10 pt-8 text-xs text-indigo-200/80 lg:mt-0">
          <div>
            <div className="font-semibold text-white">Repository</div>
            <div className="mt-1 opacity-90">SOPs &amp; assets</div>
          </div>
          <div>
            <div className="font-semibold text-white">Discussions</div>
            <div className="mt-1 opacity-90">Ideas &amp; memes</div>
          </div>
          <div>
            <div className="font-semibold text-white">Roles</div>
            <div className="mt-1 opacity-90">Staff · Manager · Admin</div>
          </div>
        </div>
      </div>
    </div>
  );

  const formPanel = (
    <div
      className={`flex min-h-[62vh] flex-col justify-center bg-slate-50 px-6 py-10 sm:px-10 lg:min-h-screen lg:w-1/2 lg:px-14 lg:py-12 ${
        visualFirst ? 'lg:order-2' : 'lg:order-1'
      }`}
    >
      <div className="mx-auto w-full max-w-md">
        {eyebrow && (
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-600/90">{eyebrow}</p>
        )}
        {title && <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">{title}</h2>}
        <div className="mt-8">{children}</div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="flex min-h-screen flex-col lg:flex-row">{visualPanel}{formPanel}</div>
    </div>
  );
}

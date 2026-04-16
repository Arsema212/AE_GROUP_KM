/** Hero: modern workspace / collaboration (Unsplash — replace with your own asset anytime). */
const AUTH_HERO_IMAGE =
  'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=2000&q=85';

function AuthLayout({ children }) {
  return (
    <div className="grid min-h-dvh w-full grid-cols-1 grid-rows-[minmax(200px,28vh)_1fr] lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:grid-rows-1">
      <aside className="relative min-h-[200px] overflow-hidden lg:min-h-dvh">
        <img
          src={AUTH_HERO_IMAGE}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
          loading="eager"
          decoding="async"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/85 via-violet-900/55 to-fuchsia-900/45" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.12),transparent_50%)]" />
        <div className="relative z-10 flex h-full min-h-[200px] flex-col justify-between p-6 text-white lg:min-h-dvh lg:p-12 xl:p-14">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/15 text-sm font-bold tracking-tight text-white ring-1 ring-white/25 backdrop-blur-sm">
              AE
            </div>
            <div>
              <div className="font-display text-lg font-semibold tracking-tight">AE Trade Group</div>
              <div className="text-xs font-medium uppercase tracking-[0.2em] text-indigo-100/90">Knowledge · Trade · Operations</div>
            </div>
          </div>
          <div className="max-w-md pb-2 lg:pb-0">
            <p className="font-display text-2xl font-semibold leading-tight tracking-tight text-white lg:text-3xl xl:text-4xl">
              Knowledge that moves with the trade.
            </p>
          </div>
        </div>
      </aside>

      <main className="flex flex-col justify-center bg-gradient-to-b from-slate-100 via-slate-50 to-white px-4 py-10 sm:px-8 lg:px-12 lg:py-12">
        <div className="mx-auto w-full max-w-lg rounded-3xl border border-slate-200/90 bg-white/95 p-8 shadow-[0_25px_80px_-20px_rgba(15,23,42,0.18)] ring-1 ring-slate-900/5 backdrop-blur-sm sm:p-10 lg:max-w-xl lg:p-12">
          {children}
        </div>
      </main>
    </div>
  );
}

export default AuthLayout;

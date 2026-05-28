"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  Bell,
  CalendarClock,
  Clock3,
  HeartPulse,
  Moon,
  ShieldCheck,
  Smartphone,
  Stethoscope,
  Sun,
  UserRound,
} from "lucide-react";

type QuoteStatus = "Caso Abierto" | "En Consulta" | "Finalizado";

type Quote = {
  id: string;
  patient: string;
  consultant: string;
  phone: string;
  status: QuoteStatus;
  openedAt: number;
  limitMinutes: number;
};

const initialQuotes: Quote[] = [
  {
    id: "Q-1042",
    patient: "María López",
    consultant: "Dr. Ana Ruiz",
    phone: "+57 300 555 0142",
    status: "Caso Abierto",
    openedAt: Date.now() - 22 * 60 * 1000,
    limitMinutes: 15,
  },
  {
    id: "Q-1048",
    patient: "Carlos Mena",
    consultant: "Dra. Valeria Torres",
    phone: "+57 310 555 0187",
    status: "En Consulta",
    openedAt: Date.now() - 18 * 60 * 1000,
    limitMinutes: 30,
  },
  {
    id: "Q-1051",
    patient: "Sofía Gómez",
    consultant: "Dr. Luis Ortega",
    phone: "+57 320 555 0111",
    status: "Finalizado",
    openedAt: Date.now() - 9 * 60 * 1000,
    limitMinutes: 15,
  },
];

function formatElapsed(ms: number) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (totalSeconds % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
}

function getStatusTone(status: QuoteStatus) {
  switch (status) {
    case "Caso Abierto":
      return "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-100";
    case "En Consulta":
      return "border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-500/30 dark:bg-sky-500/10 dark:text-sky-100";
    default:
      return "border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-500/30 dark:bg-violet-500/10 dark:text-violet-100";
  }
}

const profiles = [
  {
    id: "gerente",
    label: "Jefe / Gerente",
    badge: "Supervisor",
    summary: "Monitorea SLA, alertas y cumplimiento de tiempos del día.",
    accent: "border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-500/30 dark:bg-sky-500/10 dark:text-sky-100",
    icon: ShieldCheck,
  },
  {
    id: "consultor",
    label: "Consultor",
    badge: "Atención médica",
    summary: "Prioriza cotizaciones pendientes y avanza el estado de cada caso.",
    accent: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-100",
    icon: Stethoscope,
  },
  {
    id: "cotizador",
    label: "Cotizador",
    badge: "Solicitante",
    summary: "Visualiza el estado de su cotización y el tiempo de respuesta estimado.",
    accent: "border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-500/30 dark:bg-violet-500/10 dark:text-violet-100",
    icon: UserRound,
  },
] as const;

export default function Home() {
  const [quotes, setQuotes] = useState<Quote[]>(initialQuotes);
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    if (typeof window === "undefined") return "light";

    const savedTheme = window.localStorage.getItem("healthops-theme");
    if (savedTheme === "light" || savedTheme === "dark") return savedTheme;

    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  });
  const [limitMinutes, setLimitMinutes] = useState(15);
  const [now, setNow] = useState(0);
  const [activeProfile, setActiveProfile] = useState<(typeof profiles)[number]["id"]>("gerente");

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    window.localStorage.setItem("healthops-theme", theme);
  }, [theme]);

  useEffect(() => {
    const initialTimer = window.setTimeout(() => setNow(Date.now()), 0);
    const interval = window.setInterval(() => setNow(Date.now()), 1000);
    return () => {
      window.clearTimeout(initialTimer);
      window.clearInterval(interval);
    };
  }, []);

  const visibleQuotes = useMemo(
    () => quotes.map((quote) => ({ ...quote, limitMinutes })),
    [limitMinutes, quotes],
  );

  const metrics = useMemo(() => {
    const openCount = visibleQuotes.filter((quote) => quote.status === "Caso Abierto").length;
    const inConsultationCount = visibleQuotes.filter((quote) => quote.status === "En Consulta").length;
    const overdue = visibleQuotes.filter((quote) => quote.status !== "Finalizado" && now - quote.openedAt > quote.limitMinutes * 60 * 1000);

    return { openCount, inConsultationCount, overdueCount: overdue.length, finishedCount: visibleQuotes.length - overdue.length - openCount - inConsultationCount };
  }, [now, visibleQuotes]);

  const handleAdvanceStatus = (id: string) => {
    setQuotes((current) =>
      current.map((quote) => {
        if (quote.id !== id) return quote;
        if (quote.status === "Caso Abierto") return { ...quote, status: "En Consulta" };
        if (quote.status === "En Consulta") return { ...quote, status: "Finalizado" };
        return quote;
      }),
    );
  };

  return (
    <main className="min-h-screen bg-[linear-gradient(135deg,#eff6ff_0%,#f8fbff_45%,#ecfdf5_100%)] text-slate-900 dark:bg-[linear-gradient(135deg,#07111f_0%,#111827_45%,#052e2b_100%)] dark:text-slate-100">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-6 md:px-6 lg:px-8">
        <header className="rounded-3xl border border-white/60 bg-white/80 p-6 shadow-xl shadow-slate-200/60 backdrop-blur dark:border-slate-800 dark:bg-slate-950/80 dark:shadow-black/30">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-100">
                <Stethoscope className="h-4 w-4" />
                HealthOps Monitor
              </div>
              <div>
                <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">Tablero inteligente de tiempos y alertas de salud</h1>
                <p className="mt-2 max-w-3xl text-slate-600 dark:text-slate-300">Monitorea cotizaciones médicas, visualiza tiempos de respuesta y activa alertas automáticas de demora para consultores y gerentes.</p>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/70">
              <p className="text-xs uppercase tracking-[0.25em] text-slate-500 dark:text-slate-300">Perfiles disponibles</p>
              <div className="mt-3 grid gap-3 md:grid-cols-3">
                {profiles.map((profile) => {
                  const Icon = profile.icon;
                  const isActive = activeProfile === profile.id;
                  return (
                    <button
                      key={profile.id}
                      type="button"
                      onClick={() => setActiveProfile(profile.id)}
                      className={`rounded-2xl border p-3 text-left transition ${isActive ? "border-sky-400 bg-sky-50 shadow-md dark:border-sky-500/50 dark:bg-sky-500/10" : "border-slate-200 bg-white hover:border-sky-200 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-950 dark:hover:border-sky-500/40 dark:hover:bg-slate-900"}`}
                    >
                      <div className="flex items-center gap-2 text-sm font-semibold">
                        <Icon className="h-4 w-4" />
                        {profile.label}
                      </div>
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-300">{profile.badge}</p>
                      <p className="mt-2 text-sm text-slate-600 dark:text-slate-200">{profile.summary}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50/80 p-3 dark:border-slate-800 dark:bg-slate-900/70">
              <button
                type="button"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:hover:bg-slate-800"
              >
                {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                {theme === "dark" ? "Modo claro" : "Modo oscuro"}
              </button>
              <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                <Clock3 className="h-4 w-4" />
                Límite
                <select
                  value={limitMinutes}
                  onChange={(event) => setLimitMinutes(Number(event.target.value))}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm outline-none transition focus:border-sky-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                >
                  <option value={15}>15 minutos</option>
                  <option value={30}>30 minutos</option>
                </select>
              </label>
            </div>
          </div>
        </header>

        <section className="grid gap-4 xl:grid-cols-[1fr_1fr_1fr_1fr] md:grid-cols-2">
          <article className="rounded-3xl border border-white/70 bg-white/85 p-5 shadow-lg shadow-slate-200/60 backdrop-blur dark:border-slate-800 dark:bg-slate-950/80 dark:shadow-black/30 xl:col-span-2">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-sky-700 dark:text-sky-200">Mi perfil</p>
                <h2 className="mt-1 text-2xl font-semibold">{profiles.find((item) => item.id === activeProfile)?.label}</h2>
                <p className="mt-2 max-w-2xl text-slate-600 dark:text-slate-300">{profiles.find((item) => item.id === activeProfile)?.summary}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100">
                <p className="text-xs uppercase tracking-[0.25em] text-slate-500 dark:text-slate-300">Rol asignado</p>
                <p className="mt-1 text-lg font-semibold">{profiles.find((item) => item.id === activeProfile)?.badge}</p>
                <p className="mt-2 text-slate-600 dark:text-slate-300">{activeProfile === "gerente" && "Revisa tiempos de respuesta, SLA y alertas de incumplimiento."}{activeProfile === "consultor" && "Gestiona cotizaciones pendientes y actualiza el estado de cada caso."}{activeProfile === "cotizador" && "Consulta seguimiento y estado de su solicitud de cotización."}</p>
              </div>
            </div>
          </article>
          {[
            { title: "Cotizaciones abiertas", value: metrics.openCount, icon: Activity, tone: "bg-sky-500/10 text-sky-700 dark:text-sky-100" },
            { title: "En consulta", value: metrics.inConsultationCount, icon: ShieldCheck, tone: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-100" },
            { title: "Alertas activas", value: metrics.overdueCount, icon: AlertTriangle, tone: "bg-rose-500/10 text-rose-700 dark:text-rose-100" },
            { title: "Finalizadas hoy", value: metrics.finishedCount, icon: CalendarClock, tone: "bg-violet-500/10 text-violet-700 dark:text-violet-100" },
          ].map((item) => (
            <article key={item.title} className="rounded-3xl border border-white/70 bg-white/85 p-5 shadow-lg shadow-slate-200/60 backdrop-blur dark:border-slate-800 dark:bg-slate-950/80 dark:shadow-black/30">
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-500 dark:text-slate-300">{item.title}</p>
                <item.icon className={`h-5 w-5 ${item.tone}`} />
              </div>
              <p className="mt-4 text-3xl font-semibold">{item.value}</p>
            </article>
          ))}
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <article className="rounded-3xl border border-white/70 bg-white/85 p-5 shadow-lg shadow-slate-200/60 backdrop-blur dark:border-slate-800 dark:bg-slate-950/80 dark:shadow-black/30">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.25em] text-sky-700 dark:text-sky-200">Jira style</p>
                <h2 className="text-xl font-semibold">Tablero de gestión del tiempo</h2>
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.15em] text-slate-600 dark:bg-slate-800 dark:text-slate-200">Kanban</span>
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
              {(["Caso Abierto", "En Consulta", "Finalizado"] as const).map((status) => (
                <div key={status} className="rounded-3xl border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/70">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-700 dark:text-slate-200">{status}</h3>
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600 shadow-sm dark:bg-slate-950 dark:text-slate-200">{visibleQuotes.filter((item) => item.status === status).length}</span>
                  </div>
                  <div className="space-y-4">
                    {visibleQuotes
                      .filter((item) => item.status === status)
                      .map((quote) => {
                        const elapsedMs = now - quote.openedAt;
                        const isOverdue = quote.status !== "Finalizado" && elapsedMs > quote.limitMinutes * 60 * 1000;
                        return (
                          <article key={quote.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-700 dark:bg-slate-950">
                            <div className="mb-3 flex items-start justify-between gap-3">
                              <div>
                                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{quote.patient}</p>
                                <p className="text-xs text-slate-500 dark:text-slate-300">{quote.id} · {quote.phone}</p>
                              </div>
                              <span className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${getStatusTone(quote.status)}`}>{quote.status}</span>
                            </div>
                            <p className="mb-3 text-sm text-slate-600 dark:text-slate-300">Consultor: {quote.consultant}</p>

                            <div className="rounded-2xl bg-slate-50 p-3 dark:bg-slate-900/70">
                              <div className="flex items-center justify-between text-xs uppercase tracking-[0.18em] text-slate-500 dark:text-slate-300">
                                <span>Tiempo transcurrido</span>
                                <span className={isOverdue ? "text-rose-600 dark:text-rose-200" : "text-emerald-600 dark:text-emerald-200"}>{isOverdue ? "Demora detectada" : "Dentro del límite"}</span>
                              </div>
                              <p className="mt-1 text-2xl font-semibold tabular-nums text-slate-900 dark:text-slate-100">{formatElapsed(elapsedMs)}</p>
                              <p className="mt-1 text-xs text-slate-500 dark:text-slate-300">Límite configurado: {quote.limitMinutes} min</p>
                            </div>

                            <div className="mt-4 flex items-center justify-between gap-2">
                              <button
                                type="button"
                                onClick={() => handleAdvanceStatus(quote.id)}
                                className="rounded-xl bg-sky-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-sky-500 disabled:cursor-not-allowed disabled:bg-slate-300 dark:bg-sky-500 dark:hover:bg-sky-400"
                                disabled={quote.status === "Finalizado"}
                              >
                                {quote.status === "Caso Abierto" ? "Pasar a consulta" : quote.status === "En Consulta" ? "Finalizar cotización" : "Completado"}
                              </button>
                              {isOverdue ? <span className="rounded-full bg-rose-100 px-2.5 py-1 text-[11px] font-semibold text-rose-700 dark:bg-rose-500/10 dark:text-rose-100">Alerta activa</span> : null}
                            </div>
                          </article>
                        );
                      })}
                  </div>
                </div>
              ))}
            </div>
          </article>

          <aside className="space-y-6">
            <article className="rounded-3xl border border-white/70 bg-white/85 p-5 shadow-lg shadow-slate-200/60 backdrop-blur dark:border-slate-800 dark:bg-slate-950/80 dark:shadow-black/30">
              <div className="mb-4 flex items-center gap-2 text-sky-700 dark:text-sky-200">
                <HeartPulse className="h-5 w-5" />
                <h2 className="text-xl font-semibold">Perfil activo: {profiles.find((item) => item.id === activeProfile)?.label}</h2>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-300">{profiles.find((item) => item.id === activeProfile)?.summary}</p>
              <div className="mt-4 rounded-2xl border border-sky-200 bg-sky-50 p-4 text-sm text-sky-800 dark:border-sky-500/30 dark:bg-sky-500/10 dark:text-sky-100">
                {activeProfile === "gerente" && "Vista del gerente: prioridad a alertas, SLA y cumplimiento del día."}
                {activeProfile === "consultor" && "Vista del consultor: acceso rápido a cotizaciones pendientes y avance del estado."}
                {activeProfile === "cotizador" && "Vista del cotizador: seguimiento del estado de su cotización y tiempo transcurrido."}
              </div>
            </article>

            <article className="rounded-3xl border border-white/70 bg-white/85 p-5 shadow-lg shadow-slate-200/60 backdrop-blur dark:border-slate-800 dark:bg-slate-950/80 dark:shadow-black/30">
              <div className="mb-4 flex items-center gap-2 text-sky-700 dark:text-sky-200">
                <Bell className="h-5 w-5" />
                <h2 className="text-xl font-semibold">Regla de automatización</h2>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-300">Cuando una cotización supera el límite configurado, el sistema marca la alerta y genera notificaciones automáticas para el consultor y el gerente.</p>
              <div className="mt-4 space-y-3 rounded-2xl bg-slate-50 p-4 dark:bg-slate-900/70">
                <div className="flex items-center justify-between rounded-2xl bg-white p-3 dark:bg-slate-950"><span>SMS</span><strong>En cola</strong></div>
                <div className="flex items-center justify-between rounded-2xl bg-white p-3 dark:bg-slate-950"><span>WhatsApp</span><strong>En cola</strong></div>
                <div className="rounded-2xl bg-emerald-50 p-3 text-sm text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-100">Mensaje enviado: “¡Atención! Tienes una cotización de salud pendiente…”.</div>
              </div>
            </article>

            <article className="rounded-3xl border border-white/70 bg-white/85 p-5 shadow-lg shadow-slate-200/60 backdrop-blur dark:border-slate-800 dark:bg-slate-950/80 dark:shadow-black/30">
              <div className="mb-4 flex items-center gap-2 text-emerald-700 dark:text-emerald-100">
                <Smartphone className="h-5 w-5" />
                <h2 className="text-xl font-semibold">Reportes del gerente</h2>
              </div>
              <ul className="space-y-3">
                {visibleQuotes
                  .filter((quote) => quote.status !== "Finalizado" && now - quote.openedAt > quote.limitMinutes * 60 * 1000)
                  .map((quote) => (
                    <li key={quote.id} className="rounded-2xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-100">
                      {quote.consultant} tiene {quote.id} en demora de {formatElapsed(now - quote.openedAt)}.
                    </li>
                  ))}
                {visibleQuotes.filter((quote) => quote.status !== "Finalizado" && now - quote.openedAt > quote.limitMinutes * 60 * 1000).length === 0 && (
                  <li className="rounded-2xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-100">No hay incumplimientos en este momento.</li>
                )}
              </ul>
            </article>
          </aside>
        </section>
      </section>
    </main>
  );
}

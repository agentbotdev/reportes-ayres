import {
  BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip, LabelList,
} from 'recharts';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, TrendingUp, Share2, Activity, Bug, UserCheck, ScrollText,
  CheckCircle2, AlertTriangle, XCircle, Wrench, Eye, Lightbulb, BedDouble, Hotel,
} from 'lucide-react';
import type { DayReport } from './types';
import { Card, KpiCard, SectionHeader, Badge, Bar as ProgressBar, sevTone, estadoTone } from './components/ui';

const C = { brand: '#6366F1', soft: '#818CF8', ok: '#16A34A', warn: '#EAB308', bad: '#EF4444', info: '#3B82F6', ink: '#0F172A', slate: '#94A3B8' };

function ChartTip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass rounded-xl px-3 py-2 text-xs shadow-lg">
      <div className="font-bold text-ink">{label ?? payload[0].name}</div>
      <div className="text-slatey font-semibold">{payload[0].value}</div>
    </div>
  );
}

/* ───────────── RESUMEN ───────────── */
export function Resumen({ r }: { r: DayReport }) {
  const hab = [
    { name: 'Master Suite', value: r.habitaciones.master },
    { name: 'Loft de Montaña', value: r.habitaciones.loft },
  ];
  return (
    <div className="space-y-6">
      <Card className="p-6 overflow-hidden relative">
        <div className="absolute -right-10 -top-10 w-44 h-44 rounded-full brand-gradient opacity-[0.07] blur-2xl" />
        <div className="flex items-center gap-2 mb-2">
          <Badge tone="brand">{r.titulo}</Badge>
          <span className="text-xs text-slatey font-semibold">{r.ventana}</span>
        </div>
        <h2 className="text-2xl font-extrabold text-ink-gradient tracking-tight mb-2">Bot Martina · {r.fecha}</h2>
        <p className="text-sm text-slatey leading-relaxed max-w-3xl font-medium">{r.resumen}</p>
      </Card>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {r.kpis.map((k, i) => <KpiCard key={k.label} k={k} delay={i * 0.05} />)}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="p-5 lg:col-span-2">
          <SectionHeader icon={TrendingUp} title="Embudo del día" desc="Etapa máxima alcanzada por conversación" />
          <ResponsiveContainer width="100%" height={230}>
            <BarChart data={r.embudo} margin={{ top: 18, right: 8, left: -18, bottom: 0 }}>
              <XAxis dataKey="label" tick={{ fontSize: 10, fill: C.slate, fontWeight: 600 }} interval={0} angle={-18} textAnchor="end" height={54} />
              <YAxis tick={{ fontSize: 11, fill: C.slate }} allowDecimals={false} />
              <Tooltip content={<ChartTip />} cursor={{ fill: 'rgba(99,102,241,0.06)' }} />
              <Bar dataKey="valor" radius={[8, 8, 0, 0]} fill={C.brand}>
                <LabelList dataKey="valor" position="top" style={{ fontSize: 11, fontWeight: 800, fill: C.ink }} />
                {r.embudo.map((_, i) => <Cell key={i} fill={`url(#bg${i})`} />)}
              </Bar>
              <defs>
                {r.embudo.map((_, i) => (
                  <linearGradient key={i} id={`bg${i}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={C.brand} /><stop offset="100%" stopColor={C.soft} stopOpacity={0.65} />
                  </linearGradient>
                ))}
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-5">
          <SectionHeader icon={BedDouble} title="Habitaciones" desc="Interés por tipo" />
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={hab} dataKey="value" nameKey="name" innerRadius={48} outerRadius={72} paddingAngle={3} stroke="none">
                <Cell fill={C.brand} /><Cell fill={C.info} />
              </Pie>
              <Tooltip content={<ChartTip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-5 mt-1">
            <div className="flex items-center gap-1.5 text-xs"><span className="w-2.5 h-2.5 rounded-full" style={{ background: C.brand }} /><span className="font-bold text-ink">Master {r.habitaciones.master}</span></div>
            <div className="flex items-center gap-1.5 text-xs"><span className="w-2.5 h-2.5 rounded-full" style={{ background: C.info }} /><span className="font-bold text-ink">Loft {r.habitaciones.loft}</span></div>
          </div>
        </Card>
      </div>

      {r.funciona.length > 0 && (
        <Card className="p-5">
          <SectionHeader icon={CheckCircle2} title="Lo que funcionó" desc="Validado en producción" />
          <div className="grid sm:grid-cols-2 gap-3">
            {r.funciona.map((f, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                className="flex gap-3 p-3.5 rounded-2xl bg-ok/[0.06] border border-ok/15">
                <CheckCircle2 size={17} className="text-ok shrink-0 mt-0.5" />
                <div>
                  <div className="text-[13px] font-bold text-ink">{f.titulo}</div>
                  <div className="text-[11.5px] text-slatey font-medium mt-0.5 leading-relaxed">{f.evidencia}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

/* ───────────── EMBUDO ───────────── */
export function Embudo({ r }: { r: DayReport }) {
  const max = Math.max(...r.embudo.map(e => e.valor));
  return (
    <div className="space-y-6">
      <SectionHeader icon={TrendingUp} title="Embudo de conversión" desc={`${r.fecha} · ${r.ventana}`} />
      <Card className="p-6">
        <div className="space-y-4">
          {r.embudo.map((e, i) => (
            <div key={e.etapa}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[13px] font-bold text-ink">{e.label}</span>
                <span className="text-[13px] font-extrabold text-brand tabular-nums">{e.valor}</span>
              </div>
              <ProgressBar value={e.valor} max={max} tone={i >= r.embudo.length - 2 ? 'ok' : 'brand'} />
            </div>
          ))}
        </div>
        {r.embudoNota && (
          <div className="mt-6 flex gap-3 p-4 rounded-2xl bg-brand/[0.05] border border-brand/15">
            <Lightbulb size={17} className="text-brand shrink-0 mt-0.5" />
            <p className="text-[12.5px] text-ink/80 font-medium leading-relaxed">{r.embudoNota}</p>
          </div>
        )}
      </Card>
    </div>
  );
}

/* ───────────── DERIVACIONES ───────────── */
export function Derivaciones({ r }: { r: DayReport }) {
  const data = r.derivaciones.map(d => ({ name: d.label, value: d.cant }));
  const colors = [C.warn, C.ok, C.info, C.brand, C.bad];
  const corr = { si: { t: 'ok' as const, l: 'Correcta' }, parcial: { t: 'warn' as const, l: 'Mejorable' }, no: { t: 'bad' as const, l: 'Incorrecta' } };
  return (
    <div className="space-y-6">
      <SectionHeader icon={Share2} title="Derivaciones al equipo" desc={`${r.derivacionTotal} derivaciones · ${r.derivacionPct}% de las conversaciones`} />
      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="p-5">
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={data} dataKey="value" nameKey="name" innerRadius={55} outerRadius={92} paddingAngle={3} stroke="none">
                {data.map((_, i) => <Cell key={i} fill={colors[i % colors.length]} />)}
              </Pie>
              <Tooltip content={<ChartTip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {r.derivaciones.map((d, i) => (
              <div key={d.razon} className="flex items-center gap-1.5 text-[11px]">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: colors[i % colors.length] }} />
                <span className="font-bold text-ink">{d.cant}</span><span className="text-slatey font-medium truncate">{d.label}</span>
              </div>
            ))}
          </div>
        </Card>
        <div className="space-y-3">
          {r.derivaciones.map((d, i) => (
            <Card key={d.razon} delay={i * 0.05} className="p-4">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[13px] font-extrabold text-ink">{d.label}</span>
                <div className="flex items-center gap-2">
                  <Badge tone={corr[d.correcto].t}>{corr[d.correcto].l}</Badge>
                  <span className="text-base font-extrabold text-brand tabular-nums">{d.cant}</span>
                </div>
              </div>
              {d.nota && <p className="text-[11.5px] text-slatey font-medium leading-relaxed">{d.nota}</p>}
              {d.convs && <div className="text-[10px] text-slatey/70 font-mono mt-1.5">conv {d.convs.join(' · ')}</div>}
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ───────────── CALIDAD ───────────── */
export function Calidad({ r }: { r: DayReport }) {
  const ic = { ok: CheckCircle2, warn: AlertTriangle, bad: XCircle };
  return (
    <div className="space-y-6">
      <SectionHeader icon={Activity} title="Calidad del bot" desc="Alucinaciones, formato y adherencia al protocolo" />
      <div className="grid sm:grid-cols-2 gap-4">
        {r.calidad.map((m, i) => {
          const I = ic[m.tone];
          return (
            <Card key={i} delay={i * 0.05} className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-[12.5px] font-bold text-slatey">{m.label}</div>
                  <div className={`text-2xl font-extrabold mt-1 tabular-nums ${m.tone === 'ok' ? 'text-ok' : m.tone === 'warn' ? 'text-yellow-600' : 'text-bad'}`}>{m.value}</div>
                  {m.meta && <div className="text-[11px] text-slatey font-medium mt-0.5">{m.meta}</div>}
                </div>
                <I size={20} className={m.tone === 'ok' ? 'text-ok' : m.tone === 'warn' ? 'text-warn' : 'text-bad'} />
              </div>
              {m.nota && <p className="text-[11px] text-slatey font-medium mt-2 leading-relaxed border-t border-slate-100 pt-2">{m.nota}</p>}
            </Card>
          );
        })}
      </div>
    </div>
  );
}

/* ───────────── ERRORES & FIXES ───────────── */
export function Errores({ r }: { r: DayReport }) {
  const sevIc = { critica: XCircle, alta: AlertTriangle, media: AlertTriangle, baja: Eye, ok: CheckCircle2 };
  return (
    <div className="space-y-6">
      <SectionHeader icon={Bug} title="Errores & Fixes" desc={`${r.errores.length} hallazgos · ${r.fixes.length} correcciones`} />
      <div className="space-y-3">
        {r.errores.map((e, i) => {
          const SI = sevIc[e.sev];
          return (
            <Card key={e.id} delay={i * 0.04} className="p-5">
              <div className="flex items-start gap-3">
                <div className={`w-9 h-9 rounded-xl grid place-items-center shrink-0 ${e.sev === 'critica' ? 'bg-bad/10' : e.sev === 'ok' ? 'bg-ok/10' : 'bg-warn/12'}`}>
                  <SI size={17} className={e.sev === 'critica' ? 'text-bad' : e.sev === 'ok' ? 'text-ok' : 'text-warn'} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="text-[10px] font-mono font-bold text-slatey">{e.id}</span>
                    <span className="text-[13.5px] font-extrabold text-ink">{e.titulo}</span>
                    <Badge tone={sevTone[e.sev]}>{e.sev}</Badge>
                    <Badge tone={estadoTone[e.estado]}>{e.estado}</Badge>
                  </div>
                  <div className="text-[11px] font-semibold text-brand mb-2">{e.magnitud}</div>
                  <div className="grid sm:grid-cols-2 gap-2 text-[11.5px]">
                    <div className="p-2.5 rounded-xl bg-ink/[0.03]"><span className="font-bold text-ink/60">Causa: </span><span className="text-slatey font-medium">{e.causa}</span></div>
                    <div className="p-2.5 rounded-xl bg-ok/[0.05]"><span className="font-bold text-ok">Fix: </span><span className="text-slatey font-medium">{e.fix}</span></div>
                  </div>
                  {e.evidencia && <p className="text-[11px] text-slatey/80 font-medium mt-2 italic leading-relaxed">{e.evidencia}</p>}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <Card className="p-5">
        <SectionHeader icon={Wrench} title="Correcciones aplicadas" />
        <div className="space-y-2.5">
          {r.fixes.map((f, i) => (
            <div key={i} className="flex items-start gap-3 p-3.5 rounded-2xl bg-ok/[0.05] border border-ok/12">
              <CheckCircle2 size={16} className="text-ok shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[13px] font-bold text-ink">{f.titulo}</span>
                  <Badge tone="brand">{f.tipo}</Badge>
                  {f.hora && <span className="text-[10px] text-slatey font-mono">{f.hora}</span>}
                </div>
                <p className="text-[11.5px] text-slatey font-medium mt-0.5 leading-relaxed">{f.detalle}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

/* ───────────── ACCIONES HUMANAS ───────────── */
export function Acciones({ r }: { r: DayReport }) {
  const pri = { alta: 'bad' as const, media: 'warn' as const, baja: 'info' as const };
  return (
    <div className="space-y-6">
      <SectionHeader icon={UserCheck} title="Leads que necesitan acción humana" desc="Seguimiento prioritario del equipo" />
      <div className="space-y-3">
        {r.acciones.map((a, i) => (
          <Card key={i} delay={i * 0.05} className="p-4">
            <div className="flex items-start gap-3">
              <Badge tone={pri[a.prioridad]}>{a.prioridad}</Badge>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[13.5px] font-extrabold text-ink">{a.cliente}</span>
                  {a.contacto && <span className="text-[11px] text-slatey font-mono">{a.contacto}</span>}
                  <span className="text-[10px] text-slatey/70 font-mono">conv {a.conv}</span>
                </div>
                <p className="text-[11.5px] text-slatey font-medium mt-1">{a.motivo}</p>
                <p className="text-[11.5px] text-brand font-semibold mt-1">→ {a.accion}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

/* ───────────── BITÁCORA ───────────── */
export function Bitacora({ r }: { r: DayReport }) {
  const tipoColor: Record<string, string> = { deploy: C.brand, fix: C.ok, analisis: C.info, decision: C.warn, nota: C.slate };
  const riesgo = { alto: 'bad' as const, medio: 'warn' as const, bajo: 'info' as const };
  return (
    <div className="space-y-6">
      <SectionHeader icon={ScrollText} title="Bitácora del día" desc="Cambios, decisiones y monitoreo" />
      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="p-5">
          <h3 className="text-[13px] font-extrabold text-ink mb-4">Línea de tiempo</h3>
          <div className="relative pl-5">
            <div className="absolute left-[5px] top-1 bottom-1 w-[2px] bg-slate-200" />
            {r.bitacora.map((b, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }} className="relative mb-4 last:mb-0">
                <span className="absolute -left-[18px] top-1 w-2.5 h-2.5 rounded-full ring-4 ring-white" style={{ background: tipoColor[b.tipo] }} />
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono font-bold text-ink">{b.hora}</span>
                  <Badge tone="ink">{b.tipo}</Badge>
                </div>
                <p className="text-[12px] text-slatey font-medium mt-1 leading-relaxed">{b.texto}</p>
              </motion.div>
            ))}
          </div>
        </Card>

        <div className="space-y-6">
          <Card className="p-5">
            <h3 className="text-[13px] font-extrabold text-ink mb-3 flex items-center gap-2"><Eye size={15} className="text-brand" /> Cómo monitorear</h3>
            <ul className="space-y-2">
              {r.monitoreo.map((m, i) => (
                <li key={i} className="flex gap-2 text-[11.5px] text-slatey font-medium leading-relaxed">
                  <span className="text-brand font-bold shrink-0">·</span>{m}
                </li>
              ))}
            </ul>
          </Card>
          <Card className="p-5">
            <h3 className="text-[13px] font-extrabold text-ink mb-3 flex items-center gap-2"><Lightbulb size={15} className="text-warn" /> Predicción de errores</h3>
            <div className="space-y-2.5">
              {r.predicciones.map((p, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <Badge tone={riesgo[p.riesgo]}>{p.riesgo}</Badge>
                  <p className="text-[11.5px] text-slatey font-medium leading-relaxed flex-1">{p.texto}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

export const SECTIONS: Record<string, (p: { r: DayReport }) => JSX.Element> = {
  resumen: Resumen, embudo: Embudo, derivaciones: Derivaciones,
  calidad: Calidad, errores: Errores, acciones: Acciones, bitacora: Bitacora,
};

import { useState, useMemo } from 'react';
import {
  AreaChart, Area, BarChart, Bar, ComposedChart, Line, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip, LabelList, CartesianGrid,
} from 'recharts';
import { motion } from 'framer-motion';
import {
  TrendingUp, Share2, Activity, Bug, UserCheck, ScrollText, Clock, MessagesSquare,
  CheckCircle2, AlertTriangle, XCircle, Wrench, Eye, Lightbulb, BedDouble, ExternalLink,
  Search, ChevronRight, ArrowDownRight, Rocket, CalendarDays, GitCommit,
} from 'lucide-react';
import type { Conv } from './data/conversations';
import { convUrl, conversations } from './data/conversations';
import type { Narrative } from './data/narrative';
import { EVOLUCION_HITOS, REPORTE_SELLO } from './data/narrative';
import {
  kpis, embudo, derivaciones, timeline, habitaciones, temperaturas, arTime, RAZON_LABEL, evolucionDias,
} from './lib/metrics';
import { Card, Kpi, SectionHeader, Badge, Bar as PBar, sevTone, estadoTone } from './components/ui';

const C = { brand: '#6366F1', soft: '#818CF8', ok: '#16A34A', warn: '#EAB308', bad: '#EF4444', info: '#3B82F6', ink: '#0F172A', slate: '#94A3B8' };
type P = { cs: Conv[]; nar: Narrative; scope: string; onScope?: (s: string) => void };

function Tip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass rounded-xl px-3 py-2 text-xs shadow-lg">
      <div className="font-bold text-ink mb-0.5">{label ?? payload[0].name}</div>
      {payload.map((p: any, i: number) => (
        <div key={i} className="font-semibold" style={{ color: p.color || p.fill }}>{p.name}: {p.value}</div>
      ))}
    </div>
  );
}

const ChatLink = ({ id, children }: { id: number; children?: React.ReactNode }) => (
  <a href={convUrl(id)} target="_blank" rel="noreferrer"
    className="inline-flex items-center gap-1 text-brand hover:text-brand-dark font-semibold transition group whitespace-nowrap">
    {children ?? <>Ver chat</>}
    <ExternalLink size={11} className="opacity-60 group-hover:opacity-100" />
  </a>
);

/* ───────────── RESUMEN ───────────── */
export function Resumen({ cs, nar }: P) {
  const k = kpis(cs);
  const hab = habitaciones(cs);
  const habData = [{ name: 'Master Suite', value: hab.master }, { name: 'Loft de Montaña', value: hab.loft }];
  const emb = embudo(cs);
  const KPIS = [
    { label: 'Conversaciones', value: k.total, sub: `${k.bot} por el bot · ${k.manual} a mano`, icon: 'chat', tone: 'brand' },
    { label: 'Recibieron cotización', value: `${k.cotPct}%`, sub: `${k.cotizadas} conversaciones`, icon: 'tag', tone: 'ok' },
    { label: 'Dejaron datos', value: `${k.datosPct}%`, sub: `${k.datos} listos para reservar`, icon: 'flame', tone: 'ok' },
    { label: 'Derivadas al equipo', value: `${k.derPct}%`, sub: `${k.derivadas} conversaciones`, icon: 'share', tone: 'warn' },
    { label: 'Mensajes', value: k.mensajes, sub: `${k.msgPorConv} por conversación`, icon: 'messages', tone: 'info' },
    { label: 'Precios inventados', value: '0', sub: 'todo sale del cotizador', icon: 'shield', tone: 'ok' },
  ];
  return (
    <div className="space-y-6">
      <Card className="p-6 relative overflow-hidden">
        <div className="absolute -right-12 -top-12 w-48 h-48 rounded-full brand-gradient opacity-[0.06] blur-2xl" />
        <h2 className="text-2xl font-extrabold text-ink-gradient tracking-tight mb-2">Cómo viene Martina</h2>
        <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-slatey mb-3 bg-white/70 border border-slate-200/70 rounded-full px-3 py-1">
          <Clock size={12.5} className="text-brand" />
          Reporte iniciado {REPORTE_SELLO.inicio} · generado {REPORTE_SELLO.generado} {REPORTE_SELLO.tz}
        </div>
        <p className="text-sm text-slatey leading-relaxed max-w-3xl font-medium">{nar.resumen}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {nar.destacados.map((d, i) => (
            <span key={i} className="inline-flex items-center gap-1.5 text-[11.5px] font-semibold text-ink/75 bg-white/70 border border-slate-200/70 rounded-full px-3 py-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-brand" />{d}
            </span>
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {KPIS.map((kp, i) => <Kpi key={kp.label} {...kp} delay={i * 0.04} />)}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="p-5 lg:col-span-2">
          <SectionHeader icon={TrendingUp} title="Embudo" desc="Cuántos clientes llegaron a cada paso" />
          <ResponsiveContainer width="100%" height={230}>
            <BarChart data={emb} margin={{ top: 18, right: 8, left: -22, bottom: 0 }}>
              <XAxis dataKey="label" tick={{ fontSize: 9.5, fill: C.slate, fontWeight: 600 }} interval={0} angle={-15} textAnchor="end" height={50} />
              <YAxis tick={{ fontSize: 11, fill: C.slate }} allowDecimals={false} />
              <Tooltip content={<Tip />} cursor={{ fill: 'rgba(99,102,241,0.06)' }} />
              <defs><linearGradient id="bgrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={C.brand} /><stop offset="100%" stopColor={C.soft} stopOpacity={0.6} /></linearGradient></defs>
              <Bar isAnimationActive={false} dataKey="valor" radius={[8, 8, 0, 0]} fill="url(#bgrad)">
                <LabelList dataKey="valor" position="top" style={{ fontSize: 11, fontWeight: 800, fill: C.ink }} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-5">
          <SectionHeader icon={BedDouble} title="Habitaciones" desc="Interés por tipo" />
          <ResponsiveContainer width="100%" height={170}>
            <PieChart>
              <Pie isAnimationActive={false} data={habData} dataKey="value" nameKey="name" innerRadius={46} outerRadius={70} paddingAngle={3} stroke="none">
                <Cell fill={C.brand} /><Cell fill={C.info} />
              </Pie>
              <Tooltip content={<Tip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-5 mt-1">
            <span className="flex items-center gap-1.5 text-xs"><span className="w-2.5 h-2.5 rounded-full" style={{ background: C.brand }} /><b className="text-ink">Master {hab.master}</b></span>
            <span className="flex items-center gap-1.5 text-xs"><span className="w-2.5 h-2.5 rounded-full" style={{ background: C.info }} /><b className="text-ink">Loft {hab.loft}</b></span>
          </div>
        </Card>
      </div>

      <Card className="p-5">
        <SectionHeader icon={CheckCircle2} title="Lo que está funcionando" />
        <div className="grid sm:grid-cols-2 gap-3">
          {nar.funciona.map((f, i) => (
            <div key={i} className="flex gap-3 p-3.5 rounded-2xl bg-ok/[0.06] border border-ok/15">
              <CheckCircle2 size={17} className="text-ok shrink-0 mt-0.5" />
              <div><div className="text-[13px] font-bold text-ink">{f.titulo}</div>
                <div className="text-[11.5px] text-slatey font-medium mt-0.5 leading-relaxed">{f.evidencia}</div></div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

/* ───────────── EVOLUCIÓN (todo el período unido, por día + hitos) ───────────── */
const HITO_META: Record<string, { color: string; icon: any; label: string }> = {
  deploy: { color: C.brand, icon: Rocket, label: 'Deploy' },
  fix: { color: C.ok, icon: Wrench, label: 'Arreglo' },
  analisis: { color: C.info, icon: Eye, label: 'Análisis' },
  bug: { color: C.bad, icon: Bug, label: 'Detectado' },
  decision: { color: C.warn, icon: GitCommit, label: 'Decisión' },
};
export function Evolucion({ onScope }: P) {
  // Siempre sobre TODO el período (vista consolidada), sin importar el scope activo.
  const evol = evolucionDias(conversations);
  const k = kpis(conversations);
  const totDias = evol.length;
  const KPIS = [
    { label: 'Conversaciones totales', value: k.total, sub: `en ${totDias} días de operación`, icon: 'chat', tone: 'brand' },
    { label: 'Recibieron cotización', value: `${k.cotPct}%`, sub: `${k.cotizadas} en total`, icon: 'tag', tone: 'ok' },
    { label: 'Dejaron datos', value: `${k.datosPct}%`, sub: `${k.datos} listos para reservar`, icon: 'flame', tone: 'ok' },
    { label: 'Derivadas al equipo', value: `${k.derPct}%`, sub: `${k.derivadas} en total`, icon: 'share', tone: 'warn' },
  ];
  return (
    <div className="space-y-6">
      <SectionHeader icon={TrendingUp} title="Evolución del proyecto" desc="Toda la vida del bot, unida: cómo viene día a día desde el lanzamiento" />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {KPIS.map((kp, i) => <Kpi key={kp.label} {...kp} delay={i * 0.04} />)}
      </div>

      <Card className="p-5">
        <SectionHeader icon={CalendarDays} title="Día a día" desc="Conversaciones, cotizaciones y derivaciones por jornada · línea: % que recibió cotización" />
        <ResponsiveContainer width="100%" height={280}>
          <ComposedChart data={evol} margin={{ top: 18, right: 8, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="evt" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={C.brand} /><stop offset="100%" stopColor={C.soft} stopOpacity={0.55} /></linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#EEF2F7" vertical={false} />
            <XAxis dataKey="label" tick={{ fontSize: 11, fill: C.slate, fontWeight: 700 }} />
            <YAxis yAxisId="l" tick={{ fontSize: 11, fill: C.slate }} allowDecimals={false} />
            <YAxis yAxisId="r" orientation="right" tick={{ fontSize: 10, fill: C.ok }} domain={[0, 100]} unit="%" />
            <Tooltip content={<Tip />} cursor={{ fill: 'rgba(99,102,241,0.06)' }} />
            <Bar yAxisId="l" isAnimationActive={false} dataKey="total" name="Conversaciones" radius={[7, 7, 0, 0]} fill="url(#evt)" maxBarSize={54}>
              <LabelList dataKey="total" position="top" style={{ fontSize: 11, fontWeight: 800, fill: C.ink }} />
            </Bar>
            <Bar yAxisId="l" isAnimationActive={false} dataKey="derivadas" name="Derivadas" radius={[7, 7, 0, 0]} fill={C.warn} maxBarSize={54} opacity={0.85} />
            <Line yAxisId="r" isAnimationActive={false} type="monotone" dataKey="cotPct" name="% cotización" stroke={C.ok} strokeWidth={2.5} dot={{ r: 3.5, fill: C.ok }} />
          </ComposedChart>
        </ResponsiveContainer>
        <div className="flex flex-wrap gap-4 mt-1 justify-center text-[11px]">
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm" style={{ background: C.brand }} /><b className="text-ink">Conversaciones</b></span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm" style={{ background: C.warn }} /><b className="text-ink">Derivadas</b></span>
          <span className="flex items-center gap-1.5"><span className="w-4 h-[2.5px] rounded" style={{ background: C.ok }} /><b className="text-ink">% cotización</b></span>
        </div>
      </Card>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {evol.map((d, i) => (
          <Card key={d.dia} delay={i * 0.05} className="p-4 hover:shadow-lg hover:-translate-y-0.5 transition-all cursor-pointer group" >
            <button onClick={() => onScope?.(d.dia)} className="text-left w-full">
              <div className="flex items-center justify-between">
                <span className="text-[13px] font-extrabold text-ink">{d.label}</span>
                <span className="text-[10px] font-bold text-brand opacity-0 group-hover:opacity-100 transition flex items-center gap-0.5">ver <ChevronRight size={11} /></span>
              </div>
              <div className="text-[26px] leading-none font-extrabold text-ink tabular-nums mt-2">{d.total}</div>
              <div className="text-[10.5px] text-slatey font-medium">conversaciones</div>
              <div className="flex gap-2 mt-2.5 flex-wrap">
                <Badge tone="ok">{d.cotPct}% cotiz</Badge>
                <Badge tone="warn">{d.derivadas} deriv</Badge>
              </div>
            </button>
          </Card>
        ))}
      </div>

      <Card className="p-5">
        <SectionHeader icon={ScrollText} title="Línea de tiempo" desc="Deploys, arreglos y hallazgos a lo largo del proyecto" />
        <div className="relative pl-5">
          <div className="absolute left-[5px] top-1 bottom-1 w-[2px] bg-slate-200" />
          {EVOLUCION_HITOS.map((h, i) => {
            const m = HITO_META[h.tipo];
            const HI = m.icon;
            return (
              <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} className="relative mb-5 last:mb-0">
                <span className="absolute -left-[18px] top-1 w-2.5 h-2.5 rounded-full ring-4 ring-white" style={{ background: m.color }} />
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[11px] font-mono font-bold text-ink">{h.fecha}</span>
                  <span className="inline-flex items-center gap-1 text-[10.5px] font-bold px-2 py-0.5 rounded-full" style={{ background: `${m.color}1a`, color: m.color }}>
                    <HI size={11} />{m.label}
                  </span>
                  <span className="text-[13px] font-extrabold text-ink">{h.titulo}</span>
                </div>
                <p className="text-[12px] text-slatey font-medium mt-1 leading-relaxed max-w-3xl">{h.detalle}</p>
              </motion.div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

/* ───────────── ACTIVIDAD (timeline) ───────────── */
export function Actividad({ cs }: P) {
  const tl = timeline(cs);
  const temps = temperaturas(cs);
  const maxT = Math.max(...temps.map(t => t.valor), 1);
  const tcolor: Record<string, string> = { Caliente: C.bad, Interesado: C.ok, Nuevo: C.brand, Frío: C.info, Derivado: C.warn, Caído: C.slate, Huésped: C.soft };
  const pico = tl.reduce((a, b) => (b.total > (a?.total || 0) ? b : a), tl[0]);
  return (
    <div className="space-y-6">
      <SectionHeader icon={Clock} title="Actividad en el tiempo" desc="Cuántos escribieron en cada hora del día" />
      <Card className="p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="text-[13px] font-bold text-ink">Flujo por hora</div>
          {pico && <Badge tone="brand">Pico: {pico.hora} · {pico.total} chats</Badge>}
        </div>
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={tl} margin={{ top: 8, right: 8, left: -22, bottom: 0 }}>
            <defs>
              <linearGradient id="ag" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={C.brand} stopOpacity={0.35} /><stop offset="100%" stopColor={C.brand} stopOpacity={0} /></linearGradient>
              <linearGradient id="agd" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={C.warn} stopOpacity={0.3} /><stop offset="100%" stopColor={C.warn} stopOpacity={0} /></linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#EEF2F7" vertical={false} />
            <XAxis dataKey="hora" tick={{ fontSize: 9, fill: C.slate }} interval="preserveStartEnd" minTickGap={24} />
            <YAxis tick={{ fontSize: 11, fill: C.slate }} allowDecimals={false} />
            <Tooltip content={<Tip />} />
            <Area isAnimationActive={false} type="monotone" dataKey="total" name="Conversaciones" stroke={C.brand} strokeWidth={2.5} fill="url(#ag)" />
            <Area isAnimationActive={false} type="monotone" dataKey="derivadas" name="Derivadas" stroke={C.warn} strokeWidth={2} fill="url(#agd)" />
          </AreaChart>
        </ResponsiveContainer>
        <p className="text-[11px] text-slatey font-medium mt-2">Línea violeta: todas las conversaciones nuevas. Amarilla: las que se derivaron.</p>
      </Card>

      <Card className="p-5">
        <SectionHeader icon={Activity} title="Termómetro de leads" desc="Cómo quedaron clasificados" />
        <div className="space-y-3">
          {temps.map((t, i) => (
            <div key={t.t}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[13px] font-bold text-ink">{t.label}</span>
                <span className="text-[13px] font-extrabold tabular-nums" style={{ color: tcolor[t.label] || C.brand }}>{t.valor}</span>
              </div>
              <div className="h-2.5 rounded-full bg-ink/[0.06] overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: `${(t.valor / maxT) * 100}%` }}
                  transition={{ duration: 0.8, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }}
                  className="h-full rounded-full" style={{ background: tcolor[t.label] || C.brand }} />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

/* ───────────── EMBUDO ───────────── */
export function Embudo({ cs }: P) {
  const emb = embudo(cs);
  const max = Math.max(...emb.map(e => e.valor), 1);
  return (
    <div className="space-y-6">
      <SectionHeader icon={TrendingUp} title="Embudo de conversión" desc="Cuántos clientes avanzan en cada paso de la venta" />
      <Card className="p-6">
        <div className="space-y-5">
          {emb.map((e, i) => {
            const prev = i > 0 ? emb[i - 1].valor : e.valor;
            const drop = prev > 0 ? Math.round((e.valor / prev) * 100) : 100;
            return (
              <div key={e.etapa}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[13px] font-bold text-ink">{e.label}</span>
                  <div className="flex items-center gap-2">
                    {i > 0 && <span className="text-[11px] font-semibold text-slatey flex items-center gap-0.5"><ArrowDownRight size={12} />{drop}%</span>}
                    <span className="text-[14px] font-extrabold text-brand tabular-nums w-7 text-right">{e.valor}</span>
                  </div>
                </div>
                <PBar value={e.valor} max={max} tone={i >= emb.length - 1 ? 'ok' : 'brand'} delay={i * 0.06} />
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

/* ───────────── DERIVACIONES ───────────── */
export function Derivaciones({ cs }: P) {
  const der = derivaciones(cs);
  const total = der.reduce((a, d) => a + d.cant, 0);
  const colors = [C.warn, C.ok, C.info, C.brand, C.bad, C.soft, C.slate, '#14B8A6'];
  const corr: Record<string, { t: string; l: string }> = { si: { t: 'ok', l: 'Correcta' }, parcial: { t: 'warn', l: 'Mejorable' }, no: { t: 'bad', l: 'Revisar' } };
  const [open, setOpen] = useState<string | null>(der[0]?.razon ?? null);
  return (
    <div className="space-y-6">
      <SectionHeader icon={Share2} title="Derivaciones al equipo" desc={`${total} en total · tocá cada motivo para ver los clientes`} />
      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="p-5 self-start">
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie isAnimationActive={false} data={der.map(d => ({ name: d.label, value: d.cant }))} dataKey="value" nameKey="name" innerRadius={55} outerRadius={92} paddingAngle={3} stroke="none">
                {der.map((_, i) => <Cell key={i} fill={colors[i % colors.length]} />)}
              </Pie>
              <Tooltip content={<Tip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {der.map((d, i) => (
              <div key={d.razon} className="flex items-center gap-1.5 text-[11px]">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: colors[i % colors.length] }} />
                <b className="text-ink">{d.cant}</b><span className="text-slatey font-medium truncate">{d.label}</span>
              </div>
            ))}
          </div>
        </Card>
        <div className="space-y-2.5">
          {der.map((d, i) => (
            <Card key={d.razon} delay={i * 0.04} className="overflow-hidden">
              <button onClick={() => setOpen(open === d.razon ? null : d.razon)} className="w-full flex items-center justify-between p-4 hover:bg-white/50 transition">
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: colors[i % colors.length] }} />
                  <span className="text-[13px] font-extrabold text-ink">{d.label}</span>
                  <Badge tone={corr[d.ok].t}>{corr[d.ok].l}</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-base font-extrabold text-brand tabular-nums">{d.cant}</span>
                  <ChevronRight size={16} className={`text-slatey transition ${open === d.razon ? 'rotate-90' : ''}`} />
                </div>
              </button>
              {open === d.razon && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="px-4 pb-3.5">
                  <div className="space-y-1.5 border-t border-slate-100 pt-3">
                    {d.convs.map(c => (
                      <div key={c.id} className="flex items-center justify-between text-[12px] py-1">
                        <div className="min-w-0 flex-1">
                          <span className="font-semibold text-ink">{c.nombre}</span>
                          <span className="text-slatey font-medium truncate"> · {c.primerMsg || 's/ mensaje'}</span>
                        </div>
                        <ChatLink id={c.id} />
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ───────────── CONVERSACIONES (tabla explorable) ───────────── */
const ETAPA_BADGE: Record<string, string> = {
  presentacion: 'ink', indagacion_1: 'ink', indagacion_2: 'info', validacion_fechas: 'info',
  cotizacion_enviada: 'brand', datos_para_reserva: 'ok', cierre: 'ok', postventa: 'ok',
};
const ETAPA_TXT: Record<string, string> = {
  presentacion: 'Presentación', indagacion_1: 'Indagación', indagacion_2: 'Indagación+', validacion_fechas: 'Validación',
  cotizacion_enviada: 'Cotizada', datos_para_reserva: 'Datos reserva', cierre: 'Cierre', postventa: 'Postventa', '': '—',
};
export function Conversaciones({ cs }: P) {
  const [q, setQ] = useState('');
  const [filtro, setFiltro] = useState<'todas' | 'cotizadas' | 'derivadas' | 'datos'>('todas');
  const rows = useMemo(() => {
    let r = [...cs];
    if (filtro === 'cotizadas') r = r.filter(c => ['cotizacion_enviada', 'datos_para_reserva', 'cierre'].includes(c.etapa));
    if (filtro === 'derivadas') r = r.filter(c => c.derivado);
    if (filtro === 'datos') r = r.filter(c => ['datos_para_reserva', 'cierre'].includes(c.etapa));
    if (q.trim()) { const s = q.toLowerCase(); r = r.filter(c => c.nombre.toLowerCase().includes(s) || c.numero.includes(s) || String(c.id).includes(s) || c.primerMsg.toLowerCase().includes(s)); }
    return r;
  }, [cs, q, filtro]);
  const filtros = [
    { id: 'todas', label: `Todas (${cs.length})` },
    { id: 'cotizadas', label: 'Cotizadas' },
    { id: 'datos', label: 'Datos de reserva' },
    { id: 'derivadas', label: 'Derivadas' },
  ] as const;
  return (
    <div className="space-y-5">
      <SectionHeader icon={MessagesSquare} title="Conversaciones" desc={`${rows.length} resultado${rows.length === 1 ? '' : 's'} · tocá Ver chat para leer la conversación`} />
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slatey" />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Buscar por nombre, número, id o mensaje…"
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl glass text-sm font-medium text-ink placeholder:text-slatey/70 focus:outline-none focus:ring-2 focus:ring-brand/30" />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {filtros.map(f => (
            <button key={f.id} onClick={() => setFiltro(f.id)}
              className={`px-3.5 py-2 rounded-2xl text-[12px] font-bold transition active:scale-95 ${filtro === f.id ? 'bg-ink text-white' : 'glass text-slatey hover:text-ink'}`}>{f.label}</button>
          ))}
        </div>
      </div>
      <Card className="overflow-hidden">
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10.5px] uppercase tracking-wider text-slatey border-b border-slate-100">
                <th className="font-bold px-4 py-3">Cliente</th>
                <th className="font-bold px-3 py-3 hidden sm:table-cell">Etapa</th>
                <th className="font-bold px-3 py-3 hidden md:table-cell">Mensaje inicial</th>
                <th className="font-bold px-3 py-3">Estado</th>
                <th className="font-bold px-3 py-3 hidden sm:table-cell">Última act.</th>
                <th className="font-bold px-4 py-3 text-right">Chatwoot</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((c, i) => (
                <motion.tr key={c.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: Math.min(i * 0.015, 0.4) }}
                  className="border-b border-slate-50 hover:bg-brand/[0.03] transition group">
                  <td className="px-4 py-3">
                    <div className="text-[13px] font-bold text-ink truncate max-w-[160px]">{c.nombre}</div>
                    <div className="text-[10.5px] text-slatey font-mono">{c.numero || `#${c.id}`}</div>
                  </td>
                  <td className="px-3 py-3 hidden sm:table-cell"><Badge tone={ETAPA_BADGE[c.etapa] || 'ink'}>{ETAPA_TXT[c.etapa] || '—'}</Badge></td>
                  <td className="px-3 py-3 hidden md:table-cell"><span className="text-[11.5px] text-slatey font-medium line-clamp-1 max-w-[230px]">{c.primerMsg || '—'}</span></td>
                  <td className="px-3 py-3">
                    {c.derivado ? <Badge tone="warn">Derivada</Badge> : c.manual ? <Badge tone="info">A mano</Badge> : <Badge tone="ok">Bot</Badge>}
                  </td>
                  <td className="px-3 py-3 hidden sm:table-cell"><span className="text-[11px] text-slatey font-mono">{arTime(c.ultimaAct)}</span></td>
                  <td className="px-4 py-3 text-right"><ChatLink id={c.id}><span className="text-[11.5px]">Ver chat</span></ChatLink></td>
                </motion.tr>
              ))}
              {rows.length === 0 && <tr><td colSpan={6} className="px-4 py-10 text-center text-sm text-slatey font-medium">Sin resultados para "{q}"</td></tr>}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

/* ───────────── CALIDAD ───────────── */
export function Calidad({ nar }: P) {
  const ic = { ok: CheckCircle2, warn: AlertTriangle, bad: XCircle };
  return (
    <div className="space-y-6">
      <SectionHeader icon={Activity} title="Calidad del bot" desc="Qué tan bien está respondiendo el bot" />
      <div className="grid sm:grid-cols-2 gap-4">
        {nar.calidad.map((m, i) => {
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

/* ───────────── ERRORES ───────────── */
export function Errores({ nar }: P) {
  const sevIc: Record<string, any> = { critica: XCircle, alta: AlertTriangle, media: AlertTriangle, baja: Eye, ok: CheckCircle2 };
  return (
    <div className="space-y-6">
      <SectionHeader icon={Bug} title="Errores & Fixes" desc={`${nar.errores.length} hallazgos · ${nar.fixes.length} correcciones`} />
      <div className="space-y-3">
        {nar.errores.map((e, i) => {
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
                    <div className="p-2.5 rounded-xl bg-ink/[0.03]"><b className="text-ink/60">Qué pasó: </b><span className="text-slatey font-medium">{e.causa}</span></div>
                    <div className="p-2.5 rounded-xl bg-ok/[0.05]"><b className="text-ok">Cómo se resolvió: </b><span className="text-slatey font-medium">{e.fix}</span></div>
                  </div>
                  {e.nota && <p className="text-[11px] text-slatey/80 font-medium mt-2 italic leading-relaxed">{e.nota}</p>}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
      <Card className="p-5">
        <SectionHeader icon={Wrench} title="Correcciones aplicadas" />
        <div className="space-y-2.5">
          {nar.fixes.map((f, i) => (
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

/* ───────────── ACCIONES ───────────── */
export function Acciones({ nar }: P) {
  const pri: Record<string, string> = { alta: 'bad', media: 'warn', baja: 'info' };
  return (
    <div className="space-y-6">
      <SectionHeader icon={UserCheck} title="Leads para retomar" desc="Tocá Ver chat para leer la conversación completa" />
      <div className="space-y-3">
        {nar.acciones.map((a, i) => (
          <Card key={i} delay={i * 0.05} className="p-4">
            <div className="flex items-start gap-3">
              <Badge tone={pri[a.prioridad]}>{a.prioridad}</Badge>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[13.5px] font-extrabold text-ink">{a.cliente}</span>
                  {a.contacto && <span className="text-[11px] text-slatey font-mono">{a.contacto}</span>}
                  <ChatLink id={a.conv} />
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
export function Bitacora({ nar }: P) {
  const tc: Record<string, string> = { deploy: C.brand, fix: C.ok, analisis: C.info, decision: C.warn, nota: C.slate };
  const rg: Record<string, string> = { alto: 'bad', medio: 'warn', bajo: 'info' };
  return (
    <div className="space-y-6">
      <SectionHeader icon={ScrollText} title="Bitácora" desc="Qué se hizo y qué hay que mirar" />
      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="p-5">
          <h3 className="text-[13px] font-extrabold text-ink mb-4">Línea de tiempo</h3>
          <div className="relative pl-5">
            <div className="absolute left-[5px] top-1 bottom-1 w-[2px] bg-slate-200" />
            {nar.bitacora.map((b, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }} className="relative mb-4 last:mb-0">
                <span className="absolute -left-[18px] top-1 w-2.5 h-2.5 rounded-full ring-4 ring-white" style={{ background: tc[b.tipo] }} />
                <div className="flex items-center gap-2"><span className="text-[11px] font-mono font-bold text-ink">{b.hora}</span><Badge tone="ink">{b.tipo}</Badge></div>
                <p className="text-[12px] text-slatey font-medium mt-1 leading-relaxed">{b.texto}</p>
              </motion.div>
            ))}
          </div>
        </Card>
        <div className="space-y-6">
          <Card className="p-5">
            <h3 className="text-[13px] font-extrabold text-ink mb-3 flex items-center gap-2"><Eye size={15} className="text-brand" /> Qué monitorear</h3>
            <ul className="space-y-2">
              {nar.monitoreo.map((m, i) => <li key={i} className="flex gap-2 text-[11.5px] text-slatey font-medium leading-relaxed"><span className="text-brand font-bold">·</span>{m}</li>)}
            </ul>
          </Card>
          <Card className="p-5">
            <h3 className="text-[13px] font-extrabold text-ink mb-3 flex items-center gap-2"><Lightbulb size={15} className="text-warn" /> Lo que puede romperse</h3>
            <div className="space-y-2.5">
              {nar.predicciones.map((p, i) => (
                <div key={i} className="flex items-start gap-2.5"><Badge tone={rg[p.riesgo]}>{p.riesgo}</Badge><p className="text-[11.5px] text-slatey font-medium leading-relaxed flex-1">{p.texto}</p></div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

export const SECTIONS: Record<string, (p: P) => JSX.Element> = {
  resumen: Resumen, evolucion: Evolucion, actividad: Actividad, embudo: Embudo, derivaciones: Derivaciones,
  conversaciones: Conversaciones, calidad: Calidad, errores: Errores, acciones: Acciones, bitacora: Bitacora,
};

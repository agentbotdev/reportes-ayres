import { motion } from 'framer-motion';
import {
  MessageSquare, Share2, Tag, Flame, ShieldCheck, MessagesSquare, TrendingUp, Users, Activity,
  type LucideIcon,
} from 'lucide-react';
import type { ReactNode } from 'react';

const icons: Record<string, LucideIcon> = {
  messages: MessageSquare, share: Share2, tag: Tag, flame: Flame, shield: ShieldCheck,
  chat: MessagesSquare, trend: TrendingUp, users: Users, activity: Activity,
};

const toneText: Record<string, string> = {
  brand: 'text-brand', ok: 'text-ok', warn: 'text-yellow-600', bad: 'text-bad', info: 'text-info', ink: 'text-ink',
};
const toneBg: Record<string, string> = {
  brand: 'bg-brand/10', ok: 'bg-ok/10', warn: 'bg-warn/12', bad: 'bg-bad/10', info: 'bg-info/10', ink: 'bg-ink/8',
};

export function Card({ children, className = '', delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay, ease: [0.16, 1, 0.3, 1] }}
      className={`card rounded-3xl ${className}`}
    >{children}</motion.div>
  );
}

export function Kpi({ label, value, sub, icon = 'messages', tone = 'brand', delay = 0 }:
  { label: string; value: string | number; sub?: string; icon?: string; tone?: string; delay?: number }) {
  const Icon = icons[icon] || MessageSquare;
  return (
    <Card delay={delay} className="p-5 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
      <div className={`w-11 h-11 rounded-2xl grid place-items-center ${toneBg[tone]}`}>
        <Icon size={20} className={toneText[tone]} />
      </div>
      <div className="mt-4 text-[28px] leading-none font-extrabold tracking-tight text-ink tabular-nums">{value}</div>
      <div className="mt-2 text-[13px] font-bold text-ink/80">{label}</div>
      {sub && <div className="text-[11px] font-medium text-slatey mt-0.5">{sub}</div>}
    </Card>
  );
}

export function SectionHeader({ icon: Icon, title, desc }: { icon: LucideIcon; title: string; desc?: string }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <div className="w-10 h-10 rounded-2xl brand-gradient grid place-items-center shadow-lg shadow-brand/20">
        <Icon size={18} className="text-white" />
      </div>
      <div>
        <h2 className="text-lg font-extrabold tracking-tight text-ink">{title}</h2>
        {desc && <p className="text-xs text-slatey font-medium">{desc}</p>}
      </div>
    </div>
  );
}

export function Badge({ children, tone = 'ink' }: { children: ReactNode; tone?: string }) {
  const map: Record<string, string> = {
    ok: 'bg-ok/10 text-ok', warn: 'bg-warn/15 text-yellow-700', bad: 'bg-bad/10 text-bad',
    info: 'bg-info/10 text-info', brand: 'bg-brand/10 text-brand', ink: 'bg-ink/[0.07] text-ink/70',
  };
  return <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10.5px] font-bold whitespace-nowrap ${map[tone] || map.ink}`}>{children}</span>;
}

export function Bar({ value, max, tone = 'brand', delay = 0 }: { value: number; max: number; tone?: string; delay?: number }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  const grad: Record<string, string> = {
    brand: 'from-brand to-brand-soft', ok: 'from-ok to-emerald-400',
    warn: 'from-warn to-amber-300', bad: 'from-bad to-red-400', info: 'from-info to-sky-400',
  };
  return (
    <div className="h-2.5 rounded-full bg-ink/[0.06] overflow-hidden">
      <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }}
        transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
        className={`h-full rounded-full bg-gradient-to-r ${grad[tone] || grad.brand}`} />
    </div>
  );
}

export const sevTone: Record<string, string> = { critica: 'bad', alta: 'warn', media: 'info', baja: 'ink', ok: 'ok' };
export const estadoTone: Record<string, string> = { resuelto: 'ok', aplicado: 'ok', pendiente: 'warn', descartado: 'info' };

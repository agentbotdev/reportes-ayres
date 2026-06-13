import { motion } from 'framer-motion';
import {
  MessageSquare, Share2, Tag, Flame, Brain, ShieldCheck, Wrench,
  type LucideIcon,
} from 'lucide-react';
import type { ReactNode } from 'react';

const icons: Record<string, LucideIcon> = {
  messages: MessageSquare, share: Share2, tag: Tag, flame: Flame,
  brain: Brain, shield: ShieldCheck, wrench: Wrench,
};

const toneText: Record<string, string> = {
  brand: 'text-brand', ok: 'text-ok', warn: 'text-warn', bad: 'text-bad', info: 'text-info', ink: 'text-ink',
};
const toneBg: Record<string, string> = {
  brand: 'bg-brand/10', ok: 'bg-ok/10', warn: 'bg-warn/10', bad: 'bg-bad/10', info: 'bg-info/10', ink: 'bg-ink/10',
};

export function Card({ children, className = '', delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] }}
      className={`card rounded-3xl ${className}`}
    >
      {children}
    </motion.div>
  );
}

export function KpiCard({ k, delay = 0 }: { k: { label: string; value: string | number; sub?: string; icon?: string; tone?: string }; delay?: number }) {
  const Icon = icons[k.icon || 'messages'] || MessageSquare;
  const tone = k.tone || 'brand';
  return (
    <Card delay={delay} className="p-5">
      <div className="flex items-start justify-between">
        <div className={`w-11 h-11 rounded-2xl grid place-items-center ${toneBg[tone]}`}>
          <Icon size={20} className={toneText[tone]} />
        </div>
      </div>
      <div className="mt-4 text-3xl font-extrabold tracking-tight text-ink tabular-nums">{k.value}</div>
      <div className="mt-1 text-[13px] font-bold text-ink/80">{k.label}</div>
      {k.sub && <div className="text-[11px] font-medium text-slatey mt-0.5">{k.sub}</div>}
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

export function Badge({ children, tone = 'ink' }: { children: ReactNode; tone?: 'ok' | 'warn' | 'bad' | 'info' | 'brand' | 'ink' }) {
  const map: Record<string, string> = {
    ok: 'bg-ok/10 text-ok', warn: 'bg-warn/15 text-yellow-700', bad: 'bg-bad/10 text-bad',
    info: 'bg-info/10 text-info', brand: 'bg-brand/10 text-brand', ink: 'bg-ink/8 text-ink/70',
  };
  return <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10.5px] font-bold ${map[tone]}`}>{children}</span>;
}

export function Bar({ value, max, tone = 'brand' }: { value: number; max: number; tone?: string }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  const grad: Record<string, string> = {
    brand: 'from-brand to-brand-soft', ok: 'from-ok to-emerald-400',
    warn: 'from-warn to-amber-300', bad: 'from-bad to-red-400', info: 'from-info to-sky-400',
  };
  return (
    <div className="h-2.5 rounded-full bg-ink/[0.06] overflow-hidden">
      <motion.div
        initial={{ width: 0 }} animate={{ width: `${pct}%` }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        className={`h-full rounded-full bg-gradient-to-r ${grad[tone] || grad.brand}`}
      />
    </div>
  );
}

export const sevTone: Record<string, 'bad' | 'warn' | 'info' | 'ok'> = {
  critica: 'bad', alta: 'warn', media: 'info', baja: 'ink' as 'info', ok: 'ok',
};
export const estadoTone: Record<string, 'ok' | 'warn' | 'info'> = {
  resuelto: 'ok', aplicado: 'ok', pendiente: 'warn', investigando: 'info', descartado: 'info',
};

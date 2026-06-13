import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, TrendingUp, Share2, Activity, Bug, UserCheck, ScrollText,
  ChevronDown, Calendar, Menu, X, type LucideIcon,
} from 'lucide-react';
import type { DayReport } from '../types';

export interface NavItem { id: string; label: string; icon: LucideIcon; }
export const NAV: NavItem[] = [
  { id: 'resumen', label: 'Resumen', icon: LayoutDashboard },
  { id: 'embudo', label: 'Embudo', icon: TrendingUp },
  { id: 'derivaciones', label: 'Derivaciones', icon: Share2 },
  { id: 'calidad', label: 'Calidad del bot', icon: Activity },
  { id: 'errores', label: 'Errores & Fixes', icon: Bug },
  { id: 'acciones', label: 'Acción humana', icon: UserCheck },
  { id: 'bitacora', label: 'Bitácora', icon: ScrollText },
];

function Logo() {
  return (
    <div className="flex items-center gap-2.5">
      <div className="w-9 h-9 rounded-xl brand-gradient grid place-items-center shadow-lg shadow-brand/30">
        <div className="flex items-end gap-[2px] h-4">
          <span className="w-[3px] h-2 bg-white/90 rounded-sm" />
          <span className="w-[3px] h-4 bg-white rounded-sm" />
          <span className="w-[3px] h-3 bg-white/90 rounded-sm" />
        </div>
      </div>
      <div className="leading-none">
        <div className="text-[15px] font-extrabold text-ink tracking-tight">Reportes Ayres</div>
        <div className="text-[10px] font-bold text-slatey tracking-wider uppercase">by AgentBot</div>
      </div>
    </div>
  );
}

function DaySelector({ reports, active, onPick }: { reports: DayReport[]; active: DayReport; onPick: (d: DayReport) => void }) {
  const [open, setOpen] = useState(false);
  const fmt = (f: string) => {
    const [, m, d] = f.split('-');
    const meses = ['', 'ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
    return `${d} ${meses[parseInt(m)]}`;
  };
  return (
    <div className="relative">
      <button onClick={() => setOpen(o => !o)} className="flex items-center gap-2 px-3.5 py-2 rounded-2xl glass hover:bg-white text-sm font-bold text-ink transition active:scale-95">
        <Calendar size={15} className="text-brand" />
        <span>{fmt(active.fecha)}</span>
        <span className="text-slatey font-medium hidden sm:inline">· {active.titulo}</span>
        <ChevronDown size={14} className={`text-slatey transition ${open ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              className="absolute right-0 mt-2 w-60 glass rounded-2xl p-1.5 z-40 shadow-xl">
              {reports.map(r => (
                <button key={r.fecha} onClick={() => { onPick(r); setOpen(false); }}
                  className={`w-full text-left px-3 py-2.5 rounded-xl text-sm transition ${r.fecha === active.fecha ? 'bg-brand text-white font-bold' : 'hover:bg-white/80 text-ink font-semibold'}`}>
                  <div className="flex items-center justify-between">
                    <span>{fmt(r.fecha)}</span>
                    <span className={`text-[10px] ${r.fecha === active.fecha ? 'text-white/80' : 'text-slatey'}`}>{r.titulo}</span>
                  </div>
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Layout({
  reports, active, onPickDay, section, onSection, children,
}: {
  reports: DayReport[]; active: DayReport; onPickDay: (d: DayReport) => void;
  section: string; onSection: (s: string) => void; children: React.ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const current = NAV.find(n => n.id === section)!;

  const SideContent = () => (
    <>
      <div className="px-5 pt-6 pb-5"><Logo /></div>
      <nav className="px-3 flex-1">
        {NAV.map(item => {
          const A = item.icon;
          const isActive = item.id === section;
          return (
            <button key={item.id} onClick={() => { onSection(item.id); setMobileOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-[13px] font-bold mb-1 transition-all duration-300 active:scale-95 group
              ${isActive ? 'bg-ink text-white shadow-xl shadow-ink/10' : 'text-slatey hover:bg-white hover:text-ink'}`}>
              <A size={18} className="shrink-0 transition group-hover:scale-110" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
      <div className="p-4">
        <div className="glass rounded-2xl p-3.5">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-ok animate-pulse-dot" />
            <span className="text-[11px] font-bold text-ink">Bot en producción</span>
          </div>
          <p className="text-[10px] text-slatey mt-1 font-medium leading-relaxed">Hotel Ayres del Champaquí · WhatsApp · n8n + gpt-5.4-mini</p>
        </div>
      </div>
    </>
  );

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar desktop */}
      <aside className="hidden lg:flex w-64 shrink-0 flex-col glass border-r border-slate-200/60">
        <SideContent />
      </aside>

      {/* Sidebar mobile */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-ink/20 backdrop-blur-sm lg:hidden" onClick={() => setMobileOpen(false)} />
            <motion.aside initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 26, stiffness: 240 }}
              className="fixed top-0 left-0 bottom-0 w-64 z-50 flex flex-col glass lg:hidden">
              <button onClick={() => setMobileOpen(false)} className="absolute top-5 right-4 text-slatey"><X size={20} /></button>
              <SideContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 shrink-0 flex items-center justify-between px-4 sm:px-7 glass border-b border-slate-200/60">
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileOpen(true)} className="lg:hidden text-ink"><Menu size={22} /></button>
            <div className="flex items-center gap-2.5">
              <current.icon size={18} className="text-brand" />
              <h1 className="text-base font-extrabold text-ink tracking-tight">{current.label}</h1>
            </div>
          </div>
          <DaySelector reports={reports} active={active} onPick={onPickDay} />
        </header>
        <main className="flex-1 overflow-y-auto px-4 sm:px-7 py-6 no-scrollbar">
          <div className="max-w-6xl mx-auto pb-12">{children}</div>
        </main>
      </div>
    </div>
  );
}

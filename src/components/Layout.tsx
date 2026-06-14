import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Clock, TrendingUp, Share2, MessagesSquare, Activity, Bug, UserCheck, ScrollText,
  ChevronDown, Calendar, Menu, X, Download, LineChart, Table2, type LucideIcon,
} from 'lucide-react';

export interface NavItem { id: string; label: string; icon: LucideIcon; }
export const NAV: NavItem[] = [
  { id: 'resumen', label: 'Resumen', icon: LayoutDashboard },
  { id: 'evolucion', label: 'Evolución', icon: LineChart },
  { id: 'actividad', label: 'Por hora', icon: Clock },
  { id: 'embudo', label: 'Embudo de ventas', icon: TrendingUp },
  { id: 'derivaciones', label: 'Pasadas al equipo', icon: Share2 },
  { id: 'conversaciones', label: 'Todos los chats', icon: MessagesSquare },
  { id: 'calidad', label: 'Calidad del bot', icon: Activity },
  { id: 'errores', label: 'Errores y arreglos', icon: Bug },
  { id: 'acciones', label: 'Para llamar', icon: UserCheck },
  { id: 'bitacora', label: 'Qué hicimos', icon: ScrollText },
];

const MESES = ['', 'ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
export const scopeLabel = (s: string) => {
  if (s === 'todo') return 'Todo el período';
  const [, m, d] = s.split('-');
  return `${parseInt(d)} ${MESES[parseInt(m)]}`;
};

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

function ScopeSelector({ scopes, active, onPick }: { scopes: string[]; active: string; onPick: (s: string) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button onClick={() => setOpen(o => !o)} className="flex items-center gap-2 px-3.5 py-2 rounded-2xl glass hover:bg-white text-sm font-bold text-ink transition active:scale-95">
        <Calendar size={15} className="text-brand" />
        <span>{scopeLabel(active)}</span>
        <ChevronDown size={14} className={`text-slatey transition ${open ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              className="absolute right-0 mt-2 w-52 glass rounded-2xl p-1.5 z-40 shadow-xl">
              {['todo', ...scopes].map(s => (
                <button key={s} onClick={() => { onPick(s); setOpen(false); }}
                  className={`w-full text-left px-3 py-2.5 rounded-xl text-sm transition ${s === active ? 'bg-brand text-white font-bold' : 'hover:bg-white/80 text-ink font-semibold'}`}>
                  {scopeLabel(s)}
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
  scopes, scope, onScope, section, onSection, children, onPrint, onExportCsv,
}: {
  scopes: string[]; scope: string; onScope: (s: string) => void;
  section: string; onSection: (s: string) => void; children: React.ReactNode; onPrint: () => void; onExportCsv: () => void;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const current = NAV.find(n => n.id === section)!;

  const SideContent = () => (
    <>
      <div className="px-5 pt-6 pb-5"><Logo /></div>
      <nav className="px-3 flex-1 overflow-y-auto no-scrollbar">
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
          <p className="text-[10px] text-slatey mt-1 font-medium leading-relaxed">Hotel Ayres del Champaquí · WhatsApp</p>
        </div>
      </div>
    </>
  );

  return (
    <div className="flex h-screen overflow-hidden">
      <aside className="hidden lg:flex w-64 shrink-0 flex-col glass border-r border-slate-200/60">
        <SideContent />
      </aside>

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

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 shrink-0 flex items-center justify-between px-4 sm:px-7 glass border-b border-slate-200/60 relative z-50">
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileOpen(true)} className="lg:hidden text-ink"><Menu size={22} /></button>
            <div className="flex items-center gap-2.5">
              <current.icon size={18} className="text-brand" />
              <h1 className="text-base font-extrabold text-ink tracking-tight">{current.label}</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={onExportCsv} title="Descargar las conversaciones en CSV (Excel)"
              className="flex items-center gap-2 px-3 py-2 rounded-2xl glass hover:bg-white text-sm font-bold text-ink transition active:scale-95">
              <Table2 size={15} className="text-brand" /><span className="hidden md:inline">CSV</span>
            </button>
            <button onClick={onPrint} title="Descargar este reporte en PDF"
              className="flex items-center gap-2 px-3.5 py-2 rounded-2xl brand-gradient text-white text-sm font-bold transition active:scale-95 shadow-lg shadow-brand/20 hover:shadow-brand/30">
              <Download size={15} /><span className="hidden sm:inline">Descargar PDF</span>
            </button>
            <ScopeSelector scopes={scopes} active={scope} onPick={onScope} />
          </div>
        </header>
        <main className="flex-1 overflow-y-auto px-4 sm:px-7 py-6 no-scrollbar">
          <div className="max-w-6xl mx-auto pb-12">{children}</div>
        </main>
      </div>
    </div>
  );
}

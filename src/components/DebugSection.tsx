import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Server, Brain, Workflow, Calculator, FileText, CheckCircle2, XCircle,
  ChevronLeft, ChevronRight, AlertTriangle, ExternalLink, Link2,
  type LucideIcon,
} from 'lucide-react';
import { CATEGORIES, findBug, findCategory, type BugCategory, type BugEntry, type Severity, type Status } from '../data/debugData';
import { Card, Badge, SectionHeader } from './ui';
import FlowDiagram from './FlowDiagram';

const catIcons: Record<string, LucideIcon> = {
  server: Server, brain: Brain, workflow: Workflow, calculator: Calculator,
  'file-text': FileText, 'check-circle': CheckCircle2, 'x-circle': XCircle,
};

const sevColors: Record<Severity, { bg: string; text: string; label: string }> = {
  critica: { bg: 'bg-red-100', text: 'text-red-700', label: 'Crítica' },
  alta:    { bg: 'bg-orange-100', text: 'text-orange-700', label: 'Alta' },
  media:   { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Media' },
  baja:    { bg: 'bg-slate-100', text: 'text-slate-600', label: 'Baja' },
};

const statusColors: Record<Status, { bg: string; text: string; label: string }> = {
  resuelto: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Resuelto' },
  activo:   { bg: 'bg-red-100', text: 'text-red-700', label: 'Activo' },
  cerrado:  { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Cerrado' },
};

function SevBadge({ sev }: { sev: Severity }) {
  const c = sevColors[sev];
  return <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${c.bg} ${c.text}`}>{c.label}</span>;
}

function StatusBadge({ status }: { status: Status }) {
  const c = statusColors[status];
  return <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${c.bg} ${c.text}`}>{c.label}</span>;
}

function Breadcrumb({ items, onNavigate }: { items: { label: string; action?: () => void }[]; onNavigate?: (view: string) => void }) {
  return (
    <div className="flex items-center gap-1.5 text-[12px] font-semibold text-slate-400 mb-5">
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-1.5">
          {i > 0 && <ChevronRight size={12} />}
          {item.action ? (
            <button onClick={item.action} className="text-brand hover:text-indigo-700 transition">{item.label}</button>
          ) : (
            <span className="text-slate-600">{item.label}</span>
          )}
        </span>
      ))}
    </div>
  );
}

function CategoriesView({ onSelect }: { onSelect: (id: string) => void }) {
  return (
    <div className="space-y-5">
      <SectionHeader icon={Server} title="Debug — CRM de errores" desc={`${CATEGORIES.reduce((s, c) => s + c.bugs.length, 0)} errores auditados en 7 categorías`} />

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {CATEGORIES.map((cat, i) => {
          const Icon = catIcons[cat.icon] || Server;
          const resolved = cat.bugs.filter(b => b.status === 'resuelto' || b.status === 'cerrado').length;
          const active = cat.bugs.filter(b => b.status === 'activo').length;
          const total = cat.bugs.length;
          const pctResolved = total > 0 ? Math.round((resolved / total) * 100) : 0;

          return (
            <motion.button
              key={cat.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              onClick={() => onSelect(cat.id)}
              className="text-left card rounded-3xl p-5 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden"
            >
              <div className="absolute -right-8 -top-8 w-24 h-24 rounded-full opacity-[0.08] blur-xl" style={{ background: cat.color }} />

              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-2xl grid place-items-center" style={{ background: `${cat.color}18` }}>
                  <Icon size={18} style={{ color: cat.color }} />
                </div>
                <div>
                  <div className="text-[14px] font-extrabold text-slate-800">{cat.label}</div>
                  <div className="text-[11px] text-slate-500 font-medium">{total} {total === 1 ? 'error' : 'errores'}</div>
                </div>
              </div>

              <p className="text-[11.5px] text-slate-500 font-medium leading-relaxed mb-3">{cat.description}</p>

              <div className="flex items-center gap-2 mb-2">
                {active > 0 && <Badge tone="bad">{active} activo{active > 1 ? 's' : ''}</Badge>}
                {resolved > 0 && <Badge tone="ok">{resolved} resuelto{resolved > 1 ? 's' : ''}</Badge>}
              </div>

              <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${pctResolved}%` }}
                  transition={{ delay: i * 0.06 + 0.3, duration: 0.6 }}
                  className="h-full rounded-full bg-emerald-400"
                />
              </div>
              <div className="text-[10px] text-slate-400 font-medium mt-1">{pctResolved}% resuelto</div>

              <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition">
                <ChevronRight size={18} className="text-slate-400" />
              </div>
            </motion.button>
          );
        })}
      </div>

      <Card className="p-5">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-[28px] font-extrabold text-emerald-600">{CATEGORIES.reduce((s, c) => s + c.bugs.filter(b => b.status !== 'activo').length, 0)}</div>
            <div className="text-[12px] font-bold text-slate-500">Resueltos</div>
          </div>
          <div>
            <div className="text-[28px] font-extrabold text-red-500">{CATEGORIES.reduce((s, c) => s + c.bugs.filter(b => b.status === 'activo').length, 0)}</div>
            <div className="text-[12px] font-bold text-slate-500">Activos</div>
          </div>
          <div>
            <div className="text-[28px] font-extrabold text-indigo-600">{CATEGORIES.reduce((s, c) => s + c.bugs.length, 0)}</div>
            <div className="text-[12px] font-bold text-slate-500">Total auditados</div>
          </div>
        </div>
      </Card>
    </div>
  );
}

function BugListView({ category, onSelect, onBack }: { category: BugCategory; onSelect: (id: string) => void; onBack: () => void }) {
  const Icon = catIcons[category.icon] || Server;

  return (
    <div className="space-y-4">
      <Breadcrumb items={[
        { label: 'Debug', action: onBack },
        { label: category.label },
      ]} />

      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-2xl grid place-items-center" style={{ background: `${category.color}18` }}>
          <Icon size={18} style={{ color: category.color }} />
        </div>
        <div>
          <h2 className="text-lg font-extrabold text-slate-800">{category.label}</h2>
          <p className="text-[12px] text-slate-500 font-medium">{category.bugs.length} errores · {category.description}</p>
        </div>
      </div>

      <div className="space-y-3">
        {category.bugs.map((bug, i) => (
          <motion.button
            key={bug.id}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.04, duration: 0.35 }}
            onClick={() => onSelect(bug.id)}
            className="w-full text-left card rounded-2xl p-4 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 group"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1.5">
                  <span className="text-[11px] font-mono font-bold text-slate-400">{bug.id}</span>
                  <span className="text-[14px] font-extrabold text-slate-800">{bug.title}</span>
                  <SevBadge sev={bug.severity} />
                  <StatusBadge status={bug.status} />
                </div>
                <p className="text-[12px] text-slate-500 font-medium leading-relaxed">{bug.summary}</p>
                <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-400 font-medium">
                  <span>{bug.dateDetected}</span>
                  <span>{bug.magnitude}</span>
                  {bug.convIds && bug.convIds.length > 0 && (
                    <span className="flex items-center gap-1"><ExternalLink size={10} /> conv {bug.convIds[0]}</span>
                  )}
                </div>
              </div>
              <ChevronRight size={18} className="text-slate-300 shrink-0 mt-2 group-hover:text-brand transition" />
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}

function BugDetailView({ bug, onBack, onBackToCategories }: { bug: BugEntry; onBack: () => void; onBackToCategories: () => void }) {
  const cat = CATEGORIES.find(c => c.id === bug.category);

  return (
    <div className="space-y-5">
      <Breadcrumb items={[
        { label: 'Debug', action: onBackToCategories },
        { label: cat?.label || '', action: onBack },
        { label: bug.id },
      ]} />

      <Card className="p-6 relative overflow-hidden">
        <div className="absolute -right-12 -top-12 w-32 h-32 rounded-full opacity-[0.06] blur-xl"
          style={{ background: bug.status === 'activo' ? '#EF4444' : '#10B981' }} />

        <div className="flex items-center gap-2 flex-wrap mb-3">
          <span className="text-[12px] font-mono font-bold text-slate-400">{bug.id}</span>
          <h2 className="text-xl font-extrabold text-slate-800">{bug.title}</h2>
          <SevBadge sev={bug.severity} />
          <StatusBadge status={bug.status} />
        </div>

        <p className="text-[13px] text-slate-600 font-medium leading-relaxed mb-4">{bug.summary}</p>

        <div className="grid sm:grid-cols-2 gap-3">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Detectado</div>
            <div className="text-[13px] font-bold text-slate-700">{bug.dateDetected}</div>
          </div>
          {bug.dateFixed && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100">
              <div className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider mb-1">Resuelto</div>
              <div className="text-[13px] font-bold text-emerald-700">{bug.dateFixed}</div>
            </div>
          )}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Magnitud</div>
            <div className="text-[13px] font-bold text-slate-700">{bug.magnitude}</div>
          </div>
          {bug.convIds && bug.convIds.length > 0 && (
            <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-100">
              <div className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider mb-1">Conversaciones</div>
              <div className="flex flex-wrap gap-1.5">
                {bug.convIds.map(id => (
                  <a key={id} href={`https://chathotelayres.agentbotdev.com/app/accounts/1/conversations/${id}`}
                    target="_blank" rel="noreferrer"
                    className="text-[12px] font-bold text-brand hover:text-indigo-700 flex items-center gap-0.5">
                    #{id} <ExternalLink size={9} />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        {bug.execIds && bug.execIds.length > 0 && (
          <div className="mt-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Ejecuciones n8n</div>
            <div className="flex flex-wrap gap-2">
              {bug.execIds.map(id => (
                <span key={id} className="text-[12px] font-mono font-bold text-slate-600">exec {id}</span>
              ))}
            </div>
          </div>
        )}
      </Card>

      {bug.quote && (
        <Card className="p-5">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Cita textual</div>
          <div className="p-3 rounded-xl bg-amber-50 border border-amber-100">
            <p className="text-[12px] text-slate-700 font-medium italic leading-relaxed">"{bug.quote}"</p>
          </div>
        </Card>
      )}

      <Card className="p-5">
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-red-50/50 border border-red-100">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle size={14} className="text-red-500" />
              <span className="text-[11px] font-bold text-red-600 uppercase tracking-wider">Causa raíz</span>
            </div>
            <p className="text-[12px] text-slate-700 font-medium leading-relaxed">{bug.cause}</p>
          </div>
          <div className={`p-4 rounded-2xl border ${bug.status === 'activo' ? 'bg-orange-50/50 border-orange-100' : 'bg-emerald-50/50 border-emerald-100'}`}>
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 size={14} className={bug.status === 'activo' ? 'text-orange-500' : 'text-emerald-500'} />
              <span className={`text-[11px] font-bold uppercase tracking-wider ${bug.status === 'activo' ? 'text-orange-600' : 'text-emerald-600'}`}>
                {bug.status === 'activo' ? 'Fix propuesto' : 'Solución aplicada'}
              </span>
            </div>
            <p className="text-[12px] text-slate-700 font-medium leading-relaxed">{bug.fix}</p>
          </div>
        </div>
        {bug.verification && (
          <div className="mt-3 p-3 rounded-xl bg-emerald-50 border border-emerald-100">
            <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Verificación: </span>
            <span className="text-[12px] text-slate-700 font-medium">{bug.verification}</span>
          </div>
        )}
      </Card>

      <Card className="p-5">
        <div className="text-[12px] font-bold text-slate-800 mb-4 flex items-center gap-2">
          <Workflow size={15} className="text-brand" />
          Flujo del error — cadena paso a paso
        </div>
        <FlowDiagram flow={bug.flow} />
      </Card>

      {bug.tracker && (
        <Card className="p-5">
          <div className="text-[12px] font-bold text-slate-800 mb-3 flex items-center gap-2">
            <CheckCircle2 size={15} className="text-brand" />
            Tracker — pasos para solucionar
          </div>
          <div className="space-y-2">
            {bug.tracker.steps.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 }}
                className={`flex items-center gap-3 p-3 rounded-xl border ${step.done ? 'bg-emerald-50 border-emerald-200' : 'bg-white border-slate-200'}`}
              >
                <div className={`w-6 h-6 rounded-lg grid place-items-center shrink-0 ${step.done ? 'bg-emerald-100' : 'bg-slate-100'}`}>
                  {step.done ? (
                    <CheckCircle2 size={14} className="text-emerald-500" />
                  ) : (
                    <span className="text-[11px] font-bold text-slate-400">{i + 1}</span>
                  )}
                </div>
                <span className={`text-[12px] font-medium ${step.done ? 'text-emerald-700 line-through' : 'text-slate-700'}`}>{step.label}</span>
              </motion.div>
            ))}
          </div>
        </Card>
      )}

      {bug.connections && bug.connections.length > 0 && (
        <Card className="p-5">
          <div className="text-[12px] font-bold text-slate-800 mb-3 flex items-center gap-2">
            <Link2 size={15} className="text-brand" />
            Errores relacionados
          </div>
          <div className="flex flex-wrap gap-2">
            {bug.connections.map(connId => {
              const connected = findBug(connId);
              if (!connected) return <Badge key={connId} tone="ink">{connId}</Badge>;
              return (
                <button key={connId}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold bg-indigo-50 text-brand border border-indigo-100 hover:bg-indigo-100 transition">
                  {connId}: {connected.title}
                </button>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
}

export default function DebugSection() {
  const [view, setView] = useState<'categories' | 'list' | 'detail'>('categories');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedBug, setSelectedBug] = useState('');

  const handleSelectCategory = (id: string) => {
    setSelectedCategory(id);
    setView('list');
  };

  const handleSelectBug = (id: string) => {
    setSelectedBug(id);
    setView('detail');
  };

  const handleBackToCategories = () => {
    setView('categories');
    setSelectedCategory('');
    setSelectedBug('');
  };

  const handleBackToList = () => {
    setView('list');
    setSelectedBug('');
  };

  const category = findCategory(selectedCategory);
  const bug = findBug(selectedBug);

  return (
    <AnimatePresence mode="wait">
      {view === 'categories' && (
        <motion.div key="categories" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, x: -20 }}>
          <CategoriesView onSelect={handleSelectCategory} />
        </motion.div>
      )}
      {view === 'list' && category && (
        <motion.div key="list" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
          <BugListView category={category} onSelect={handleSelectBug} onBack={handleBackToCategories} />
        </motion.div>
      )}
      {view === 'detail' && bug && (
        <motion.div key="detail" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
          <BugDetailView bug={bug} onBack={handleBackToList} onBackToCategories={handleBackToCategories} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

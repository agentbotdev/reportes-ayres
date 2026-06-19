import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, AlertTriangle, Eye, Wrench, Clock, Info } from 'lucide-react';
import type { BugFlow, FlowNode, NodeType } from '../data/debugData';

const nodeConfig: Record<NodeType, { bg: string; border: string; icon: typeof CheckCircle2; iconColor: string }> = {
  ok:      { bg: 'bg-emerald-50', border: 'border-emerald-200', icon: CheckCircle2, iconColor: 'text-emerald-500' },
  fail:    { bg: 'bg-red-50',     border: 'border-red-200',     icon: XCircle,      iconColor: 'text-red-500' },
  impact:  { bg: 'bg-amber-50',   border: 'border-amber-200',   icon: AlertTriangle, iconColor: 'text-amber-500' },
  client:  { bg: 'bg-blue-50',    border: 'border-blue-200',     icon: Eye,          iconColor: 'text-blue-500' },
  fix:     { bg: 'bg-emerald-50', border: 'border-emerald-300',  icon: Wrench,       iconColor: 'text-emerald-600' },
  pending: { bg: 'bg-orange-50',  border: 'border-orange-200',   icon: Clock,        iconColor: 'text-orange-500' },
  info:    { bg: 'bg-slate-50',   border: 'border-slate-200',    icon: Info,         iconColor: 'text-slate-500' },
};

function FlowNodeCard({ node, index }: { node: FlowNode; index: number }) {
  const cfg = nodeConfig[node.type];
  const Icon = cfg.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: index * 0.08, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className={`relative p-4 rounded-2xl border-2 ${cfg.bg} ${cfg.border} shadow-sm hover:shadow-md transition-shadow duration-300`}
    >
      <div className="flex items-start gap-3">
        <div className={`w-8 h-8 rounded-xl grid place-items-center shrink-0 ${cfg.bg}`}>
          <Icon size={16} className={cfg.iconColor} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[13px] font-bold text-slate-800 leading-snug">{node.label}</div>
          {node.detail && (
            <div className="text-[11px] text-slate-500 font-medium mt-1 leading-relaxed">{node.detail}</div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function Arrow({ index }: { index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, scaleY: 0 }}
      animate={{ opacity: 1, scaleY: 1 }}
      transition={{ delay: index * 0.08 + 0.04, duration: 0.3 }}
      className="flex justify-center py-1"
    >
      <div className="flex flex-col items-center">
        <div className="w-[2px] h-5 bg-gradient-to-b from-slate-300 to-slate-400" />
        <div className="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[6px] border-t-slate-400" />
      </div>
    </motion.div>
  );
}

export default function FlowDiagram({ flow }: { flow: BugFlow }) {
  const orderedNodes = getOrderedNodes(flow);

  return (
    <div className="max-w-lg mx-auto">
      {orderedNodes.map((node, i) => (
        <div key={node.id}>
          <FlowNodeCard node={node} index={i} />
          {i < orderedNodes.length - 1 && <Arrow index={i} />}
        </div>
      ))}
    </div>
  );
}

function getOrderedNodes(flow: BugFlow): FlowNode[] {
  if (!flow.edges.length) return flow.nodes;

  const adj = new Map<string, string[]>();
  const inDeg = new Map<string, number>();
  for (const n of flow.nodes) {
    adj.set(n.id, []);
    inDeg.set(n.id, 0);
  }
  for (const [from, to] of flow.edges) {
    adj.get(from)?.push(to);
    inDeg.set(to, (inDeg.get(to) || 0) + 1);
  }

  const queue = flow.nodes.filter(n => (inDeg.get(n.id) || 0) === 0).map(n => n.id);
  const ordered: FlowNode[] = [];
  const visited = new Set<string>();

  while (queue.length) {
    const id = queue.shift()!;
    if (visited.has(id)) continue;
    visited.add(id);
    const node = flow.nodes.find(n => n.id === id);
    if (node) ordered.push(node);
    for (const next of adj.get(id) || []) {
      if (!visited.has(next)) queue.push(next);
    }
  }

  for (const n of flow.nodes) {
    if (!visited.has(n.id)) ordered.push(n);
  }

  return ordered;
}

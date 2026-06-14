import type { Conv } from '../data/conversations';
import { arTime } from './metrics';

// Exporta las conversaciones del scope actual a CSV (abre bien en Excel — incluye BOM).
export function downloadCsv(cs: Conv[], scope: string) {
  const headers = ['id', 'nombre', 'numero', 'creada', 'ultima_actividad', 'etapa', 'temperatura', 'habitacion', 'derivado', 'razon_derivacion', 'manual', 'msgs_cliente', 'msgs_bot', 'primer_mensaje'];
  const esc = (v: unknown) => {
    const s = String(v ?? '');
    return /[",\n;]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
  };
  const rows = cs.map(c => [
    c.id, c.nombre, c.numero, arTime(c.creada), arTime(c.ultimaAct), c.etapa, c.temperatura,
    c.habitacion, c.derivado ? 'si' : 'no', c.razon, c.manual ? 'si' : 'no', c.msgsCliente, c.msgsBot, c.primerMsg,
  ].map(esc).join(','));
  const csv = '﻿' + headers.join(',') + '\n' + rows.join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `martina-${scope}-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

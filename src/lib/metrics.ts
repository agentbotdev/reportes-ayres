import { conversations, type Conv, LAUNCH } from '../data/conversations';

// Hora Argentina (UTC-3) para todo lo que ve el usuario
const AR_OFFSET = -3 * 3600;
export const arDate = (epoch: number) => new Date((epoch + AR_OFFSET) * 1000);
export const arDayKey = (epoch: number) => arDate(epoch).toISOString().slice(0, 10);
export const arHourLabel = (epoch: number) => {
  const d = arDate(epoch);
  return `${String(d.getUTCDate()).padStart(2, '0')}/${String(d.getUTCMonth() + 1).padStart(2, '0')} ${String(d.getUTCHours()).padStart(2, '0')}h`;
};
export const arTime = (epoch: number) => {
  const d = arDate(epoch);
  return `${String(d.getUTCDate()).padStart(2, '0')}/${String(d.getUTCMonth() + 1).padStart(2, '0')} ${String(d.getUTCHours()).padStart(2, '0')}:${String(d.getUTCMinutes()).padStart(2, '0')}`;
};

export type Scope = 'todo' | string; // 'todo' | 'YYYY-MM-DD'

export function filterScope(scope: Scope): Conv[] {
  if (scope === 'todo') return conversations;
  return conversations.filter(c => c.creada >= LAUNCH && arDayKey(c.creada) === scope);
}

export const scopeDays = (): string[] => {
  const set = new Set<string>();
  conversations.forEach(c => { if (c.creada >= LAUNCH) set.add(arDayKey(c.creada)); });
  return [...set].sort().reverse();
};

const ETAPA_ORDER = ['presentacion', 'indagacion_1', 'indagacion_2', 'validacion_fechas', 'cotizacion_enviada', 'datos_para_reserva', 'cierre', 'reserva_confirmada', 'postventa'];
const ETAPA_LABEL: Record<string, string> = {
  presentacion: 'Presentación', indagacion_1: 'Indagación', indagacion_2: 'Indagación +datos',
  validacion_fechas: 'Validación fechas', cotizacion_enviada: 'Cotización enviada',
  datos_para_reserva: 'Datos de reserva', cierre: 'Cierre', reserva_confirmada: 'Reserva confirmada', postventa: 'Postventa',
};

export const RAZON_LABEL: Record<string, string> = {
  sin_disponibilidad: 'Sin disponibilidad', cierre_datos_reserva: 'Cierre → recepción',
  servicios_spa: 'Day Spa / tratamientos', evento: 'Eventos', pension_especial: 'Pensión / all-inclusive',
  petit_hotel: 'Suite Petit Hotel', grupo_grande: 'Grupo grande (6+)', grupo_o_vip: 'Grupo / VIP',
  voucher_giftcard: 'Voucher / gift card', consulta_general: 'Consulta general',
};
export const RAZON_OK: Record<string, 'si' | 'parcial' | 'no'> = {
  cierre_datos_reserva: 'si', servicios_spa: 'si', evento: 'si', pension_especial: 'si',
  petit_hotel: 'si', grupo_grande: 'si', grupo_o_vip: 'si', voucher_giftcard: 'si',
  sin_disponibilidad: 'parcial', consulta_general: 'parcial',
};

export function kpis(cs: Conv[]) {
  const bot = cs.filter(c => !c.manual);
  const cot = cs.filter(c => ['cotizacion_enviada', 'datos_para_reserva', 'cierre', 'reserva_confirmada'].includes(c.etapa));
  const datos = cs.filter(c => ['datos_para_reserva', 'cierre', 'reserva_confirmada'].includes(c.etapa));
  const der = cs.filter(c => c.derivado);
  const totMsgs = cs.reduce((a, c) => a + c.msgsCliente + c.msgsBot, 0);
  return {
    total: cs.length, bot: bot.length, manual: cs.length - bot.length,
    cotizadas: cot.length, cotPct: cs.length ? Math.round((cot.length / cs.length) * 100) : 0,
    datos: datos.length, datosPct: cs.length ? Math.round((datos.length / cs.length) * 100) : 0,
    derivadas: der.length, derPct: cs.length ? Math.round((der.length / cs.length) * 100) : 0,
    mensajes: totMsgs, msgPorConv: cs.length ? Math.round((totMsgs / cs.length) * 10) / 10 : 0,
  };
}

export function embudo(cs: Conv[]) {
  // embudo acumulativo: cuántas alcanzaron AL MENOS cada etapa
  const idx = (e: string) => ETAPA_ORDER.indexOf(e);
  const stages = ['presentacion', 'indagacion_2', 'validacion_fechas', 'cotizacion_enviada', 'datos_para_reserva'];
  return stages.map(s => ({
    etapa: s, label: ETAPA_LABEL[s],
    valor: cs.filter(c => c.etapa && idx(c.etapa) >= idx(s)).length,
  }));
}

export function derivaciones(cs: Conv[]) {
  const der = cs.filter(c => c.derivado);
  const groups: Record<string, Conv[]> = {};
  der.forEach(c => { (groups[c.razon] ||= []).push(c); });
  return Object.entries(groups)
    .map(([razon, list]) => ({
      razon, label: RAZON_LABEL[razon] || razon, cant: list.length,
      ok: RAZON_OK[razon] || 'parcial', convs: list,
    }))
    .sort((a, b) => b.cant - a.cant);
}

export function timeline(cs: Conv[]) {
  const map: Record<string, { hora: string; total: number; derivadas: number; cotizadas: number }> = {};
  cs.filter(c => c.creada >= LAUNCH).forEach(c => {
    const k = arHourLabel(c.creada);
    map[k] ||= { hora: k, total: 0, derivadas: 0, cotizadas: 0 };
    map[k].total++;
    if (c.derivado) map[k].derivadas++;
    if (['cotizacion_enviada', 'datos_para_reserva', 'cierre'].includes(c.etapa)) map[k].cotizadas++;
  });
  return Object.values(map).sort((a, b) => a.hora.localeCompare(b.hora));
}

export function habitaciones(cs: Conv[]) {
  return {
    master: cs.filter(c => c.habitacion.includes('master_suite')).length,
    loft: cs.filter(c => c.habitacion.includes('loft')).length,
  };
}

export function temperaturas(cs: Conv[]) {
  const order = ['caliente', 'interesado', 'nuevo', 'frio', 'derivado', 'caido', 'huesped'];
  const lbl: Record<string, string> = { caliente: 'Caliente', interesado: 'Interesado', nuevo: 'Nuevo', frio: 'Frío', derivado: 'Derivado', caido: 'Caído', huesped: 'Huésped' };
  const m: Record<string, number> = {};
  cs.forEach(c => { if (c.temperatura) m[c.temperatura] = (m[c.temperatura] || 0) + 1; });
  return order.filter(t => m[t]).map(t => ({ t, label: lbl[t], valor: m[t] }));
}

export { ETAPA_LABEL };

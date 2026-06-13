export type Sev = 'critica' | 'alta' | 'media' | 'baja' | 'ok';
export type Estado = 'resuelto' | 'aplicado' | 'pendiente' | 'investigando' | 'descartado';

export interface Kpi {
  label: string;
  value: string | number;
  sub?: string;
  delta?: string;
  trend?: 'up' | 'down' | 'flat';
  icon?: string;
  tone?: 'brand' | 'ok' | 'warn' | 'bad' | 'info' | 'ink';
}

export interface FunnelStage {
  etapa: string;
  label: string;
  valor: number;
}

export interface Derivacion {
  razon: string;
  label: string;
  cant: number;
  correcto: 'si' | 'parcial' | 'no';
  convs?: string[];
  nota?: string;
}

export interface ErrorItem {
  id: string;
  titulo: string;
  sev: Sev;
  estado: Estado;
  magnitud: string;
  causa: string;
  fix: string;
  evidencia?: string;
}

export interface FixItem {
  titulo: string;
  detalle: string;
  tipo: 'prompt' | 'nodo' | 'cotizador' | 'acumulador' | 'infra';
  estado: Estado;
  hora?: string;
}

export interface QualityMetric {
  label: string;
  value: string;
  meta?: string;
  tone: 'ok' | 'warn' | 'bad';
  nota?: string;
}

export interface HumanAction {
  prioridad: 'alta' | 'media' | 'baja';
  cliente: string;
  contacto?: string;
  conv: string;
  motivo: string;
  accion: string;
}

export interface BitacoraItem {
  hora: string;
  texto: string;
  tipo: 'deploy' | 'fix' | 'analisis' | 'decision' | 'nota';
}

export interface Prediccion {
  texto: string;
  riesgo: 'alto' | 'medio' | 'bajo';
}

export interface DayReport {
  fecha: string;            // YYYY-MM-DD
  titulo: string;
  ventana: string;
  resumen: string;
  kpis: Kpi[];
  embudo: FunnelStage[];
  embudoNota?: string;
  derivaciones: Derivacion[];
  derivacionTotal: number;
  derivacionPct: number;
  errores: ErrorItem[];
  fixes: FixItem[];
  funciona: { titulo: string; evidencia: string }[];
  calidad: QualityMetric[];
  habitaciones: { master: number; loft: number };
  acciones: HumanAction[];
  monitoreo: string[];
  predicciones: Prediccion[];
  bitacora: BitacoraItem[];
}

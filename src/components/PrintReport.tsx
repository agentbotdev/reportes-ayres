import type { Conv } from '../data/conversations';
import { conversations } from '../data/conversations';
import type { Narrative } from '../data/narrative';
import { EVOLUCION_HITOS, REPORTE_SELLO } from '../data/narrative';
import { kpis, embudo, derivaciones, habitaciones, evolucionDias } from '../lib/metrics';
import { scopeLabel } from './Layout';

// Documento de impresión: se renderiza limpio para "Guardar como PDF".
// Oculto en pantalla, visible solo al imprimir (ver @media print en index.css).
export default function PrintReport({ cs, nar, scope }: { cs: Conv[]; nar: Narrative; scope: string }) {
  const k = kpis(cs);
  const emb = embudo(cs);
  const der = derivaciones(cs);
  const hab = habitaciones(cs);
  const evol = evolucionDias(conversations); // siempre el período completo
  const fecha = new Date().toLocaleDateString('es-AR', { day: '2-digit', month: 'long', year: 'numeric' });
  const estadoTxt: Record<string, string> = { resuelto: 'Resuelto', aplicado: 'Aplicado', pendiente: 'Pendiente', descartado: 'Descartado' };

  return (
    <div className="print-doc">
      <header className="pr-head">
        <div>
          <h1>Reporte Bot Martina</h1>
          <p className="pr-sub">Hotel Ayres del Champaquí · {scopeLabel(scope)} · iniciado {REPORTE_SELLO.inicio}, generado {REPORTE_SELLO.generado} {REPORTE_SELLO.tz} · {fecha}</p>
        </div>
        <div className="pr-brand">AgentBot</div>
      </header>

      <p className="pr-resumen">{nar.resumen}</p>

      <h2>Métricas principales</h2>
      <div className="pr-kpis">
        <div><b>{k.total}</b><span>Conversaciones ({k.bot} bot · {k.manual} a mano)</span></div>
        <div><b>{k.cotPct}%</b><span>Recibieron cotización ({k.cotizadas})</span></div>
        <div><b>{k.datosPct}%</b><span>Dejaron datos para reservar ({k.datos})</span></div>
        <div><b>{k.derPct}%</b><span>Derivadas al equipo ({k.derivadas})</span></div>
        <div><b>{k.mensajes}</b><span>Mensajes ({k.msgPorConv} por chat)</span></div>
        <div><b>0</b><span>Precios inventados</span></div>
      </div>

      {scope === 'todo' && evol.length > 1 && (
        <div className="pr-block">
          <h2>Evolución día a día</h2>
          <table className="pr-table">
            <thead><tr><th>Día</th><th>Conversaciones</th><th>Cotización</th><th>Datos reserva</th><th>Derivadas</th></tr></thead>
            <tbody>
              {evol.map(d => (
                <tr key={d.dia}>
                  <td><b>{d.label}</b></td><td className="pr-num">{d.total}</td>
                  <td>{d.cotizadas} ({d.cotPct}%)</td><td className="pr-num">{d.datos}</td><td className="pr-num">{d.derivadas}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="pr-block">
        <h2>Embudo de conversión</h2>
        <table className="pr-table">
          <tbody>
            {emb.map(e => (
              <tr key={e.etapa}><td>{e.label}</td><td className="pr-num">{e.valor}</td>
                <td className="pr-barcell"><span className="pr-bar" style={{ width: `${(e.valor / (emb[0].valor || 1)) * 100}%` }} /></td></tr>
            ))}
          </tbody>
        </table>
        <p className="pr-mini">Interés por habitación: Master Suite {hab.master} · Loft de Montaña {hab.loft}.</p>
      </div>

      <div className="pr-block">
        <h2>Derivaciones al equipo ({k.derivadas})</h2>
        <table className="pr-table">
          <thead><tr><th>Motivo</th><th>Cantidad</th><th>Evaluación</th></tr></thead>
          <tbody>
            {der.map(d => (
              <tr key={d.razon}><td>{d.label}</td><td className="pr-num">{d.cant}</td>
                <td>{d.ok === 'si' ? 'Correcta' : d.ok === 'parcial' ? 'Mejorable' : 'Revisar'}</td></tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="pr-block">
        <h2>Errores detectados y estado</h2>
        <ol className="pr-errs">
          {nar.errores.map(e => (
            <li key={e.id}>
              <b>{e.titulo}</b> <span className={`pr-tag pr-tag-${e.estado}`}>{estadoTxt[e.estado] || e.estado}</span> <span className="pr-mag">{e.magnitud}</span>
              <div className="pr-err-body"><i>Qué pasó:</i> {e.causa} <br /><i>Solución:</i> {e.fix}{e.nota ? <><br /><i>Nota:</i> {e.nota}</> : null}</div>
            </li>
          ))}
        </ol>
      </div>

      <div className="pr-block">
        <h2>Calidad del bot</h2>
        <ul className="pr-cal">
          {nar.calidad.map((m, i) => <li key={i}><b>{m.value}</b> — {m.label}{m.meta ? ` (${m.meta})` : ''}{m.nota ? ` · ${m.nota}` : ''}</li>)}
        </ul>
      </div>

      <div className="pr-block">
        <h2>Acciones del equipo</h2>
        <ul className="pr-cal">
          {nar.acciones.map((a, i) => <li key={i}><b>{a.cliente}</b>{a.contacto ? ` (${a.contacto})` : ''} <span className={`pr-tag pr-pri-${a.prioridad}`}>{a.prioridad}</span> — {a.motivo} → {a.accion}</li>)}
        </ul>
      </div>

      {scope === 'todo' && (
        <div className="pr-block">
          <h2>Línea de tiempo del proyecto</h2>
          <ul className="pr-cal pr-timeline">
            {EVOLUCION_HITOS.map((h, i) => <li key={i}><b>{h.fecha}</b> · {h.titulo} — {h.detalle}</li>)}
          </ul>
        </div>
      )}

      <footer className="pr-foot">Reporte generado por AgentBot · Bot Martina en producción · {fecha}</footer>
    </div>
  );
}

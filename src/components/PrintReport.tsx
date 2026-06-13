import type { Conv } from '../data/conversations';
import type { Narrative } from '../data/narrative';
import { kpis, embudo, derivaciones, habitaciones } from '../lib/metrics';
import { scopeLabel } from './Layout';

// Documento de impresión: se renderiza limpio para "Guardar como PDF".
// Oculto en pantalla, visible solo al imprimir (ver @media print en index.css).
export default function PrintReport({ cs, nar, scope }: { cs: Conv[]; nar: Narrative; scope: string }) {
  const k = kpis(cs);
  const emb = embudo(cs);
  const der = derivaciones(cs);
  const hab = habitaciones(cs);
  const fecha = new Date().toLocaleDateString('es-AR', { day: '2-digit', month: 'long', year: 'numeric' });

  return (
    <div className="print-doc">
      <header className="pr-head">
        <div>
          <h1>Reporte Bot Martina</h1>
          <p className="pr-sub">Hotel Ayres del Champaquí · {scopeLabel(scope)} · generado el {fecha}</p>
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

      <h2>Errores detectados y soluciones</h2>
      <ol className="pr-errs">
        {nar.errores.map(e => (
          <li key={e.id}>
            <b>{e.titulo}</b> <span className="pr-tag">{e.estado}</span>
            <div className="pr-err-body"><i>Qué pasó:</i> {e.causa} <br /><i>Solución:</i> {e.fix}</div>
          </li>
        ))}
      </ol>

      <h2>Calidad del bot</h2>
      <ul className="pr-cal">
        {nar.calidad.map((m, i) => <li key={i}><b>{m.value}</b> — {m.label}{m.nota ? ` (${m.nota})` : ''}</li>)}
      </ul>

      <h2>Acciones del equipo</h2>
      <ul className="pr-cal">
        {nar.acciones.map((a, i) => <li key={i}><b>{a.cliente}</b> ({a.prioridad}) — {a.motivo} → {a.accion}</li>)}
      </ul>

      <footer className="pr-foot">Reporte generado por AgentBot · Bot Martina en producción · {fecha}</footer>
    </div>
  );
}

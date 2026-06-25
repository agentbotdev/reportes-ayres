import type { Conv } from '../data/conversations';
import { conversations } from '../data/conversations';
import type { Narrative } from '../data/narrative';
import { EVOLUCION_HITOS, REPORTE_SELLO, RESULTADOS, FUGAS, DERIVACIONES } from '../data/narrative';
import { kpis, embudo, habitaciones, evolucionDias } from '../lib/metrics';
import { scopeLabel } from './Layout';

// Documento de impresión: se renderiza limpio para "Guardar como PDF".
// Oculto en pantalla, visible solo al imprimir (ver @media print en index.css).
// Papel A4 blanco · informe de consultoría · todo sincronizado al 23/06 (986 conversaciones).
export default function PrintReport({ cs, nar, scope }: { cs: Conv[]; nar: Narrative; scope: string }) {
  const k = kpis(cs);
  const emb = embudo(cs);
  const hab = habitaciones(cs);
  const evol = evolucionDias(conversations); // siempre el período completo
  const fecha = new Date().toLocaleDateString('es-AR', { day: '2-digit', month: 'long', year: 'numeric' });
  const estadoTxt: Record<string, string> = { resuelto: 'Resuelto', aplicado: 'Aplicado', pendiente: 'Pendiente', descartado: 'Descartado' };

  return (
    <div className="print-doc">
      {/* ── 1 · Header ── */}
      <header className="pr-head">
        <div className="pr-head-left">
          <h1>Reporte Bot Martina</h1>
          <p className="pr-sub">Hotel Ayres del Champaquí · {scopeLabel(scope)}</p>
          <p className="pr-sello">Iniciado {REPORTE_SELLO.inicio} · generado {REPORTE_SELLO.generado} {REPORTE_SELLO.tz} · {fecha}</p>
        </div>
        <div className="pr-brand">
          <span className="pr-brand-name">AgentBot</span>
          <span className="pr-brand-tag">Informe de operación</span>
        </div>
      </header>

      {/* ── 2 · Resumen ejecutivo ── */}
      <section className="pr-block pr-exec">
        <h2>Resumen ejecutivo</h2>
        <p className="pr-resumen">{nar.resumen}</p>
      </section>

      {/* ── 3 · RESULTADOS · la plata que generó Martina (lo más importante) ── */}
      <section className="pr-block pr-results">
        <h2 className="pr-h2-star">La plata que generó Martina</h2>
        <p className="pr-results-lead">El resultado de negocio del período. Las cuatro cifras que importan:</p>
        <div className="pr-hero">
          {RESULTADOS.hero.map((h, i) => (
            <div key={i} className={`pr-hero-card pr-hero-${h.tone}`}>
              <div className="pr-hero-val">{h.value}</div>
              <div className="pr-hero-lbl">{h.label}</div>
              {h.sub ? <div className="pr-hero-sub">{h.sub}</div> : null}
            </div>
          ))}
        </div>

        <div className="pr-results-grid">
          <div className="pr-rcol">
            <div className="pr-rcol-title">Cómo se compone</div>
            <ul className="pr-rlist">
              {RESULTADOS.desglose.map((d, i) => (
                <li key={i}><b>{d.titulo}.</b> {d.detalle}</li>
              ))}
            </ul>
          </div>
          <div className="pr-rcol">
            <div className="pr-rcol-title">Evidencia y retorno</div>
            <div className="pr-fact">
              <span className="pr-fact-num">{RESULTADOS.evidencia.monto}</span>
              <span className="pr-fact-txt">{RESULTADOS.evidencia.texto}</span>
            </div>
            <div className="pr-fact">
              <span className="pr-fact-num">{RESULTADOS.roi.costo}/mes</span>
              <span className="pr-fact-txt">{RESULTADOS.roi.texto}</span>
            </div>
            <div className="pr-fact">
              <span className="pr-fact-num">{RESULTADOS.reactivaciones.cant} de {RESULTADOS.reactivaciones.base}</span>
              <span className="pr-fact-txt">{RESULTADOS.reactivaciones.texto}</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── 4 · Métricas principales ── */}
      <section className="pr-block">
        <h2>Métricas principales</h2>
        <div className="pr-kpis">
          <div><b>{k.total}</b><span>Conversaciones ({k.bot} bot · {k.manual} a mano)</span></div>
          <div><b>{k.cotPct}%</b><span>Recibieron cotización ({k.cotizadas})</span></div>
          <div><b>{k.datosPct}%</b><span>Dejaron datos para reservar ({k.datos})</span></div>
          <div><b>{k.derPct}%</b><span>Derivadas al equipo ({k.derivadas})</span></div>
          <div><b>{k.mensajes}</b><span>Mensajes ({k.msgPorConv} por chat)</span></div>
          <div><b>0</b><span>Precios inventados</span></div>
        </div>
      </section>

      {/* ── 5 · Embudo de conversión ── */}
      <section className="pr-block">
        <h2>Embudo de conversión</h2>
        <table className="pr-table pr-table-funnel">
          <tbody>
            {emb.map(e => (
              <tr key={e.etapa}>
                <td className="pr-funnel-lbl">{e.label}</td>
                <td className="pr-num">{e.valor}</td>
                <td className="pr-barcell">
                  <span className="pr-bar" style={{ width: `${(e.valor / (emb[0].valor || 1)) * 100}%` }} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="pr-mini">Interés por habitación: Master Suite {hab.master} · Loft de Montaña {hab.loft}.</p>
      </section>

      {/* ── 6 · Evolución día a día ── */}
      {scope === 'todo' && evol.length > 1 && (
        <section className="pr-block">
          <h2>Evolución día a día</h2>
          <table className="pr-table pr-table-zebra">
            <thead><tr><th>Día</th><th className="pr-th-num">Conversaciones</th><th>Cotización</th><th className="pr-th-num">Datos reserva</th><th className="pr-th-num">Derivadas</th></tr></thead>
            <tbody>
              {evol.map(d => (
                <tr key={d.dia}>
                  <td><b>{d.label}</b></td>
                  <td className="pr-num">{d.total}</td>
                  <td>{d.cotizadas} <span className="pr-soft">({d.cotPct}%)</span></td>
                  <td className="pr-num">{d.datos}</td>
                  <td className="pr-num">{d.derivadas}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {/* ── 7 · Derivaciones (DERIVACIONES de narrative · arreglado) ── */}
      <section className="pr-block">
        <h2>Derivaciones al equipo</h2>
        <p className="pr-mini pr-mini-lead">
          {DERIVACIONES.total} conversaciones derivadas ({DERIVACIONES.porcentaje} del total) ·
          de ellas, <b>{DERIVACIONES.cierresRecepcion} son cierres listos</b> que pasaron a recepción para reservar.
        </p>
        <table className="pr-table pr-table-zebra">
          <thead><tr><th>Tipo de derivación</th><th className="pr-th-num">Cantidad</th></tr></thead>
          <tbody>
            {DERIVACIONES.tipos.map(t => (
              <tr key={t.label}>
                <td>{t.label}</td>
                <td className="pr-num">{t.cant}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* ── 8 · Oportunidades (FUGAS, framing suave) ── */}
      <section className="pr-block">
        <h2>Oportunidades</h2>
        <p className="pr-mini pr-mini-lead">Tres frentes de mejora donde hay valor para capturar. No son problemas: son plata en pausa.</p>
        <div className="pr-opps">
          {FUGAS.map((o, i) => (
            <div key={i} className="pr-opp">
              <div className="pr-opp-head">
                <span className="pr-opp-title">{o.titulo}</span>
                {o.estimado ? <span className={`pr-opp-chip${o.esEstimacion ? ' pr-opp-chip-est' : ''}`}>{o.estimado}</span> : null}
              </div>
              <div className="pr-opp-body">
                <p><span className="pr-opp-k">Qué pasa hoy:</span> {o.quePasa}</p>
                <p><span className="pr-opp-k">La oportunidad:</span> {o.oportunidad}</p>
                <p><span className="pr-opp-k">Solución:</span> {o.solucion}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 9 · Calidad del bot ── */}
      <section className="pr-block">
        <h2>Calidad del bot</h2>
        <ul className="pr-quality">
          {nar.calidad.map((m, i) => (
            <li key={i}>
              <div className="pr-q-head">
                <b className="pr-q-val">{m.value}</b>
                <span className="pr-q-lbl">{m.label}{m.meta ? <span className="pr-soft"> · {m.meta}</span> : null}</span>
              </div>
              {m.nota ? <div className="pr-q-note">{m.nota}</div> : null}
              {m.benchmark ? <div className="pr-q-bench"><span className="pr-q-bench-k">Benchmark:</span> {m.benchmark}</div> : null}
            </li>
          ))}
        </ul>
      </section>

      {/* ── 10 · Errores detectados y estado ── */}
      <section className="pr-block">
        <h2>Errores detectados y estado</h2>
        <ol className="pr-errs">
          {nar.errores.map(e => (
            <li key={e.id + e.titulo}>
              <span className="pr-err-title"><b>{e.titulo}</b></span>
              <span className={`pr-tag pr-tag-${e.estado}`}>{estadoTxt[e.estado] || e.estado}</span>
              <span className="pr-mag">{e.magnitud}</span>
              <div className="pr-err-body"><i>Qué pasó:</i> {e.causa} <br /><i>Solución:</i> {e.fix}{e.nota ? <><br /><i>Nota:</i> {e.nota}</> : null}</div>
            </li>
          ))}
        </ol>
      </section>

      {/* ── 11 · Acciones para retomar ── */}
      {nar.acciones.length > 0 && (
        <section className="pr-block">
          <h2>Acciones para retomar</h2>
          <ul className="pr-actions">
            {nar.acciones.map((a, i) => (
              <li key={i}>
                <span className={`pr-tag pr-pri-${a.prioridad}`}>{a.prioridad}</span>
                <b>{a.cliente}</b>{a.contacto ? <span className="pr-soft"> ({a.contacto})</span> : ''}
                <span className="pr-act-body"> — {a.motivo} → <b>{a.accion}</b></span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* ── 12 · Línea de tiempo del proyecto ── */}
      {scope === 'todo' && (
        <section className="pr-block">
          <h2>Línea de tiempo del proyecto</h2>
          <ul className="pr-timeline">
            {EVOLUCION_HITOS.map((h, i) => (
              <li key={i}>
                <span className="pr-tl-date">{h.fecha}</span>
                <span className="pr-tl-body"><b>{h.titulo}</b> — {h.detalle}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* ── 13 · Footer ── */}
      <footer className="pr-foot">Reporte generado por AgentBot · Bot Martina en producción · Hotel Ayres del Champaquí · {fecha}</footer>
    </div>
  );
}

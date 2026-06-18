// ============================================================
// ANÁLISIS CUALITATIVO por scope (las métricas duras salen del dataset).
// 'todo' = consolidado del período · 'YYYY-MM-DD' = jornada puntual.
// ============================================================
export type Sev = 'critica' | 'alta' | 'media' | 'baja' | 'ok';
export type Estado = 'resuelto' | 'aplicado' | 'pendiente' | 'descartado';

export interface ErrorItem { id: string; titulo: string; sev: Sev; estado: Estado; magnitud: string; causa: string; fix: string; nota?: string; }
export interface FixItem { titulo: string; detalle: string; tipo: string; hora?: string; }
export interface QualityMetric { label: string; value: string; meta?: string; tone: 'ok' | 'warn' | 'bad'; nota?: string; }
export interface HumanAction { prioridad: 'alta' | 'media' | 'baja'; cliente: string; contacto?: string; conv: number; motivo: string; accion: string; }
export interface Bit { hora: string; texto: string; tipo: 'deploy' | 'fix' | 'analisis' | 'decision' | 'nota'; }
export interface Pred { texto: string; riesgo: 'alto' | 'medio' | 'bajo'; }
export interface Win { titulo: string; evidencia: string; }

export interface Narrative {
  resumen: string;
  destacados: string[];
  errores: ErrorItem[];
  fixes: FixItem[];
  funciona: Win[];
  calidad: QualityMetric[];
  acciones: HumanAction[];
  monitoreo: string[];
  predicciones: Pred[];
  bitacora: Bit[];
}

// ── Sello temporal del reporte ──
export const REPORTE_SELLO = { inicio: '11/06 19:33 (go-live)', generado: '17/06', tz: 'ART' };

// ── Línea de tiempo del proyecto (toda la vida del bot, unida por día) ──
export interface Hito { dia: string; fecha: string; tipo: 'deploy' | 'fix' | 'analisis' | 'bug' | 'decision'; titulo: string; detalle: string; }
export const EVOLUCION_HITOS: Hito[] = [
  { dia: '2026-06-11', fecha: '11/06', tipo: 'deploy', titulo: 'Go-live (19:33 ART)', detalle: 'Martina sale a producción con el cerebro nuevo, el cotizador real y un modelo más inteligente con respaldo. A la tarde se abre a todo el tráfico de WhatsApp.' },
  { dia: '2026-06-12', fecha: '12/06', tipo: 'fix', titulo: 'Se corrigen los errores del arranque', detalle: 'Primer día completo. El equipo reportó errores de información (spa, horarios, mensajes citados) y se corrigieron el mismo día. Se blindó el juntador de mensajes y se armó el cierre con derivación a recepción.' },
  { dia: '2026-06-13', fecha: '13/06', tipo: 'deploy', titulo: 'Divisor de mensajes a prueba de fallos', detalle: 'Se mejoró el sistema que separa los mensajes: ya no muestra saltos de línea raros ni repite mensajes. Validado: cero casos después del arreglo.' },
  { dia: '2026-06-14', fecha: '14/06', tipo: 'analisis', titulo: 'Día de mayor tráfico + análisis profundo', detalle: 'El día con más consultas (128). Se revisó toda la operación a fondo. La infraestructura aguantó sin caídas y se detectaron los puntos finos que quedan por pulir.' },
  { dia: '2026-06-15', fecha: '15/06', tipo: 'bug', titulo: 'Falla de lectura de PDF (sin crédito)', detalle: 'Día parejo. El lector de PDF (servicio externo pdf.co) se quedó sin crédito y un cliente que mandó un PDF no recibió respuesta. Se recarga y queda resuelto.' },
  { dia: '2026-06-16', fecha: '16/06', tipo: 'analisis', titulo: 'Buen día comercial + 2 fallas del cotizador', detalle: 'El día con más reservas iniciadas (13). Aparecieron 2 fallas del cotizador cuando un cliente no dijo cuántas personas eran (el bot mandó 0 y el sistema lo rechazó). Acotado y con arreglo claro.' },
  { dia: '2026-06-17', fecha: '17/06', tipo: 'analisis', titulo: 'Cierre de semana + medición fresca', detalle: 'Media jornada sin ninguna falla nueva. Se hizo la medición completa de los 7 días y la auditoría del cotizador: confirmó que la tarifa del Loft de julio ya está sana.' },
];

// ── Casos donde el bot brilló (del análisis cualitativo de las 72hs) ──
export const CASOS_72 = [
  { conv: 4505, titulo: 'La mejor del período', dia: '14/06', cita: 'Buenísimo, vamos con Loft de Montaña.', detalle: 'Resolvió una fecha vaga sin asumir de más, cotizó con precio real y al retomar 3hs después NO se re-presentó: confirmó la elección y avanzó al pago. Cierre completo, natural y sin un solo error.' },
  { conv: 3528, titulo: 'Cierre redondo', dia: '12/06', cita: 'Para reservar se abona una seña del 50% del total.', detalle: 'Explicó las formas de pago y la seña sin filtrar un solo dato bancario, pidió los datos y derivó limpio a recepción. El cierre comercial ideal.' },
  { conv: 4394, titulo: 'Reconoce su error', dia: '13/06', cita: 'Sí, tal cual, tenés razón 🙌', detalle: 'El cliente lo corrigió ("el 26 es viernes") y el bot reconoció el error con naturalidad, recalculó las fechas y re-cotizó sin fricción.' },
  { conv: 4420, titulo: 'Contesta todo y no inventa', dia: '13/06', cita: 'Pileta climatizada y circuito hídrico, ambos incluidos en la estadía.', detalle: 'Respondió todas las preguntas encadenadas leyendo el contexto y, cuando le preguntaron algo que no sabía, lo derivó en vez de inventar.' },
  { conv: 4542, titulo: 'Criterio con las edades', dia: '14/06', cita: 'Desde los 13 años ya se considera adulto en el hotel, ¿confirmo así?', detalle: 'No asumió: reclasificó la composición con criterio y pidió confirmación antes de cotizar.' },
  { conv: 4491, titulo: 'Calidez pura', dia: '14/06', cita: 'Sí, obvio, no molesta para nada 😊', detalle: 'Contuvo a la clienta que se disculpaba por preguntar mucho, cotizó media pensión con precio real y derivó natural.' },
  { conv: 4471, titulo: 'Resolutivo con un grupo', dia: '14/06', cita: 'Para 5 amigas te queda Loft + Loft 😊', detalle: 'Manejó un grupo de 5 y, cuando pidieron dos fechas distintas, cotizó ambas con el reparto de habitaciones claro.' },
  { conv: 4357, titulo: 'Lee al cliente', dia: '12/06', cita: 'Hola, María Cielo, gracias por escribirnos.', detalle: 'Saludó por el nombre real, no asumió la cantidad de personas y manejó la falta de disponibilidad con tacto, ofreciendo flexibilidad.' },
  { conv: 4709, titulo: 'Criterio con empatía', dia: '16/06', cita: 'Para una bebé celíaca y alérgica, lo mejor es coordinarlo con cocina.', detalle: 'Manejó con criterio y calidez el caso de una bebé con celiaquía y alergias, recomendando con fundamento y sin inventar.' },
  { conv: 4627, titulo: 'Insiste con tacto y cierra', dia: '15/06', cita: '¿Me confirmás el día de ingreso así te paso el precio exacto?', detalle: 'Leyó el contexto, insistió con tacto por la fecha concreta, cotizó con el reparto de habitaciones y una alternativa, y cerró cálido.' },
  { conv: 4692, titulo: 'Calidez genuina', dia: '16/06', cita: 'Jajaja sí, te entiendo 😄', detalle: 'Leyó el tono del cliente, le siguió el chiste y cerró con paciencia y empatía, sin sonar a formulario.' },
];
export const HUMANIDAD_DIA: Record<string, number> = { '2026-06-12': 5.9, '2026-06-13': 6.8, '2026-06-14': 6.4, '2026-06-15': 5.8, '2026-06-16': 6.2, '2026-06-17': 6.4 };

// ── Errores: RESUELTOS ──
const E_SPA: ErrorItem = { id: 'INFO', titulo: 'Decía que el spa/circuito hídrico se pagaba aparte', sev: 'critica', estado: 'resuelto', magnitud: 'Primeros días', causa: 'La información estaba cargada mal en las instrucciones del bot.', fix: 'Se reescribió qué entra en la tarifa (desayuno, circuito hídrico, saunas, piletas, gym, SUM) y qué se paga aparte (masajes, tratamientos, media pensión).' };
const E_LEAK: ErrorItem = { id: 'SEG', titulo: 'Filtró una instrucción interna a una clienta', sev: 'critica', estado: 'resuelto', magnitud: '1 conversación (Débora)', causa: 'El modelo copió textual una guía interna del sistema.', fix: 'Triple barrera de seguridad. No volvió a pasar: cero filtraciones en el resto del período.' };
const E_QUOTE: ErrorItem = { id: 'INFO', titulo: 'No leía los mensajes citados', sev: 'alta', estado: 'resuelto', magnitud: 'Primeros días', causa: 'Cuando el cliente respondía a un mensaje viejo, el bot no veía a qué se refería.', fix: 'Ahora resuelve la cita y la antepone al mensaje.' };
const E_CHECKOUT: ErrorItem = { id: 'INFO', titulo: 'Informaba mal el check-out (decía 11, es 10)', sev: 'alta', estado: 'resuelto', magnitud: 'Primeros días', causa: 'No tenía cargados los horarios, así que los inventó.', fix: 'Se cargaron los horarios y datos operativos reales.' };
const E_FRIO0: ErrorItem = { id: 'COMP', titulo: 'Cotizaba directo sin saludar primero', sev: 'media', estado: 'resuelto', magnitud: 'Primeros días', causa: 'Faltaba el saludo obligatorio en el primer contacto.', fix: 'Saludo y mensaje puente obligatorios antes de cotizar.' };
const E_HIDRO: ErrorItem = { id: 'INFO', titulo: 'Confundía el hidromasaje del Loft con el de la Master', sev: 'media', estado: 'resuelto', magnitud: 'Primeros días', causa: 'Faltaba el contraste claro entre las habitaciones.', fix: 'Se aclaró que la Master tiene hidromasaje en la habitación y el Loft no.' };
const E_FORMATO: ErrorItem = { id: 'FORM', titulo: 'Saltos de línea raros y mensajes repetidos', sev: 'media', estado: 'resuelto', magnitud: 'Pocos casos, día 2', causa: 'El divisor de mensajes cortaba mal algunos textos.', fix: 'Se reforzó el divisor: cero casos después del arreglo.' };
const E_NOMBRE: ErrorItem = { id: 'CRM', titulo: 'Guardaba el nombre del cliente vacío en el sistema', sev: 'baja', estado: 'resuelto', magnitud: 'Interno', causa: 'El registro pisaba el nombre real.', fix: 'Ahora toma el nombre del onboarding o el de WhatsApp.' };

// ── Errores: DETECCIONES EN INVESTIGACIÓN ──
const D_LOFT: ErrorItem = { id: 'COTIZ', titulo: 'Precios del Loft en julio (ya resuelto)', sev: 'ok', estado: 'resuelto', magnitud: 'Ya no se reproduce', causa: 'El cotizador devolvía la tarifa del Loft de julio muy por encima de lo normal. Era una tarifa corrupta del sistema de precios del hotel.', fix: 'Verificado fresco contra el cotizador: hoy el Loft de julio devuelve un precio sano (~$211.000/noche). El problema ya no se reproduce.', nota: 'Cerrado. Conviene blindar el cotizador para que no vuelva a pasar.' };
const D_FAMILY: ErrorItem = { id: 'COTIZ', titulo: 'La promo "Family x3" se aplica también al Loft', sev: 'alta', estado: 'pendiente', magnitud: 'Encarece el Loft de julio', causa: 'La promo, que debería ser solo para la Master, también se le aplica al Loft y lo encarece de más. Probable dato mal cargado en la base de promos.', fix: 'Corregir en la base de promos que "Family x3" aplique solo a la Master. No requiere tocar código.', nota: 'Afecta ventas del Loft.' };
const D_PAX0: ErrorItem = { id: 'COTIZ', titulo: 'Si el cliente no dice cuántas personas son, el cotizador falla', sev: 'alta', estado: 'pendiente', magnitud: '2 fallas reales (16/06)', causa: 'Cuando el cliente no especifica cuántos son, el bot manda "0 adultos" y el cotizador lo rechaza con error.', fix: 'Doble arreglo: que el cotizador pida el dato en vez de romperse, y que el bot siempre pregunte cuántas personas antes de cotizar.' };
const D_PDF: ErrorItem = { id: 'AISL', titulo: 'Lector de PDF sin crédito', sev: 'media', estado: 'pendiente', magnitud: '1 caso (15/06)', causa: 'El servicio externo que lee PDFs (pdf.co) se quedó sin crédito y un cliente que mandó un PDF no recibió respuesta.', fix: 'Recargar el crédito del servicio.' };
const D_SINDISP: ErrorItem = { id: 'NEG', titulo: 'Manejo de "sin disponibilidad"', sev: 'media', estado: 'pendiente', magnitud: 'A definir con recepción', causa: 'Cuando no hay lugar, el bot deriva. El cotizador ya calcula fechas alternativas con precio, pero hoy no se ofrecen.', fix: 'Definir con recepción si el bot ofrece esas fechas alternativas en vez de derivar.' };
const D_COMPO: ErrorItem = { id: 'NEG', titulo: 'Composición de grupos mixtos', sev: 'media', estado: 'pendiente', magnitud: 'A definir con recepción', causa: 'Con un adolescente (que por tarifa cuenta como adulto) que igual puede compartir habitación con un niño, la decisión de si entran en una Master la toma una persona.', fix: 'Recepción va a ajustar este criterio.' };
const D_AISLADOS: ErrorItem = { id: 'AISL', titulo: 'Casos técnicos aislados', sev: 'baja', estado: 'pendiente', magnitud: 'Muy pocos casos', causa: 'No procesó una imagen (1 vez), mandó dos veces el mismo mensaje (3 veces), copió un mensaje del cliente (1 vez), se volvió a presentar al reabrir un cliente (aislado).', fix: 'Controlados y sin repetición. Se blindan los nodos correspondientes.' };
const D_ASUME: ErrorItem = { id: 'LOG', titulo: 'A veces asume fechas o personas en vez de preguntar', sev: 'media', estado: 'pendiente', magnitud: 'Algunos casos', causa: 'Ante una fecha vaga ("la semana que viene") o una composición ambigua, a veces completa el dato solo.', fix: 'Reforzar que siempre pregunte cuando falta una fecha o la cantidad de personas.' };

const ACC72: HumanAction[] = [
  { prioridad: 'alta', cliente: 'JV', contacto: '+5491161195564', conv: 4494, motivo: 'Eligió Master Suite y llegó a la forma de pago.', accion: 'Cerrar la reserva.' },
  { prioridad: 'alta', cliente: 'Jimena Bertone', contacto: '+5493515293110', conv: 4451, motivo: 'Eligió Master, llegó a datos de reserva.', accion: 'Cerrar.' },
  { prioridad: 'alta', cliente: 'Eliana', contacto: '+5493513077724', conv: 4505, motivo: 'Lead caliente con datos (Loft).', accion: 'Cerrar.' },
  { prioridad: 'media', cliente: 'Patricia', contacto: '+5493571593633', conv: 4460, motivo: 'Llegó a datos de reserva (Loft).', accion: 'Retomar.' },
  { prioridad: 'media', cliente: 'Lic. Fiama Mignola', contacto: '+5493534595555', conv: 4454, motivo: 'El bot se le colgó al recibir una imagen y quedó sin respuesta.', accion: 'Disculparse y retomar.' },
];

const todo: Narrative = {
  resumen: 'En los primeros 7 días (del 11/06 19:33 al 17/06) Martina atendió 481 conversaciones, casi todas sin que intervenga una persona. Casi la mitad (47%) recibió una cotización con precio real y un 10% dejó sus datos para reservar — y ese embudo se sostuvo la semana entera. El sistema funcionó redondo: 9.996 procesos internos con 99,94% de éxito, sin ninguna falla nueva el último día. Y lo importante quedó blindado: no inventó ni un precio, casi no filtró datos (un solo caso, ya corregido) y nunca pasó datos bancarios al cliente. Los errores del arranque se corrigieron rápido; los últimos 4 días no se aplicó ningún cambio (decisión de analizar primero) y el bot se mantuvo estable, sin aparecer ningún problema nuevo. La gran noticia: la tarifa del Loft de julio, que era lo más urgente, ya está sana.',
  destacados: [
    '481 conversaciones · 47% recibió cotización con precio real.',
    '9.996 procesos internos con 99,94% de éxito (6 fallas, ninguna el último día).',
    'Cero precios inventados, cero datos bancarios pasados al cliente (una sola filtración, ya corregida).',
    '6 de cada 10 conversaciones salieron sin un solo error; la tarifa del Loft de julio ya está sana.',
  ],
  errores: [E_SPA, E_LEAK, E_QUOTE, E_CHECKOUT, E_FRIO0, E_HIDRO, E_FORMATO, E_NOMBRE, D_LOFT, D_FAMILY, D_PAX0, D_SINDISP, D_COMPO, D_AISLADOS, D_PDF, D_ASUME],
  fixes: [
    { titulo: 'Versión nueva del bot en producción', detalle: 'Cerebro (instrucciones) reescrito de cero, modelo más inteligente con un segundo modelo de respaldo.', tipo: 'sistema', hora: '11/06' },
    { titulo: 'Cotizador real conectado', detalle: 'Todos los precios y la disponibilidad salen del sistema de verdad, nunca inventados.', tipo: 'sistema', hora: '11/06' },
    { titulo: 'Juntador de mensajes blindado', detalle: 'Ignora los ecos del propio bot, los mensajes viejos y las notas internas; junta los mensajes en ráfaga.', tipo: 'sistema', hora: '12/06' },
    { titulo: 'Cierre con derivación a recepción', detalle: 'Pide los datos, avisa que sigue una persona y se apaga. Nunca toca datos bancarios.', tipo: 'flujo', hora: '12/06' },
    { titulo: 'Base de servicios corregida', detalle: 'Quedó claro qué entra en la tarifa y qué se paga aparte.', tipo: 'info', hora: '12/06' },
    { titulo: 'Triple barrera de seguridad', detalle: 'Para que nunca se filtre una instrucción interna al cliente.', tipo: 'seguridad', hora: '12/06' },
  ],
  funciona: [
    { titulo: 'Nunca inventó un precio', evidencia: 'Todo precio sale del cotizador real, durante los 7 días.' },
    { titulo: 'Cero datos bancarios al cliente', evidencia: 'En las conversaciones que llegaron a la seña, nunca pasó CBU ni alias.' },
    { titulo: 'Infraestructura sólida', evidencia: '9.996 procesos internos con 99,94% de éxito; sin fallas nuevas el último día.' },
    { titulo: 'Deriva en el momento justo', evidencia: 'Grupos grandes, vouchers, Day Spa y cierres de reserva pasan al equipo correctamente (30 cierres derivados).' },
    { titulo: '6 de cada 10 sin un solo error', evidencia: 'La mayoría de las conversaciones salieron limpias; el embudo de ventas se sostuvo toda la semana.' },
    { titulo: 'Tarifa del Loft, sana', evidencia: 'El precio del Loft de julio que estaba desproporcionado ya devuelve un valor normal.' },
  ],
  calidad: [
    { label: 'Éxito del sistema', value: '99,94%', meta: '9.996 procesos, 6 fallas', tone: 'ok', nota: 'La infraestructura no es el problema.' },
    { label: 'Precios inventados', value: '0%', tone: 'ok', nota: 'Todo sale del cotizador.' },
    { label: 'Filtraciones de datos', value: '1', tone: 'ok', nota: 'Día 2, corregida. Cero el resto del período.' },
    { label: 'Datos bancarios al cliente', value: '0', tone: 'ok', nota: 'Los maneja recepción.' },
    { label: 'Conversaciones sin error', value: '6 de 10', tone: 'ok' },
    { label: 'Precios del Loft (julio)', value: 'sana', tone: 'ok', nota: 'El problema más urgente, ya resuelto.' },
  ],
  acciones: ACC72,
  monitoreo: [
    'Recargar el crédito del lector de PDF (pdf.co).',
    'Corregir en el cotizador la promo Family x3 (que aplique solo a la Master) y el caso "0 personas".',
    'Pulir el tono del bot: saludar siempre primero, no repetir plantillas y no re-presentarse (los puntos más frecuentes).',
    'Definir con recepción el manejo de "sin disponibilidad" y la composición de grupos mixtos.',
    'Que la respuesta humana a las derivaciones no llegue tarde (para no perder clientes).',
  ],
  predicciones: [
    { texto: 'El tono de formulario y la cotización sin saludo son los puntos más frecuentes a pulir; se arreglan con ajustes en las instrucciones del bot.', riesgo: 'medio' },
    { texto: 'Las fechas relativas ("este finde", "la semana que viene") pueden seguir confundiendo al bot. A reforzar.', riesgo: 'medio' },
    { texto: 'Las derivaciones sin respuesta humana a tiempo son clientes que se enfrían.', riesgo: 'medio' },
  ],
  bitacora: [
    { hora: '11/06 19:33', texto: 'Go-live: Martina sale a producción y se abre a todo el tráfico.', tipo: 'deploy' },
    { hora: '12/06', texto: 'Se corrigen los errores de información del arranque + juntador de mensajes blindado.', tipo: 'fix' },
    { hora: '13/06', texto: 'Divisor de mensajes a prueba de fallos (saltos de línea + repeticiones).', tipo: 'deploy' },
    { hora: '14/06', texto: 'Día de mayor tráfico (128) + análisis profundo. Infraestructura sin caídas.', tipo: 'analisis' },
    { hora: '15/06', texto: 'Día parejo. Falla del lector de PDF por falta de crédito (1 caso).', tipo: 'nota' },
    { hora: '16/06', texto: 'Mejor día comercial (13 reservas iniciadas) + 2 fallas del cotizador por "0 personas".', tipo: 'analisis' },
    { hora: '17/06', texto: 'Cierre de semana sin fallas nuevas. Medición fresca + auditoría: tarifa del Loft sana.', tipo: 'analisis' },
  ],
};

// Días puntuales (resumen breve por jornada)
const dia11: Narrative = { ...todo, resumen: 'Go-live a las 19:33 ART. En las primeras horas (tráfico de tarde-noche) el bot cotizó al 72% de los clientes. Arranque fuerte.', destacados: ['Go-live 19:33 ART', '72% de cotización en las primeras horas', '18 conversaciones'], acciones: [] };
const dia12: Narrative = { ...todo, resumen: 'Primer día completo. El equipo reportó errores de información (spa, horarios, mensajes citados) y se corrigieron TODOS el mismo día. El caso de "falsa disponibilidad" se investigó: no era un error, el finde se había vendido de verdad.', destacados: ['63 conversaciones · 48% cotización', 'Todos los errores reportados, corregidos el mismo día', 'Cero precios inventados'] };
const dia13: Narrative = { ...todo, resumen: 'Día de validación. Los arreglos del 12 aguantaron: cero recaídas. Se reforzó el divisor de mensajes (saltos de línea y repeticiones), con cero casos después del arreglo.', destacados: ['57 conversaciones · 58% cotización', 'Los fixes del 12 aguantaron', 'Divisor de mensajes blindado'] };
const dia14: Narrative = { ...todo, resumen: 'Día de mayor tráfico (128 conversaciones). El sistema aguantó sin caídas. Se hizo el análisis profundo que dejó documentadas las detecciones que quedan por pulir.', destacados: ['128 conversaciones · 41% cotización', 'Día pico, sin caídas de sistema', 'Análisis profundo completo'] };
const dia15: Narrative = { ...todo, resumen: 'Día parejo, sin cambios aplicados. El lector de PDF se quedó sin crédito y un cliente que mandó un PDF no recibió respuesta (caso aislado). El resto, estable.', destacados: ['57 conversaciones · 46% cotización', 'Falla del lector de PDF (sin crédito)', 'Bot estable, sin problemas nuevos'] };
const dia16: Narrative = { ...todo, resumen: 'El mejor día comercial: 13 reservas iniciadas. Aparecieron 2 fallas del cotizador cuando un cliente no dijo cuántas personas eran (el bot mandó 0 y el sistema lo rechazó). Acotado y con arreglo claro.', destacados: ['91 conversaciones · 46% cotización · 13 reservas iniciadas', '2 fallas del cotizador por "0 personas"', 'Mejor día de conversión de la semana'] };
const dia17: Narrative = { ...todo, resumen: 'Media jornada de cierre, sin ninguna falla nueva. Se hizo la medición completa de los 7 días y la auditoría del cotizador, que confirmó que la tarifa del Loft de julio ya está sana.', destacados: ['21 conversaciones · 52% cotización', 'Cero fallas nuevas de sistema', 'Tarifa del Loft de julio: confirmada sana'] };

export const narrative: Record<string, Narrative> = { todo, '2026-06-11': dia11, '2026-06-12': dia12, '2026-06-13': dia13, '2026-06-14': dia14, '2026-06-15': dia15, '2026-06-16': dia16, '2026-06-17': dia17 };
export const getNarrative = (scope: string): Narrative => narrative[scope] || narrative.todo;

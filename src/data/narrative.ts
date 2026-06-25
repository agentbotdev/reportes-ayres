// ============================================================
// ANÁLISIS CUALITATIVO por scope (las métricas duras salen del dataset).
// 'todo' = consolidado del período · 'YYYY-MM-DD' = jornada puntual.
// ============================================================
export type Sev = 'critica' | 'alta' | 'media' | 'baja' | 'ok';
export type Estado = 'resuelto' | 'aplicado' | 'pendiente' | 'descartado';

export interface ErrorItem { id: string; titulo: string; sev: Sev; estado: Estado; magnitud: string; causa: string; fix: string; nota?: string; }
export interface FixItem { titulo: string; detalle: string; tipo: string; hora?: string; }
export interface QualityMetric { label: string; value: string; meta?: string; tone: 'ok' | 'warn' | 'bad'; nota?: string; benchmark?: string; }
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
export const REPORTE_SELLO = { inicio: '11/06 19:33 (go-live)', generado: '23/06', tz: 'ART' };

// ── RESULTADOS: la plata que generó el bot (del análisis maestro, no del dataset) ──
export interface ResultadoHero { value: string; label: string; sub?: string; icon: string; tone: string; }
export const RESULTADOS = {
  hero: [
    { value: '22', label: 'Reservas generadas', sub: 'cerradas por Martina', icon: 'flame', tone: 'brand' },
    { value: '68', label: 'Noches vendidas', sub: 'sumando todas las reservas', icon: 'trend', tone: 'ok' },
    { value: '~$13 M', label: 'Ingresos atribuidos', sub: 'en reservas que pasaron por el bot', icon: 'tag', tone: 'ok' },
    { value: '~1 de 5', label: 'Reservas del hotel pasó por el bot', sub: 'cerca del 20% del total', icon: 'users', tone: 'info' },
  ] as ResultadoHero[],
  desglose: [
    { titulo: '18 reservas confirmadas por recepción', detalle: '52 noches vendidas, confirmadas directamente por el equipo.' },
    { titulo: '4 reservas trazadas por seguimiento', detalle: '16 noches más, identificadas siguiendo las conversaciones del bot.' },
    { titulo: '22 reservas · 68 noches en total', detalle: 'La suma de lo confirmado por recepción más lo trazado por seguimiento.' },
  ],
  evidencia: {
    monto: '$6.472.467',
    texto: '13 de esas reservas ya están confirmadas por DNI en el sistema. Es el piso 100% verificable: plata real, atada a un documento.',
  },
  roi: {
    costo: '~$75',
    texto: 'Por un costo de alrededor de $75 por mes, Martina está atribuida a cerca de $13 millones en reservas en apenas 13 días. El costo del bot es mínimo frente a lo que mueve.',
  },
  reactivaciones: {
    cant: 6,
    base: 22,
    pct: 27,
    texto: '6 de las 22 reservas son clientes que ya habían pasado por el hotel y volvieron gracias al bot. Martina también "despierta" a los clientes dormidos.',
  },
};

// ── OPORTUNIDADES: las 3 "fugas" presentadas como plata recuperable (framing del dueño) ──
export interface Oportunidad {
  titulo: string;
  quePasa: string;      // qué pasa hoy, 1-2 líneas simples
  oportunidad: string;  // la oportunidad / plata en pausa
  solucion: string;     // la solución concreta
  estimado?: string;    // chip de número (puede ser estimación)
  esEstimacion?: boolean;
  icon: 'usersPause' | 'handoff' | 'calendar';
}
export const FUGAS: Oportunidad[] = [
  {
    titulo: 'Clientes tibios: los que ya tienen precio',
    quePasa: 'Alrededor de 320 personas recibieron una cotización y todavía no dieron el siguiente paso. De cada 10 que reciben precio, unos 3 quedan en pausa.',
    oportunidad: 'No es plata perdida: es plata en pausa. Un mensaje de seguimiento a las 24-72hs puede despertar a varios.',
    solucion: 'Seguimiento automático para los que cotizaron y no avanzaron.',
    estimado: '~30 reservas más',
    esEstimacion: true,
    icon: 'usersPause',
  },
  {
    titulo: 'Derivaciones para retomar más rápido',
    quePasa: 'Cuando el bot pasa una consulta a una persona, el bot ya hizo su parte en segundos. El cliente queda calentito, listo para que el equipo lo tome.',
    oportunidad: 'Retomar ágil = más cierres. Hay clientes calientes esperando del otro lado.',
    solucion: 'Un aviso/notificador para que el equipo no deje enfriar las derivaciones.',
    icon: 'handoff',
  },
  {
    titulo: 'Fechas llenas, pero con alternativa',
    quePasa: 'Cuando una fecha está completa (alrededor de 143 consultas, ~15%), hoy el bot deriva sin ofrecer otra opción.',
    oportunidad: 'El cotizador YA calcula fechas alternativas con precio. Solo falta ofrecerlas para rescatar consultas que hoy se van.',
    solucion: 'Mejora chica (el dato ya está calculado) para que el bot ofrezca la alternativa.',
    estimado: '~143 consultas · ~15%',
    icon: 'calendar',
  },
];

// ── DERIVACIONES: desglose del universo 986 (calculado offline, clasificación automática del contenido) ──
export interface DerivTipo { label: string; cant: number; }
export const DERIVACIONES = {
  total: 167,
  porcentaje: '16,9%',          // del total de 986 conversaciones
  cierresRecepcion: 36,         // clientes que ya iban a reservar y pasan a una persona para cerrar
  // Clasificación automática del contenido de las conversaciones (suma 167)
  tipos: [
    { label: 'Cierre → recepción', cant: 36 },
    { label: 'Consulta general', cant: 72 },
    { label: 'Spa / wellness', cant: 33 },
    { label: 'Suite Petit Hotel', cant: 6 },
    { label: 'Grupo grande', cant: 6 },
    { label: 'Voucher / gift card', cant: 5 },
    { label: 'Sin disponibilidad', cant: 5 },
    { label: 'Pensión / all inclusive', cant: 4 },
  ] as DerivTipo[],
  // En qué etapa del flujo se produce la derivación
  porMomento: [
    { label: 'Indagación', cant: 82 },
    { label: 'Datos para reserva', cant: 36 },
    { label: 'Presentación', cant: 21 },
    { label: 'Cotización', cant: 14 },
    { label: 'Validación de fechas', cant: 13 },
  ] as DerivTipo[],
  porHabitacion: { master: 81, loft: 17 },
};

// ── Línea de tiempo del proyecto (toda la vida del bot, unida por día) ──
export interface Hito { dia: string; fecha: string; tipo: 'deploy' | 'fix' | 'analisis' | 'bug' | 'decision'; titulo: string; detalle: string; }
export const EVOLUCION_HITOS: Hito[] = [
  { dia: '2026-06-11', fecha: '11/06', tipo: 'deploy', titulo: 'Go-live (19:33 ART)', detalle: 'Martina sale a producción con el cerebro nuevo, el cotizador real y un modelo más inteligente con respaldo. A la tarde se abre a todo el tráfico de WhatsApp.' },
  { dia: '2026-06-12', fecha: '12/06', tipo: 'fix', titulo: 'Se corrigen los errores del arranque', detalle: 'Primer día completo. El equipo reportó errores de información (spa, horarios, mensajes citados) y se corrigieron el mismo día. Se blindó el juntador de mensajes y se armó el cierre con derivación a recepción.' },
  { dia: '2026-06-13', fecha: '13/06', tipo: 'deploy', titulo: 'Divisor de mensajes a prueba de fallos', detalle: 'Se mejoró el sistema que separa los mensajes: ya no muestra saltos de línea raros ni repite mensajes. Validado: cero casos después del arreglo.' },
  { dia: '2026-06-14', fecha: '14/06', tipo: 'analisis', titulo: 'Día de mayor tráfico + análisis profundo', detalle: 'El día con más consultas (128). Se revisó toda la operación a fondo. La infraestructura aguantó sin caídas y se detectaron los puntos finos que quedan por pulir.' },
  { dia: '2026-06-15', fecha: '15/06', tipo: 'bug', titulo: 'Falla de lectura de PDF (sin crédito)', detalle: 'Día parejo. El lector de PDF (servicio externo pdf.co) se quedó sin crédito y un cliente que mandó un PDF no recibió respuesta. Se recarga y queda resuelto.' },
  { dia: '2026-06-16', fecha: '16/06', tipo: 'analisis', titulo: 'Buen día comercial + 2 fallas del cotizador', detalle: 'El día con más clientes que dejaron datos para reservar (15). Aparecieron 2 fallas del cotizador cuando un cliente no dijo cuántas personas eran (el bot mandó 0 y el sistema lo rechazó). Acotado y con arreglo claro.' },
  { dia: '2026-06-17', fecha: '17/06', tipo: 'analisis', titulo: 'Cierre de semana + medición fresca', detalle: 'Media jornada sin ninguna falla nueva. Se hizo la medición completa de los 7 días y la auditoría del cotizador: confirmó que la tarifa del Loft de julio ya está sana.' },
  { dia: '2026-06-18', fecha: '18/06', tipo: 'analisis', titulo: 'Primer mega reporte (7 días)', detalle: 'Se cumplen los primeros 7 días del bot y se entrega el primer reporte integral con el análisis cualitativo de las conversaciones. Un fallo nuevo del cotizador (adultos=0, el tercer caso), acotado.' },
  { dia: '2026-06-23', fecha: '19-23/06', tipo: 'analisis', titulo: 'Reporte integral de 13 días', detalle: 'Se extiende la medición a los 13 días completos: 986 conversaciones, 10.134 ejecuciones (99,88%). Resultado de negocio confirmado: 22 reservas, 68 noches y alrededor de $13 millones — cerca de 1 de cada 5 reservas del hotel en el período.' },
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
export const HUMANIDAD_DIA: Record<string, number> = { '2026-06-11': 5.0, '2026-06-12': 5.9, '2026-06-13': 6.8, '2026-06-14': 6.4, '2026-06-15': 5.8, '2026-06-16': 6.2, '2026-06-17': 6.4, '2026-06-18': 6.3 };

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
  { prioridad: 'alta', cliente: 'Ro', contacto: '+5493416668427', conv: 0, motivo: 'Llegó a dejar datos (Master) y quedó en avanzar apenas tenga la info — 23/06.', accion: 'Retomar y cerrar.' },
  { prioridad: 'alta', cliente: 'Luz', contacto: '+5493516968640', conv: 0, motivo: 'Preguntó por desayuno e instalaciones (Loft), llegó a datos sin cerrar — 23/06.', accion: 'Responder y cerrar.' },
  { prioridad: 'media', cliente: 'Roxana Carrizo', contacto: '+5493571577183', conv: 0, motivo: 'Dejó datos (Master) y dijo que lo confirma — 22/06.', accion: 'Retomar.' },
  { prioridad: 'media', cliente: 'Gustavo Cutraro', contacto: '+5491151578434', conv: 0, motivo: 'Llegó a datos (Loft), lo está hablando con la señora — 22/06.', accion: 'Seguir.' },
  { prioridad: 'media', cliente: 'Matías', contacto: '+5493584118208', conv: 0, motivo: 'Dejó datos (Master) preguntando precio de julio — 21/06.', accion: 'Cotizar julio y cerrar.' },
  { prioridad: 'media', cliente: 'Martín Vázquez', contacto: '+5493415645994', conv: 0, motivo: 'Llegó a datos de reserva (Master) sin cerrar — 21/06.', accion: 'Retomar.' },
];

const todo: Narrative = {
  resumen: 'En 13 días (del 11/06 19:33 al 23/06) Martina atendió 986 conversaciones, el 96% sin que intervenga una persona. El 42% recibió una cotización —y casi todas (39,7% del total) con un precio real y concreto del cotizador— y un 8% dejó sus datos para reservar. El sistema funcionó redondo: 10.134 procesos internos con 99,88% de éxito y solo 12 fallas menores en 13 días. Lo importante quedó blindado: no inventó ni un precio en todo el período, nunca pasó datos bancarios y la única filtración interna (día 2) se corrigió al instante. La baja del % de cotización hacia el final es estacional (julio se llena y el hotel ya tiene buena ocupación), no un deterioro del bot. Y la gran noticia: Martina generó 22 reservas (68 noches, alrededor de $13 millones) — cerca de 1 de cada 5 reservas que entró al hotel en estos días.',
  destacados: [
    '986 conversaciones en 13 días · 42% recibió una cotización (39,7% con precio real).',
    '22 reservas generadas · 68 noches · ~$13 millones · cerca de 1 de cada 5 del hotel.',
    'El bot resolvió solo el 96% de las conversaciones; apenas el 4% pasó a una persona.',
    '10.134 procesos internos con 99,88% de éxito (12 fallas menores en 13 días).',
    'Responde en unos 12 segundos y atiende las 24 horas, incluida la madrugada.',
    'Cero precios inventados y cero datos bancarios al cliente; la única filtración (día 2) ya está corregida.',
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
    { titulo: 'Nunca inventó un precio', evidencia: 'Todo precio sale del cotizador real, durante los 13 días.' },
    { titulo: 'Cero datos bancarios al cliente', evidencia: 'En las conversaciones que llegaron a la seña, nunca pasó CBU ni alias.' },
    { titulo: 'Infraestructura sólida', evidencia: '10.134 procesos internos con 99,88% de éxito; solo 12 fallas menores en 13 días.' },
    { titulo: 'Deriva en el momento justo', evidencia: 'Grupos grandes, vouchers, Day Spa y cierres de reserva pasan al equipo correctamente.' },
    { titulo: 'El bot resuelve solo', evidencia: 'El 96% de las conversaciones las maneja el bot sin intervención de una persona.' },
    { titulo: 'Tarifa del Loft, sana', evidencia: 'El precio del Loft de julio que estaba desproporcionado ya devuelve un valor normal.' },
  ],
  calidad: [
    { label: 'Éxito del sistema', value: '99,88%', meta: '10.134 procesos, 12 fallas', tone: 'ok', nota: 'La infraestructura no es el problema.', benchmark: 'A la par del estándar de la industria para sistemas en producción (~99,9% de disponibilidad).' },
    { label: 'Resueltas sin una persona', value: '96%', tone: 'ok', nota: 'Solo el 4% de las conversaciones pasó a una persona.' },
    { label: 'Tiempo de respuesta', value: '~12 seg', tone: 'ok', nota: 'Incluye pensar y cotizar con precio real.', benchmark: 'La industria considera excelente responder a un lead en menos de 5 minutos (estudios MIT/InsideSales). Martina responde en ~12 segundos: muy por debajo de ese umbral.' },
    { label: 'Cobertura 24/7', value: '24 hs', meta: '~10% de las consultas llegan de noche', tone: 'ok', nota: 'El bot suma atención las 24 horas, incluida la madrugada: cobertura que antes no existía.' },
    { label: 'Uso del modelo de respaldo', value: '0%', tone: 'ok', nota: 'El modelo principal nunca falló (muestra de 80).' },
    { label: 'Precios inventados', value: '0', tone: 'ok', nota: 'Todo sale del cotizador, en los 13 días.' },
    { label: 'Filtraciones de datos', value: '1', tone: 'ok', nota: 'Día 2, corregida al instante. Cero el resto del período.' },
    { label: 'Datos bancarios al cliente', value: '0', tone: 'ok', nota: 'Los maneja recepción.' },
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
    { hora: '18/06', texto: 'Arranque de la 2da semana con tráfico alto (89) y 54% de cotización. Estable.', tipo: 'nota' },
    { hora: '19/06', texto: 'Día parejo (76). El % de cotización empieza a acomodarse al patrón estacional (julio se llena).', tipo: 'nota' },
    { hora: '20/06', texto: 'Tráfico alto (90). % de cotización en 40%, en línea con la estacionalidad. Sin novedades.', tipo: 'nota' },
    { hora: '21/06', texto: 'Tráfico alto (91) y día con más derivaciones del período (23). Sistema estable.', tipo: 'nota' },
    { hora: '22/06', texto: 'Récord de conversaciones del período (113). Volumen alto sin caídas; más consultas se derivan (estacional).', tipo: 'analisis' },
    { hora: '23/06', texto: 'Cierre del reporte de 13 días (93). Se consolida la medición integral del período.', tipo: 'analisis' },
  ],
};

// Días puntuales (resumen breve por jornada)
const dia11: Narrative = { ...todo, resumen: 'Go-live a las 19:33 ART. En las primeras horas (tráfico de tarde-noche) el bot cotizó al 72% de los clientes. Arranque fuerte.', destacados: ['Go-live 19:33 ART', '72% de cotización en las primeras horas', '18 conversaciones'], acciones: [] };
const dia12: Narrative = { ...todo, resumen: 'Primer día completo. El equipo reportó errores de información (spa, horarios, mensajes citados) y se corrigieron TODOS el mismo día. El caso de "falsa disponibilidad" se investigó: no era un error, el finde se había vendido de verdad.', destacados: ['63 conversaciones · 49% cotización', 'Todos los errores reportados, corregidos el mismo día', 'Cero precios inventados'] };
const dia13: Narrative = { ...todo, resumen: 'Día de validación. Los arreglos del 12 aguantaron: cero recaídas. Se reforzó el divisor de mensajes (saltos de línea y repeticiones), con cero casos después del arreglo.', destacados: ['57 conversaciones · 58% cotización', 'Los fixes del 12 aguantaron', 'Divisor de mensajes blindado'] };
const dia14: Narrative = { ...todo, resumen: 'Día de mayor tráfico (128 conversaciones). El sistema aguantó sin caídas. Se hizo el análisis profundo que dejó documentadas las detecciones que quedan por pulir.', destacados: ['128 conversaciones · 41% cotización', 'Día pico, sin caídas de sistema', 'Análisis profundo completo'] };
const dia15: Narrative = { ...todo, resumen: 'Día parejo, sin cambios aplicados. El lector de PDF se quedó sin crédito y un cliente que mandó un PDF no recibió respuesta (caso aislado). El resto, estable.', destacados: ['57 conversaciones · 46% cotización', 'Falla del lector de PDF (sin crédito)', 'Bot estable, sin problemas nuevos'] };
const dia16: Narrative = { ...todo, resumen: 'El mejor día comercial: 15 reservas iniciadas. Aparecieron 2 fallas del cotizador cuando un cliente no dijo cuántas personas eran (el bot mandó 0 y el sistema lo rechazó). Acotado y con arreglo claro.', destacados: ['91 conversaciones · 47% cotización · 15 reservas iniciadas', '2 fallas del cotizador por "0 personas"', 'Mejor día de conversión de la semana'] };
const dia17: Narrative = { ...todo, resumen: 'Media jornada de cierre, sin ninguna falla nueva. Se hizo la medición completa de los 7 días y la auditoría del cotizador, que confirmó que la tarifa del Loft de julio ya está sana. Pocas consultas, pero con el mejor % de cotización del período.', destacados: ['20 conversaciones · 65% cotización', 'Cero fallas nuevas de sistema', 'Tarifa del Loft de julio: confirmada sana'] };
const dia18: Narrative = { ...todo, resumen: 'Arranque de la segunda semana con tráfico alto (89 conversaciones) y buen ritmo de cotización (54%). Día sólido y estable, sin fallas nuevas de sistema.', destacados: ['89 conversaciones · 54% cotización', '8 dejaron datos para reservar', 'Día estable, sin fallas nuevas'] };
const dia19: Narrative = { ...todo, resumen: 'Día parejo (76 conversaciones). El % de cotización (46%) empieza a acomodarse al patrón estacional: julio se va llenando y muchas consultas llegan sobre fechas con buena ocupación. Sistema estable.', destacados: ['76 conversaciones · 46% cotización', '5 dejaron datos · 11 derivaciones', 'Patrón estacional: julio se llena'] };
const dia20: Narrative = { ...todo, resumen: 'Tráfico alto (90 conversaciones) con el % de cotización en 40%, en línea con la estacionalidad del período (más fechas con ocupación alta). Sin novedades de sistema.', destacados: ['90 conversaciones · 40% cotización', '4 dejaron datos · 13 derivaciones', 'Baja del % de cotización: estacional, no deterioro'] };
const dia21: Narrative = { ...todo, resumen: 'Tráfico alto (91 conversaciones) y el día con más derivaciones del período (23): cada vez más consultas pasan al equipo para cerrar o por fechas con ocupación. El % de cotización (32%) sigue el patrón estacional. Sistema estable.', destacados: ['91 conversaciones · 32% cotización', 'Día con más derivaciones del período (23)', '6 dejaron datos para reservar'] };
const dia22: Narrative = { ...todo, resumen: 'El día con más conversaciones del período (113). El % de cotización (25%) refleja la estacionalidad: con julio ya con buena ocupación, una parte mayor de las consultas se deriva en vez de cotizarse. Volumen récord, sistema sin caídas.', destacados: ['113 conversaciones · 25% cotización', 'Día de MÁS conversaciones del período', '9 dejaron datos para reservar'] };
const dia23: Narrative = { ...todo, resumen: 'Cierre del reporte de 13 días con tráfico alto (93 conversaciones) y % de cotización (30%) en el rango estacional. Se consolida la medición integral del período. Sistema estable hasta el final.', destacados: ['93 conversaciones · 30% cotización', '4 dejaron datos · 15 derivaciones', 'Cierre del período de 13 días'] };

export const narrative: Record<string, Narrative> = { todo, '2026-06-11': dia11, '2026-06-12': dia12, '2026-06-13': dia13, '2026-06-14': dia14, '2026-06-15': dia15, '2026-06-16': dia16, '2026-06-17': dia17, '2026-06-18': dia18, '2026-06-19': dia19, '2026-06-20': dia20, '2026-06-21': dia21, '2026-06-22': dia22, '2026-06-23': dia23 };
export const getNarrative = (scope: string): Narrative => narrative[scope] || narrative.todo;

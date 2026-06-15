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
export const REPORTE_SELLO = { inicio: '11/06 19:33 (go-live)', generado: '15/06', tz: 'ART' };

// ── Línea de tiempo del proyecto (toda la vida del bot, unida por día) ──
export interface Hito { dia: string; fecha: string; tipo: 'deploy' | 'fix' | 'analisis' | 'bug' | 'decision'; titulo: string; detalle: string; }
export const EVOLUCION_HITOS: Hito[] = [
  { dia: '2026-06-11', fecha: '11/06', tipo: 'deploy', titulo: 'Go-live (19:33 ART)', detalle: 'Martina sale a producción con el cerebro nuevo, el cotizador real y un modelo más inteligente con respaldo. A la tarde se abre a todo el tráfico de WhatsApp.' },
  { dia: '2026-06-12', fecha: '12/06', tipo: 'fix', titulo: 'Se corrigen los errores del arranque', detalle: 'Primer día completo. El equipo reportó errores de información (spa, horarios, mensajes citados) y se corrigieron el mismo día. Se blindó el juntador de mensajes y se armó el cierre con derivación a recepción.' },
  { dia: '2026-06-13', fecha: '13/06', tipo: 'deploy', titulo: 'Divisor de mensajes a prueba de fallos', detalle: 'Se mejoró el sistema que separa los mensajes: ya no muestra saltos de línea raros ni repite mensajes. Validado: cero casos después del arreglo.' },
  { dia: '2026-06-14', fecha: '14/06', tipo: 'analisis', titulo: 'Día de mayor tráfico + análisis profundo', detalle: 'El día con más consultas (127). Se revisó toda la operación a fondo. La infraestructura aguantó sin caídas y se detectaron los puntos finos que quedan por pulir.' },
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
];
export const HUMANIDAD_DIA: Record<string, number> = { '2026-06-12': 5.9, '2026-06-13': 6.8, '2026-06-14': 6.4 };

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
const D_LOFT: ErrorItem = { id: 'COTIZ', titulo: 'Precios del Loft en julio desproporcionados', sev: 'alta', estado: 'pendiente', magnitud: 'Sistemático (todo julio)', causa: 'El cotizador devuelve la tarifa del Loft de julio (vacaciones de invierno) muy por encima de lo normal, bastante más cara que la Master. El bot la muestra tal cual porque viene del sistema.', fix: 'Corregir la tarifa del Loft del lado de los precios cargados en el cotizador. No es un error del bot.', nota: 'Lo más urgente: afecta ventas.' };
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
  resumen: 'En las primeras 72 horas (del 11/06 19:33 al 14/06) Martina atendió 299 conversaciones, casi todas sin que intervenga una persona. Casi la mitad (46%) recibió una cotización con precio real y un 8% dejó sus datos para reservar. El sistema funcionó redondo: 6.257 procesos internos con 99,97% de éxito. Y lo importante quedó blindado: no inventó ni un precio, no filtró datos internos y nunca pasó datos bancarios al cliente. Los errores del arranque se corrigieron rápido; quedan algunas detecciones en investigación, la más importante la tarifa del Loft en julio (que viene del cotizador, no del bot).',
  destacados: [
    '299 conversaciones · 46% recibió cotización con precio real.',
    '6.257 procesos internos con 99,97% de éxito (solo 2 fallas).',
    'Cero precios inventados, cero filtraciones y cero datos bancarios pasados al cliente.',
    '8 de cada 10 conversaciones salieron sin un solo error.',
  ],
  errores: [E_SPA, E_LEAK, E_QUOTE, E_CHECKOUT, E_FRIO0, E_HIDRO, E_FORMATO, E_NOMBRE, D_LOFT, D_SINDISP, D_COMPO, D_AISLADOS, D_ASUME],
  fixes: [
    { titulo: 'Versión nueva del bot en producción', detalle: 'Cerebro (instrucciones) reescrito de cero, modelo más inteligente con un segundo modelo de respaldo.', tipo: 'sistema', hora: '11/06' },
    { titulo: 'Cotizador real conectado', detalle: 'Todos los precios y la disponibilidad salen del sistema de verdad, nunca inventados.', tipo: 'sistema', hora: '11/06' },
    { titulo: 'Juntador de mensajes blindado', detalle: 'Ignora los ecos del propio bot, los mensajes viejos y las notas internas; junta los mensajes en ráfaga.', tipo: 'sistema', hora: '12/06' },
    { titulo: 'Cierre con derivación a recepción', detalle: 'Pide los datos, avisa que sigue una persona y se apaga. Nunca toca datos bancarios.', tipo: 'flujo', hora: '12/06' },
    { titulo: 'Base de servicios corregida', detalle: 'Quedó claro qué entra en la tarifa y qué se paga aparte.', tipo: 'info', hora: '12/06' },
    { titulo: 'Triple barrera de seguridad', detalle: 'Para que nunca se filtre una instrucción interna al cliente.', tipo: 'seguridad', hora: '12/06' },
  ],
  funciona: [
    { titulo: 'Nunca inventó un precio', evidencia: 'Todo precio sale del cotizador real.' },
    { titulo: 'Cero filtraciones y cero datos bancarios', evidencia: 'En las conversaciones que llegaron a la seña, nunca pasó CBU ni alias.' },
    { titulo: 'Infraestructura sólida', evidencia: '6.257 procesos internos con 99,97% de éxito; aguantó el día pico (127 consultas).' },
    { titulo: 'Deriva en el momento justo', evidencia: 'Grupos grandes, vouchers, Day Spa y cierres de reserva pasan al equipo correctamente.' },
    { titulo: '8 de cada 10 sin un solo error', evidencia: 'La enorme mayoría de las conversaciones salieron limpias.' },
  ],
  calidad: [
    { label: 'Éxito del sistema', value: '99,97%', meta: '6.257 procesos, 2 fallas', tone: 'ok', nota: 'La infraestructura no es el problema.' },
    { label: 'Precios inventados', value: '0%', tone: 'ok', nota: 'Todo sale del cotizador.' },
    { label: 'Filtraciones de datos', value: '0%', tone: 'ok' },
    { label: 'Datos bancarios al cliente', value: '0', tone: 'ok', nota: 'Los maneja recepción.' },
    { label: 'Conversaciones sin error', value: '8 de 10', tone: 'ok' },
    { label: 'Precios del Loft (julio)', value: 'a corregir', tone: 'warn', nota: 'Viene del cotizador, no del bot.' },
  ],
  acciones: ACC72,
  monitoreo: [
    'Corregir la tarifa del Loft de julio en el cotizador.',
    'Definir con recepción el manejo de "sin disponibilidad" y la composición de grupos mixtos.',
    'Que la respuesta humana a las derivaciones no llegue tarde (para no perder clientes).',
    'Seguir puliendo el tono para que suene cada vez más natural.',
  ],
  predicciones: [
    { texto: 'Las fechas relativas ("este finde", "la semana que viene") pueden seguir confundiendo al bot. A reforzar.', riesgo: 'medio' },
    { texto: 'Si no se corrige la tarifa del Loft de julio, esas consultas se pierden.', riesgo: 'alto' },
    { texto: 'Las derivaciones sin respuesta humana a tiempo son clientes que se enfrían.', riesgo: 'medio' },
  ],
  bitacora: [
    { hora: '11/06 19:33', texto: 'Go-live: Martina sale a producción y se abre a todo el tráfico.', tipo: 'deploy' },
    { hora: '12/06', texto: 'Se corrigen los errores de información del arranque + juntador de mensajes blindado.', tipo: 'fix' },
    { hora: '13/06', texto: 'Divisor de mensajes a prueba de fallos (saltos de línea + repeticiones).', tipo: 'deploy' },
    { hora: '14/06', texto: 'Día de mayor tráfico (127) + análisis profundo. Infraestructura sin caídas.', tipo: 'analisis' },
  ],
};

// Días puntuales (resumen breve por jornada)
const dia11: Narrative = { ...todo, resumen: 'Go-live a las 19:33 ART. En las primeras horas (tráfico de tarde-noche) el bot cotizó al 72% de los clientes. Arranque fuerte.', destacados: ['Go-live 19:33 ART', '72% de cotización en las primeras horas', '18 conversaciones'], acciones: [] };
const dia12: Narrative = { ...todo, resumen: 'Primer día completo. El equipo reportó errores de información (spa, horarios, mensajes citados) y se corrigieron TODOS el mismo día. El caso de "falsa disponibilidad" se investigó: no era un error, el finde se había vendido de verdad.', destacados: ['63 conversaciones · 48% cotización', 'Todos los errores reportados, corregidos el mismo día', 'Cero precios inventados'] };
const dia13: Narrative = { ...todo, resumen: 'Día de validación. Los arreglos del 12 aguantaron: cero recaídas. Se reforzó el divisor de mensajes (saltos de línea y repeticiones), con cero casos después del arreglo.', destacados: ['56 conversaciones · 57% cotización', 'Los fixes del 12 aguantaron', 'Divisor de mensajes blindado'] };
const dia14: Narrative = { ...todo, resumen: 'Día de mayor tráfico (127 conversaciones). El sistema aguantó sin caídas. Se hizo el análisis profundo que dejó documentadas las detecciones que quedan por pulir.', destacados: ['127 conversaciones · 41% cotización', 'Día pico, sin caídas de sistema', 'Análisis profundo completo'] };

export const narrative: Record<string, Narrative> = { todo, '2026-06-11': dia11, '2026-06-12': dia12, '2026-06-13': dia13, '2026-06-14': dia14 };
export const getNarrative = (scope: string): Narrative => narrative[scope] || narrative.todo;

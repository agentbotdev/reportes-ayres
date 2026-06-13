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

const E_NL: ErrorItem = {
  id: 'E1', titulo: 'Saltos de línea visibles como texto', sev: 'media', estado: 'aplicado',
  magnitud: '3 mensajes de 652 · 1 conversación (Alejandra)',
  causa: 'El modelo escribe a veces "\\n" como texto en vez de un salto real. El divisor de mensajes cortaba por saltos reales, así que ese literal raro quedaba a la vista.',
  fix: 'El divisor ahora convierte los "\\n" de texto en saltos reales antes de cortar, sin tocar la separación de mensajes. Aplicado 13/06 06:41 ART.',
  nota: 'La primera medición marcó 84% — era un error nuestro de conteo (sumaba los eventos internos de Chatwoot). El número real es 0,5%.',
};
const E_REP: ErrorItem = {
  id: 'E2', titulo: 'Pregunta repetida dos veces seguidas', sev: 'alta', estado: 'aplicado',
  magnitud: '4 de 100 conversaciones',
  causa: 'El modelo repetía el mismo texto pegado (ej. la pregunta de composición dos veces).',
  fix: 'El divisor descarta líneas y mensajes idénticos consecutivos. Aplicado en el mismo cambio.',
};
const E_FECHA: ErrorItem = {
  id: 'E3', titulo: 'Fechas vagas terminan en una cotización inventada', sev: 'alta', estado: 'pendiente',
  magnitud: '1 de 21 cotizaciones',
  causa: 'Un cliente pidió "una semana en julio, después del 10" sin día exacto y el bot cotizó una noche del 12 de junio.',
  fix: 'No llamar al cotizador sin día de ingreso y egreso confirmados. A definir con Pao junto con el modo de fechas alternativas.',
};
const E_ALT: ErrorItem = {
  id: 'E4', titulo: 'No ofrece fechas alternativas que sí existen', sev: 'media', estado: 'pendiente',
  magnitud: '8 derivaciones por "sin disponibilidad"',
  causa: 'El cotizador ya devuelve fechas cercanas con precio, pero hoy se ignoran. El bot deriva y recepción las ofrece a mano.',
  fix: 'Mostrar esas alternativas en vez de derivar. Es decisión de Pao (su regla de "no sugerir fechas" era de cuando el bot las inventaba).',
};

const ACC: HumanAction[] = [
  { prioridad: 'alta', cliente: 'Walter Torres', contacto: '+5493512377956', conv: 4329, motivo: 'Tres conversaciones sin respuesta, lead partido.', accion: 'Contactar. 2 personas, finde de junio.' },
  { prioridad: 'alta', cliente: 'Débora', contacto: '+5493584902857', conv: 4341, motivo: 'Recibió un mensaje interno por error (ya arreglado). Sigue interesada.', accion: 'Retomar sin mencionarlo. Master $240k/noche o Loft $211k.' },
  { prioridad: 'media', cliente: 'Margarita Moreyra', contacto: '+5493543558276', conv: 4338, motivo: 'Le dijeron "ya está reservado" sin ofrecerle otra fecha.', accion: 'Ofrecer alternativas reales.' },
  { prioridad: 'media', cliente: 'Mercedes Riaño', conv: 4336, motivo: 'Familia 2+2 (3 y 8 años), 29-30 jul. Derivada sin respuesta.', accion: 'Cotizar para esa composición.' },
  { prioridad: 'baja', cliente: 'Jorge Torres', contacto: '+5493513871751', conv: 4340, motivo: 'Cotización con vencimiento.', accion: 'Follow-up antes de las 48 hs. Master $330k.' },
];

const todo: Narrative = {
  resumen: 'Desde que arrancó (11/06 22:33) Martina atendió 100 conversaciones, 96 sin intervención humana. El cambio más fuerte está en el embudo: el 51% recibe una cotización con precio real y el 10% llega a dejar sus datos para reservar — antes del bot eran 3 de cada 100. Se corrigieron a fondo los errores de contenido del primer día y dos bugs de formato del modelo. Quedan dos decisiones de negocio para charlar con Pao.',
  destacados: [
    '51% de las conversaciones recibió cotización con precio real.',
    '24% derivó al equipo; la mitad de esas derivaciones son cierres o servicios que el bot no cotiza.',
    'Cero precios inventados y cero filtraciones de instrucciones internas.',
    'El pico de tráfico fue el 12/06 entre las 13 y 19 ART.',
  ],
  errores: [E_NL, E_REP, E_FECHA, E_ALT],
  fixes: [
    { titulo: 'Divisor de mensajes a prueba de modelo', detalle: 'Normaliza saltos de línea, descarta repeticiones y filtra instrucciones internas. Determinístico: funciona aunque el modelo falle.', tipo: 'nodo', hora: '13/06 06:41' },
    { titulo: 'Base de conocimiento de servicios', detalle: 'Quedó claro qué entra en la tarifa (circuito hídrico, saunas, gym) y qué se paga aparte (masajes, flotación, media pensión).', tipo: 'prompt', hora: '12/06' },
    { titulo: 'Cierre con derivación a recepción', detalle: 'El bot pide los datos, avisa que recepción sigue y se apaga. Sin pasar datos bancarios.', tipo: 'prompt', hora: '12/06' },
    { titulo: 'Acumulador blindado', detalle: 'Filtra ecos del propio bot, mensajes viejos y notas internas de Chatwoot. Junta mensajes en ráfaga.', tipo: 'acumulador', hora: '12/06' },
  ],
  funciona: [
    { titulo: 'El embudo se dio vuelta', evidencia: 'De 3% que llegaba a datos de reserva a 10%. Cotización: de 3% a 51%.' },
    { titulo: 'Cero precios inventados', evidencia: 'Todo precio sale del cotizador. Ningún número de la galera.' },
    { titulo: 'Derivación de punta a punta', evidencia: 'Detecta el caso, etiqueta en Chatwoot y asigna al equipo solo.' },
    { titulo: 'Combos para grupos', evidencia: 'Grupos de 4-5 se cotizan con dos habitaciones, sin derivar.' },
  ],
  calidad: [
    { label: 'Precios inventados', value: '0%', tone: 'ok', nota: 'Todo sale del cotizador.' },
    { label: 'Filtraciones internas', value: '0%', tone: 'ok', nota: 'Defensa en 3 capas.' },
    { label: 'Alucinación de fechas', value: '~5%', meta: '1 de 21 cotizaciones', tone: 'warn', nota: 'Siempre con fechas vagas. Pendiente E3.' },
    { label: 'Mensajes con formato roto', value: '0,5%', meta: '3 de 652', tone: 'ok', nota: 'Raro. Ya corregido en el divisor.' },
  ],
  acciones: ACC,
  monitoreo: [
    'Saltos de línea visibles: revisar el texto crudo de Chatwoot. Meta 0.',
    'Repeticiones y filtraciones: misma revisión, meta 0.',
    'Derivaciones por "sin disponibilidad": si suben, falta el modo alternativas.',
    'Embudo diario: cuántas llegan a cotización y a datos.',
  ],
  predicciones: [
    { texto: 'Las fechas relativas ("este finde", "mañana") van a seguir confundiendo al modelo. Es la fuente número uno de error a futuro.', riesgo: 'alto' },
    { texto: 'Grupos de 5 personas (el borde entre combo y derivar) conviene testearlos.', riesgo: 'medio' },
    { texto: 'De madrugada el equipo no da abasto: derivaciones que quedan sin responder.', riesgo: 'medio' },
  ],
  bitacora: [
    { hora: '11/06 19:08', texto: 'Go-live: Martina V8 sale a producción.', tipo: 'deploy' },
    { hora: '11/06 19:08', texto: 'Bot abierto a todo el tráfico.', tipo: 'decision' },
    { hora: '12/06', texto: 'Se corrigen 8 errores de contenido reportados por el equipo.', tipo: 'fix' },
    { hora: '13/06 06:41', texto: 'Divisor de mensajes a prueba de modelo (saltos de línea + repeticiones).', tipo: 'deploy' },
    { hora: '13/06', texto: 'Quedan para Pao: cotizar fechas alternativas y el manejo de fechas vagas.', tipo: 'nota' },
  ],
};

const dia12: Narrative = {
  resumen: 'Primer día completo en producción. Se reportaron 10 errores —casi todos de contenido en el prompt, no del modelo— y se corrigieron el mismo día. El caso de "falsa disponibilidad" se investigó a fondo y no era un bug: el fin de semana se había vendido de verdad.',
  destacados: [
    'El embudo se dio vuelta respecto de la era pre-bot.',
    'Cero precios inventados en todo el día.',
    'Lo de "falsa disponibilidad" resultó ser una venta real, no un error.',
  ],
  errores: [
    { id: 'RC-2', titulo: 'Decía que el spa se paga aparte', sev: 'critica', estado: 'resuelto', magnitud: 'Pablo, Jorge', causa: 'El error estaba escrito en el prompt.', fix: 'Se reescribió qué entra en la tarifa y qué no.' },
    { id: 'RC-4', titulo: 'Filtró una instrucción interna', sev: 'critica', estado: 'resuelto', magnitud: 'conv. de Débora', causa: 'El modelo copió textual la guía interna del cotizador.', fix: 'Tres capas de defensa: prompt, prefijo en el cotizador y filtro en el divisor.' },
    { id: 'RC-1', titulo: 'No leía los mensajes citados', sev: 'critica', estado: 'resuelto', magnitud: 'Pablo, Nerea', causa: 'El acumulador descartaba el dato del mensaje citado.', fix: 'Ahora resuelve la cita y la antepone al mensaje.' },
    { id: 'RC-3', titulo: 'Informaba check-out a las 11 (es 10)', sev: 'alta', estado: 'resuelto', magnitud: 'Nerea', causa: 'El prompt no tenía los horarios; el modelo los inventó.', fix: 'Se cargaron los datos operativos reales.' },
    { id: 'FD', titulo: '"Falsa disponibilidad" (Hernán, Margarita)', sev: 'ok', estado: 'descartado', magnitud: 'No era bug', causa: 'El fin de semana se vendió de verdad entre la cotización y la consulta.', fix: 'Caso cerrado. Aviso operativo: no cotizar a mano sin chequear disponibilidad.' },
  ],
  fixes: [
    { titulo: 'Deploy V8 inicial', detalle: 'Prompt nuevo, cotizador v2, modelo gpt-5.4-mini con fallback.', tipo: 'prompt', hora: '16:41' },
    { titulo: 'Acumulador blindado', detalle: 'Filtros estrictos, anti-duplicados y juntado de ráfagas.', tipo: 'acumulador', hora: '17:12' },
    { titulo: 'Cierre con derivación a recepción', detalle: 'Sin datos bancarios; recepción toma el control.', tipo: 'prompt', hora: '17:57' },
  ],
  funciona: [
    { titulo: 'El embudo se dio vuelta', evidencia: '58% recibió cotización ese día (era 3%).' },
    { titulo: 'Cero alucinaciones de precio', evidencia: 'Todo salió del cotizador.' },
  ],
  calidad: [
    { label: 'Errores de contenido', value: '8', meta: 'todos corregidos', tone: 'warn' },
    { label: 'Precios inventados', value: '0%', tone: 'ok' },
  ],
  acciones: ACC.slice(0, 2),
  monitoreo: ['Que las etiquetas de derivado/humano se apliquen bien.', 'Filtraciones: meta 0.'],
  predicciones: [{ texto: 'Las fechas vagas y relativas van a seguir dando dolores de cabeza.', riesgo: 'alto' }],
  bitacora: [
    { hora: '16:41', texto: 'Go-live del V8.', tipo: 'deploy' },
    { hora: '17:12', texto: 'Acumulador blindado contra webhooks sucios.', tipo: 'fix' },
    { hora: '19:08', texto: 'Bot abierto a todo el tráfico.', tipo: 'decision' },
  ],
};

const dia13: Narrative = {
  resumen: 'Día de validación. Los arreglos del 12 quedaron firmes: nadie volvió a recibir info equivocada de spa ni horarios mal. Aparecieron dos bugs de formato del modelo (un salto de línea visible y una pregunta repetida), los dos raros y ya corregidos de raíz en el divisor de mensajes. La derivación subió por una racha de consultas para un fin de semana ya vendido.',
  destacados: [
    'Los fixes de contenido del 12 aguantaron: cero recaídas.',
    'Los 2 bugs nuevos eran de formato, no de criterio, y ya están tapados.',
    'La derivación subió por fechas sin disponibilidad, no por fallas del bot.',
  ],
  errores: [E_NL, E_REP, E_FECHA, E_ALT],
  fixes: [
    { titulo: 'Divisor de mensajes a prueba de modelo', detalle: 'Normaliza saltos de línea, descarta repeticiones y filtra instrucciones internas. Validado con 6 casos antes de tocar producción.', tipo: 'nodo', hora: '06:41' },
  ],
  funciona: [
    { titulo: 'La info de spa quedó bien', evidencia: 'Cero menciones de "el spa se paga". Explicó bien circuito hídrico y tratamientos.' },
    { titulo: 'Confirma cuando hay ambigüedad', evidencia: '"¿Te referís al finde del 13 y 14 o a otro?"' },
    { titulo: 'Cierre a recepción impecable', evidencia: 'Pago, datos y derivación, sin pasar el CBU.' },
  ],
  calidad: [
    { label: 'Mensajes con formato roto', value: '0,5%', meta: '3 de 652', tone: 'ok', nota: 'Ya corregido.' },
    { label: 'Repeticiones', value: '~0,6%', meta: '4 de 652', tone: 'ok', nota: 'Ya corregido.' },
    { label: 'Filtraciones internas', value: '0%', tone: 'ok' },
    { label: 'Alucinación de fechas', value: '~5%', meta: 'fechas vagas', tone: 'warn', nota: 'Pendiente E3.' },
  ],
  acciones: ACC,
  monitoreo: [
    'Saltos de línea visibles: meta 0 tras el fix.',
    'Repeticiones: meta 0.',
    'Derivaciones por "sin disponibilidad": termómetro del modo alternativas.',
  ],
  predicciones: [
    { texto: 'Fechas relativas: el modelo es flojo, va a volver a fallar ahí.', riesgo: 'alto' },
    { texto: 'El "\\n" podría reaparecer si se cambia el modelo; por eso el fix vive en el divisor, no en el prompt.', riesgo: 'bajo' },
  ],
  bitacora: [
    { hora: '06:30', texto: 'Análisis de las conversaciones post-fix.', tipo: 'analisis' },
    { hora: '06:35', texto: 'Corrección de medición: el bug de saltos de línea era 0,5%, no 84%.', tipo: 'nota' },
    { hora: '06:41', texto: 'Divisor de mensajes a prueba de modelo.', tipo: 'deploy' },
  ],
};

export const narrative: Record<string, Narrative> = { todo, '2026-06-12': dia12, '2026-06-13': dia13 };
export const getNarrative = (scope: string): Narrative => narrative[scope] || narrative.todo;

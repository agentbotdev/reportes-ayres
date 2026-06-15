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

// ── Línea de tiempo del proyecto (toda la vida del bot, unida por día) ──
export interface Hito { dia: string; fecha: string; tipo: 'deploy' | 'fix' | 'analisis' | 'bug' | 'decision'; titulo: string; detalle: string; }
export const EVOLUCION_HITOS: Hito[] = [
  { dia: '2026-06-11', fecha: '11/06', tipo: 'deploy', titulo: 'Go-live V8', detalle: 'Martina sale a producción con el prompt V8, el cotizador v2 y el modelo gpt-5.4-mini con fallback. A la tarde se abre a todo el tráfico de WhatsApp.' },
  { dia: '2026-06-12', fecha: '12/06', tipo: 'fix', titulo: '8 errores de contenido corregidos', detalle: 'Primer día completo. Se reportaron y arreglaron el mismo día errores de info (spa, horarios, mensajes citados). Se blindó el juntador de mensajes y se armó el cierre con derivación a recepción.' },
  { dia: '2026-06-13', fecha: '13/06', tipo: 'deploy', titulo: 'Divisor de mensajes a prueba de modelo', detalle: 'Se deployó el divisor que normaliza saltos de línea y descarta repeticiones (06:41 ART). Validado con 6 casos antes de tocar producción.' },
  { dia: '2026-06-13', fecha: '13/06', tipo: 'analisis', titulo: 'Análisis post-fix', detalle: 'Se confirmó que los arreglos del 12 aguantaron: cero recaídas de info equivocada.' },
  { dia: '2026-06-14', fecha: '14/06', tipo: 'analisis', titulo: 'Informe de las primeras 72 horas (282 conversaciones)', detalle: 'Se revisó toda la operación con métricas duras + 6.044 ejecuciones internas + análisis cualitativo de 250 conversaciones. Infraestructura 99,97% de éxito, humanidad 6,48/10 con pico el 13/06. La mayoría de los bugs feos son del acumulador (plomería de orquestación), no del modelo.' },
  { dia: '2026-06-14', fecha: '14/06', tipo: 'bug', titulo: 'Bugs detectados (sin tocar todavía)', detalle: 'Precios del Loft disparatados en julio (bug del cotizador), el bot se cuelga con imágenes, mensajes repetidos por el acumulador, asunción de fechas/personas y tono de formulario. Decisión: documentar todo primero, después un arreglo por vez.' },
];

// ── Humanidad conversacional por día (análisis cualitativo, escala 1-10) ──
export const HUMANIDAD_DIA: Record<string, number> = { '2026-06-11': 5.0, '2026-06-12': 5.94, '2026-06-13': 6.84, '2026-06-14': 6.35 };

// ── Sello temporal del reporte (cuándo se hizo este análisis) ──
export const REPORTE_SELLO = { inicio: '13/06 22:00', generado: '14/06 08:31', tz: 'ART' };

// ── Errores del período (reutilizables entre scopes) ──
const E_NL: ErrorItem = {
  id: 'E1', titulo: 'Saltos de línea visibles como texto', sev: 'media', estado: 'aplicado',
  magnitud: '3 mensajes de 652 · 1 conversación (Alejandra) · todos PRE-fix',
  causa: 'El modelo escribe a veces "\\n" como texto en vez de un salto real. El divisor de mensajes cortaba por saltos reales, así que ese literal raro quedaba a la vista.',
  fix: 'El divisor convierte los "\\n" de texto en saltos reales antes de cortar. Aplicado 13/06 06:41 ART. Validado: 0 casos después del deploy.',
  nota: 'La primera medición marcó 84% — era un error nuestro de conteo (sumaba los eventos internos de Chatwoot). El número real es 0,5% y ya está resuelto.',
};
const E_DOBLE: ErrorItem = {
  id: 'B1', titulo: 'Mensajes repetidos (el bot manda dos veces lo mismo)', sev: 'alta', estado: 'pendiente',
  magnitud: '8 bloques repetidos en 3 conversaciones (4376, 4413, 4421)',
  causa: 'El sistema que junta los mensajes del cliente a veces dispara DOS veces la misma respuesta, con ~35 segundos de diferencia y sin que el cliente haya escrito nada en el medio. Confirmado revisando las ejecuciones internas (n8n).',
  fix: 'Ajustar el juntador de mensajes para que no dispare dos veces (o descartar respuestas idénticas antes de enviarlas). Es un tema del sistema, NO del texto del bot.',
  nota: 'Es el bug que más afecta la sensación de calidad: un humano nunca manda dos veces el mismo párrafo.',
};
const E_ALUC: ErrorItem = {
  id: 'B2', titulo: 'Asume fechas o personas que el cliente no dijo', sev: 'alta', estado: 'pendiente',
  magnitud: '~3 casos claros (el más grave: conv 4393)',
  causa: 'Cuando el cliente no da una fecha o cantidad exacta, el bot a veces la completa solo en vez de preguntar. En un caso el cliente preguntó "dónde están y qué servicios" y el bot respondió "2 adultos, del 18 al 22 de julio" y cotizó — datos que el cliente nunca dio.',
  fix: 'Que el bot SIEMPRE pregunte cuando falta la fecha o la cantidad de personas, en vez de adivinar. Investigar si en un caso se mezcló contexto de otra conversación.',
};
const E_FRIO: ErrorItem = {
  id: 'B3', titulo: 'Cotiza sin saludar cuando el cliente da todo de entrada', sev: 'media', estado: 'pendiente',
  magnitud: '3 conversaciones (4379, 4404, 4403)',
  causa: 'Si el primer mensaje del cliente ya trae fecha y cantidad de personas, el bot tira el precio directo, sin el "Hola, soy Martina" ni un mensaje puente. Es correcto en el dato, pero suena frío en la primera impresión.',
  fix: 'Siempre saludar y avisar "ya te armo las opciones" antes de mandar el precio, aunque el cliente haya dado todos los datos de una.',
};
const E_HUM: ErrorItem = {
  id: 'B5', titulo: 'Tono a veces robótico / de formulario', sev: 'media', estado: 'pendiente',
  magnitud: 'Naturalidad promedio 3,2 de 5',
  causa: 'El pedido de datos usa siempre la misma plantilla ("te solicitamos los siguientes datos") y a veces el bot no lee lo que el cliente ya dijo. Eso suena a formulario, no a una asesora.',
  fix: 'Variar el texto del pedido de datos y que el bot reconozca lo que el cliente ya escribió antes de pedir lo que falta.',
  nota: 'El bot YA sabe sonar humano: varias conversaciones (Paola, Flor, otras) son indistinguibles de una persona cálida. Falta que ese tono sea siempre, no la excepción.',
};
const E_REPLOOP: ErrorItem = {
  id: 'B6', titulo: 'Repite la misma frase ante reformulaciones', sev: 'media', estado: 'pendiente',
  magnitud: '2 conversaciones (4389, 3793)',
  causa: 'Cuando no hay disponibilidad y el cliente reformula la consulta, el bot repite palabra por palabra "no tengo disponibilidad, ¿tenés flexibilidad?" hasta 3 veces sin avanzar ni ofrecer otra cosa.',
  fix: 'Variar el texto y, tras 1-2 negativas, ofrecer una fecha alternativa o pasar al equipo.',
};
const E_ECO: ErrorItem = {
  id: 'B4', titulo: 'El bot copió el mensaje del cliente (1 caso)', sev: 'alta', estado: 'pendiente',
  magnitud: '1 conversación (4387, consulta de voucher)',
  causa: 'En una consulta de voucher, el bot devolvió textual el mismo mensaje que escribió el cliente, en vez de responder. Caso aislado pero feo: el cliente quedó sin respuesta real.',
  fix: 'Revisar el armado del mensaje en ese nodo. Además, las consultas de voucher deberían derivarse al equipo.',
};
const E_FECHA: ErrorItem = {
  id: 'E3', titulo: 'Fechas vagas terminan en una cotización inventada', sev: 'alta', estado: 'pendiente',
  magnitud: '1 de 21 cotizaciones',
  causa: 'Un cliente pidió "una semana en julio, después del 10" sin día exacto y el bot cotizó una noche del 12 de junio.',
  fix: 'No llamar al cotizador sin día de ingreso y egreso confirmados. Se trabaja junto con B2.',
};
const E_ALT: ErrorItem = {
  id: 'E4', titulo: 'No ofrece fechas alternativas que sí existen', sev: 'media', estado: 'pendiente',
  magnitud: 'Derivaciones por "sin disponibilidad"',
  causa: 'El cotizador ya devuelve fechas cercanas con precio, pero hoy se ignoran. El bot deriva y recepción las ofrece a mano.',
  fix: 'Mostrar esas alternativas en vez de derivar. Es decisión de Pao (su regla de "no sugerir fechas" era de cuando el bot las inventaba).',
};

// ── Errores nuevos del informe 72hs ──
const E_COTIZADOR: ErrorItem = {
  id: 'B10', titulo: '💰 Cotizador: precios del Loft disparatados en julio', sev: 'alta', estado: 'pendiente',
  magnitud: 'Verificado en vivo (convs 4462, 4469)',
  causa: 'El cotizador devuelve la tarifa del Loft ROTA para julio (vacaciones de invierno): el Loft del 11 al 13 de julio sale $1.276.000 POR NOCHE, cuando en junio sale $145.200 (~8 veces más) y 4,5 veces el Master de la misma estadía. El bot NO inventa nada: muestra el precio que le da el cotizador.',
  fix: 'Revisar y corregir la tarifa del Loft de julio en el sistema del cotizador (lo administra el equipo). Afecta ventas AHORA: el cliente ve un precio absurdo y se va.',
  nota: 'Es un problema de DATOS del cotizador, no del bot. Pero es la prioridad comercial: cada cotización de Loft en julio sale mal.',
};
const E_VISION: ErrorItem = {
  id: 'B7', titulo: 'El bot se cuelga cuando le mandan una imagen', sev: 'alta', estado: 'pendiente',
  magnitud: '1 conversación (4454, una clienta)',
  causa: 'Una clienta mandó la foto de una promo y el lector de imágenes del sistema se rompió. El bot no respondió más y la clienta quedó sin atención.',
  fix: 'Blindar el lector de imágenes para que no se caiga, y que ante una imagen que no puede leer el bot igual conteste ("recibí tu imagen, ¿en qué te ayudo?").',
};
const E_RESALUDO: ErrorItem = {
  id: 'B8', titulo: 'Se vuelve a presentar si el cliente reescribe rápido', sev: 'media', estado: 'pendiente',
  magnitud: '2 conversaciones (4453, 4526)',
  causa: 'Si el cliente reescribe a los 2-3 minutos, el bot vuelve a mandar la presentación completa en vez de seguir con lo que el cliente ya dijo.',
  fix: 'Reforzar que el saludo va una sola vez; si ya hubo intercambio, no presentarse de nuevo.',
};
// ── Errores RESUELTOS (historial, para el catálogo completo) ──
const R_LEAK: ErrorItem = {
  id: 'RC-4', titulo: 'Filtró una instrucción interna a una clienta', sev: 'critica', estado: 'resuelto',
  magnitud: 'conv 4341 (Débora), 12/06', causa: 'El modelo copió textual su guía interna del cotizador ("COTIZÁ ASÍ:...") y se la mostró al cliente.',
  fix: 'Triple barrera de seguridad: regla en el prompt + prefijo de instrucción interna en el cotizador + filtro determinístico en el divisor. CERO leaks en el resto del período.',
};
const R_SPA: ErrorItem = {
  id: 'RC-2', titulo: 'Decía que el spa / circuito hídrico se paga aparte', sev: 'critica', estado: 'resuelto',
  magnitud: 'Pablo, Jorge · 12/06', causa: 'El error estaba escrito en el prompt.',
  fix: 'Base de conocimiento reescrita: circuito hídrico, saunas, gym y SUM están incluidos; masajes, flotación y media pensión se pagan aparte.',
};
const R_QUOTES: ErrorItem = {
  id: 'RC-1', titulo: 'No leía los mensajes citados (replies)', sev: 'critica', estado: 'resuelto',
  magnitud: 'Pablo, Nerea · 12/06', causa: 'El juntador descartaba el dato del mensaje citado que manda WhatsApp.',
  fix: 'Ahora resuelve la cita y la antepone al mensaje, así el bot responde sobre el tema correcto.',
};
const R_CHECKOUT: ErrorItem = {
  id: 'RC-3', titulo: 'Informaba check-out a las 11 (es 10)', sev: 'alta', estado: 'resuelto',
  magnitud: 'Nerea · 12/06', causa: 'El prompt no tenía los horarios y el modelo los inventó.',
  fix: 'Se cargaron los datos operativos reales (check-in 15, check-out 10) + regla anti-invención.',
};
const R_REP: ErrorItem = {
  id: 'E2', titulo: 'Pregunta repetida dos veces seguidas', sev: 'alta', estado: 'aplicado',
  magnitud: '4 de 100 conversaciones · 13/06', causa: 'El modelo repetía el mismo texto pegado.',
  fix: 'El divisor descarta líneas y mensajes idénticos consecutivos (Code1 v2). Cayó fuerte post-deploy.',
};

// ── Casos emblemáticos del informe 72hs (análisis cualitativo de 250 convs) ──
export interface Caso { conv: number; dia: string; tipo: 'mejor' | 'peor'; titulo: string; cita: string; detalle: string; }
export const CASOS_72: Caso[] = [
  { conv: 4505, dia: '14/06', tipo: 'mejor', titulo: 'La mejor del período (9,5/10)', cita: 'Buenísimo, vamos con Loft de Montaña.', detalle: 'Resolvió una fecha vaga sin asumir, mandó fotos, cotizó, y al retomar 3hs después NO se re-presentó: confirmó la elección y cerró con seña sin filtrar datos bancarios. Cierre completo, natural y sin un bug.' },
  { conv: 4542, dia: '14/06', tipo: 'mejor', titulo: 'Regla de edades impecable', cita: 'Desde los 13 años ya se considera adulto en el hotel. Entonces serían 3 adultos y 1 niño de 10, ¿confirmo así?', detalle: 'No asume: reclasifica con criterio y pide confirmación antes de cotizar.' },
  { conv: 4394, dia: '13/06', tipo: 'mejor', titulo: 'Reconoce su error con naturalidad', cita: 'Sí, tal cual, tenés razón 🙌', detalle: 'El cliente lo corrige ("el 26 es viernes") y Martina recalcula y re-cotiza sin fricción.' },
  { conv: 4491, dia: '14/06', tipo: 'mejor', titulo: 'Calidez pura', cita: 'Sí, obvio, no molesta para nada 😊', detalle: 'La clienta se disculpa por preguntar mucho y el bot la contiene, cotiza media pensión y deriva natural.' },
  { conv: 3528, dia: '12/06', tipo: 'mejor', titulo: 'Cierre ejemplar', cita: 'Para reservar se abona una seña del 50% del total.', detalle: 'Explica pago y seña sin filtrar un dato bancario, pide los 9 datos y deriva limpio.' },
  { conv: 4420, dia: '13/06', tipo: 'mejor', titulo: 'No inventa: deriva', cita: 'Tienen pileta climatizada y circuito hídrico, ambos incluidos en la estadía.', detalle: 'Contesta todas las preguntas encadenadas y cuando no sabe algo (juegos para niños) deriva en vez de inventar.' },
  { conv: 4469, dia: '14/06', tipo: 'peor', titulo: 'La peor (2,5/10)', cita: 'Queda como 1 adulto y 2 niños, uno de 15 y uno de 5...', detalle: 'Descontrol total: alucinó la composición (edades que nadie dijo), inventó fechas, y mostró un Loft a $3.759.360. Los tres bugs juntos.' },
  { conv: 4341, dia: '12/06', tipo: 'peor', titulo: 'El leak crítico (ya resuelto)', cita: 'COTIZÁ ASÍ: Master Suite a $240.000...', detalle: 'Filtró su instrucción interna al cliente en crudo. Fixeado el mismo día con triple barrera.' },
  { conv: 4387, dia: '13/06', tipo: 'peor', titulo: 'Eco total', cita: '(copió palabra por palabra el mensaje del cliente)', detalle: 'La única respuesta del bot fue repetir el mensaje del cliente. Lead de voucher de regalo perdido.' },
  { conv: 4389, dia: '13/06', tipo: 'peor', titulo: 'Loop sin salida', cita: 'Mirando las fechas que me pasaste, no tengo disponibilidad...', detalle: 'Disparó "sin disponibilidad" tres veces sin leer que el cliente insistía con la misma fecha. No avanzó ni derivó.' },
  { conv: 4462, dia: '14/06', tipo: 'peor', titulo: 'Loft disparatado', cita: 'Loft de Montaña por $2.552.000.', detalle: 'Mostró el Loft a $1,27M por noche — bug del cotizador (B10), no del bot.' },
  { conv: 4453, dia: '14/06', tipo: 'peor', titulo: 'Re-saludo + ignora contexto', cita: 'Hola, ¿cómo estás? Soy Martina... (otra vez)', detalle: 'El cliente ya había dado info y el bot se re-presentó ignorando lo que dijo.' },
];

const ACC: HumanAction[] = [
  { prioridad: 'alta', cliente: 'Walter Torres', contacto: '+5493512377956', conv: 4329, motivo: 'Tres conversaciones sin respuesta, lead partido.', accion: 'Contactar. 2 personas, finde de junio.' },
  { prioridad: 'alta', cliente: 'Débora', contacto: '+5493584902857', conv: 4341, motivo: 'Recibió un mensaje interno por error (ya arreglado). Sigue interesada.', accion: 'Retomar sin mencionarlo. Master $240k/noche o Loft $211k.' },
  { prioridad: 'media', cliente: 'Margarita Moreyra', contacto: '+5493543558276', conv: 4338, motivo: 'Le dijeron "ya está reservado" sin ofrecerle otra fecha.', accion: 'Ofrecer alternativas reales.' },
  { prioridad: 'media', cliente: 'Mercedes Riaño', conv: 4336, motivo: 'Familia 2+2 (3 y 8 años), 29-30 jul. Derivada sin respuesta.', accion: 'Cotizar para esa composición.' },
  { prioridad: 'baja', cliente: 'Jorge Torres', contacto: '+5493513871751', conv: 4340, motivo: 'Cotización con vencimiento.', accion: 'Follow-up antes de las 48 hs. Master $330k.' },
];

const ACC14: HumanAction[] = [
  { prioridad: 'alta', cliente: 'Santi', contacto: '+5493543313579', conv: 4375, motivo: 'Eligió Loft, llegó a forma de pago y no volvió (se enfrió esperando).', accion: 'Retomar el cierre. Del 20 al 23 de julio, 2 personas.' },
  { prioridad: 'alta', cliente: 'Natalia Maroto', contacto: '+5493516824015', conv: 4426, motivo: 'Eligió Master Suite, pidió media pensión, llegó a forma de pago.', accion: 'Cerrar. 11 al 13 de julio.' },
  { prioridad: 'alta', cliente: 'Lic. Paola Donati', contacto: '+5491163006192', conv: 4334, motivo: 'Eligió Loft (viaja con mascota), llegó a la seña.', accion: 'Cerrar. 6 al 9 de julio, seña $353.760.' },
  { prioridad: 'media', cliente: 'Flor Villa', contacto: '+5493571511743', conv: 4401, motivo: 'Lead caliente, llegó a datos de reserva.', accion: 'Retomar el cierre.' },
  { prioridad: 'media', cliente: 'Gise Palacios', contacto: '+5493513091850', conv: 4365, motivo: 'Se derivó de madrugada y esperó ~9,5 hs sin respuesta; se quejó.', accion: 'Disculparse y ofrecer fechas con disponibilidad.' },
  { prioridad: 'media', cliente: 'Alicia', contacto: '+5491123388637', conv: 4393, motivo: 'El bot le pasó fechas y precio de datos que ella no dio (asumió).', accion: 'Confirmar fechas reales y qué necesita; recotizar bien.' },
];

const todo: Narrative = {
  resumen: 'En las primeras 72 horas (go-live 11/06 19:33 ART) Martina atendió 282 conversaciones, casi todas sin intervención humana. El embudo se dio vuelta: el 46% recibió una cotización con precio real y el 9% llegó a dejar sus datos para reservar — antes del bot eran 3 de cada 100. La infraestructura fue impecable (6.044 ejecuciones internas, 99,97% de éxito) y lo crítico quedó blindado: cero precios inventados, cero filtraciones de instrucciones internas, cero datos bancarios expuestos. La calidad conversacional subió día a día (humanidad 6,48/10, con pico el 13/06 tras el fix de formato). Lo que queda por pulir es de comportamiento y un tema del cotizador (precios del Loft en julio). Nada se tocó todavía: primero el cuadro completo, después un arreglo por vez.',
  destacados: [
    '282 conversaciones en 72hs · 46% recibió cotización · 9% dejó datos (antes era 3%).',
    'Infraestructura impecable: 6.044 ejecuciones internas, 99,97% de éxito (solo 2 fallos).',
    'Cero precios inventados, cero filtraciones, cero datos bancarios expuestos.',
    'Humanidad 6,48/10 · 60 conversaciones donde el bot brilló · 70% sin un solo bug.',
  ],
  errores: [E_COTIZADOR, E_VISION, E_DOBLE, E_ALUC, E_ECO, E_FRIO, E_HUM, E_REPLOOP, E_RESALUDO, E_FECHA, E_ALT, R_LEAK, R_SPA, R_QUOTES, R_CHECKOUT, E_NL, R_REP],
  fixes: [
    { titulo: 'Divisor de mensajes a prueba de modelo', detalle: 'Normaliza saltos de línea, descarta repeticiones y filtra instrucciones internas. Determinístico: funciona aunque el modelo falle.', tipo: 'nodo', hora: '13/06 06:41' },
    { titulo: 'Base de conocimiento de servicios', detalle: 'Quedó claro qué entra en la tarifa (circuito hídrico, saunas, gym) y qué se paga aparte (masajes, flotación, media pensión).', tipo: 'prompt', hora: '12/06' },
    { titulo: 'Cierre con derivación a recepción', detalle: 'El bot pide los datos, avisa que recepción sigue y se apaga. Sin pasar datos bancarios.', tipo: 'prompt', hora: '12/06' },
    { titulo: 'Acumulador blindado', detalle: 'Filtra ecos del propio bot, mensajes viejos y notas internas de Chatwoot. Junta mensajes en ráfaga.', tipo: 'acumulador', hora: '12/06' },
  ],
  funciona: [
    { titulo: 'El embudo se dio vuelta', evidencia: 'De 3% que llegaba a datos de reserva a 9%. Cotización: de 3% a 46%. Multiplicó por ~15 los que llegan a cotizar.' },
    { titulo: 'Infraestructura sólida', evidencia: '6.044 ejecuciones internas en 72hs, 99,97% de éxito (solo 2 fallos). Absorbió el pico de 121 convs el 14/06 sin caerse.' },
    { titulo: 'Nunca inventa precios', evidencia: 'Todo precio sale del cotizador. Hasta los precios raros del Loft vienen de la tool, no del bot.' },
    { titulo: 'Cero datos sensibles filtrados', evidencia: '0 CBU/alias, 0 leaks de instrucción (tras el fix del 12/06). El pago lo cierra el humano.' },
    { titulo: 'Aplica la regla de edades', evidencia: 'Reclasifica (13+ = adulto) y pide confirmación antes de cotizar, en vez de asumir.' },
    { titulo: 'Sabe sonar humano', evidencia: '60 de 250 conversaciones (24%) donde el bot brilló: contiene la indecisión, reconoce sus errores, no inventa cuando no sabe.' },
  ],
  calidad: [
    { label: 'Éxito de la infraestructura', value: '99,97%', meta: '6.042 de 6.044 ejecuciones', tone: 'ok', nota: 'El fierro no es el problema.' },
    { label: 'Precios inventados por el bot', value: '0%', tone: 'ok', nota: 'Todo sale del cotizador.' },
    { label: 'Filtraciones · datos bancarios', value: '0', tone: 'ok', nota: 'Blindado de punta a punta.' },
    { label: 'Humanidad conversacional', value: '6,48/10', meta: 'pico 6,84 el 13/06', tone: 'warn', nota: 'Competente, con aristas. Subió día a día.' },
    { label: 'Conversaciones sin ningún bug', value: '70%', meta: '174 de 250', tone: 'ok', nota: '60 donde el bot brilló.' },
    { label: 'Precios del Loft (julio)', value: 'ROTO', meta: 'convs 4462, 4469', tone: 'bad', nota: 'Bug del cotizador (B10). Afecta ventas.' },
    { label: 'Bugs del acumulador (plomería)', value: '~25', meta: 'doble disparo + eco + re-saludo', tone: 'warn', nota: 'La mayoría de los bugs feos, no del modelo.' },
  ],
  acciones: [...ACC14, ...ACC],
  monitoreo: [
    'Mensajes repetidos: revisar el texto crudo de Chatwoot, meta 0.',
    'Que el bot pregunte (no asuma) fechas y cantidad de personas.',
    'Naturalidad del tono: re-medir tras los arreglos de texto, meta > 4/5.',
    'Derivaciones de madrugada: que no queden clientes esperando sin respuesta.',
    'Conversión post-seña: cuántos de los que llegan a datos efectivamente cierran.',
  ],
  predicciones: [
    { texto: 'Las fechas relativas ("este finde", "mañana") van a seguir confundiendo al modelo. Es la fuente número uno de error a futuro.', riesgo: 'alto' },
    { texto: 'Si no se ajusta el juntador, los mensajes repetidos van a seguir apareciendo en ráfagas.', riesgo: 'medio' },
    { texto: 'De madrugada el equipo no da abasto: derivaciones que quedan sin responder.', riesgo: 'medio' },
  ],
  bitacora: [
    { hora: '11/06 19:08', texto: 'Go-live: Martina V8 sale a producción y se abre a todo el tráfico.', tipo: 'deploy' },
    { hora: '12/06', texto: 'Se corrigen 8 errores de contenido reportados por el equipo + acumulador blindado.', tipo: 'fix' },
    { hora: '13/06 06:41', texto: 'Divisor de mensajes a prueba de modelo (saltos de línea + repeticiones).', tipo: 'deploy' },
    { hora: '14/06', texto: 'Análisis profundo del período: infra en cero fallos, fixes validados, nuevos temas de comportamiento detectados (sin tocar).', tipo: 'analisis' },
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
  errores: [E_NL, { id: 'E2', titulo: 'Pregunta repetida dos veces seguidas', sev: 'alta', estado: 'aplicado', magnitud: '4 de 100 conversaciones', causa: 'El modelo repetía el mismo texto pegado.', fix: 'El divisor descarta líneas y mensajes idénticos consecutivos.' }, E_FECHA, E_ALT],
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

const dia14: Narrative = {
  resumen: 'Análisis profundo de toda la operación desde el último reporte. Se revisaron 72 conversaciones de la ventana (madrugada del 14 ART y el cierre del 13) cruzando métricas duras con 1.345 ejecuciones internas y el detalle de cada cotización. La buena noticia: la infraestructura está impecable (cero fallos) y los arreglos previos funcionaron (saltos de línea y filtraciones en cero). Lo que hay que mejorar es de comportamiento: mensajes que se repiten por un doble disparo del juntador, el bot que a veces asume fechas o personas en vez de preguntar, y un tono por momentos de formulario — justo lo que se quiere pulir. Nada se tocó: primero el cuadro completo, después un arreglo por vez. (Las métricas de esta vista son las del día 14 calendario; el análisis completo del corte está en "Todo el período".)',
  destacados: [
    'Infraestructura impecable: cero fallos en 1.345 ejecuciones internas.',
    'El fix de saltos de línea quedó firme: cero casos nuevos.',
    'Se identificó la causa real de los mensajes repetidos: doble disparo del juntador (no es el texto del bot).',
    'El bot ya sabe sonar humano; falta que sea siempre, no la excepción.',
  ],
  errores: [E_DOBLE, E_ALUC, E_FRIO, E_HUM, E_REPLOOP, E_ECO],
  fixes: [],
  funciona: [
    { titulo: 'Infraestructura sin fallos', evidencia: '1.345 ejecuciones internas (bot, juntador, etiquetado, cotizador): cero errores técnicos.' },
    { titulo: 'Saltos de línea resueltos', evidencia: 'Cero casos después del fix del 13. El arreglo aguantó.' },
    { titulo: 'Cero filtraciones y cero datos bancarios', evidencia: 'En las conversaciones que llegaron a la seña, el bot nunca pasó CBU ni alias.' },
    { titulo: 'Derivaciones por reglas bien ejecutadas', evidencia: 'Grupos de 6+, gift cards, spa y cierres: derivados correctamente.' },
  ],
  calidad: [
    { label: 'Fallos técnicos del sistema', value: '0%', meta: '0 de 1.345', tone: 'ok' },
    { label: 'Saltos de línea (post-fix)', value: '0%', tone: 'ok', nota: 'El arreglo del 13 funcionó.' },
    { label: 'Mensajes repetidos', value: '8', meta: '3 conversaciones', tone: 'warn', nota: 'Doble disparo del juntador (B1).' },
    { label: 'Asume fechas/personas', value: '~3', meta: 'casos claros', tone: 'warn', nota: 'Debería preguntar (B2).' },
    { label: 'Naturalidad del tono', value: '3,2/5', tone: 'warn', nota: 'Prioridad a mejorar (B5).' },
    { label: 'Precios inventados', value: '0%', tone: 'ok' },
  ],
  acciones: ACC14,
  monitoreo: [
    'Mensajes repetidos: meta 0 tras ajustar el juntador.',
    'Que el bot pregunte fecha y cantidad de personas en vez de asumir.',
    'Naturalidad del tono: re-medir tras variar el texto del pedido de datos.',
    'Derivaciones de madrugada: que no queden clientes esperando horas.',
  ],
  predicciones: [
    { texto: 'Si no se ajusta el juntador, los mensajes repetidos seguirán apareciendo en ráfagas.', riesgo: 'medio' },
    { texto: 'Las fechas relativas y vagas van a seguir tentando al bot a asumir.', riesgo: 'alto' },
    { texto: 'Las derivaciones de madrugada sin cobertura van a dejar leads fríos.', riesgo: 'medio' },
  ],
  bitacora: [
    { hora: '14/06', texto: 'Análisis de 72 conversaciones del corte + 1.345 ejecuciones internas.', tipo: 'analisis' },
    { hora: '14/06', texto: 'Confirmado con n8n: los mensajes repetidos son por doble disparo del juntador, no del modelo.', tipo: 'nota' },
    { hora: '14/06', texto: 'Plan de arreglos propuesto (sin aplicar): juntador, saludo+puente, anti-asunción, tono.', tipo: 'decision' },
  ],
};

export const narrative: Record<string, Narrative> = { todo, '2026-06-12': dia12, '2026-06-13': dia13, '2026-06-14': dia14 };
export const getNarrative = (scope: string): Narrative => narrative[scope] || narrative.todo;

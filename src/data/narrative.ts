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
  { dia: '2026-06-14', fecha: '14/06', tipo: 'analisis', titulo: 'Análisis profundo del período (164 conversaciones)', detalle: 'Se revisó toda la operación con métricas duras + 1.345 ejecuciones internas. La infraestructura quedó en cero fallos y los fixes validados. Se detectaron temas de comportamiento (mensajes repetidos, asunción de datos, tono) para trabajar.' },
  { dia: '2026-06-14', fecha: '14/06', tipo: 'bug', titulo: 'Bugs detectados (sin tocar todavía)', detalle: 'Mensajes repetidos por doble disparo del juntador, el bot que a veces asume fechas/personas, y un tono por momentos de formulario. Decisión: analizar todo primero, después aplicar un arreglo por vez.' },
];

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
  resumen: 'Desde el go-live (11/06 22:33) Martina atendió 164 conversaciones, la enorme mayoría sin intervención humana. El embudo sigue fuerte: cerca del 50% recibe una cotización con precio real y un 9% llega a dejar sus datos para reservar — antes del bot eran 3 de cada 100. La infraestructura es impecable (1.345 ejecuciones internas, cero fallos) y los arreglos aplicados funcionaron (saltos de línea y filtraciones en cero). Lo que queda por mejorar es de comportamiento: mensajes que se repiten por un doble disparo del juntador, el bot que a veces asume fechas o personas en vez de preguntar, y un tono que por momentos suena a formulario. Nada de esto se tocó todavía: primero el análisis completo, después un arreglo por vez.',
  destacados: [
    '164 conversaciones desde el lanzamiento · ~50% recibió cotización con precio real.',
    'Infraestructura impecable: 1.345 ejecuciones internas, cero fallos técnicos.',
    'Cero precios inventados y cero filtraciones de instrucciones internas en todo el período.',
    'El bot ya sabe sonar humano: varias conversaciones indistinguibles de una persona cálida.',
  ],
  errores: [E_DOBLE, E_ALUC, E_FRIO, E_HUM, E_REPLOOP, E_ECO, E_NL, E_FECHA, E_ALT],
  fixes: [
    { titulo: 'Divisor de mensajes a prueba de modelo', detalle: 'Normaliza saltos de línea, descarta repeticiones y filtra instrucciones internas. Determinístico: funciona aunque el modelo falle.', tipo: 'nodo', hora: '13/06 06:41' },
    { titulo: 'Base de conocimiento de servicios', detalle: 'Quedó claro qué entra en la tarifa (circuito hídrico, saunas, gym) y qué se paga aparte (masajes, flotación, media pensión).', tipo: 'prompt', hora: '12/06' },
    { titulo: 'Cierre con derivación a recepción', detalle: 'El bot pide los datos, avisa que recepción sigue y se apaga. Sin pasar datos bancarios.', tipo: 'prompt', hora: '12/06' },
    { titulo: 'Acumulador blindado', detalle: 'Filtra ecos del propio bot, mensajes viejos y notas internas de Chatwoot. Junta mensajes en ráfaga.', tipo: 'acumulador', hora: '12/06' },
  ],
  funciona: [
    { titulo: 'El embudo se dio vuelta', evidencia: 'De 3% que llegaba a datos de reserva a ~9%. Cotización: de 3% a ~50%.' },
    { titulo: 'Infraestructura impecable', evidencia: '1.345 ejecuciones internas en el período, cero fallos técnicos.' },
    { titulo: 'Cero precios inventados', evidencia: 'Todo precio sale del cotizador. Ningún número de la galera.' },
    { titulo: 'Derivación de punta a punta', evidencia: 'Detecta el caso, etiqueta en Chatwoot y asigna al equipo solo.' },
    { titulo: 'Combos para grupos', evidencia: 'Grupos de 4-5 se cotizan con dos habitaciones, sin derivar.' },
    { titulo: 'Sabe sonar humano', evidencia: 'Hay conversaciones (Paola, Flor) indistinguibles de una persona cálida.' },
  ],
  calidad: [
    { label: 'Fallos técnicos del sistema', value: '0%', meta: '0 de 1.345 ejecuciones', tone: 'ok', nota: 'La infraestructura no es el problema.' },
    { label: 'Precios inventados', value: '0%', tone: 'ok', nota: 'Todo sale del cotizador.' },
    { label: 'Filtraciones internas', value: '0%', tone: 'ok', nota: 'Defensa en 3 capas.' },
    { label: 'Saltos de línea visibles', value: '0%', meta: 'post-fix', tone: 'ok', nota: 'Resuelto en el divisor.' },
    { label: 'Mensajes repetidos', value: '8', meta: '3 conversaciones', tone: 'warn', nota: 'Doble disparo del juntador (B1). Pendiente.' },
    { label: 'Asume fechas/personas', value: '~3', meta: 'casos claros', tone: 'warn', nota: 'Debería preguntar (B2). Pendiente.' },
    { label: 'Naturalidad del tono', value: '3,2/5', tone: 'warn', nota: 'Prioridad: que suene siempre humano (B5).' },
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

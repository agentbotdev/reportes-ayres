import type { DayReport } from '../types';

// ============================================================
// REPORTES DIARIOS — BOT MARTINA · Hotel Ayres del Champaquí
// Fuente: Chatwoot API + ejecuciones n8n. Verificado a nivel mensaje.
// Para agregar un día: sumar un objeto DayReport al array `reports`.
// ============================================================

const dia13: DayReport = {
  fecha: '2026-06-13',
  titulo: 'Post-correcciones',
  ventana: '01:21 → 07:17 UTC (madrugada ART)',
  resumen:
    'Día de validación de los fixes del 12 y caza fina de errores nuevos. Los arreglos de contenido (info de spa, check-out, derivación a recepción) quedaron sólidos. Aparecieron 2 bugs de formato raros e intermitentes del modelo (saltos de línea literales y repetición de pregunta), ya corregidos de raíz en el pipeline. La tasa de derivación subió por una racha de consultas para un fin de semana ya vendido.',
  kpis: [
    { label: 'Conversaciones', value: 25, sub: 'con actividad post-fix', icon: 'messages', tone: 'brand' },
    { label: 'Derivadas', value: 12, sub: '48% del total', icon: 'share', tone: 'warn' },
    { label: 'Cotización entregada', value: 5, sub: 'con precio real', icon: 'tag', tone: 'ok' },
    { label: 'A datos de reserva', value: 5, sub: 'leads calientes', icon: 'flame', tone: 'ok' },
    { label: 'Alucinación', value: '~5%', sub: '1 de 21 cotizaciones', icon: 'brain', tone: 'warn' },
    { label: 'Leaks internos', value: '0%', sub: 'fix del 12 sólido', icon: 'shield', tone: 'ok' },
  ],
  embudo: [
    { etapa: 'presentacion', label: 'Presentación', valor: 5 },
    { etapa: 'indagacion_1', label: 'Indagación 1', valor: 2 },
    { etapa: 'indagacion_2', label: 'Indagación 2', valor: 6 },
    { etapa: 'validacion_fechas', label: 'Validación fechas', valor: 2 },
    { etapa: 'cotizacion_enviada', label: 'Cotización enviada', valor: 5 },
    { etapa: 'datos_para_reserva', label: 'Datos de reserva', valor: 5 },
  ],
  embudoNota: 'El 40% recibió cotización o avanzó a datos de reserva. Embudo sano pese a la racha de "sin disponibilidad".',
  derivaciones: [
    { razon: 'sin_disponibilidad', label: 'Sin disponibilidad', cant: 5, correcto: 'parcial', convs: ['4369', '4365', '4337', '395', '4353'], nota: 'Finde 13-15 jun ya vendido. Debería ofrecer alternativas (el cotizador las tiene) en vez de derivar — pendiente con Pao.' },
    { razon: 'cierre', label: 'Cierre / datos → recepción', cant: 2, correcto: 'si', convs: ['4292', '4364'], nota: 'Conversión: grupos de 4 eligieron Master+Loft y pasaron a recepción.' },
    { razon: 'servicios', label: 'Servicios especiales', cant: 4, correcto: 'si', convs: ['4360', '4367', '467', '4056'], nota: 'Day Spa, Día del Padre, all-inclusive, Petit Hotel — no se cotizan por bot.' },
    { razon: 'spa_detalle', label: 'Detalle de spa', cant: 1, correcto: 'si', convs: ['4351'], nota: 'Pidió la carta de tratamientos.' },
  ],
  derivacionTotal: 12,
  derivacionPct: 48,
  errores: [
    { id: 'E1', titulo: 'Saltos de línea "\\n" literales visibles', sev: 'media', estado: 'aplicado', magnitud: '3 mensajes de 652 (0.5%) · 1 conversación (Alejandra 4351)', causa: 'gpt-5.4-mini ocasionalmente escribe "\\n" como texto en vez de salto real. El Code1 partía por saltos reales y no tocaba ese literal raro. NO lo introdujo el deploy del 12.', fix: 'Code1 v2: normaliza "\\n"/"\\r\\n" literales → reales antes de partir (sin romper la separación por doble salto). Aplicado 09:41 UTC.', evidencia: 'Corrección de medición: una 1ª pasada reportó "84%" — era falso positivo (contaba el "\\n" de los mensajes-evento internos de Chatwoot). El número real, contando caracteres exactos, es 0.5%.' },
    { id: 'E2', titulo: 'Repetición de mensaje / pregunta pegada', sev: 'alta', estado: 'aplicado', magnitud: '~4 de 86 conversaciones (4321, 4316, 4312, 4313)', causa: 'El modelo repite el mismo texto (ej: la pregunta de composición dos veces seguidas).', fix: 'Code1 v2: dedup de líneas y mensajes idénticos consecutivos. Aplicado 09:41 UTC.' },
    { id: 'E3', titulo: 'Alucinación de fechas', sev: 'alta', estado: 'pendiente', magnitud: '1 de 21 cotizaciones (~5%) · conv 467', causa: 'El cliente pidió "una semana, julio, después del 10" sin día exacto; el bot cotizó 1 noche del 12-13 junio (inventó). La regla de fechas vagas no alcanzó.', fix: 'Reforzar regla + considerar no llamar la tool sin día de ingreso Y egreso explícitos. A revisar con Pao.' },
    { id: 'E4', titulo: 'No ofrece alternativas que sí existen', sev: 'media', estado: 'pendiente', magnitud: '5 derivaciones por "sin disponibilidad"', causa: 'El cotizador devuelve fechas cercanas con precio (campo alternativas) pero el mapeo las ignora. El humano las ofrece después a mano.', fix: 'Exponer alternativas + ajustar CASO C del prompt. DECISIÓN DE PAO pendiente (su regla "no sugerir fechas" era de cuando el bot las inventaba).' },
    { id: 'E5', titulo: 'No clarifica fechas relativas', sev: 'baja', estado: 'pendiente', magnitud: 'conv 4369 ("este finde", "sábado 14")', causa: 'El modelo es flojo con fechas relativas; repitió "sin disponibilidad" sin ayudar a fijar el día.', fix: 'Regla de clarificación (parcialmente cubierta por la regla 12 de confirmación).' },
  ],
  fixes: [
    { titulo: 'Code1 v2 — normalizador + dedup', detalle: 'Convierte "\\n" literales a saltos reales, colapsa líneas/mensajes repetidos y mantiene el anti-leak. Validado con 6 casos locales. Resuelve E1 y E2 de raíz, sin depender del modelo.', tipo: 'nodo', estado: 'aplicado', hora: '09:41 UTC' },
  ],
  funciona: [
    { titulo: 'KB de wellness', evidencia: '0 errores de "el spa se paga". En 4351 explicó bien circuito hídrico, masajes y tratamientos.' },
    { titulo: 'Check-out 10hs', evidencia: '0 menciones de "11hs" post-fix.' },
    { titulo: 'Confirmación de ambigüedad', evidencia: '4369: "¿Te referís al finde del 13 y 14 de junio o a otro?" (regla 12 funcionando).' },
    { titulo: 'Derivación a recepción con datos', evidencia: '4292: pago → 9 datos → "te derivo con recepción". Perfecto.' },
    { titulo: 'Combos para grupos de 4', evidencia: '4364 y 4292: Master+Loft correcto para 4 adultos.' },
    { titulo: 'Anti-leak', evidencia: '0 leaks de "COTIZÁ ASÍ" en las 25 conversaciones.' },
  ],
  calidad: [
    { label: 'Alucinación (fechas/datos)', value: '~5%', meta: '1 de 21 cotizaciones', tone: 'warn', nota: 'El "\\n" NO es alucinación, es formato.' },
    { label: 'Mensajes con "\\n" literal', value: '0.5%', meta: '3 de 652', tone: 'ok', nota: 'Raro e intermitente. Ya corregido en Code1.' },
    { label: 'Mensajes con repetición', value: '~0.6%', meta: '~4 de 652', tone: 'ok', nota: 'Raro. Ya corregido en Code1.' },
    { label: 'Adherencia a lógica/protocolo', value: 'Alta', tone: 'ok', nota: 'Cotiza con precio, deriva bien, combos bien.' },
    { label: 'Leaks de instrucciones internas', value: '0%', tone: 'ok', nota: 'Defensa de 3 capas sólida.' },
  ],
  habitaciones: { master: 14, loft: 9 },
  acciones: [
    { prioridad: 'alta', cliente: 'Walter Torres', contacto: '+5493512377956', conv: '4329-31', motivo: '3 conversaciones sin respuesta, lead fragmentado.', accion: 'Contactar ya. Jun 13-14, 2 adultos.' },
    { prioridad: 'alta', cliente: 'Débora', contacto: '+5493584902857', conv: '4341', motivo: 'Recibió el leak (ya corregido); sigue como lead activa.', accion: 'Retomar sin mencionar el error. Master $240k/noche o Loft $211k.' },
    { prioridad: 'media', cliente: 'Margarita Moreyra', contacto: '+5493543558276', conv: '4338', motivo: 'Le dijeron "ya está reservado".', accion: 'Ofrecer alternativas reales de fecha.' },
    { prioridad: 'media', cliente: 'Mercedes Riaño', conv: '4336', motivo: 'Familia 2+2 (3 y 8 años) Jul 29-30, derivada sin respuesta del equipo.', accion: 'Informar opciones para esa composición.' },
    { prioridad: 'baja', cliente: 'Jorge Torres', contacto: '+5493513871751', conv: '4340', motivo: 'Cotización válida hasta 14-jun 20:21.', accion: 'Follow-up antes del vencimiento. Master $330k.' },
  ],
  monitoreo: [
    'Check diario del "\\n" literal sobre el wire crudo de Chatwoot. Meta: 0%. (script monitor_formato.py)',
    'Repeticiones: líneas idénticas consecutivas. Meta: 0.',
    'Leaks: grep "COTIZÁ ASÍ" en mensajes salientes. Meta: 0.',
    'Alucinación de fechas: cruzar mes mencionado por el cliente vs mes cotizado.',
    'Tasa de derivación por "sin disponibilidad": si sube, falta el modo alternativas.',
  ],
  predicciones: [
    { texto: 'Fechas relativas ("este finde", "mañana") van a seguir dando alucinaciones — el modelo es flojo ahí. Fuente #1 de error futuro.', riesgo: 'alto' },
    { texto: 'Markdown de WhatsApp (*negrita*) — verificar que no se rompa o duplique.', riesgo: 'bajo' },
    { texto: 'Grupos de 5 (límite entre combo y derivar 6+) — testear el borde.', riesgo: 'medio' },
    { texto: 'Saturación de derivaciones de noche: 48% deriva; si el equipo no da abasto, leads sin respuesta.', riesgo: 'medio' },
    { texto: 'El "\\n" podría reaparecer si se cambia el modelo — por eso el fix va en el Code1 (determinístico), no solo en el prompt.', riesgo: 'bajo' },
  ],
  bitacora: [
    { hora: '01:21', texto: 'Deploy fixes RC-1..RC-8 en 3 workflows (12/12 checks): quotes, KB wellness, datos operativos, anti-leak 3 capas, saludo obligatorio, contraste habitaciones, Nombre Notion.', tipo: 'deploy' },
    { hora: '02:15', texto: 'KB de wellness refinada con la definición exacta de Ignacio (circuito hídrico, SUM, sala de trabajo).', tipo: 'fix' },
    { hora: '09:00', texto: 'Análisis completo de 25 conversaciones post-fix. Detectados E1-E5.', tipo: 'analisis' },
    { hora: '09:30', texto: 'Corrección de medición: el bug "\\n" era 0.5% (no 84% como se reportó primero). Falso positivo del script.', tipo: 'nota' },
    { hora: '09:41', texto: 'Deploy Code1 v2 (normalizador + dedup) — resuelve E1 y E2 de raíz.', tipo: 'deploy' },
  ],
};

const dia12: DayReport = {
  fecha: '2026-06-12',
  titulo: 'Primeras 24 horas',
  ventana: 'Activación 11-jun 22:33 → 13-jun 02:00 UTC',
  resumen:
    'Primer día completo del Bot Martina V8 en producción real. El embudo se dio vuelta respecto de la era pre-bot: de 3% que llegaba a datos de reserva se pasó a 9%, y de 42% que moría en presentación a 6%. Se detectaron 10 errores reportados por el equipo, todos con causa raíz confirmada y corregidos el mismo día o al siguiente. El caso de "falsa disponibilidad" se investigó y resultó NO ser un bug.',
  kpis: [
    { label: 'Conversaciones', value: 86, sub: '95% atendidas por el bot', icon: 'messages', tone: 'brand' },
    { label: 'Cotización entregada', value: '58%', sub: 'vs 3% era pre-bot', icon: 'tag', tone: 'ok' },
    { label: 'A datos de reserva', value: '9%', sub: 'el embudo se dio vuelta', icon: 'flame', tone: 'ok' },
    { label: 'Derivadas', value: 19, sub: '22% del total', icon: 'share', tone: 'warn' },
    { label: 'Errores resueltos', value: '8', sub: 'de 10 reportados', icon: 'wrench', tone: 'ok' },
    { label: 'Alucinación de precio', value: '0%', sub: 'todo precio salió de la tool', icon: 'shield', tone: 'ok' },
  ],
  embudo: [
    { etapa: 'presentacion', label: 'Presentación', valor: 12 },
    { etapa: 'indagacion', label: 'Indagación', valor: 16 },
    { etapa: 'validacion_fechas', label: 'Validación fechas', valor: 9 },
    { etapa: 'cotizacion_enviada', label: 'Cotización enviada', valor: 37 },
    { etapa: 'datos_para_reserva', label: 'Datos de reserva', valor: 7 },
    { etapa: 'postventa', label: 'Postventa', valor: 1 },
  ],
  embudoNota: 'Era pre-bot (análisis de 190 conversaciones de abril): 42% moría en presentación, solo 3% llegaba a datos. Hoy: 6% en presentación, 58% recibe cotización, 9% a datos.',
  derivaciones: [
    { razon: 'cierre', label: 'Cierre / datos → recepción', cant: 7, correcto: 'si', nota: 'Conversión: leads que avanzaron a reserva.' },
    { razon: 'servicios', label: 'Servicios especiales / Petit', cant: 5, correcto: 'si', nota: 'Eventos, Day Spa, Petit Hotel, all-inclusive.' },
    { razon: 'sin_disponibilidad', label: 'Sin disponibilidad', cant: 4, correcto: 'parcial', nota: 'Fechas sin lugar; el humano retomó con alternativas.' },
    { razon: 'grupo_familia', label: 'Grupo grande / familia compleja', cant: 3, correcto: 'si', nota: 'Composiciones que el bot no cotiza solo.' },
  ],
  derivacionTotal: 19,
  derivacionPct: 22,
  errores: [
    { id: 'RC-1', titulo: 'Bot ciego a mensajes citados (replies)', sev: 'critica', estado: 'resuelto', magnitud: 'Pablo×3, Nerea', causa: 'El acumulador descartaba content_attributes.in_reply_to que Chatwoot sí envía.', fix: 'Pipeline de quotes: el acumulador resuelve la cita vía API y la antepone + regla 12 en el prompt.' },
    { id: 'RC-2', titulo: 'Info de wellness incorrecta ("el spa se paga")', sev: 'critica', estado: 'resuelto', magnitud: 'Pablo, Jorge', causa: 'El error estaba ESCRITO en el prompt ("se abona o viene por promo").', fix: 'KB corregida: circuito hídrico, saunas, gym, SUM incluidos; spa/masajes/flotación aparte.' },
    { id: 'RC-3', titulo: 'Check-out informado 11hs (es 10hs)', sev: 'alta', estado: 'resuelto', magnitud: 'Nerea', causa: 'El prompt no tenía horarios → el modelo alucinó el estándar de industria.', fix: 'Bloque DATOS OPERATIVOS + regla anti-invención de datos operativos.' },
    { id: 'RC-4', titulo: 'Leak de instrucciones internas', sev: 'critica', estado: 'resuelto', magnitud: 'Débora recibió "COTIZÁ ASÍ:..."', causa: 'gpt-5.4-mini transcribió la instruccion_agente de la tool en su respuesta.', fix: 'Defensa 3 capas: regla 7 reforzada + prefijo [INSTRUCCIÓN INTERNA] en el cotizador + guard regex en Code1.' },
    { id: 'RC-5', titulo: 'Cotiza "en frío" sin saludar', sev: 'media', estado: 'resuelto', magnitud: 'Nahueleiva', causa: 'La excepción de ETAPA 1 no cubría "no falta ningún dato"; el puente era opcional.', fix: 'Saludo + mensaje puente obligatorios en el primer turno.' },
    { id: 'RC-6', titulo: 'Confusión hidromasaje Loft vs Master', sev: 'alta', estado: 'resuelto', magnitud: 'Nerea', causa: 'RC-1 + el prompt no contrastaba explícitamente las habitaciones.', fix: 'Bloque DIFERENCIAS CLAVE: Master tiene hidro en habitación, Loft no.' },
    { id: 'RC-8', titulo: 'Notion guardaba "—" en Nombre', sev: 'alta', estado: 'resuelto', magnitud: 'Regresión del 12-jun', causa: 'El Update mapeaba Nombre ← onboarding (que vale "—" casi siempre) y pisaba el nombre en cada mensaje.', fix: 'Ternario: usa onboarding si es real, sino el nombre de WhatsApp.' },
    { id: 'FD', titulo: '"Falsa disponibilidad" (Hernán/Margarita)', sev: 'ok', estado: 'descartado', magnitud: 'NO era bug', causa: 'El finde 13-15 jun se vendió de verdad entre las 02:00 y las 20:05. El agente mandó fechas correctas y el cotizador respondió honesto.', fix: 'Caso cerrado. El error fue del equipo enviando un template de tarifas sin chequear disponibilidad (tema operativo para Pao).' },
  ],
  fixes: [
    { titulo: 'Deploy V8 inicial', detalle: 'Prompt nuevo, tool al cotizador v2, gpt-5.4-mini + fallback real, Code1 splitter, STATUS V8, memoria 25.', tipo: 'prompt', estado: 'aplicado', hora: '19:41' },
    { titulo: 'Acumulador blindado', detalle: 'Filter de 5 condiciones, labels derivado/humano frenan, debounce sano, Redis delete correcto, dedup batch.', tipo: 'acumulador', estado: 'aplicado', hora: '20:12' },
    { titulo: 'PVA nuevo de cierre', detalle: 'Sin datos bancarios por bot, ETAPA 6 con escasez + derivación a recepción antes de los datos, STATUS temperatura=derivado.', tipo: 'prompt', estado: 'aplicado', hora: '20:57' },
    { titulo: 'Quotes + Notion + ETIQUETADO', detalle: 'Pipeline de mensajes citados, Nombre en Notion, endpoint de labels correcto + lowercase.', tipo: 'acumulador', estado: 'aplicado', hora: '21:27' },
  ],
  funciona: [
    { titulo: 'El embudo se dio vuelta', evidencia: '58% recibe cotización (era 3%), 9% llega a datos de reserva.' },
    { titulo: 'Cero alucinaciones de precio', evidencia: 'Todos los precios entregados salieron de la tool.' },
    { titulo: 'Derivación funcionando de punta a punta', evidencia: 'STATUS → Notion → ETIQUETADO → label en Chatwoot → asignación al equipo.' },
    { titulo: 'Combos para grupos', evidencia: 'Grupos de 4-5 cotizados con 2 habitaciones sin derivar.' },
  ],
  calidad: [
    { label: 'Cotización con precio real', value: '100%', tone: 'ok', nota: 'Cero precios inventados.' },
    { label: 'Errores de contenido', value: '8 detectados', meta: 'todos corregidos', tone: 'warn', nota: 'Spa, check-out, hidromasaje, leak, etc.' },
    { label: 'Adherencia al embudo', value: 'Alta', tone: 'ok' },
  ],
  habitaciones: { master: 33, loft: 20 },
  acciones: [
    { prioridad: 'alta', cliente: 'Walter Torres', contacto: '+5493512377956', conv: '4329-31', motivo: '3 conversaciones sin respuesta.', accion: 'Contactar. Jun 13-14, 2 adultos.' },
    { prioridad: 'alta', cliente: 'Débora', contacto: '+5493584902857', conv: '4341', motivo: 'Recibió el leak; sigue activa.', accion: 'Retomar sin mencionar el error.' },
  ],
  monitoreo: [
    'Embudo diario: % que llega a cotización y a datos de reserva.',
    'Leaks: grep "COTIZÁ ASÍ" en salientes. Meta: 0.',
    'Etiquetado: que derivado/humano se apliquen y no se pisen.',
  ],
  predicciones: [
    { texto: 'Leads viejos con memoria V6 pueden traer contexto raro las primeras horas.', riesgo: 'bajo' },
    { texto: 'Fechas relativas y vagas serán fuente recurrente de error.', riesgo: 'alto' },
  ],
  bitacora: [
    { hora: '19:41', texto: 'GO-LIVE: deploy V8 inicial a producción.', tipo: 'deploy' },
    { hora: '20:12', texto: 'Acumulador blindado contra webhooks sucios de Chatwoot.', tipo: 'fix' },
    { hora: '20:57', texto: 'PVA nuevo de cierre (derivación a recepción).', tipo: 'fix' },
    { hora: '22:08', texto: 'Bot abierto a todo el tráfico (se quitó el pin de testing).', tipo: 'decision' },
  ],
};

export const reports: DayReport[] = [dia13, dia12];

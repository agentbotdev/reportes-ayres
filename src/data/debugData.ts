export type Severity = 'critica' | 'alta' | 'media' | 'baja';
export type Status = 'resuelto' | 'activo' | 'cerrado';
export type NodeType = 'ok' | 'fail' | 'impact' | 'client' | 'fix' | 'pending' | 'info';

export interface FlowNode {
  id: string;
  label: string;
  type: NodeType;
  detail?: string;
}

export interface BugFlow {
  nodes: FlowNode[];
  edges: [string, string][];
}

export interface TrackerStep {
  label: string;
  done: boolean;
}

export interface BugEntry {
  id: string;
  title: string;
  category: string;
  severity: Severity;
  status: Status;
  magnitude: string;
  summary: string;
  convIds?: number[];
  execIds?: number[];
  dateDetected: string;
  dateFixed?: string;
  cause: string;
  fix: string;
  verification?: string;
  quote?: string;
  flow: BugFlow;
  connections?: string[];
  tracker?: { steps: TrackerStep[] };
}

export interface BugCategory {
  id: string;
  label: string;
  icon: string;
  color: string;
  description: string;
  bugs: BugEntry[];
}

const infraBugs: BugEntry[] = [
  {
    id: 'B7', title: 'Vision rompe con imagen', category: 'infra', severity: 'alta', status: 'activo',
    magnitude: '1 caso (conv 4454)', summary: 'Imagen de promo rompe Vision → cliente sin respuesta → lead perdido',
    convIds: [4454], execIds: [63594], dateDetected: '14/06 10:05',
    cause: 'Nodo Analyze image sin try/catch. Si Vision falla, el acumulador entero muere.',
    fix: 'Blindar con try/catch + fallback "recibí tu imagen, ¿en qué te ayudo?"',
    quote: '[cliente] Consultaba por esta promo → [bot] (silencio total)',
    flow: {
      nodes: [
        { id: 'n1', label: 'Cliente manda imagen', type: 'ok', detail: 'Imagen de promoción' },
        { id: 'n2', label: 'ACUMULADOR', type: 'ok', detail: 'Filter + Redis + Wait OK' },
        { id: 'n3', label: 'Switch tipo=imagen', type: 'ok' },
        { id: 'n4', label: 'Analyze image (Vision)', type: 'fail', detail: 'Bad request — sin try/catch' },
        { id: 'n5', label: 'Ejecución MUERE', type: 'impact', detail: 'BOT MARTINA nunca se ejecuta' },
        { id: 'n6', label: 'Cliente: silencio total', type: 'client', detail: 'Lead perdido — Fiama Mignola' },
      ],
      edges: [['n1','n2'],['n2','n3'],['n3','n4'],['n4','n5'],['n5','n6']],
    },
    tracker: { steps: [
      { label: 'Envolver Analyze image en try/catch', done: false },
      { label: 'Agregar fallback: "recibí tu imagen, ¿en qué te ayudo?"', done: false },
      { label: 'Backup del acumulador', done: false },
      { label: 'Deploy + verificar con imagen de prueba', done: false },
    ]},
  },
  {
    id: 'N8N-2', title: 'Notion Bad Gateway (transitorio)', category: 'infra', severity: 'baja', status: 'cerrado',
    magnitude: '1 caso (conv 4464)', summary: 'Notion devolvió 502 al etiquetar. Cliente SÍ recibió respuesta.',
    execIds: [64700], dateDetected: '14/06 15:18',
    cause: 'Notion API transitoria (502). No afecta al cliente.',
    fix: 'Sin acción necesaria — transitorio.',
    flow: {
      nodes: [
        { id: 'n1', label: 'BOT MARTINA responde OK', type: 'ok' },
        { id: 'n2', label: 'Envía a Chatwoot OK', type: 'ok' },
        { id: 'n3', label: 'POST Etiquetas', type: 'fail', detail: 'Bad gateway (Notion 502)' },
        { id: 'n4', label: 'Labels no se actualizan', type: 'impact', detail: 'Solo metadata — bajo impacto' },
      ],
      edges: [['n1','n2'],['n2','n3'],['n3','n4']],
    },
  },
  {
    id: 'C4', title: 'pdf.co sin crédito', category: 'infra', severity: 'media', status: 'activo',
    magnitude: '1 caso (conv 4594)', summary: 'Crédito agotado de pdf.co → bot no lee PDFs de clientes',
    convIds: [4594], execIds: [66963], dateDetected: '15/06 13:52',
    cause: 'Crédito agotado del servicio externo pdf.co',
    fix: 'Recargar crédito + try/catch para fallback',
    flow: {
      nodes: [
        { id: 'n1', label: 'Cliente manda PDF', type: 'ok' },
        { id: 'n2', label: 'Switch tipo=file', type: 'ok' },
        { id: 'n3', label: 'HTTP Request2 (pdf.co)', type: 'fail', detail: 'Payment required' },
        { id: 'n4', label: 'Bot no lee el PDF', type: 'impact' },
      ],
      edges: [['n1','n2'],['n2','n3'],['n3','n4']],
    },
    tracker: { steps: [
      { label: 'Recargar crédito de pdf.co', done: false },
      { label: 'Agregar try/catch + fallback', done: false },
      { label: 'Verificar con PDF de prueba', done: false },
    ]},
  },
  {
    id: 'C2', title: 'adultos=0 rompe cotizador', category: 'infra', severity: 'alta', status: 'activo',
    magnitude: '3 fallos (16 y 18/06)', summary: 'Bot llama tool sin datos → cotizador hace throw → cotización falla',
    execIds: [67922, 68518, 70921], dateDetected: '16/06 11:03',
    cause: 'Bot manda adultos=0 sin repreguntar + cotizador hace throw en vez de contrato suave',
    fix: 'Doble: bot anti-asunción + cotizador contrato suave "falta_dato"',
    quote: 'Input: { adultos: 0, ninos: 0, fecha_inicio: null, fecha_fin: null }',
    connections: ['B2'],
    flow: {
      nodes: [
        { id: 'n1', label: 'Cliente no dice cuántos son', type: 'info' },
        { id: 'n2', label: 'Agente decide llamar tool', type: 'ok', detail: 'Sin datos de PAX' },
        { id: 'n3', label: 'Manda adultos=0, ninos=0', type: 'fail', detail: 'Debería repreguntar' },
        { id: 'n4', label: 'Validar Input: throw', type: 'fail', detail: '"adultos invalido: 0 [line 9]"' },
        { id: 'n5', label: 'Cotización falla', type: 'impact', detail: 'Agente no recibe respuesta' },
      ],
      edges: [['n1','n2'],['n2','n3'],['n3','n4'],['n4','n5']],
    },
    tracker: { steps: [
      { label: 'Reforzar regla 11: no llamar tool sin adultos>0 y fechas', done: false },
      { label: 'Cotizador: cambiar throw por contrato suave', done: false },
      { label: 'Backup workflows', done: false },
      { label: 'Deploy bot + cotizador', done: false },
      { label: 'Testear con mensaje sin PAX', done: false },
      { label: 'Monitorear ejecuciones 48hs', done: false },
    ]},
  },
  {
    id: 'N8N-5', title: 'Notion Gateway Timeout', category: 'infra', severity: 'baja', status: 'cerrado',
    magnitude: '1 caso (conv 4656)', summary: 'Notion timeout al actualizar. Cliente recibió respuesta.',
    convIds: [4656], execIds: [68447], dateDetected: '16/06 13:29',
    cause: 'Notion API timeout transitorio.',
    fix: 'Sin acción — transitorio.',
    flow: {
      nodes: [
        { id: 'n1', label: 'BOT responde OK', type: 'ok' },
        { id: 'n2', label: 'Update Notion', type: 'fail', detail: 'Gateway timeout' },
        { id: 'n3', label: 'Notion no se actualiza', type: 'impact', detail: 'Bajo impacto' },
      ],
      edges: [['n1','n2'],['n2','n3']],
    },
  },
];

const promptBugs: BugEntry[] = [
  {
    id: 'B2', title: 'Alucinación de fecha / PAX', category: 'prompt', severity: 'alta', status: 'activo',
    magnitude: '~9 casos (2%)', summary: 'El modelo inventa fechas o cantidad de personas que el cliente nunca dijo',
    convIds: [4393, 4675, 4678, 4735, 4421], dateDetected: '13/06',
    cause: 'gpt-5.4-mini ante gates bloqueantes ALUCINA el dato faltante para pasar',
    fix: 'Fecha/PAX ambiguo = BLOQUEANTE absoluto, repreguntar SIEMPRE',
    quote: '[cliente] Donde están y qué servicios ofrecen → [bot] ¡Buenísimo! Son 2 adultos, del 18 al 22 de julio.',
    connections: ['C2', 'B9'],
    flow: {
      nodes: [
        { id: 'n1', label: 'Cliente pregunta sin dar fechas/PAX', type: 'info', detail: '"dónde están y qué servicios"' },
        { id: 'n2', label: 'Gate: necesita fecha+PAX para cotizar', type: 'ok' },
        { id: 'n3', label: 'Modelo INVENTA datos', type: 'fail', detail: '"2 adultos, 18-22 julio" — nunca dichos' },
        { id: 'n4', label: 'Llama tool con datos falsos', type: 'fail' },
        { id: 'n5', label: 'Cotiza con precio real pero datos errados', type: 'impact' },
        { id: 'n6', label: 'Cliente recibe cotización incorrecta', type: 'client' },
      ],
      edges: [['n1','n2'],['n2','n3'],['n3','n4'],['n4','n5'],['n5','n6']],
    },
    tracker: { steps: [
      { label: 'Reforzar regla anti-asunción como gate ABSOLUTO', done: false },
      { label: 'Agregar: "Si no tenés fecha exacta YYYY-MM-DD, REPREGUNTÁ"', done: false },
      { label: 'Agregar: "Si no tenés adultos > 0, REPREGUNTÁ"', done: false },
      { label: 'Testear con mensajes ambiguos', done: false },
      { label: 'Fan-out cualitativo post-fix (50 convs)', done: false },
    ]},
  },
  {
    id: 'B3', title: 'Cotización en frío', category: 'prompt', severity: 'media', status: 'activo',
    magnitude: '~28 casos (6%)', summary: 'Bot tira ficha de habitación sin saludar ni presentarse',
    convIds: [4780, 4783, 4379, 4404], dateDetected: '12/06',
    cause: 'Cuando el 1er mensaje trae todo, el modelo se salta ETAPA 1 (saludo+puente)',
    fix: 'Saludo + puente OBLIGATORIOS en 1er contacto, AUNQUE el cliente dé todo',
    quote: '[bot] Ingreso martes 14 de julio — 1 noche. La propuesta que mejor encaja... (sin hola)',
    connections: ['B5', 'B8'],
    flow: {
      nodes: [
        { id: 'n1', label: 'Cliente da todo de entrada', type: 'info', detail: 'Fechas + PAX en el 1er mensaje' },
        { id: 'n2', label: 'Agente interpreta: "ya tengo todo"', type: 'ok' },
        { id: 'n3', label: 'Se salta ETAPA 1 (saludo)', type: 'fail', detail: 'Sin hola, sin "soy Martina"' },
        { id: 'n4', label: 'Va directo a la ficha de precio', type: 'fail' },
        { id: 'n5', label: 'Cliente: primera impresión fría', type: 'client' },
      ],
      edges: [['n1','n2'],['n2','n3'],['n3','n4'],['n4','n5']],
    },
    tracker: { steps: [
      { label: 'Agregar: saludo + puente OBLIGATORIO en 1er contacto', done: false },
      { label: 'Frasear: "Hola, soy Martina! Ya te armo la cotización..."', done: false },
      { label: 'Testear con mensaje que trae todo', done: false },
      { label: 'Medir % cotización en frío post-fix', done: false },
    ]},
  },
  {
    id: 'B5', title: 'Tono robótico / formulario', category: 'prompt', severity: 'media', status: 'activo',
    magnitude: '~48 casos (10%)', summary: 'Bot copia verbatim template de "solicitud de datos" sin adaptar',
    dateDetected: '14/06',
    cause: 'Prompt tiene bloque rígido que el modelo copia sin personalizar ni leer género',
    fix: 'Variar copy + acusar recibo del contexto + leer género',
    quote: '[bot] Para poder continuar con tu cotización te solicitamos los siguientes datos: 📌 Fecha de ingreso...',
    connections: ['B3', 'B8'],
    flow: {
      nodes: [
        { id: 'n1', label: 'Bot necesita datos del cliente', type: 'ok' },
        { id: 'n2', label: 'Lee template fijo del prompt', type: 'ok' },
        { id: 'n3', label: 'Copia VERBATIM sin adaptar', type: 'fail', detail: '"te solicitamos los siguientes datos: 📌..."' },
        { id: 'n4', label: 'Suena a formulario, no a persona', type: 'client' },
      ],
      edges: [['n1','n2'],['n2','n3'],['n3','n4']],
    },
    tracker: { steps: [
      { label: 'Reemplazar template por instrucción de INTENCIÓN', done: false },
      { label: 'Agregar: "preguntá de forma NATURAL, no como formulario"', done: false },
      { label: 'Agregar: leer género del nombre/pronombres', done: false },
      { label: 'Medir humanidad post-fix (fan-out 50 convs)', done: false },
    ]},
  },
  {
    id: 'B6', title: 'Loop verbatim (sin disponibilidad)', category: 'prompt', severity: 'media', status: 'activo',
    magnitude: '~21 casos (4,5%)', summary: 'Repite el MISMO bloque ante reformulaciones sin ofrecer alternativas',
    convIds: [4762, 4389, 4445, 4461, 4727], dateDetected: '14/06',
    cause: 'No hay instrucción de variar + no expone alternativas del cotizador + sin gate de derivación',
    fix: 'Variar fraseo + exponer alternativas[] + derivar tras 2 negativas',
    quote: '[bot] No tengo disponibilidad completa. ¿Tenés flexibilidad? (×3 idéntico)',
    flow: {
      nodes: [
        { id: 'n1', label: 'Cotizador: sin disponibilidad', type: 'ok', detail: 'Pero devuelve alternativas[]' },
        { id: 'n2', label: 'Mapeo IGNORA alternativas', type: 'fail', detail: 'E4 — alternativas descartadas' },
        { id: 'n3', label: 'Bot dice "sin dispo, ¿flexibilidad?"', type: 'ok' },
        { id: 'n4', label: 'Cliente reformula', type: 'info' },
        { id: 'n5', label: 'Bot REPITE textualmente', type: 'fail', detail: 'Sin variar ni derivar' },
        { id: 'n6', label: 'Cliente atrapado en loop', type: 'client' },
      ],
      edges: [['n1','n2'],['n2','n3'],['n3','n4'],['n4','n5'],['n5','n6']],
    },
    tracker: { steps: [
      { label: 'Decisión de Pao: ¿exponer alternativas de fechas?', done: false },
      { label: 'Exponer alternativas[] en Mapear Contrato Agente', done: false },
      { label: 'Agregar gate: "si ya lo dijiste 2 veces, derivar"', done: false },
      { label: 'Instrucción: "NUNCA repetir bloque verbatim"', done: false },
      { label: 'Testear con consulta sin disponibilidad', done: false },
    ]},
  },
  {
    id: 'B8', title: 'Re-saludo (presentación 2×)', category: 'prompt', severity: 'baja', status: 'activo',
    magnitude: '~9 casos (2%)', summary: 'Bot manda presentación completa DE NUEVO cuando cliente reescribe',
    convIds: [4453, 4526, 4606, 4741], dateDetected: '14/06',
    cause: 'Gate "ya hubo intercambio" no es suficientemente fuerte en el prompt',
    fix: 'Gate explícito: "si ya respondí, NO re-presentarme"',
    connections: ['B3', 'B5'],
    flow: {
      nodes: [
        { id: 'n1', label: 'Bot responde (ya se presentó)', type: 'ok' },
        { id: 'n2', label: 'Cliente reescribe ~3 min después', type: 'info' },
        { id: 'n3', label: 'Bot vuelve a presentarse', type: 'fail', detail: 'Presentación completa 2×' },
        { id: 'n4', label: 'Cliente: "parece que no me escuchó"', type: 'client' },
      ],
      edges: [['n1','n2'],['n2','n3'],['n3','n4']],
    },
    tracker: { steps: [
      { label: 'Gate: "si ya hubo intercambio, NO re-presentarme"', done: false },
      { label: 'Checklist 9 en prompt', done: false },
      { label: 'Testear con re-escritura a los 3 min', done: false },
    ]},
  },
  {
    id: 'B9', title: 'Parsing de fecha roto', category: 'prompt', severity: 'baja', status: 'activo',
    magnitude: '~4 casos (1%)', summary: 'El modelo no resuelve fechas vagas/relativas',
    convIds: [4537, 4510], dateDetected: '14/06',
    cause: 'El modelo no resuelve "este finde", "la semana que viene" → manda "07-xx" a la tool',
    fix: 'Regla de clarificación más fuerte + considerar parser externo',
    quote: 'Tool recibió fecha_inicio: "2026-07-xx" — literal con "xx"',
    connections: ['B2'],
    flow: {
      nodes: [
        { id: 'n1', label: 'Cliente dice fecha vaga', type: 'info', detail: '"este finde", "dos noches"' },
        { id: 'n2', label: 'Modelo intenta resolver', type: 'ok' },
        { id: 'n3', label: 'Manda fecha inválida a tool', type: 'fail', detail: '"2026-07-xx"' },
        { id: 'n4', label: 'Cotización errada o fallida', type: 'impact' },
      ],
      edges: [['n1','n2'],['n2','n3'],['n3','n4']],
    },
    tracker: { steps: [
      { label: 'Regla: "Si la fecha no es YYYY-MM-DD concreta, REPREGUNTÁ"', done: false },
      { label: 'Evaluar parser externo de fechas relativas', done: false },
      { label: 'Testear con "este finde" / "la semana que viene"', done: false },
    ]},
  },
];

const pipelineBugs: BugEntry[] = [
  {
    id: 'B1', title: 'Doble disparo del acumulador', category: 'pipeline', severity: 'media', status: 'activo',
    magnitude: '~18 bloques duplicados en ~8 convs', summary: '2 ejecuciones del agente sobre el mismo input → respuesta idéntica ×2',
    convIds: [4421, 4376, 4413, 4741], execIds: [62975, 62984, 62063, 62070], dateDetected: '14/06',
    cause: 'Wait 35s + debounce no previene 2 ejecuciones si timing cae entre 35s y ~70s',
    fix: 'Dedup por hash de output antes de enviar, o ventana de exclusión en Redis',
    connections: ['B8'],
    flow: {
      nodes: [
        { id: 'n1', label: 'Cliente manda 2-3 msgs rápido', type: 'info' },
        { id: 'n2', label: 'ACUMULADOR: Redis PUSH', type: 'ok' },
        { id: 'n3', label: 'Wait 35s + debounce', type: 'ok' },
        { id: 'n4', label: 'Timing gap: 2 execs pasan', type: 'fail', detail: 'Exec A y Exec B procesan el mismo batch' },
        { id: 'n5', label: 'BOT MARTINA corre 2 veces', type: 'fail' },
        { id: 'n6', label: 'Misma respuesta ×2 al cliente', type: 'client', detail: 'Parece bot roto' },
      ],
      edges: [['n1','n2'],['n2','n3'],['n3','n4'],['n4','n5'],['n5','n6']],
    },
    tracker: { steps: [
      { label: 'Elegir: hash dedup o ventana de exclusión Redis', done: false },
      { label: 'Implementar en Code1 o pre-envío', done: false },
      { label: 'Backup del acumulador', done: false },
      { label: 'Deploy + monitorear 48hs', done: false },
    ]},
  },
  {
    id: 'B4', title: 'Eco / loopback', category: 'pipeline', severity: 'baja', status: 'activo',
    magnitude: '1 caso (conv 4387)', summary: 'Bot copió palabra por palabra el mensaje del cliente',
    convIds: [4387], dateDetected: '13/06',
    cause: 'Posible confusión output/input en el nodo del agente',
    fix: 'Guard en Code1 + derivar vouchers',
    quote: '[cliente] Quiero info para regalar un voucher... → [bot] Quiero info para regalar un voucher...',
    flow: {
      nodes: [
        { id: 'n1', label: 'Cliente pide info voucher', type: 'info' },
        { id: 'n2', label: 'Agente procesa', type: 'ok' },
        { id: 'n3', label: 'Output = Input (copia textual)', type: 'fail' },
        { id: 'n4', label: 'No derivó (voucher debía derivar)', type: 'impact' },
        { id: 'n5', label: 'Lead de voucher perdido', type: 'client' },
      ],
      edges: [['n1','n2'],['n2','n3'],['n3','n4'],['n4','n5']],
    },
  },
];

const cotizadorBugs: BugEntry[] = [
  {
    id: 'B10', title: 'Loft julio $1,27M/noche', category: 'cotizador', severity: 'critica', status: 'cerrado',
    magnitude: '2+ convs (4462, 4469)', summary: 'Rate corrupto de Venice → precio disparatado del Loft en julio',
    convIds: [4462, 4469], dateDetected: '14/06', dateFixed: '~17/06',
    cause: 'Venice PMS cargó rate corrupto. "Toma-mínimo" lo elegía.',
    fix: 'Se resolvió solo (Venice corrigió). Protección accidental.',
    verification: 'Verificado 18/06: Loft julio = $211k/noche ✅ sano',
    flow: {
      nodes: [
        { id: 'n1', label: 'Cliente pide Loft julio', type: 'info' },
        { id: 'n2', label: 'Cotizador consulta Venice', type: 'ok' },
        { id: 'n3', label: 'Venice devuelve rate corrupto', type: 'fail', detail: '$1,27M/noche (8× normal)' },
        { id: 'n4', label: 'Toma-mínimo elige rate corrupto', type: 'fail' },
        { id: 'n5', label: 'Bot muestra precio roto al cliente', type: 'client' },
        { id: 'n6', label: 'Venice corrige rate', type: 'fix', detail: 'Protección accidental' },
        { id: 'n7', label: 'Verificado: $211k/noche sano', type: 'ok' },
      ],
      edges: [['n1','n2'],['n2','n3'],['n3','n4'],['n4','n5'],['n3','n6'],['n6','n7']],
    },
  },
  {
    id: 'C1', title: 'Promo Family x3 al Loft', category: 'cotizador', severity: 'alta', status: 'activo',
    magnitude: '2 convs con sobreprecio ~$265k', summary: 'Promo Family aplica al Loft (debería ser solo Master)',
    dateDetected: '17/06',
    cause: 'Columna habitaciones NULL en Supabase → matchea todas las habitaciones',
    fix: 'Cargar "9" (roomTypeId Master) en la promo. Fix de DATO.',
    flow: {
      nodes: [
        { id: 'n1', label: 'Consulta Loft julio con familia', type: 'info' },
        { id: 'n2', label: 'Cotizador consulta promos (Supabase)', type: 'ok' },
        { id: 'n3', label: 'Family x3: habitaciones = NULL', type: 'fail', detail: 'NULL = aplica a TODAS' },
        { id: 'n4', label: 'Aplica promo al Loft (+$265k)', type: 'fail' },
        { id: 'n5', label: 'Loft sale sobrepreciado', type: 'client' },
      ],
      edges: [['n1','n2'],['n2','n3'],['n3','n4'],['n4','n5']],
    },
    tracker: { steps: [
      { label: 'Verificar: GET promos?nombre=eq.Family x3', done: false },
      { label: 'Cargar habitaciones="9" en la promo', done: false },
      { label: 'Verificar cotización Loft julio post-fix', done: false },
    ]},
  },
  {
    id: 'C3', title: 'Prefijo anti-leak ausente en backup', category: 'cotizador', severity: 'media', status: 'activo',
    magnitude: 'Riesgo latente', summary: 'Si se restaura backup, la capa anti-leak se pierde',
    dateDetected: '17/06',
    cause: 'Backup tomado ANTES del fix de RC-4. No tiene prefijo [INSTRUCCIÓN INTERNA].',
    fix: 'Sincronizar backup con producción.',
    connections: ['RC-4'],
    flow: {
      nodes: [
        { id: 'n1', label: 'Backup del cotizador (pre-fix)', type: 'info' },
        { id: 'n2', label: 'No tiene prefijo anti-leak', type: 'fail' },
        { id: 'n3', label: 'Si se restaura → riesgo de leak', type: 'impact' },
        { id: 'n4', label: 'Quedan capas 2 y 3 como respaldo', type: 'pending', detail: 'Regla 7 + guard regex' },
      ],
      edges: [['n1','n2'],['n2','n3'],['n2','n4']],
    },
  },
];

const contenidoBugs: BugEntry[] = [
  {
    id: 'RC-1', title: 'Bot ciego a replies/quotes', category: 'contenido', severity: 'alta', status: 'resuelto',
    magnitude: 'Varios clientes (Pablo, Nerea)', summary: 'No leía mensajes citados de WhatsApp',
    dateDetected: '12/06', dateFixed: '12/06',
    cause: 'Acumulador descartaba content_attributes.in_reply_to',
    fix: 'variables1 captura inReplyTo + Dedup batch resuelve la cita vía GET',
    verification: '0 recurrencias en 6 días',
    flow: {
      nodes: [
        { id: 'n1', label: 'Cliente cita mensaje viejo', type: 'info' },
        { id: 'n2', label: 'Chatwoot manda in_reply_to', type: 'ok' },
        { id: 'n3', label: 'Acumulador descartaba el campo', type: 'fail' },
        { id: 'n4', label: 'Bot responde sin contexto', type: 'client' },
        { id: 'n5', label: 'Fix: captura + resuelve cita', type: 'fix' },
        { id: 'n6', label: '0 recurrencias', type: 'ok' },
      ],
      edges: [['n1','n2'],['n2','n3'],['n3','n4'],['n3','n5'],['n5','n6']],
    },
  },
  {
    id: 'RC-2', title: '"El spa se paga" (info FALSA)', category: 'contenido', severity: 'critica', status: 'resuelto',
    magnitude: 'Primeros días', summary: 'Bot decía que circuito hídrico se pagaba aparte — es GRATIS',
    dateDetected: '12/06', dateFixed: '12/06',
    cause: 'KB incorrecta en el prompt',
    fix: 'KB corregida: circuito hídrico INCLUIDO, masajes/flotación SE PAGAN',
    verification: '0 recurrencias',
    flow: {
      nodes: [
        { id: 'n1', label: 'Cliente pregunta por spa', type: 'info' },
        { id: 'n2', label: 'Prompt dice "se abona"', type: 'fail', detail: 'Info FALSA' },
        { id: 'n3', label: 'Bot: "se paga aparte"', type: 'client' },
        { id: 'n4', label: 'Fix: KB corregida', type: 'fix' },
      ],
      edges: [['n1','n2'],['n2','n3'],['n2','n4']],
    },
  },
  {
    id: 'RC-3', title: 'Check-out "11hs" (es 10)', category: 'contenido', severity: 'alta', status: 'resuelto',
    magnitude: 'Primeros días', summary: 'Bot inventó horario de check-out',
    dateDetected: '12/06', dateFixed: '12/06',
    cause: 'Prompt no tenía datos operativos → modelo inventó',
    fix: 'Bloque DATOS OPERATIVOS + anti-invención',
    verification: '0 recurrencias',
    flow: {
      nodes: [
        { id: 'n1', label: 'Cliente pregunta check-out', type: 'info' },
        { id: 'n2', label: 'Prompt: sin datos operativos', type: 'fail' },
        { id: 'n3', label: 'Modelo inventa "11hs"', type: 'fail' },
        { id: 'n4', label: 'Fix: check-in 15, check-out 10', type: 'fix' },
      ],
      edges: [['n1','n2'],['n2','n3'],['n2','n4']],
    },
  },
  {
    id: 'RC-4', title: 'LEAK: filtró instrucción interna', category: 'contenido', severity: 'critica', status: 'resuelto',
    magnitude: '1 conv (4341, Débora)', summary: 'Bot mandó guía interna "COTIZÁ ASÍ:..." al cliente',
    convIds: [4341], dateDetected: '12/06', dateFixed: '12/06',
    cause: 'gpt-5.4-mini copió textualmente la instruccion_agente del cotizador',
    fix: '3 capas: regla 7 + prefijo [INSTRUCCIÓN INTERNA] + guard regex Code1',
    verification: '0 leaks en 6 días post-fix',
    connections: ['C3'],
    flow: {
      nodes: [
        { id: 'n1', label: 'Cotizador genera instruccion_agente', type: 'ok' },
        { id: 'n2', label: 'Sin prefijo anti-leak', type: 'fail' },
        { id: 'n3', label: 'Modelo COPIA textual', type: 'fail' },
        { id: 'n4', label: 'Débora recibe guía interna', type: 'client', detail: 'LEAK CRÍTICO' },
        { id: 'n5', label: 'Fix: 3 capas de protección', type: 'fix', detail: 'Regla + prefijo + guard' },
        { id: 'n6', label: '0 leaks en 6 días', type: 'ok' },
      ],
      edges: [['n1','n2'],['n2','n3'],['n3','n4'],['n3','n5'],['n5','n6']],
    },
  },
  {
    id: 'RC-5', title: 'Cotización en frío (parcial)', category: 'contenido', severity: 'media', status: 'resuelto',
    magnitude: 'Primeros días', summary: 'Saludo obligatorio agregado — evolución como B3',
    dateDetected: '12/06', dateFixed: '12/06',
    cause: 'Excepción ETAPA 1 sin rama "no falta nada"',
    fix: 'Saludo + puente obligatorios en primer turno',
    verification: 'Mejoró pero B3 sigue (~28 casos)',
    connections: ['B3'],
    flow: {
      nodes: [
        { id: 'n1', label: 'Fix: saludo obligatorio', type: 'fix' },
        { id: 'n2', label: 'Mejoró pero no eliminó', type: 'pending', detail: 'Evoluciona como B3' },
      ],
      edges: [['n1','n2']],
    },
  },
  {
    id: 'RC-6', title: 'Confundió hidro Master vs Loft', category: 'contenido', severity: 'media', status: 'resuelto',
    magnitude: 'Primeros días', summary: 'Decía que Loft tiene hidromasaje en habitación',
    dateDetected: '12/06', dateFixed: '12/06',
    cause: 'Faltaba contraste claro en prompt',
    fix: 'Bloque DIFERENCIAS CLAVE',
    verification: '0 recurrencias',
    flow: {
      nodes: [
        { id: 'n1', label: 'Prompt sin contraste', type: 'fail' },
        { id: 'n2', label: 'Fix: Master=hidro, Loft=sin hidro', type: 'fix' },
        { id: 'n3', label: '0 recurrencias', type: 'ok' },
      ],
      edges: [['n1','n2'],['n2','n3']],
    },
  },
  {
    id: 'E1', title: '\\n literal visible', category: 'contenido', severity: 'media', status: 'resuelto',
    magnitude: '3 msgs de 652 (0,5%)', summary: 'Cliente veía \\n como texto en vez de saltos de línea',
    convIds: [4351], dateDetected: '13/06', dateFixed: '13/06 09:41',
    cause: 'Code1 v1 no normalizaba backslash+n literales',
    fix: 'Code1 v2 normaliza \\n/\\r\\n literales → saltos reales',
    verification: '0 casos en 5 días post-fix',
    flow: {
      nodes: [
        { id: 'n1', label: 'Modelo genera \\n literal', type: 'fail' },
        { id: 'n2', label: 'Code1 v1 no lo detecta', type: 'fail' },
        { id: 'n3', label: 'Cliente ve "\\n" como texto', type: 'client' },
        { id: 'n4', label: 'Fix: Code1 v2 normaliza', type: 'fix' },
        { id: 'n5', label: '0 en 5 días', type: 'ok' },
      ],
      edges: [['n1','n2'],['n2','n3'],['n2','n4'],['n4','n5']],
    },
  },
];

const v6Bugs: BugEntry[] = [
  { id: 'V6-1', title: 'Precios contradictorios', category: 'v6', severity: 'critica', status: 'resuelto', magnitude: 'Sistemático', summary: 'Code1 inyectaba promos por keywords con flag roto', dateDetected: 'pre-11/06', dateFixed: '11/06', cause: 'Code1 viejo + dataTable promos + flag anti-dup roto', fix: 'Code1 splitter simple. Promos solo del cotizador.', flow: { nodes: [{ id: 'n1', label: 'Code1 viejo con keywords', type: 'fail' }, { id: 'n2', label: 'Fix: splitter simple', type: 'fix' }], edges: [['n1','n2']] } },
  { id: 'V6-2', title: 'Prompt gigante (50k chars)', category: 'v6', severity: 'alta', status: 'resuelto', magnitude: 'Sistemático', summary: 'V6 + parche con variables undefined', dateDetected: 'pre-11/06', dateFixed: '11/06', cause: 'Prompt V6 con {{ vars }} que no existían', fix: 'Prompt V8 limpio (de 50k a ~8k chars)', flow: { nodes: [{ id: 'n1', label: 'Prompt 50k + vars rotas', type: 'fail' }, { id: 'n2', label: 'Prompt V8 limpio', type: 'fix' }], edges: [['n1','n2']] } },
  { id: 'V6-3', title: 'Tool apuntaba a cotizador viejo', category: 'v6', severity: 'alta', status: 'resuelto', magnitude: 'Sistemático', summary: 'DISPO V1 sin precios reales', dateDetected: 'pre-11/06', dateFixed: '11/06', cause: 'Tool → DISPO V1', fix: 'Tool → COTIZACION AYRES v2 (contrato v4)', flow: { nodes: [{ id: 'n1', label: 'DISPO V1 (viejo)', type: 'fail' }, { id: 'n2', label: 'COTIZADOR v2 (real)', type: 'fix' }], edges: [['n1','n2']] } },
  { id: 'V6-4', title: 'Fallback fantasma', category: 'v6', severity: 'media', status: 'resuelto', magnitude: 'Sistemático', summary: 'El fallback era el MISMO nodo de modelo', dateDetected: 'pre-11/06', dateFixed: '11/06', cause: 'Fallback = principal', fix: 'Nodo nuevo gpt-4.1-mini real', flow: { nodes: [{ id: 'n1', label: 'Fallback = principal', type: 'fail' }, { id: 'n2', label: 'gpt-4.1-mini real', type: 'fix' }], edges: [['n1','n2']] } },
  { id: 'V6-5', title: 'Mensajes duplicados al bot', category: 'v6', severity: 'alta', status: 'resuelto', magnitude: 'Frecuente', summary: 'If3 con \\n\\n que nunca matcheaba', dateDetected: 'pre-11/06', dateFixed: '11/06', cause: 'AMBAS ramas procesaban', fix: 'If3 limpio + NoOp', flow: { nodes: [{ id: 'n1', label: 'If3 roto → ambas ramas', type: 'fail' }, { id: 'n2', label: 'If3 limpio + NoOp', type: 'fix' }], edges: [['n1','n2']] } },
  { id: 'V6-6', title: 'Mensajes viejos arrastrados', category: 'v6', severity: 'alta', status: 'resuelto', magnitude: 'Frecuente', summary: 'Redis DELETE con key distinta al PUSH', dateDetected: 'pre-11/06', dateFixed: '11/06', cause: 'Key DELETE ≠ key PUSH → lista nunca se borraba', fix: 'Misma key + Dedup batch', flow: { nodes: [{ id: 'n1', label: 'Redis keys distintas', type: 'fail' }, { id: 'n2', label: 'Misma key + dedup', type: 'fix' }], edges: [['n1','n2']] } },
  { id: 'V6-7', title: 'Ecos del bot re-entraban', category: 'v6', severity: 'media', status: 'resuelto', magnitude: 'Frecuente', summary: 'Filter solo excluía outgoing', dateDetected: 'pre-11/06', dateFixed: '11/06', cause: 'Pasaban updated/activity/notas', fix: 'Filter: message_created + incoming + no privados + frescura <10min', flow: { nodes: [{ id: 'n1', label: 'Filter insuficiente', type: 'fail' }, { id: 'n2', label: 'Filter 5 condiciones', type: 'fix' }], edges: [['n1','n2']] } },
  { id: 'V6-8', title: 'Labels no frenaban el bot', category: 'v6', severity: 'alta', status: 'resuelto', magnitude: 'Frecuente', summary: 'Solo miraba labels[0] != bot_apagado', dateDetected: 'pre-11/06', dateFixed: '11/06', cause: 'Si primer label era otro, pasaba', fix: 'JOIN lowercase + notContains ×3', flow: { nodes: [{ id: 'n1', label: 'Solo labels[0]', type: 'fail' }, { id: 'n2', label: 'JOIN lowercase ×3', type: 'fix' }], edges: [['n1','n2']] } },
  { id: 'V6-9', title: 'STATUS apagaba de más', category: 'v6', severity: 'media', status: 'resuelto', magnitude: 'Frecuente', summary: 'Derivaba con score 5+ y dudas', dateDetected: 'pre-11/06', dateFixed: '11/06', cause: 'Umbral muy bajo', fix: 'STATUS V8: 6+, Martina responde dudas', flow: { nodes: [{ id: 'n1', label: 'Umbral 5+', type: 'fail' }, { id: 'n2', label: 'Umbral 6+ + dudas OK', type: 'fix' }], edges: [['n1','n2']] } },
];

const falsosBugs: BugEntry[] = [
  { id: 'FP-1', title: '"Falsa disponibilidad" (Hernán)', category: 'falsos', severity: 'baja', status: 'resuelto', magnitude: 'Investigado', summary: 'NO era bug — el finde se vendió de verdad entre consultas', dateDetected: '12/06', dateFixed: '13/06', cause: 'El finde se vendió entre 02:00 y 20:05', fix: 'Caso cerrado — operativo (no cotizar a mano sin chequear)', flow: { nodes: [{ id: 'n1', label: 'Bot cotizó con dispo (02:00)', type: 'ok' }, { id: 'n2', label: 'Finde se VENDIÓ', type: 'info' }, { id: 'n3', label: 'Hernán consulta (20:05)', type: 'info' }, { id: 'n4', label: 'Humano: "ya reservado"', type: 'ok' }], edges: [['n1','n2'],['n2','n3'],['n3','n4']] } },
  { id: 'FP-2', title: '"4 PAX en Master" (4416)', category: 'falsos', severity: 'baja', status: 'resuelto', magnitude: 'Investigado', summary: '2+2<13 = Master admite 4. Bot hizo BIEN.', dateDetected: '14/06', dateFixed: '14/06', cause: 'Auditor no conocía capacidad real', fix: 'FALSO POSITIVO', flow: { nodes: [{ id: 'n1', label: '2 adultos + 2 niños <13', type: 'info' }, { id: 'n2', label: 'Master admite hasta 4', type: 'ok' }, { id: 'n3', label: 'Bot hizo BIEN', type: 'ok' }], edges: [['n1','n2'],['n2','n3']] } },
  { id: 'FP-3', title: '"84% de \\n" (medición)', category: 'falsos', severity: 'baja', status: 'resuelto', magnitude: 'Error de medición', summary: 'Era 0,5% — la medición contaba eventos Chatwoot + repr()', dateDetected: '13/06', dateFixed: '13/06', cause: 'repr() convierte saltos reales en \\n + contaba eventos internos', fix: 'Metodología corregida: caracteres exactos, excluir eventos', flow: { nodes: [{ id: 'n1', label: 'Medición con repr()', type: 'fail', detail: 'Contaba saltos reales como literales' }, { id: 'n2', label: '"84%" — FALSO', type: 'fail' }, { id: 'n3', label: 'Medición correcta: 0,5%', type: 'fix' }], edges: [['n1','n2'],['n1','n3']] } },
];

export const CATEGORIES: BugCategory[] = [
  {
    id: 'infra', label: 'Infraestructura', icon: 'server', color: '#EF4444',
    description: 'Fallos de n8n: ejecuciones rotas, servicios externos, validación',
    bugs: infraBugs,
  },
  {
    id: 'prompt', label: 'Prompt / Modelo', icon: 'brain', color: '#F59E0B',
    description: 'Comportamiento del agente gpt-5.4-mini: alucinaciones, tono, loops',
    bugs: promptBugs,
  },
  {
    id: 'pipeline', label: 'Pipeline', icon: 'workflow', color: '#8B5CF6',
    description: 'Acumulador, Code1, nodos de orquestación',
    bugs: pipelineBugs,
  },
  {
    id: 'cotizador', label: 'Cotizador', icon: 'calculator', color: '#3B82F6',
    description: 'Precios, promos, validación, rates de Venice',
    bugs: cotizadorBugs,
  },
  {
    id: 'contenido', label: 'Contenido / KB', icon: 'file-text', color: '#10B981',
    description: 'Info mal cargada, formato, seguridad (RC-1..8, E1, E2)',
    bugs: contenidoBugs,
  },
  {
    id: 'v6', label: 'Resueltos V6→V8', icon: 'check-circle', color: '#6B7280',
    description: 'Los 9 bugs estructurales que murieron con la migración',
    bugs: v6Bugs,
  },
  {
    id: 'falsos', label: 'Falsos positivos', icon: 'x-circle', color: '#94A3B8',
    description: 'Casos investigados y descartados — NO eran bugs',
    bugs: falsosBugs,
  },
];

export const ALL_BUGS = CATEGORIES.flatMap(c => c.bugs);
export const findBug = (id: string) => ALL_BUGS.find(b => b.id === id);
export const findCategory = (id: string) => CATEGORIES.find(c => c.id === id);

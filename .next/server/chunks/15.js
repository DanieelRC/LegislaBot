"use strict";exports.id=15,exports.ids=[15],exports.modules={75015:(e,a,r)=>{r.d(a,{S:()=>g});var t=r(24330);r(60166);var o=r(52241),n=r(57725),i=r(44343),s=r(56052),c=r(9487),l=r(49033),d=r(40618);async function u({apiName:e,tokensUsed:a,costEstimate:r=0,requestType:t}){try{await c.db.insert(l.bB).values({api_name:e,tokens_used:a,cost_estimate:r.toString(),request_type:t}),console.log(`API Usage logged: ${e}, Tokens: ${a}, Type: ${t}`)}catch(e){console.error("Error logging API usage:",e)}}function x(){let e=new Date;return{formatted:new Intl.DateTimeFormat("es-MX",{day:"numeric",month:"long",year:"numeric"}).format(e),year:e.getFullYear()}}function f(){if(!process.env.GOOGLE_GENERATIVE_AI_API_KEY)throw Error("La API key de Google (GOOGLE_GENERATIVE_AI_API_KEY) no est\xe1 definida en las variables de entorno");if(!process.env.OPENAI_API_KEY)throw Error("La API key de OpenAI (OPENAI_API_KEY) no est\xe1 definida en las variables de entorno")}async function p(e,a){try{f();let{formatted:r,year:t}=x(),n=await (0,o._4)({model:(0,i.l)("gemini-2.5-flash"),prompt:`Hoy es ${r}. Realiza una investigaci\xf3n exhaustiva sobre "${e}" en el contexto jur\xeddico mexicano, especialmente aplicable a la Ciudad de M\xe9xico (Por ning\xfan motivo inventes informaci\xf3n). Identifica:
- Legislaci\xf3n vigente (federal y local) relacionada
- Iniciativas previas sobre el tema (si existen)
- Estudios acad\xe9micos recientes (a partir de 2020 hasta ${t})
- Regulaciones internacionales destacadas sobre este tema
- Principales problemas jur\xeddicos o vac\xedos legales que justifican esta iniciativa
- T\xe9rminos t\xe9cnicos clave que deben ser definidos legalmente (m\xednimo 30 conceptos)

Organiza tu respuesta claramente en secciones tituladas y formatea la respuesta como una lista con las siguientes categor\xedas:
- T\xedtulo de la fuente
- Tipo (ley, iniciativa, estudio acad\xe9mico, regulaci\xf3n internacional)
- Breve resumen
- Relevancia espec\xedfica para fundamentar un proyecto de ley sobre ${e} en la Ciudad de M\xe9xico, periodo ${t}-${t+5}
- T\xe9rminos t\xe9cnicos identificados que requieren definici\xf3n legal`,temperature:.3,maxTokens:a.maxTokensPerRequest??8192});return a.enableApiUsageTracking&&await u({apiName:"google/gemini-1.5-flash",tokensUsed:n.usage.totalTokens,requestType:"research"}),n.text}catch(e){throw console.error("Error en la investigaci\xf3n con Gemini:",e),Error(`Error al realizar la investigaci\xf3n previa: ${e instanceof Error?e.message:String(e)}`)}}async function m(e,a,r){try{f();let{formatted:t,year:i}=x(),s=r.defaultLegislator||"A QUIEN CORRESPONDA",c=await (0,o._4)({model:(0,n.f)("gpt-4o"),system:`Eres un asistente legal especializado en la redacci\xf3n de proyectos de ley para la Ciudad de M\xe9xico.
      Debes generar un proyecto de ley COMPLETO, EXTREMADAMENTE DETALLADO Y T\xc9CNICO con la siguiente estructura:
      1. T\xcdTULO DEL PROYECTO DE LEY - Redactado formalmente
      2. EXPOSICI\xd3N DE MOTIVOS (considerandos) - M\xednimo 1500 palabras, con fundamentaci\xf3n jur\xeddica profunda
      3. ARTICULADO - Con estructura jer\xe1rquica (T\xedtulos, Cap\xedtulos, Secciones) y numeraci\xf3n legal adecuada
         - Incluir CAP\xcdTULO DE DEFINICIONES con al menos 30 t\xe9rminos t\xe9cnicos definidos con precisi\xf3n jur\xeddica
         - Desarrollar m\xednimo 50 art\xedculos cubriendo todos los aspectos regulatorios
         - Considerar casos l\xedmite, excepciones y mecanismos de actualizaci\xf3n
      4. DISPOSICIONES TRANSITORIAS - Detalladas y con plazos espec\xedficos
      5. FIRMA - Solo incluye "Ciudad de M\xe9xico, [fecha]" y el nombre del legislador
      6. REFERENCIAS - Completas y verificables con formato APA 7ma edici\xf3n
      
      El proyecto debe ser t\xe9cnicamente s\xf3lido, jur\xeddicamente viable y seguir el formato oficial de los proyectos de ley en M\xe9xico.
      Redacta con lenguaje t\xe9cnico-jur\xeddico formal, sin referencias partidistas. Prioriza exhaustividad y profundidad.`,prompt:`Hoy es ${t}. Eres un experto en derecho constitucional mexicano y regulaci\xf3n tecnol\xf3gica. Con base en la siguiente investigaci\xf3n (NO INVENTES INFORMACI\xd3N):
${e}

Redacta un proyecto de decreto EXTREMADAMENTE DETALLADO que expida una nueva ley para la Ciudad de M\xe9xico sobre ${a}. El texto debe apegarse estrictamente a las normas de t\xe9cnica legislativa mexicana.

ESTRUCTURA OBLIGATORIA:

T\xcdTULO DE LA INICIATIVA
[Redacta un t\xedtulo formal para la ley]

EXPOSICI\xd3N DE MOTIVOS (Redactalo en formato de considerandos y no separes en p\xe1rrafos con t\xedtulos en esta parte, los considerandos son de dos tipos: (i) f\xe1cticos, donde se se\xf1alan los hechos que justifican la resoluci\xf3n; y (ii) normativos, que contienen referencia a normas preexistentes, las cuales sustentan la emisi\xf3n de la nueva norma. Es costumbre que los considerandos normativos empiecen citando la existencia de una norma para luego transcribir lo que ella dice. Siguen una estructura como esta: referencia a una norma – cita textual de la Norma. No utilices siempre la palabra considerando, var\xeda con "CONSIDERANDO", "CONSIDERA", etc. En minusculas): 
- Fundamenta con profundidad (m\xednimo 1500 palabras) usando:
  * 5 tratados internacionales relevantes
  * 3 jurisprudencias locales aplicables
  * 2 estudios t\xe9cnicos actualizados
- Analiza vac\xedos legales identificados con casos concretos
- Explica c\xf3mo cada art\xedculo resuelve problemas espec\xedficos
- Justifica la alineaci\xf3n con principios constitucionales

ARTICULADO
Sigue esta estructura jer\xe1rquica:
T\xcdTULO PRIMERO: DISPOSICIONES GENERALES
  Cap\xedtulo I - Objeto, \xe1mbito de aplicaci\xf3n y principios rectores
  Cap\xedtulo II - DEFINICIONES (m\xednimo 30 t\xe9rminos t\xe9cnicos definidos con precisi\xf3n jur\xeddica)
  
T\xcdTULO SEGUNDO: DERECHOS Y OBLIGACIONES
  Cap\xedtulo I - Derechos de los titulares
  Cap\xedtulo II - Obligaciones de los responsables
  
T\xcdTULO TERCERO: GOBERNANZA Y SUPERVISI\xd3N
  Cap\xedtulo I - \xd3rganos de supervisi\xf3n
  Cap\xedtulo II - Mecanismos de control
  
T\xcdTULO CUARTO: SEGURIDAD Y PROTECCI\xd3N DE DATOS
  Cap\xedtulo I - Medidas t\xe9cnicas
  Cap\xedtulo II - Protocolos de seguridad
  
T\xcdTULO QUINTO: R\xc9GIMEN SANCIONADOR
  Cap\xedtulo I - Infracciones
  Cap\xedtulo II - Sanciones
  
(Contin\xfaa con t\xedtulos necesarios para cubrir TODOS los aspectos del tema)

Cada art\xedculo debe:
- Ser claro, preciso y aut\xf3nomo
- Contemplar excepciones y casos l\xedmite
- Incluir referencias cruzadas cuando sea necesario
- Especificar plazos y procedimientos concretos

DISPOSICIONES TRANSITORIAS
- Establece plazos realistas para implementaci\xf3n
- Detalla fases de adaptaci\xf3n
- Especifica obligaciones de transici\xf3n
Ciudad de M\xe9xico, ${t}.
${s}

REFERENCIAS
- Formato APA 7ma edici\xf3n
- M\xednimo 20 fuentes acad\xe9micas/jur\xeddicas
- Incluir:
  * Hiperv\xednculos verificables
  * Fechas exactas de consulta
  * 5 tratados internacionales
  * 3 jurisprudencias locales
  * 2 estudios t\xe9cnicos actualizados
- Solo fuentes existentes y verificables

Genera un documento JUR\xcdDICAMENTE ROBUSTO, con m\xednimo 100 art\xedculos bien estructurados, que sirva como marco regulatorio completo para ${a} en la Ciudad de M\xe9xico para el periodo ${i}-${i+5}.`,temperature:.2,maxTokens:r.maxTokensPerRequest??20768});return r.enableApiUsageTracking&&await u({apiName:"openai/gpt-4o",tokensUsed:c.usage.totalTokens,requestType:"draft_generation"}),c.text}catch(e){throw console.error("Error en la generaci\xf3n del borrador con GPT-4:",e),Error("Error al generar el borrador base")}}async function E(e,a){try{f();let{formatted:r}=x();a.defaultLegislator;let t=await (0,o._4)({model:(0,n.f)("gpt-4o"),system:`Eres un experto legal especializado en derecho tecnol\xf3gico y regulaci\xf3n de IA en M\xe9xico.
      Tu tarea es revisar, MEJORAR Y EXPANDIR sustancialmente un borrador de proyecto de ley asegurando:
      1. Consistencia terminol\xf3gica y jur\xeddica ABSOLUTA
      2. Cumplimiento ESTRICTO con la jerarqu\xeda normativa mexicana
      3. Precisi\xf3n y DETALLE en las definiciones t\xe9cnicas (ampliar a 40+ t\xe9rminos si es necesario)
      4. Verificaci\xf3n de que cada art\xedculo contemple casos l\xedmite y excepciones
      5. Ampliaci\xf3n del articulado a 120+ art\xedculos donde sea necesario
      6. Integraci\xf3n PERFECTA de citas y referencias
      7. PRESERVACI\xd3N de la estructura jer\xe1rquica (T\xedtulos, Cap\xedtulos, Art\xedculos)`,prompt:`Como experto legal en regulaci\xf3n tecnol\xf3gica, revisa, MEJORA SUSTANCIALMENTE y EXPANDE el siguiente borrador para la Ciudad de M\xe9xico. Transforma este documento en un texto legislativo PROFESIONAL, COMPLETO Y T\xc9CNICAMENTE PERFECTO.

Revisi\xf3n cr\xedtica obligatoria:
1. AMPLIAR el cap\xedtulo de definiciones a 40+ t\xe9rminos t\xe9cnicos con precisi\xf3n jur\xeddica
2. VERIFICAR que cada art\xedculo contemple:
   - Excepciones aplicables
   - Casos l\xedmite no obvios
   - Mecanismos de actualizaci\xf3n
3. ASEGURAR concordancia con legislaci\xf3n complementaria
4. A\xd1ADIR 20% m\xe1s de art\xedculos donde sea necesario para cobertura completa
5. GARANTIZAR que todas las referencias est\xe9n:
   - Correctamente citadas en el texto (Autor, A\xf1o, p. X)
   - Incluidas en la secci\xf3n de REFERENCIAS con hiperv\xednculos verificables
6. FIRMA: Mantener EXACTAMENTE "Ciudad de M\xe9xico, [fecha]" y nombre del legislador antes de las referencias

El borrador a transformar es:

${e}

Entrega \xdaNICAMENTE el texto legal mejorado, SIN comentarios ni letra en negritas, ad\xe9mas las definiciones deben de ir enumeradas con n\xfameros romanos. El resultado debe ser un documento FORMAL, EXHAUSTIVO Y LISTO PARA PRESENTACI\xd3N, con m\xe1s de 100 art\xedculos y 40+ definiciones t\xe9cnicas.`,temperature:.1,maxTokens:a.maxTokensPerRequest??20768});return a.enableApiUsageTracking&&await u({apiName:"openai/gpt-4o",tokensUsed:t.usage.totalTokens,requestType:"refinement"}),t.text}catch(e){throw console.error("Error en el refinamiento legal:",e),Error("Error al refinar el proyecto de ley")}}async function g(e){let{stage:a,topic:r,inputData:t}=e;try{let e=await (0,s.YX)();switch(a){case"research":return await p(r,e);case"draft":if(!t)throw Error("Se requiere contexto de investigaci\xf3n para la etapa de redacci\xf3n");return await m(t,r,e);case"refine":if(!t)throw Error("Se requiere borrador inicial para la etapa de refinamiento");return await E(t,e);default:throw Error("Etapa de generaci\xf3n inv\xe1lida")}}catch(e){throw console.error(`Error en processGenerationStep (etapa: ${a}):`,e),Error(`Error durante la etapa '${a}': ${e instanceof Error?e.message:String(e)}`)}}(0,d.h)([u]),(0,t.j)("f6b12f990f31db6cbfa6d29b42643b0e06732013",u),(0,d.h)([g]),(0,t.j)("bd7baf09183fd0dcf14d526d69ec081295d5bb22",g)},56052:(e,a,r)=>{r.d(a,{GR:()=>c,VP:()=>x,YX:()=>d});var t=r(24330);r(60166);var o=r(9487),n=r(49033),i=r(57745),s=r(57708);async function c(){try{return(await o.db.select({key:n._X.key,value:n._X.value,description:n._X.description}).from(n._X)).map(e=>({key:e.key,value:e.value,description:e.description??void 0}))}catch(e){return console.error("Error al obtener configuraciones:",e),[]}}async function l(e){try{let[a]=await o.db.select({value:n._X.value}).from(n._X).where((0,i.eq)(n._X.key,e)).limit(1);return a?.value??null}catch(a){return console.error(`Error al obtener configuraci\xf3n ${e}:`,a),null}}async function d(){try{let e=(await o.db.select({key:n._X.key,value:n._X.value}).from(n._X).where((0,i.d3)(n._X.key,["default_legislator","max_tokens_per_request","enable_api_usage_tracking"]))).reduce((e,a)=>(e[a.key]=a.value,e),{});return{defaultLegislator:e.default_legislator??null,maxTokensPerRequest:e.max_tokens_per_request?parseInt(e.max_tokens_per_request,10):null,enableApiUsageTracking:"true"===e.enable_api_usage_tracking}}catch(e){return console.error("Error al obtener configuraciones relevantes:",e),{defaultLegislator:null,maxTokensPerRequest:null,enableApiUsageTracking:!1}}}async function u(e,a){try{return await o.db.update(n._X).set({value:a}).where((0,i.eq)(n._X.key,e)),(0,s.revalidatePath)("/settings"),!0}catch(a){return console.error(`Error al actualizar configuraci\xf3n ${e}:`,a),!1}}async function x(e){try{for(let[a,r]of Object.entries(e))await o.db.update(n._X).set({value:r}).where((0,i.eq)(n._X.key,a));return(0,s.revalidatePath)("/settings"),!0}catch(e){return console.error("Error al actualizar configuraciones:",e),!1}}(0,r(40618).h)([c,l,d,u,x]),(0,t.j)("2f704beac639500a6a8c0f77f73b36f1feccc00c",c),(0,t.j)("1c12427ade96633cb648d6b99be20ef15b9bd3d2",l),(0,t.j)("dc1d8366114e93478b8761c6b48b2734304d9b23",d),(0,t.j)("c84862781dc6da5fe40a6cf2e1e92855e23c5249",u),(0,t.j)("ac8ef273685a2accc5f4244b8ba8ec0bbe10c075",x)},9487:(e,a,r)=>{r.d(a,{J:()=>s,M:()=>c,db:()=>i});var t=r(62237),o=r(86142);t.vK.fetchConnectionCache=!0;let n=function(){try{if(!process.env.DATABASE_URL)return console.warn("DATABASE_URL no est\xe1 definida, usando modo de demostraci\xf3n"),(e,...a)=>("string"==typeof e?console.log("SQL simulado (query):",e,a[0]||[]):console.log("SQL simulado (template):",e,a),Promise.resolve([]));return(0,t.qn)(process.env.DATABASE_URL)}catch(e){throw console.error("Error al crear cliente SQL:",e),Error("No se pudo conectar a la base de datos")}}(),i=(0,o.tS)(n);async function s(e,a=[]){try{return await n(e,a)}catch(r){throw console.error("Error executing query:",r,{query:e,params:a}),Error("Database query failed")}}async function c(e=5e3){try{let a=await Promise.race([n`SELECT 1 as test`,new Promise((a,r)=>setTimeout(()=>r(Error("Database connection timeout")),e))]);return Array.isArray(a)&&a.length>0&&a[0]?.test===1}catch(e){return console.error("Database connection test failed:",e),!1}}},49033:(e,a,r)=>{r.d(a,{_X:()=>E,bB:()=>g});var t=r(55396),o=r(8324),n=r(95961),i=r(41401),s=r(72140),c=r(1575),l=r(12941),d=r(98748),u=r(43050),x=r(11613);let f=(0,t.ys)("bill_status",["draft","published","archived"]),p=(0,o.af)("bills",{id:(0,n.eP)("id").primaryKey(),title:(0,i.L7)("title",{length:255}).notNull(),content:(0,s.fL)("content").notNull(),topic:(0,i.L7)("topic",{length:100}).notNull(),status:f("status").notNull().default("draft"),created_at:(0,c.AB)("created_at",{withTimezone:!0}).defaultNow().notNull(),updated_at:(0,c.AB)("updated_at",{withTimezone:!0}).defaultNow().notNull()}),m=(0,o.af)("drafts",{id:(0,n.eP)("id").primaryKey(),title:(0,i.L7)("title",{length:255}).notNull(),content:(0,s.fL)("content").notNull(),bill_id:(0,l._L)("bill_id").references(()=>p.id,{onDelete:"set null"}),created_at:(0,c.AB)("created_at",{withTimezone:!0}).defaultNow().notNull()});(0,o.af)("examples",{id:(0,n.eP)("id").primaryKey(),title:(0,i.L7)("title",{length:255}).notNull(),description:(0,s.fL)("description"),content:(0,s.fL)("content").notNull(),category:(0,i.L7)("category",{length:100}),is_active:(0,d.O7)("is_active").default(!0),created_at:(0,c.AB)("created_at",{withTimezone:!0}).defaultNow().notNull()});let E=(0,o.af)("settings",{id:(0,n.eP)("id").primaryKey(),key:(0,i.L7)("key",{length:100}).notNull().unique(),value:(0,s.fL)("value").notNull(),description:(0,s.fL)("description"),created_at:(0,c.AB)("created_at",{withTimezone:!0}).defaultNow().notNull(),updated_at:(0,c.AB)("updated_at",{withTimezone:!0}).defaultNow().notNull()}),g=(0,o.af)("api_usage",{id:(0,n.eP)("id").primaryKey(),api_name:(0,i.L7)("api_name",{length:100}).notNull(),tokens_used:(0,l._L)("tokens_used").notNull(),cost_estimate:(0,u.gH)("cost_estimate",{precision:10,scale:6}).default("0"),request_type:(0,i.L7)("request_type",{length:50}),created_at:(0,c.AB)("created_at",{withTimezone:!0}).defaultNow().notNull()});(0,x.lE)(p,({many:e})=>({drafts:e(m)})),(0,x.lE)(m,({one:e})=>({bill:e(p,{fields:[m.bill_id],references:[p.id]})}))}};
# LegislaBot

Asistente de técnica legislativa: convierte un tema en una **iniciativa de ley con formato oficial** para la Ciudad de México. Investiga el marco jurídico, propone la estructura y redacta el documento **sección por sección, en streaming**, de modo que el texto se ve escribirse en tiempo real.

> Los textos generados son borradores de apoyo. No sustituyen la revisión jurídica profesional.

## Qué hace

- **Generación por etapas visibles:** investigación → estructura → exposición de motivos → articulado (un Título por petición) → transitorios y referencias.
- **Streaming palabra por palabra**, con opción de detener, reanudar y reintentar solo el paso que falló.
- **Documento tipográfico** con índice navegable, validación de formato oficial y conteo de artículos.
- **Edición, guardado de borradores privados** (sin cuenta) y **exportación** a PDF carta, Word y texto plano.
- **Modo demo** automático cuando no hay claves de IA o se agota la cuota diaria.
- Tema claro/oscuro, diseño responsivo y accesible.

## Arquitectura

```
Navegador ──(1 petición corta por sección)──▶  /api/generate  (Edge Runtime, streaming)
   │                                               │
   │  hook useBillGeneration                       ├─ Zod: valida y limpia la entrada
   │  · orquesta los pasos                         ├─ Cuota diaria por IP (Postgres, upsert atómico)
   │  · pinta el stream en la hoja                 ├─ Token HMAC por generación (expira en 1 h)
   │  · persiste en sessionStorage                 └─ Gemini 2.5 Flash / GPT-4o  ·  o modo demo
   │
   └─ Server Actions (borradores) ──▶ Neon Postgres (Drizzle), filtrado por cookie de sesión
```

### Por qué por secciones

Una ley completa tarda minutos en generarse y el plan gratuito de Vercel corta las peticiones largas. En vez de una llamada monolítica, el cliente encadena peticiones cortas a una ruta Edge que transmite el texto conforme se produce. Ninguna se acerca al límite de tiempo y un error solo repite ese paso, conservando lo ya escrito.

### Seguridad

| Riesgo | Medida |
|---|---|
| Abuso de créditos de IA | Cuota diaria por IP + token firmado por generación con tope de pasos; al excederse, modo demo |
| Acceso a borradores ajenos | Cookie de sesión `httpOnly`; toda consulta filtra por dueño en el servidor |
| Inyección de prompt | El tema se limpia, se limita a 300 caracteres y se delimita como dato en el prompt |
| Fuga de secretos | Solo variables de entorno; los ajustes usan lista blanca de claves y exigen `ADMIN_TOKEN` |
| Entradas maliciosas | Esquemas Zod en todas las rutas y acciones; errores genéricos al cliente |
| Ataques de navegador | CSP, HSTS, `X-Frame-Options: DENY`, `Referrer-Policy`, `Permissions-Policy` |

## Stack

Next.js 14 (App Router, Edge Runtime) · TypeScript · Vercel AI SDK (Gemini, GPT-4o) · Neon Postgres + Drizzle · Tailwind CSS + Radix UI · Zod · jsPDF

## Puesta en marcha

```bash
npm install
cp .env.example .env.local   # completa los valores
npm run db:migrate           # crea/actualiza las tablas (opcional si no usas base de datos)
npm run dev
```

Sin claves de IA la aplicación funciona en **modo demo**; sin `DATABASE_URL` funciona todo excepto guardar borradores.

### Variables de entorno

| Variable | Requerida | Descripción |
|---|---|---|
| `OPENAI_API_KEY` | Para IA real | Redacción (GPT-4o) |
| `GOOGLE_GENERATIVE_AI_API_KEY` | Para IA real | Investigación (Gemini) |
| `DATABASE_URL` | Para guardar | Cadena de conexión de Neon |
| `GENERATION_SECRET` | En producción | Firma los tokens de generación (`openssl rand -hex 32`) |
| `ADMIN_TOKEN` | Opcional | Permite editar los ajustes desde `/settings` |
| `DAILY_GENERATION_LIMIT` | Opcional | Generaciones reales por IP al día (por defecto 3) |

Nunca subas `.env.local` al repositorio.

## Scripts

| Comando | Acción |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` / `npm start` | Compilación y servidor de producción |
| `npm run lint` / `npm run typecheck` | Calidad de código |
| `npm run db:migrate` | Migración idempotente del esquema |

## Estructura

```
app/
  api/generate/     ruta Edge de streaming (un paso por petición)
  actions/drafts.ts server actions de borradores, por sesión
  bills/ example/ about/ settings/
components/
  generator.tsx       compositor + generación en vivo
  bill-document.tsx   la "hoja" tipográfica
  bill-workspace.tsx  índice, validación, edición, exportación
hooks/use-bill-generation.ts   orquestación de pasos en el cliente
lib/
  bill-parser.ts   parser único: vista, índice, validador y exportadores
  prompts.ts       prompts por sección y modelos
  rate-limit.ts · generation-token.ts · session.ts · validation.ts
```

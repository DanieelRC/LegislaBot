# LegisAI - Asistente de Formulación de Proyectos de Ley

Plataforma de apoyo a legisladores para la formulación de Proyectos de Ley relacionados con la regulación del uso de la inteligencia artificial en la Ciudad de México.

## Configuración del Entorno

Para ejecutar esta aplicación, necesitas configurar las siguientes variables de entorno en un archivo `.env` en la raíz del proyecto:

\`\`\`env
# API Keys para servicios de IA
OPENAI_API_KEY=your_openai_api_key_here
GOOGLE_API_KEY=your_google_api_key_here

# Otras configuraciones (opcionales para desarrollo local)
NODE_ENV=development
APP_URL=http://localhost:3000
\`\`\`

### Obtención de API Keys

1. **OpenAI API Key**:
   - Regístrate en [OpenAI Platform](https://platform.openai.com/)
   - Ve a la sección de API Keys y crea una nueva clave
   - Copia la clave y pégala en el archivo `.env`

2. **Google API Key (para Gemini)**:
   - Regístrate en [Google AI Studio](https://makersuite.google.com/)
   - Crea una API Key para Gemini
   - Copia la clave y pégala en el archivo `.env`

## Instalación

\`\`\`bash
# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
npm run dev

# Construir para producción
npm run build

# Iniciar en modo producción
npm start
\`\`\`

## Características

- Generación de proyectos de ley con formato oficial mexicano
- Investigación previa con Gemini
- Generación de borradores con GPT-4
- Refinamiento legal especializado
- Edición en línea del contenido generado
- Validación de formato oficial
- Ejemplos de iniciativas exitosas
- Sistema de guardado de borradores
- Exportación a PDF con formato oficial

## Tecnologías Utilizadas

- Next.js 14 (App Router)
- AI SDK (OpenAI, Google)
- Tailwind CSS
- shadcn/ui
- TypeScript

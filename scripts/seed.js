// Este script se utiliza para sembrar datos de ejemplo en la base de datos

const { Client } = require("pg")
require("dotenv").config()

async function seed() {
  // Conectar a la base de datos
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  })

  try {
    await client.connect()
    console.log("Conectado a la base de datos")

    // Insertar ejemplos
    const examplesResult = await client.query(`
      INSERT INTO examples (title, description, content, category, is_active)
      VALUES 
        (
          'LEY PARA LA REGULACIÓN DE SISTEMAS DE INTELIGENCIA ARTIFICIAL EN LA CIUDAD DE MÉXICO',
          'Establece un marco regulatorio para el desarrollo, implementación y uso de sistemas de IA en la CDMX.',
          'LEY PARA LA REGULACIÓN DE SISTEMAS DE INTELIGENCIA ARTIFICIAL EN LA CIUDAD DE MÉXICO

EXPOSICIÓN DE MOTIVOS

La inteligencia artificial (IA) representa una de las transformaciones tecnológicas más significativas de nuestra era, con el potencial de revolucionar diversos sectores económicos, sociales y gubernamentales. La Ciudad de México, como centro de innovación y desarrollo tecnológico del país, enfrenta el desafío de aprovechar los beneficios de estas tecnologías mientras garantiza que su implementación sea ética, segura y respetuosa de los derechos fundamentales de sus habitantes.

Actualmente, la ausencia de un marco regulatorio específico para sistemas de inteligencia artificial genera incertidumbre jurídica tanto para desarrolladores como para usuarios, lo que puede resultar en implementaciones que no consideren adecuadamente aspectos como la privacidad, la transparencia, la rendición de cuentas y la no discriminación.

Esta iniciativa busca establecer principios claros y mecanismos de gobernanza que promuevan la innovación responsable en el campo de la inteligencia artificial, garantizando que estas tecnologías contribuyan al bienestar social, el desarrollo económico sostenible y el fortalecimiento de los servicios públicos en la Ciudad de México.

La presente ley se fundamenta en estándares internacionales como los Principios de la OCDE sobre Inteligencia Artificial, las recomendaciones de la UNESCO sobre la Ética de la Inteligencia Artificial y las mejores prácticas implementadas en otras jurisdicciones, adaptándolas al contexto específico de la Ciudad de México y su marco jurídico.

PROPUESTA

ARTÍCULO PRIMERO. Se expide la Ley para la Regulación de Sistemas de Inteligencia Artificial en la Ciudad de México, para quedar como sigue:

TÍTULO PRIMERO
DISPOSICIONES GENERALES

Artículo 1. La presente Ley es de orden público e interés social y tiene por objeto establecer los principios, bases, procedimientos e instituciones para la regulación, desarrollo, implementación y uso de sistemas de inteligencia artificial en la Ciudad de México.

Artículo 2. Para los efectos de esta Ley se entenderá por:
I. Inteligencia Artificial: Conjunto de técnicas y sistemas computacionales diseñados para realizar tareas que normalmente requieren inteligencia humana, como el aprendizaje, la toma de decisiones, el reconocimiento de patrones y el procesamiento del lenguaje natural.
II. Sistema de Alto Riesgo: Aquellos sistemas de inteligencia artificial cuyo uso pueda afectar significativamente derechos fundamentales, la seguridad o el bienestar de las personas.
III. Evaluación de Impacto Algorítmico: Proceso sistemático para identificar, evaluar y mitigar los posibles efectos negativos de un sistema de inteligencia artificial antes de su implementación.

Ciudad de México, a 15 de abril de 2024, Dip. María Rodríguez González.',
          'general',
          true
        ),
        (
          'INICIATIVA CON PROYECTO DE DECRETO QUE REGULA EL USO DE DEEPFAKES EN LA CIUDAD DE MÉXICO',
          'Establece medidas para prevenir y sancionar el uso malicioso de deepfakes.',
          'INICIATIVA CON PROYECTO DE DECRETO QUE REGULA EL USO DE DEEPFAKES EN LA CIUDAD DE MÉXICO

EXPOSICIÓN DE MOTIVOS

El avance tecnológico en materia de inteligencia artificial ha permitido el desarrollo de herramientas capaces de crear contenido sintético altamente realista, conocido comúnmente como "deepfakes". Estas tecnologías permiten manipular o generar imágenes, videos y audios que pueden resultar indistinguibles de contenido auténtico para el ojo o el oído humano.

Si bien estas tecnologías tienen aplicaciones legítimas en campos como el entretenimiento, la educación y las artes, también presentan riesgos significativos cuando son utilizadas con fines maliciosos, como la desinformación, el fraude, la suplantación de identidad, el acoso o la creación de contenido íntimo no consentido.

La Ciudad de México, como centro urbano con alta penetración tecnológica, requiere un marco normativo que aborde específicamente los desafíos que plantean los deepfakes, estableciendo medidas preventivas, obligaciones para los desarrolladores y plataformas, así como sanciones para quienes hagan uso indebido de estas tecnologías en perjuicio de terceros.

Esta iniciativa busca equilibrar la protección de derechos fundamentales como la privacidad, la dignidad, el honor y la propia imagen, con el fomento a la innovación tecnológica y la libertad de expresión, estableciendo reglas claras que brinden certeza jurídica a todos los actores involucrados.

PROPUESTA

Artículo ÚNICO. Se expide el Decreto que Regula el Uso de Deepfakes en la Ciudad de México, para quedar como sigue:

DECRETO QUE REGULA EL USO DE DEEPFAKES EN LA CIUDAD DE MÉXICO

CAPÍTULO I
DISPOSICIONES GENERALES

Artículo 1. El presente Decreto es de orden público e interés social, y tiene por objeto regular la creación, distribución y uso de contenido sintético generado mediante técnicas de inteligencia artificial, conocido como "deepfakes", en la Ciudad de México.

Artículo 2. Para efectos de este Decreto, se entenderá por:
I. Deepfake: Contenido sintético generado o manipulado mediante técnicas de inteligencia artificial que representa de manera realista a personas diciendo o haciendo cosas que nunca dijeron o hicieron.
II. Contenido sintético: Imágenes, videos, audios u otros formatos multimedia creados o alterados sustancialmente mediante algoritmos de inteligencia artificial.
III. Etiquetado: Identificación visible que indica que el contenido ha sido generado o manipulado mediante inteligencia artificial.

Ciudad de México, a 20 de abril de 2024, Dip. Carlos Martínez López.',
          'deepfakes',
          true
        ),
        (
          'INICIATIVA DE LEY DE TRANSPARENCIA ALGORÍTMICA PARA LA CIUDAD DE MÉXICO',
          'Establece requisitos de transparencia para sistemas algorítmicos utilizados en servicios públicos.',
          'INICIATIVA DE LEY DE TRANSPARENCIA ALGORÍTMICA PARA LA CIUDAD DE MÉXICO

EXPOSICIÓN DE MOTIVOS

En la era digital, los algoritmos y sistemas de inteligencia artificial están transformando la forma en que se toman decisiones en diversos ámbitos, incluyendo la prestación de servicios públicos, la asignación de recursos, la evaluación de riesgos y la implementación de políticas públicas. Estos sistemas ofrecen oportunidades para mejorar la eficiencia, precisión y escala de las operaciones gubernamentales.

Sin embargo, la creciente dependencia de sistemas algorítmicos plantea desafíos significativos en términos de transparencia, rendición de cuentas y equidad. La opacidad en el funcionamiento de estos sistemas puede conducir a decisiones discriminatorias, injustas o arbitrarias que afecten los derechos de las personas sin que existan mecanismos adecuados para cuestionar o revisar dichas decisiones.

La Ciudad de México, como entidad comprometida con la innovación, la transparencia y los derechos humanos, requiere un marco normativo que establezca estándares claros para el uso de sistemas algorítmicos en el sector público, garantizando que estos sistemas sean transparentes, auditables y respetuosos de los derechos fundamentales de todos los habitantes.

Esta iniciativa busca establecer obligaciones de transparencia algorítmica para las entidades públicas de la Ciudad de México, promoviendo la rendición de cuentas, la participación ciudadana y la confianza en los sistemas tecnológicos utilizados por el gobierno.

PROPUESTA

Artículo ÚNICO. Se expide la Ley de Transparencia Algorítmica para la Ciudad de México, para quedar como sigue:

LEY DE TRANSPARENCIA ALGORÍTMICA PARA LA CIUDAD DE MÉXICO

TÍTULO PRIMERO
DISPOSICIONES GENERALES

Artículo 1. La presente Ley es de orden público, interés social y observancia general en la Ciudad de México, y tiene por objeto garantizar la transparencia, explicabilidad y rendición de cuentas en el diseño, desarrollo, adquisición, implementación y uso de sistemas algorítmicos por parte de los entes públicos de la Ciudad de México.

Artículo 2. Para los efectos de esta Ley se entenderá por:
I. Sistema Algorítmico: Cualquier sistema computacional que utilice algoritmos, incluyendo aquellos basados en inteligencia artificial o aprendizaje automático, para realizar tareas, procesar información o tomar decisiones.
II. Registro Público de Sistemas Algorítmicos: Base de datos pública que contiene información sobre los sistemas algorítmicos utilizados por los entes públicos de la Ciudad de México.
III. Evaluación de Impacto Algorítmico: Proceso sistemático para identificar, evaluar y mitigar los posibles efectos de un sistema algorítmico en los derechos de las personas y en el interés público.

Ciudad de México, a 25 de abril de 2024, Dip. Ana García Hernández.',
          'transparencia',
          true
        )
    `)
    console.log(`Insertados ${examplesResult.rowCount} ejemplos`)

    // Insertar configuraciones
    const settingsResult = await client.query(`
      INSERT INTO settings (key, value, description)
      VALUES 
        ('app_name', 'LegisAI', 'Nombre de la aplicación'),
        ('app_description', 'Asistente de Formulación de Proyectos de Ley', 'Descripción de la aplicación'),
        ('default_legislator', 'Dip. Juan Pérez', 'Nombre del legislador por defecto'),
        ('max_tokens_per_request', '8000', 'Número máximo de tokens por solicitud'),
        ('enable_api_usage_tracking', 'true', 'Habilitar seguimiento de uso de API')
    `)
    console.log(`Insertadas ${settingsResult.rowCount} configuraciones`)

    console.log("Datos sembrados exitosamente")
  } catch (error) {
    console.error("Error al sembrar datos:", error)
  } finally {
    await client.end()
    console.log("Conexión cerrada")
  }
}

seed()

export type Area = {
  id: string;
  name: string;
  tagline: string;
  description: string;
  icon: string;
  color: string;
};

export type CourseLevel = "Básico" | "Intermedio" | "Avanzado";

export type Course = {
  id: string;
  title: string;
  areaId: string;
  summary: string;
  description: string;
  duration: string;
  hours: number;
  level: CourseLevel;
  certification: boolean;
  top: boolean;
  topics: string[];
};

export type Certification = {
  courseId: string;
  date: string;
  score: number;
};

export type User = {
  id: string;
  name: string;
  email: string;
  bio: string;
  enrolledCourseIds: string[];
  certifications: Certification[];
};

export const AREAS: Area[] = [
  {
    id: "ciberseguridad",
    name: "Ciberseguridad",
    tagline: "Protege sistemas, redes y datos.",
    description:
      "Programas orientados a la protección de la información: análisis de vulnerabilidades, respuesta a incidentes, seguridad ofensiva y defensiva.",
    icon: "🛡️",
    color: "#254bff",
  },
  {
    id: "iot",
    name: "Internet de las Cosas (IoT)",
    tagline: "Conecta y programa dispositivos inteligentes.",
    description:
      "Diseño y desarrollo de soluciones con sensores, microcontroladores y plataformas en la nube para entornos conectados.",
    icon: "📡",
    color: "#087d7f",
  },
  {
    id: "cloud-devops",
    name: "Cloud & DevOps",
    tagline: "Infraestructura moderna, despliegues continuos.",
    description:
      "Contenedores, orquestación, CI/CD y estrategias de despliegue en las principales plataformas de nube.",
    icon: "☁️",
    color: "#6750b4",
  },
  {
    id: "datos",
    name: "Ciencia de Datos",
    tagline: "Convierte datos en decisiones.",
    description:
      "Análisis, visualización y modelado de datos con Python, SQL y herramientas de BI.",
    icon: "📊",
    color: "#b85a22",
  },
  {
    id: "ia",
    name: "Inteligencia Artificial",
    tagline: "Aprendizaje automático y modelos generativos.",
    description:
      "Fundamentos de machine learning, deep learning y aplicaciones prácticas de IA generativa.",
    icon: "🤖",
    color: "#254bff",
  },
  {
    id: "web",
    name: "Desarrollo Web",
    tagline: "Construye aplicaciones para la web moderna.",
    description:
      "Frontend, backend y arquitectura de aplicaciones full-stack con los frameworks más usados del mercado.",
    icon: "🌐",
    color: "#087d7f",
  },
  {
    id: "redes",
    name: "Redes y Comunicaciones",
    tagline: "Fundamentos de conectividad e infraestructura.",
    description:
      "Modelos de referencia, protocolos, seguridad de redes y administración de infraestructura de comunicaciones.",
    icon: "🔗",
    color: "#6750b4",
  },
];

export const COURSES: Course[] = [
  {
    id: "seguridad-informatica-fundamentos",
    title: "Seguridad Informática: Fundamentos",
    areaId: "ciberseguridad",
    summary:
      "Conceptos esenciales de seguridad: amenazas, cifrado, autenticación y buenas prácticas para proteger la información.",
    description:
      "Un programa introductorio que te lleva desde los principios básicos de la seguridad de la información hasta la aplicación de controles concretos. Vas a identificar amenazas comunes, entender cómo funciona el cifrado simétrico y asimétrico, y aplicar políticas de autenticación y control de acceso en escenarios reales.",
    duration: "6 semanas",
    hours: 24,
    level: "Básico",
    certification: true,
    top: true,
    topics: [
      "Principios de seguridad de la información",
      "Cifrado simétrico y asimétrico",
      "Autenticación y control de acceso",
      "Análisis de riesgos",
      "Seguridad de aplicaciones web",
    ],
  },
  {
    id: "ethical-hacking",
    title: "Ethical Hacking y Pruebas de Penetración",
    areaId: "ciberseguridad",
    summary:
      "Metodologías ofensivas para auditar sistemas: reconocimiento, explotación de vulnerabilidades y reportes.",
    description:
      "Aprendé a pensar como un atacante para defender mejor. El curso cubre el ciclo completo de una prueba de penetración: reconocimiento, escaneo, explotación, post-explotación y elaboración de reportes profesionales con autorización legal.",
    duration: "10 semanas",
    hours: 40,
    level: "Avanzado",
    certification: true,
    top: true,
    topics: [
      "Reconocimiento y footprinting",
      "Escaneo de vulnerabilidades",
      "Explotación con Metasploit",
      "Ingeniería social",
      "Redacción de reportes de auditoría",
    ],
  },
  {
    id: "iot-basico",
    title: "IoT: Introducción a Dispositivos Conectados",
    areaId: "iot",
    summary:
      "Montá tus primeros dispositivos inteligentes con sensores, actuadores y conexión a la nube.",
    description:
      "Desde cero, conectás sensores y actuadores a microcontroladores, aprendés protocolos de comunicación como MQTT, y publicás datos en una plataforma cloud para monitorearlos desde un tablero web.",
    duration: "8 semanas",
    hours: 32,
    level: "Básico",
    certification: true,
    top: false,
    topics: [
      "Arquitectura de sistemas IoT",
      "Sensores y actuadores",
      "Protocolo MQTT",
      "Microcontroladores (ESP32)",
      "Dashboards de monitoreo",
    ],
  },
  {
    id: "edge-computing-iot",
    title: "Edge Computing aplicado a IoT",
    areaId: "iot",
    summary:
      "Procesamiento en el borde para reducir latencia y latencia en soluciones industriales IoT.",
    description:
      "Optimizá soluciones IoT procesando datos cerca de la fuente. Trabajás con dispositivos edge, balance entre cómputo local y nube, y casos de uso industrial con requisitos de tiempo real.",
    duration: "7 semanas",
    hours: 28,
    level: "Intermedio",
    certification: true,
    top: false,
    topics: [
      "Computación en el borde",
      "Arquitecturas fog/edge",
      "Procesamiento de datos en tiempo real",
      "Seguridad en el borde",
      "Casos de uso industrial",
    ],
  },
  {
    id: "docker-kubernetes",
    title: "Docker y Kubernetes: Fundamentos",
    areaId: "cloud-devops",
    summary:
      "Contenerización y orquestación para desplegar aplicaciones modernas en la nube.",
    description:
      "Dominá los contenedores y su orquestación: imágenes, redes, volúmenes, y despliegue de aplicaciones en clústers Kubernetes. Incluye prácticas de CI/CD aplicadas a microservicios.",
    duration: "9 semanas",
    hours: 36,
    level: "Intermedio",
    certification: true,
    top: true,
    topics: [
      "Imágenes y contenedores Docker",
      "Docker Compose",
      "Pods, Deployments y Services",
      "Helm y gestión de configuraciones",
      "CI/CD con contenedores",
    ],
  },
  {
    id: "cloud-native",
    title: "Cloud Native: Arquitectura y Microservicios",
    areaId: "cloud-devops",
    summary:
      "Diseñá aplicaciones nativas de la nube: microservicios, observabilidad y escalado automático.",
    description:
      "El programa integral para construir aplicaciones diseñadas para la nube: principios de diseño de microservicios, service mesh, observabilidad, resiliencia y escalado automático bajo demanda.",
    duration: "12 semanas",
    hours: 48,
    level: "Avanzado",
    certification: true,
    top: true,
    topics: [
      "Principios de diseño Cloud Native",
      "Microservicios y comunicación",
      "Service mesh",
      "Observabilidad (logs, métricas, traces)",
      "Escalado automático y resiliencia",
    ],
  },
  {
    id: "data-analisis-python",
    title: "Análisis de Datos con Python",
    areaId: "datos",
    summary:
      "Pandas, visualización y limpieza de datos para obtener insights accionables.",
    description:
      "Un recorrido práctico por el análisis exploratorio de datos: limpieza, transformación, agregaciones y visualizaciones efectivas con Python y las bibliotecas del ecosistema de datos.",
    duration: "8 semanas",
    hours: 32,
    level: "Básico",
    certification: true,
    top: false,
    topics: [
      "Introducción a Python para datos",
      "Pandas: DataFrames",
      "Limpieza y transformación",
      "Visualización con Matplotlib y Seaborn",
      "Análisis exploratorio",
    ],
  },
  {
    id: "machine-learning-fundamentos",
    title: "Machine Learning: Fundamentos",
    areaId: "ia",
    summary:
      "Modelos supervisados y no supervisados, evaluación y despliegue de modelos básicos.",
    description:
      "Aprendé los algoritmos de aprendizaje automático más utilizados, cómo evaluarlos correctamente y cómo llevarlos a producción con herramientas modernas.",
    duration: "10 semanas",
    hours: 40,
    level: "Intermedio",
    certification: true,
    top: true,
    topics: [
      "Regresión y clasificación",
      "Árboles de decisión y ensambles",
      "Clustering",
      "Evaluación de modelos",
      "Deploy de modelos",
    ],
  },
  {
    id: "fullstack-moderno",
    title: "Desarrollo Full-Stack Moderno",
    areaId: "web",
    summary:
      "Frontend con React, backend con Node y bases de datos: una aplicación completa de punta a punta.",
    description:
      "Construí una aplicación web completa: interfaz con React, API REST con Node.js, persistencia con bases de datos SQL y despliegue en la nube. Proyecto final integrador incluido.",
    duration: "12 semanas",
    hours: 50,
    level: "Intermedio",
    certification: true,
    top: false,
    topics: [
      "React y TypeScript",
      "APIs REST con Node.js",
      "Bases de datos SQL y ORM",
      "Autenticación con OAuth",
      "Deploy y monitoreo",
    ],
  },
  {
    id: "redes-fundamentos",
    title: "Redes de Computadoras: Fundamentos",
    areaId: "redes",
    summary:
      "Modelo OSI, TCP/IP, direccionamiento y administración básica de redes.",
    description:
      "Los fundamentos de las redes modernas: capas del modelo OSI, suite TCP/IP, direccionamiento IPv4/IPv6, y configuración básica de switches y routers.",
    duration: "7 semanas",
    hours: 28,
    level: "Básico",
    certification: true,
    top: false,
    topics: [
      "Modelo OSI y TCP/IP",
      "Direccionamiento IPv4 e IPv6",
      "VLANs y subredes",
      "Protocolos de enrutamiento",
      "Diagnóstico de redes",
    ],
  },
];

export function getAreaById(areaId: string): Area | undefined {
  return AREAS.find((area) => area.id === areaId);
}

export function getCourseById(courseId: string): Course | undefined {
  return COURSES.find((course) => course.id === courseId);
}

export function getCoursesByArea(areaId: string): Course[] {
  return COURSES.filter((course) => course.areaId === areaId);
}

export function getTopCourses(): Course[] {
  return COURSES.filter((course) => course.top);
}

export function formatStudents(count: number): string {
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1).replace(".", ",").replace(",0", "")} mil`;
  }
  return String(count);
}

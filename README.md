# Certifika2 — Frontend

Aplicacion web de Certifika2, construida con Next.js, React y TypeScript.

**Web desplegada:** https://uwbsn5nyfh.execute-api.us-east-1.amazonaws.com

## Funcionalidades

- Inicio de sesion con Google mediante Cognito, con respaldo Cognito nativo.
- Catalogo, inscripciones, aula con recursos y comunidad.
- Perfil con datos personales, cursos y descarga/verificacion de certificados.
- DEMO sobre cursos inscritos: notas de ejemplo y emision de PDF por el flujo real de Kinesis.
- Espacio docente con creacion y gestion de cursos, materiales, anuncios y estudiantes.
- Administracion de postulaciones y visores de SQS y certificados Kinesis.

## Desarrollo

```bash
npm ci
npm run dev
```

Abrir http://localhost:3000. Las operaciones autenticadas necesitan el BFF y el proveedor Cognito configurados en el entorno de despliegue. No se incluyen credenciales.

## Compilacion y despliegue

```bash
npm run build
```

Next.js genera el sitio estatico en `out/`. En AWS se sirve desde S3 mediante API Gateway HTTPS; `/api/*` se dirige al BFF en ECS. Los servicios se consumen bajo el mismo origen mediante `/api/bff/*`, con sesion segura gestionada por el BFF. Los archivos de infraestructura y scripts AWS pertenecen al proyecto de despliegue, separado de este repositorio.

## Roles

Toda cuenta autenticada recibe ESTUDIANTE. PROFESOR y ADMIN son permisos adicionales de Cognito. Aprobar una postulacion docente asigna PROFESOR; cerrar sesion e ingresar de nuevo actualiza los permisos del navegador.

Las notas DEMO son sinteticas y sus certificados se identifican como demostracion.
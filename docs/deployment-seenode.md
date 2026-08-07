# Despliegue en Seenode

1. Crear una base PostgreSQL administrada.
2. Copiar `DATABASE_URL`.
3. Crear un Web Service conectado al repositorio.
4. Configurar build command: `npm run build`.
5. Configurar start command: `npm run start`.
6. Configurar puerto `3000`.
7. Anadir variables de `.env.example`.
8. Definir temporalmente `ADMIN_BOOTSTRAP_EMAIL` y `ADMIN_BOOTSTRAP_PASSWORD`.
9. Desplegar.
10. Revisar que `prisma migrate deploy` termina correctamente.
11. Iniciar sesion con el administrador.
12. Retirar `ADMIN_BOOTSTRAP_PASSWORD` de Seenode.
13. Redesplegar y comprobar que el bootstrap muestra `ADMIN_EXISTS`.

No se necesita volumen persistente, Redis ni almacenamiento de objetos. Los PDF y SVG de trabajos se procesan en memoria y se descargan directamente.

Si Seenode detecta Dockerfile, tambien puede construir con Docker. En ese caso sigue usando las mismas variables y puerto `3000`.

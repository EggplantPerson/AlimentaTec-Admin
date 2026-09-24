# Requisitos para correr el proyecto

1. pnpm
2. PostgreSQL (Sólo si se va a usar una base de datos local)
3. Typescript
4. Node.js

# Instrucciones para ejecutar el proyecto

1. Clonar la rama prod del repositorio
2. Ejecutar el comando "pnpm install" desde la carpeta raíz del proyecto para instalar todas las dependencias
3. Poblar las variables en .env con los valores solicitados
   
  (Para correr el servidor local es necesario poner el link de PostgreSQL local en DIRECT_URL y DATABASE_URL)
  
  (Si no hay un bucket S3 disponible no se puede ejecutar el backend)
  
5. Verificar que PostgreSQL esté corriendo de manera local
6. Ejecutar el comando "pnpm exec prisma migrate dev" para crear las tablas definidas dentro de schema.prisma en la base de datos
7. Abrir una terminal y ejecutar el comando "pnpm server:dev" esto ejecuta el backend
8. Abrir una segunda terminal y ejecutar el comando "pnpm dev" esto ejecuta el frontend y proporciona el link a la página web en localhost

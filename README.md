# FORTH WARS — versión con panel administrativo

Esta versión usa **Supabase Auth + PostgreSQL + Row Level Security (RLS) + Realtime**.

## 1. Crear proyecto Supabase
Crea un proyecto gratuito en Supabase.

## 2. Crear la base de datos
En **SQL Editor**, ejecuta TODO el archivo `supabase.sql`.

## 3. Crear tu cuenta de administrador
En Supabase:
**Authentication → Users → Add user**

Crea el correo y contraseña que usarás en `admin.html`.
No escribas esa contraseña en ningún archivo del proyecto.

## 4. Configurar la web
Abre `config.js` y coloca:
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`

Los puedes obtener desde:
**Project Settings → API**

La `anon key` puede aparecer en el frontend. La contraseña NO.

## 5. Ejecutar
Puedes abrir `index.html` para probar la página pública y `admin.html` para administrar.

Para usarlo publicado, sube los archivos a GitHub Pages, Netlify o Vercel.

## Seguridad
- La contraseña la maneja Supabase Auth.
- Las tablas tienen RLS.
- La página pública solo tiene permiso de lectura.
- Las operaciones de escritura requieren autenticación.
- No se guarda la contraseña en HTML, CSS o JavaScript.
- Para producción, se recomienda restringir todavía más las políticas de escritura al UID exacto del administrador.

## Actualización instantánea
La web pública y el panel escuchan cambios de Supabase Realtime. Cuando se modifica un miembro, guerra o premio, las páginas conectadas reciben el cambio automáticamente.

## Importante
Este ZIP es una plantilla funcional lista para conectar a TU proyecto Supabase. No incluye tus credenciales reales porque nunca deben compartirse.

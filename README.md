# Sistema POS y Gestor de Inventario (Plataforma Web)

Este es un sistema POS y gestor de inventario completo, modular e independiente, diseñado para funcionar 100% como una aplicación web en producción. Se compone de un frontend en **React (Vite + Tailwind CSS)** y un backend en **Node.js (Express + Prisma ORM + PostgreSQL/Supabase)**.

---

## 🚀 Despliegue en Producción

### 1. Base de Datos (Supabase)
El backend utiliza PostgreSQL mediante Prisma. Puedes utilizar **Supabase** para hospedar tu base de datos de producción:

1. Crea un proyecto en [Supabase](https://supabase.com/).
2. Ve a **Project Settings > Database** y copia el string de conexión URI de la base de datos (`DATABASE_URL`).
   * *Tip:* Usa el puerto `5432` o el Connection Pooler si vas a realizar despliegues Serverless.
3. Configura este string en el archivo `.env` de tu backend de producción:
   ```env
   DATABASE_URL="postgresql://postgres:[TU-CONTRASEÑA]@[ID-PROYECTO].supabase.co:5432/postgres"
   ```
4. Aplica las migraciones de base de datos ejecutando en el backend:
   ```bash
   npm run prisma:generate
   npm run prisma:migrate
   ```

### 2. Frontend (Netlify)
El frontend se compila de forma estática y está optimizado para funcionar en **Netlify**:

1. Sube este repositorio a tu cuenta de GitHub.
2. Conecta el repositorio en el panel de Netlify.
3. Netlify leerá automáticamente el archivo `netlify.toml` de la raíz, configurando:
   * **Base Directory:** `frontend`
   * **Publish Directory:** `dist`
   * **Build Command:** `npm run build`
4. **CORS & Proxy API:** En el archivo `netlify.toml`, asegúrate de actualizar la redirección `/api/*` con la URL donde alojes tu backend en producción:
   ```toml
   [[redirects]]
     from = "/api/*"
     to = "https://tu-backend-produccion.com/api/:splat"
     status = 200
     force = true
   ```

### 3. Backend (Render / Railway / VPS)
El backend de Node.js necesita estar activo para responder a las peticiones del POS.
* Puedes alojarlo de forma sencilla en plataformas como **Railway**, **Render** o en tu propio VPS.
* Asegúrate de configurar las variables de entorno en el panel del hosting (`DATABASE_URL`, `PORT`, `JWT_SECRET`, etc.).

---

## 💻 Desarrollo Local

Para ejecutar el backend y el frontend en paralelo localmente con recarga en tiempo real:

1. Instala las dependencias en la raíz:
   ```bash
   npm install
   ```
2. Inicia el servidor de desarrollo:
   ```bash
   npm run dev
   ```

Esto ejecutará automáticamente:
* **Frontend:** `http://localhost:5173`
* **Backend:** `http://localhost:3001`

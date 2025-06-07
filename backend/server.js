// backend/server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const Rosa = require('./models/Rosa');

const app = express();
const PORT = process.env.PORT || 3000;

// ─── 1) Middlewares básicos ─────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ─── 2) Servir el frontend (archivos estáticos) ────────────────────────
//     Asegúrate de que esto apunte a la carpeta local “public”
//     y NO tenga nada que ver con tu URI de MongoDB.
app.use(express.static(path.join(__dirname, '../public')));

// ─── 3) Conexión a MongoDB Atlas ───────────────────────────────────────
//     Aquí defines tu URI, reemplazando <db_password> por la contraseña real.
//     Ejemplo de Atlas (reemplaza <db_password>):
//       mongodb+srv://rosify_user:<db_password>@cluster0.ylz3v.mongodb.net/rosify?retryWrites=true&w=majority
//
const MONGO_URI = 'mongodb+srv://rosify_user:Joseballona14@cluster0.y1z3v.mongodb.net/rosify?retryWrites=true&w=majority&appName=Cluster0';
mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('🔌 Conectado a MongoDB Atlas'))
  .catch(err => console.error('❌ Error conectando a MongoDB Atlas:', err));

// ─── 4) RUTAS DE LA API ─────────────────────────────────────────────────

// 4.1) Crear una nueva rosa (POST /api/rosas)
app.post('/api/rosas', async (req, res) => {
  try {
    const { color, mensaje, remitente, intencion, imagen, video } = req.body;
    if (!color || !mensaje || !remitente || !intencion || !imagen) {
      return res.status(400).json({ success: false, error: 'Faltan datos obligatorios.' });
    }
    const nuevaRosa = new Rosa({ color, mensaje, remitente, intencion, imagen, video });
    await nuevaRosa.save();

    // Genero la URL final: /r.html?code=ABC123
    const urlFinal = `${req.protocol}://${req.get('host')}/r.html?code=${nuevaRosa.code}`;
    return res.json({ success: true, url: urlFinal });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, error: 'Error interno al crear la rosa.' });
  }
});

// 4.2) Leer una rosa por su código (GET /api/rosas/:code)
app.get('/api/rosas/:code', async (req, res) => {
  try {
    const { code } = req.params;
    const rosa = await Rosa.findOne({ code });
    if (!rosa) {
      return res.status(404).json({ success: false, error: 'Rosa no encontrada.' });
    }
    return res.json({
      success: true,
      data: {
        color: rosa.color,
        mensaje: rosa.mensaje,
        remitente: rosa.remitente,
        intencion: rosa.intencion,
        imagen: rosa.imagen,
        video: rosa.video,
        createdAt: rosa.createdAt
      }
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, error: 'Error al buscar la rosa.' });
  }
});

// ─── 5) Catch-all con un middleware en lugar de ruta inválida ─────────
//     Este bloque “agarra” cualquier petición que NO haya sido /api/rosas ni
//     un archivo estático, y devuelve index.html para que el frontend lo procese.
app.use((req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// ─── 6) Levantar el servidor ───────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});

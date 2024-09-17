const express = require('express');
const { port } = require('./config');
const userRoutes = require('./routes/userRoutes');
const protectedRoutes = require('./routes/protectedRoutes');

const app = express();
app.use(express.json());

// Cargar rutas
app.use('/api', userRoutes);
app.use('/api', protectedRoutes);

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor corriendo en el puerto ${port}`);
});
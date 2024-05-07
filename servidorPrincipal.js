const express = require('express'),
      server = express();

//incluir module path para manejar directorios
const path = require('path');
//incluir la clase de las rutas
const rutas = require(path.resolve('./src/rutas', 'index.js'));


server.use(rutas);
server.listen(4000);
console.log('servidor levantado en el puerto 4000');

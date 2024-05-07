const router = require('express').Router();

// Importar zona controller
const zonaController = require('../controllers/zona.controller');
//importar controlador para sincronizar
const sincronizarController = require('../controllers/sincronizar.controller');


// Ruta de prueba...
router.get('/test', (req, res) =>{
    
    res.json({
        ok: true,
        message: 'Funciona!!!!'
    });
});

// Ruta para agregar zona
router.post('/agregar-zona', zonaController.agregar);


// Ruta para quitar zona
router.delete('/quitar-zona/:id', zonaController.quitar);

// Ruta para quitar zona
router.post('/sincronizar/atu',sincronizarController.sincronizar);

module.exports = router;
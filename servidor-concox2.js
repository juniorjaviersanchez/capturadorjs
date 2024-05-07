// Requerir dependencia express
const express = require('express');
// Inicializa express
const app = express();
// Crear un servidor para socket.io
const server = require('http').createServer(app);
// Pasar el servidor a socket.io
const io = require('socket.io')(server);
// Morgan es modulo que permite ver las peticiones del cliente http
const morgan = require('morgan');
// Path es un modulo para manejar directorios en node
const path = require('path');

const concoxHandler = require('./src/clientes-tcp/concox-2-stream-hanlder');



// Middlewares
app.use(morgan('dev'));
app.use(express.urlencoded({extended: false}));
app.use(express.json());



// Rutas
app.use(require('./src/rutas/index'));




// Archivos estáticos
app.use(express.static(path.join(__dirname, './src/public')));


// Socket NameSpaces
const rastreoPorUnidad = io.of('/rastreo-por-unidad');
const rastreoPorFlota = io.of('/rastreo-por-flota');
const rastreoMultiple = io.of('/rastreo-multiple');

// Socket connections

// Conexion a socket rastreo por unidad
rastreoPorUnidad.on('connection', (socket) =>{
    
    console.log('Se unió un cliente socket.io', socket.id);
    
    // Suscribir al cliente con el imei
    socket.on('subscribe', (imei) => {

        socket.join(`imei-${imei}`);

        // Devolver el resultado de la suscripción
        socket.emit('subscribe-result', {
            ok: true,
            message: `Suscripción exitosa con el imei: ${imei}`
        });

         
    });


    // Quitar la suscripcion de la sala con el imei recibido
    socket.on('unsubscribe', (imei) =>{
        socket.leave(`imei-${imei}`);

        socket.emit('unsubscribe-result', {
            ok: true,
            message: `Saliste de la sala: imei-${imei}`
        });

    });

    // Cuando se desconecta del socket
    socket.on('disconnect', () =>{

        console.log(`Se desconectó un cliente socket.io: ${socket.id}`);
    });

});


// Conexion a socket rastreo por flota
rastreoPorFlota.on('connection', (socket) =>{

    console.log('Se unió un cliente socket.io', socket.id);
    
    // Suscribir al cliente con el ID de flota
    socket.on('subscribe', (flotaId) => {

        socket.join(`flota-${flotaId}`);

        // Devolver el resultado de la suscripción
        socket.emit('subscribe-result', {
            ok: true,
            message: `Suscripción exitosa con flota ID: ${flotaId}`
        });

 


    });


    // Quitar la suscripcion de la sala con el ID de flota
    socket.on('unsubscribe', (flotaId) =>{
        socket.leave(`flota-${flotaId}`);

        socket.emit('unsubscribe-result', {
            ok: true,
            message: `Saliste de la sala: flota-${flotaId}`
        });


    });

    // Cuando se desconecta del socket
    socket.on('disconnect', () =>{

        console.log(`Se desconectó un cliente socket.io: ${socket.id}`);
    });

});


// Conexion a socket rastreo multiple
rastreoMultiple.on('connection', (socket) =>{

    console.log('Se unió un cliente socket.io', socket.id);
    
    // Suscribir al cliente con el imei
    socket.on('subscribe', (imei) => {

        socket.join(`imei-${imei}`);

        // Devolver el resultado de la suscripción
        socket.emit('subscribe-result', {
            ok: true,
            message: `Suscripción exitosa con el imei: ${imei}`
        });

         
    });


    // Quitar la suscripcion de la sala con el imei recibido
    socket.on('unsubscribe', (imei) =>{
        socket.leave(`imei-${imei}`);

        socket.emit('unsubscribe-result', {
            ok: true,
            message: `Saliste de la sala: imei-${imei}`
        });

    });

    // Cuando se desconecta del socket
    socket.on('disconnect', () =>{

        console.log(`Se desconectó un cliente socket.io: ${socket.id}`);
    });
});

/**
 * 
 * @param {*} evento 
 * @param {*} data 
 * Función que permite manejar la sala por unidad
 */
const handleRastreoPorUnidad = (evento, data) =>{

    // Emitir eventos a la sala imei-{imei}
    rastreoPorUnidad.to(`imei-${data[0].imei}`).emit(evento, data);
}

/**
 * 
 * @param {*} evento 
 * @param {*} data 
 * Funcion que permite manejar la sala por flota
 */
const handleRastreoPorFlota = (evento, data) =>{

    // Emitir eventos a la sala flota-{flota_id}
    rastreoPorFlota.to(`flota-${data[0].flota_id}`).emit(evento, data);
}

/**
 * 
 * @param {*} evento 
 * @param {*} data 
 * Funcion que permite manejar la sala multiple
 */
const handleRastreoMultiple = (evento, data) =>{

    // Emitir a la sala con el imei bajo el namespace multiple
    rastreoMultiple.to(`ime-${data[0].imei}`).emit(evento, data);
}


// Escuchar eventos del servidor concox TCP
concoxHandler.on('data', (data) =>{

    // Parsea la data porque la original viene convertido en string
    let dataParse = JSON.parse(data);
 
    // Verifica si la propiedad alertas(arreglo) de  dataParse no tiene longitud
    if(dataParse.alertas.length === 0) return; // Detiene la ejecución

    
    // Itera el arreglo alertas
    dataParse.alertas.map(alerta =>{

        // Alerta es el nombre del evento que el socket.io cliente debe esperar de forma estática ejem: bateria_baja
        let evento = alerta;

        /**
         * ------------- EMITIR A LAS SALAS DE RASTREO POR UNIDAD -------------------
         */
        let imeiRoomExists = rastreoPorUnidad.adapter.rooms.hasOwnProperty(`imei-${dataParse[alerta][0].imei}`);
        if(imeiRoomExists){     
              
            handleRastreoPorUnidad(evento, dataParse[alerta]);
        }else{
            console.log(`No existe una sala para el imei ${dataParse[alerta][0].imei}`);
        }


        /**
         * -------------- EMITIR A LA SALAS DE RASTREO POR FLOTA -----------------
         */
        let flotaRoomExists = rastreoPorFlota.adapter.rooms.hasOwnProperty(`flota-${dataParse[alerta][0].flota_id}`);
        if(flotaRoomExists){

            handleRastreoPorFlota(evento, dataParse[alerta]);
        }


        /**
         * ------------- EMITIR A LAS SALAS DE RASTREO MULTIPLE -------------------
         */
        let imeiMultipleRoomExists = rastreoMultiple.adapter.rooms.hasOwnProperty(`imei-${dataParse[alerta][0].imei}`);
        if(imeiMultipleRoomExists){   

            handleRastreoMultiple(evento, dataParse[alerta]);
        }

    });
    

});



// Asignar un puerto al server y poner a escuchar
server.listen(3001, () =>{
    console.log('Server HTTP en el puerto 3001');
});

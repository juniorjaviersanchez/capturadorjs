// Incluir al modulo dotenv
require('dotenv').config();
// incluir modulo  net de Nodejs'.
const Net = require('net');
// incluir modulo  colores de Nodejs'.
var colors = require('colors');
//incluir modulo shortid para generar los id
const shortid = require('shortid');
//incluir modulo para gestionar los protocolos
const protocolo=require('./utilidades/protocolos');
//incluir module path para manejar directorios
const path = require('path');
//incluir la clase TCPSocket
const TCPSocket = require(path.resolve('./src', 'tcp-socket.js'));



// asignar el puerto por el cual se conectar
const config = {
    host: process.env.SKYPATROL_HOST,
    port: process.env.SKYPATROL_PORT,
    exclusive: true,
}


// Crea un set para almacenar sockets Cliente de tipo STREAM_HANDLER
const streamHandlers = new Set();

// Emitir data a los STREAM_HANDLER
streamHandlers.broadcast = function(data, except){
    for (let socket of this) {
        if (socket !== except) {

            socket.write(data);
        }
    }
}

// crear servidor TCP.
const server = new Net.Server();

// Cuando un cliente solicita una conexión con el servidor, el servidor crea un nuevo
// socket dedicado a este cliente.
server.on('connection', function(socket) {
    
    console.log('Se ha establecido una nueva conexión.'.green);

    //generar los id de seccion para cada cliente
    socket.id = shortid.generate();


    // El servidor también puede recibir datos del cliente leyendo desde su socket.
    socket.on('data', async function(data) {

        console.log('data recibida en la atu');
        console.log(data.toString());
        

    });

    // cliente finaliza la coneccion.
    socket.on('end', function() {
        console.log('Se desconectó un cliente');

        streamHandlers.delete(socket);
       
        //Intanciar clase TCPSocket
        tcpSocket  = new TCPSocket();

        //eliminar el tcpSocket de los registros
        tcpSocket.eliminar(socket.id);
    });

    socket.on('error', (err) => {

        console.log({ error: `Error en conexion ${err}` });
        socket.destroy(JSON.stringify({
            error: 'Conexion erronea',
            code: 500,
        }));

        socket.end();
    });
});



//El servidor escucha un socket para que un cliente haga una solicitud de conexión.
server.listen(config.port, () => {
    console.log(`El servidor esta encendido en localhost  puerto:${config.port}`.green);

});

// Reinicar server si el host o el puero ya está en uso
server.on('error', (err) => {

    if (err.code === 'EADDRINUSE') {

        console.log('Error: Es probable que el puerto esté uso - reconectando...');
        setTimeout(() => {
            server.close();
            server.listen(config);
        }, 5000);
    } else {
        console.log({ err: `Error de servidor ${err}` });
    }
});


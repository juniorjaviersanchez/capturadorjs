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
const util = require('util');
//Variable para socket de la atu
const cliente_atu =require(path.resolve('./src/clientes-atu', 'tcp-atu.js'));
//incluir la clase base de datos
const BaseDatosAtu = require(path.resolve('./src/db', 'base-datos-atu.js'));
//incluir la clase de operaciones
const operacion = require('./utilidades/operaciones');
//incluir la clase base de datos
const BaseDatos = require(path.resolve('./src/db', 'base-datos.js'));




// asignar el puerto por el cual se conectar
const config = {
    host: process.env.CONCOX_X3_HOST,
    port: process.env.CONCOX_X3_PORT,
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

    console.log('SocketId',socket.id);    

    // El servidor también puede recibir datos del cliente leyendo desde su socket.
    socket.on('data', async function(data) {

        // Esta variable permite verificar lo que envia el cliente al conectarse
        // Sirver para deternimar si el socket cliente es de tipo STREAM_HANDLER
        let verifyData = data.toString();
 
        // Verifica si el socket que envia la data es de tipo STREAM_HANDLER
        if(verifyData === 'SATELITE_PERU'){
            
            console.log('SATELITE_PERU CONECTADO'); 

        }else{

            console.log(`Data recibida desde el dispositivo gps: ${data.toString('hex')}`);
        
              
            try {
                let respuesta_servidor = await protocolo.GestionarProtocolo(data, socket);
                
                //iterar las respuesta del servidor
                respuesta_servidor.map(data_convertida => {   
                    //console.log('data_convertida:',data_convertida);
                    //console.log('trama recibida:');
                    //console.log(util.inspect(data_convertida, {depth: null}));

                    //verificar si existe alguna respuesta para el gps
                    if (data_convertida.respuestaGps!=null) {
                        //enviando respuesta al gps
                        socket.write(data_convertida.respuestaGps); 
                    }

                      /*                
                    //obtener la data para la atu
                    let data_atu = buscarDataAtu(data_convertida);
                   //intanciar clase de base de datos 
                    mysql  = new BaseDatosAtu();

                    //validar que exista data para la atu
                    if (data_atu) {
                        data_atu.map(atu =>{

                            //enviar data a la atu
                            cliente_atu.enviarData(atu);

                            //ENVIAR DATA A NUESTROS SERVIDORES
                            mysql.Insertar(atu);
                        });
                    }
                    */

                    // Emitir data a los sockets STREAM_HANDLER
                    streamHandlers.broadcast(JSON.stringify(data_convertida) , socket);
                });    

                

            } catch (error) {
                console.log('error al resolver la promesa',error);
            }
            
            
        }

    });

    // cliente finaliza la coneccion.
    socket.on('end', function() {
        console.log('Se desconectó un cliente');

        streamHandlers.delete(socket);

        let data= new Object();

        //Intanciar clase TCPSocket
        tcpSocket  = new TCPSocket();

        
        //buscar vehiculo por id de socket
        let vehiculo = tcpSocket.obtenerPorId(socket.id);    
    
        //obtener imei
        data.imei=vehiculo.imei_gps;
       
        //obtener imei
        data.fecha=operacion.obtenerFechaActual();

        //obtener estatus
        data.estatus=0;
        
        //obtener protocolo
        data_reset.estatus='X3';
               
        //obtener organizacion id
        data.organizacion_id=vehiculo.organizacion_id;
                  
        //obtener flota id
        data.flota_id=vehiculo.flota_id;
                         
        //obtener descripcion vehiculo
        data.description=vehiculo.vehiculo_placa;
       
        //obtener estatus señal gps
        data.estado_senial_gps=vehiculo.estado_vehiculo.estado_senial_gps;
        
        //intanciar clase de base de datos 
        mysql  = new BaseDatos();
        //enviar data a mysql
        mysql.InsertarReset(data);


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


function buscarDataAtu(data) {
    //validar que exista data
    if(data.alertas.includes('nueva_ubicacion') == false) return null; // Detiene la ejecución
    
    //variable para guardar data para enviar a la atu
    let data_atu=[];

        // Itera el arreglo alertas
        data.nueva_ubicacion.map(trama =>{
            if (trama.vehiculo_placa) {  
                data_atu.push({
                    Placa: trama.vehiculo_placa,
                    Latitud: trama.estado_vehiculo.latitud,
                    Longitud: trama.estado_vehiculo.longitud,
                    Velocidad: trama.estado_vehiculo.velocidad,
                    TimeStamp: trama.estado_vehiculo.fecha_evento
                });  
            }
    
        });



    return data_atu;

}

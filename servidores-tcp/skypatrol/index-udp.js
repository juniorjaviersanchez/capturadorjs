// Incluir al modulo dotenv
require('dotenv').config();
//modulo para conexiones udp
const dgram = require('dgram');

// incluir modulo  colores de Nodejs'.
var colors = require('colors');
//incluir modulo para gestionar los protocolos
const protocolo=require('./utilidades/protocolos');
//incluir module path para manejar directorios
const path = require('path');
//incluir la clase TCPSocket
const TCPSocket = require(path.resolve('./src', 'tcp-socket.js'));
//para mostrar en consola
const util = require('util')
//Variable para socket de la atu
const cliente_atu =require(path.resolve('./src/clientes-atu', 'tcp-atu.js'));
//incluir la clase base de datos
const BaseDatosAtu = require(path.resolve('./src/db', 'base-datos-atu.js'));

const server = dgram.createSocket('udp4');


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


server.on('error', (err) => {
  console.log(`server error:\n${err.stack}`);
  server.close();
});

server.on('message', async (data, info) => {
        
    console.log(`Data recibida desde el dispositivo gps: ${data.toString('hex')}`);    

    try {
        let respuesta_servidor = await protocolo.GestionarProtocolo(data);
        
        //iterar las respuesta del servidor
        respuesta_servidor.map(data_convertida => {   
            //console.log('data_convertida:',data_convertida);
          //  console.log('trama recibida:',data_convertida);
          //  console.log('trama recibida:',util.inspect(data_convertida, {showHidden: false, depth: null, colorize:true}));

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
 
        });    

        

    } catch (error) {
        console.log('error al resolver la promesa',error);
    }
        
        
    

});

server.on('listening', () => {
    const address = server.address();
      console.log(`El servidor esta encendido en ${address.address}  puerto:${address.port}`.green);
  
});


server.on('close', () => {
 
    console.log(`El servidor fue apagado`);

});


server.on('connect', () => {
 
    console.log(`un nuevo cliente se a conectado en el servidor`);

});

 
server.bind({
    address: process.env.SKYPATROL_HOST,
    port:  process.env.SKYPATROL_PORT,
    exclusive: true
  });

  
/**
 * METODO PARA CONVERTIR A LA DATA QUE SE LE ENVIARA A LA ATU
 */
function buscarDataAtu(data) {
    //validar que exista data
    if(data.alertas==null){
        return;
    }
    
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
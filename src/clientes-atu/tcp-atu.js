require('dotenv').config();
var net = require('net');

const client = new net.Socket({
    readable: true,
    writable: true,
});
const config = {
    host: process.env.HOST_ATU,
    port: process.env.PORT_ATU,
    exclusive: true,
}

// constante nombre que identifica al socket
// Esto serive para determinar la escucha de data de otros sockets que no tenga este nombre
const SOCKET_NAME = 'SATELITE_PERU';
let DATA_ENVIAR = 'DATA_ENVIAR';

//variable par
let coneccion = false;

//Funciones para manejar eventos de clientes
// conneccion
function hacerConneccion(data) {
    DATA_ENVIAR=data;

    //verificar si ya existe una coneccion con la atu
    if (coneccion) {
        //si la coneccion existe sole se envia la data
        conectarControladorEventos()
    }else{
        //al no existir la coneccion se realiza la coneccion con la atu
        //y una vez conectado se envia la data atravez del evento connect
        client.connect(config.port, config.host);
        coneccion = true
    }
}

/* metodo encargado de realizar el envio de data a la atu */
function conectarControladorEventos() {
   
    console.log(`Enviando al server TCP ATU en el puerto: ${config.port} del servidor: ${config.host}`);
 
    client.write(JSON.stringify(DATA_ENVIAR)+'\n');
    //client.end()
    //coneccion=false;

}

/** controlar los errores para detectar cuando el socket se desconecta */
function ControladorEventosErors(e) {
    console.log(`Error al conectar al server TCP ATU ${e.code}`);
    coneccion=false;
}
  
/** cerrar la coneccion del socket cuando se genere el evento close */
function cerrarControladorEventos() {

    console.log('Se cerró el server TCP ATU');
    coneccion = false;
 
}
  
 // Escuchando eventos
client.on('connect', conectarControladorEventos);
client.on('error', ControladorEventosErors);
client.on('close', cerrarControladorEventos);
 

 
exports.enviarData=hacerConneccion;

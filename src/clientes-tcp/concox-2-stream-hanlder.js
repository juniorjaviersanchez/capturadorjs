// Incluir al modulo dotenv
require('dotenv').config();
const net = require('net');
const client = new net.Socket({
    readable: true,
    writable: true,
});
const config = {
    host: process.env.CONCOX2_HOST,
    port: process.env.CONCOX2_PORT,
    exclusive: true,
}

// constante nombre que identifica al socket
// Esto serive para determinar la escucha de data de otros sockets que no tenga este nombre
const SOCKET_NAME = 'STREAM_HANDLER';

const timeout = 3000;
let retrying = false;
// Functions to handle client events
// connector
function makeConnection() {
  client.connect(config.port, config.host);
}

function connectEventHandler() {

  console.log({
    port: client.remotePort,
    host: client.remoteAddress,
  }, 'Conectado al server TCP Concox # 02');

  client.write(SOCKET_NAME);

  retrying = false;
}

function errorEventHandler(e) {
  console.log(`Error al conectar al server TCP Concox # 02 ${e.code}`);
  if (!retrying) {
    retrying = true;
  }
  setTimeout(makeConnection, timeout);
}

function closeEventHandler() {

  if (retrying) return false;

  console.log('Se cerró el server TCP Concox # 02');
  console.log(`Reconectando en... ${timeout / 1000} Segundos`);

  if (!retrying) {
    retrying = true;
  }

  return setTimeout(makeConnection, timeout);
}

// Escuchando eventos
client.on('connect', connectEventHandler);
client.on('error', errorEventHandler);
client.on('close', closeEventHandler);



// Conectando al socket TCP server
console.log('***** Connectando al server TCP Concox ******');
makeConnection();

module.exports = client;

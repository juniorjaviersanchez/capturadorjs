// Incluir al modulo dotenv
require('dotenv').config();
//incluir module path para manejar directorios
const path = require('path');
//incluir cron de node
var cron = require('node-cron');
//incluir la clase db para las conecciones a base de datos
const BaseDatosGps = require(path.resolve('./src/db', 'db-api.js'));
//incluir la clase base de datos
const BaseDatos = require(path.resolve('./src/db', 'base-datos.js'));
//incluir modulo para gestionar los protocolos
const protocolo=require(path.resolve('./web-service/tramas-gps/utilidades', 'protocolos.js'));

iniciar();

async function iniciar() {

    //intanciar clase de base de datos 
    //mysql mibus
    mysql  = new BaseDatos();
    //mysql servidar 2
    mysql_gps = new BaseDatosGps();

    try {
        
        //buscar listado de vehiculos
        let vehiculos = await mysql.buscarVehiculos();
          
       console.log('comenzando busqueda');
        //recorrer todos los vehiculos
        await asyncForEach(vehiculos, async (vehiculo) => {
             console.log('buscando historico'+vehiculo.placa);
            //buscar la data en la plataforma de gps
            let trama_vehiculo = await mysql.buscarHistorialVehiculo(vehiculo.imeil, vehiculo.cuenta_id, '2020-11-12 00:00:00', '2020-11-12 23:59:00');
            
            if (trama_vehiculo.length) { 
                console.log('gestionando');
                    //gestionar la trama 
                    await protocolo.GestionarProtocolo(trama_vehiculo, vehiculo);
                
                

            }
                
        });
        console.log('Busqueda Finalizada');

        
    } catch (error) {
        console.log('error al resolver la promesa',error);
    }
    
}


async function asyncForEach(array, callback) {
    for (let index = 0; index < array.length; index++) {
      await callback(array[index], index, array);
    }
}


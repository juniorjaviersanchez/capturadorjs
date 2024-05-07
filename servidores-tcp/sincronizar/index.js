// Incluir al modulo dotenv
require('dotenv').config();
  
//incluir module path para manejar directorios
const path = require('path');
//incluir la clase TCPSocket
const util = require('util');
//Variable para socket de la atu
const cliente_atu =require(path.resolve('./src/clientes-atu', 'tcp-atu.js'));
//incluir la clase base de datos
const BaseDatosAtu = require(path.resolve('./src/db', 'base-datos-atu.js'));

 
seleccionarDataSincronizar();

async function seleccionarDataSincronizar() {
    let autos=
    [
        'A7B-743',
        'A4J-702',
        'C0Q-781',
        'A0L-727',
        'A5D-720',
        'Y1S-829'
];


    let fecha_inicial='2020-11-03 00:00:00';
    let fecha_final  ='2020-11-04 23:59:00';
    //intanciar clase de base de datos 
    mysql  = new BaseDatosAtu(); 
    for (let i = 0; i < autos.length; i++) {
        console.log('consultando registros del vehiculo '+autos[i]+'==>'+i);
        
        let data_respuesta = await mysql.consultar(fecha_inicial,fecha_final,autos[i]);
        let data_atu = buscarDataAtu(data_respuesta);
        
        console.log(`enviando ==>${data_atu.length}<== registros a la atu del vehiculo ....${autos[i]}`);
      
        //validar que exista data para la atu
        if (data_atu) {
            //enviar data a la atu
            cliente_atu.enviarData(data_atu);
        }
        
    }

}
 
 


function buscarDataAtu(data) {
 
    //variable para guardar data para enviar a la atu
    let data_atu=[];

        // Itera el arreglo alertas
        data.map(trama =>{
                 data_atu.push({
                    Placa: trama.Placa,
                    Latitud: trama.Latitud,
                    Longitud: trama.Longitud,
                    Velocidad: trama.Velocidad,
                    TimeStamp: trama.TimeStamp
                });  
            
    
        });



    return data_atu;

}

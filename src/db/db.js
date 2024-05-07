/**
 * metodos que requieran conectarse a la base de datos
 * 
 */

//incluir module path para manejar directorios
const path = require('path');

// Incluir configuraciones del proyecto
const config = require(path.resolve('./', 'config.js'));

//incluir la clase base de datos
const BaseDatos = require(path.resolve('./src/db', 'base-datos.js'));

//incluir la clase de respaldo local 
const respaldo = require(path.resolve('./src/respaldo', 'respaldo.js'));

const fs = require('fs');

//se trabajara con insert masivos 
//para ello se declara un array 
let data_enviar=[]
//variable que manejara la cantidad de insert a enviar
let cant_data=0;

 /**
  * metodo para buscar vehiculo
  * @param {*} imei 
  */
function buscarVehiculo(imei) {


    return new Promise((resolve, reject) =>{

        config.laravelAPI.get('buscar-vehiculo', {
        params: {
            imei: imei
        }
      })
      .then(function (response) {

        resolve(response.data);

      })
      .catch(function (error) {
       
        reject(error);
      });
      
      
    });

}

function actualizarEstatusVehiculo(data) {


  return new Promise((resolve, reject) =>{
      resolve(true);
      
      config.laravelAPI.post('actualizar-estado-vehiculo', data).then(function (respuesta) {
      
      resolve(respuesta);

    })
    .catch(function (error) {
     
      reject(error);
    });
    
    
  });

}

/**
 * metodo para actualizar voltaje del vehiculo
 * @param {*} imei 
 * @param {*} voltaje 
 */
function actualizarVoltajeVehiculo(vehiculo_id, voltaje) {


  return new Promise((resolve, reject) =>{

      config.laravelAPI.post('actualizar-voltaje-vehiculo', {vehiculo_id,voltaje}).then(function (respuesta) {
      console.log(respuesta.data);
      resolve(respuesta);

    })
    .catch(function (error) {
     
      reject(error);
    });
    
    
  });

}


function insertarNuevaUbicacion(data) {
  
  //si es un punto de geozona se le envia por http a laravel
  if (data.estado_vehiculo.estado_gps_id > 3104 &&  data.estado_vehiculo.estado_gps_id <3108 ) {
    //validar que sea diferente al punto dentro de geozona
    if (data.estado_vehiculo.estado_gps_id!=3107) {
      
      return new Promise((resolve, reject) =>{
        
        config.laravelAPI.post('insertar-nueva-ubicacion', data).then(function (respuesta) {
          console.log(respuesta.data);
          
          
          resolve(respuesta);
          
        })
        .catch(function (error) {
          
          
          
          reject(error);
        });
        
        
      });
    }
  }

  //si es un punto de comun se inserta directamente a la base de datos
  //este inser se manejara con inser masivos para ello validamos que existan la cantidad esprada
  //agregar data 
  data_enviar.push(data);
  if (data_enviar.length>=cant_data) {
    
    //enviar la clase que se encarga de insertart en la base de datos
    return new Promise((resolve, reject) => {
      
      //intanciar clase de base de datos 
      mysql  = new BaseDatos();
      //enviar data a mysql
      mysql.Insertar(data_enviar);
      //enviar data a respaldo local
      //respaldo.insertarRegistro(data_enviar);
      //se vuelve a inicializar el arreglo de sincronizacion
      data_enviar = [];
      resolve(true);
    });
  
  }




}

function gestionarFrecuencia(data) {
 

  return new Promise((resolve, reject) =>{

      config.laravelAPI.get('gestionarFrecuencia',  {
        params: data
      }).then(function (respuesta) {
        
        
       
      resolve(respuesta);
        

    })
    .catch(function (error) {

      reject(error);
    });
  });
  
 
 
}

/**
 * 
 * @param {*} flotaId 
 * Funcion para buscar zona en la base de datos 
 */
const buscarZonas = async(flotaId) =>{
    
  let zonasLocales = [];
  try {

      // Asignar zonasLocales desde un archivo JSON
      zonasLocales = require('./zonas-locales.json');
      
  } catch (error) {
      // Si el archivo JSON no contiene registro, entonces el arreglo será vaccio
      zonasLocales = [];
  }
  let zonasEncontradas;
  // Verificar la longitud de zonasEncontradas
  if(zonasLocales.length == 0){

      // Si la condicion es verdadero quiere decir que no se encontro zonas localmente.
      // Entonces buscar en la API de laravel
      let status = 1;
      let response = await config.laravelAPI.get(`obtener-zonas/${status}`);

      //console.log('Modo zonas encontradas: API Laravel');

      // Asignar zonasEncontradas a partir de la respuesta de la api
      zonasEncontradas = response.data;

      // Agregar cada zona en arreglo en zonasLocales
      zonasEncontradas.map(zona =>{
          zonasLocales.push(zona);
      });

      // Escribir en el archivo JSON
      fs.writeFile('src/db/zonas-locales.json', JSON.stringify(zonasLocales), (err) =>{
          if (err) throw err;
          //console.log('Se guardó las zonas en el archivo local');
      });

      // Retornar zonasEncontradas en API
     // return zonasEncontradas;
  }

   
    // Filtrar la zonas en el arreglo zonasLocales mediante el id_empresa
    zonasEncontradas = zonasLocales.filter(zona =>{
      return zona.flota_id === flotaId;
    });


    
  //console.log('Modo zonas encontradas: Localmente');
  // Retornar zonasEncontradas localmente
  return zonasEncontradas;

}


exports.buscarVehiculo=buscarVehiculo;
exports.actualizarEstatusVehiculo=actualizarEstatusVehiculo;
exports.insertarNuevaUbicacion=insertarNuevaUbicacion;
exports.buscarZonas=buscarZonas;
exports.actualizarVoltajeVehiculo=actualizarVoltajeVehiculo;
exports.gestionarFrecuencia=gestionarFrecuencia;

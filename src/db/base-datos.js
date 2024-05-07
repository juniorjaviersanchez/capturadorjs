const mysql = require('mysql');
require('dotenv').config();

var connection = mysql.createPool({
   connectionLimit : 20,
   host:  process.env.DB_HOST,
   user:  process.env.DB_USERNAME,
   password:  process.env.DB_PASSWORD,
   database:  process.env.DB_DATABASE,
   port:  process.env.DB_PORT,
   
});

//inicializar arreglo para guardar insert
let values_insertar_api = [];

let estadosAlertas = [61722,62465,62467,62549,62673,63553,63601,63602,64784,64787,64789,64790,64791,64792,64793,64794,64795,64796,64797,64800,64801];
 
class BaseDatos{

   Insertar(dataValue){
         //validar que la latitud sea distinta a 0
         if (dataValue[0].estado_vehiculo.latitud!=0) {
            //validar que la fecha no sea una fecha futura
            //si la fecha es valida la funcion devolvera true
            if (this.validarFechaFutura(dataValue[0].estado_vehiculo.fecha_evento)) {
               
               //declaracion de consulta para inser normal
               let sql ="INSERT IGNORE INTO eventosgps (auto_imeil, fecha, latitud, longitud, velocidad, altitud, direccion, MCC, MNC, ALC, Cell_ID, variacion_grados, cantidad_satelite, variacion_magneticaGps, codigo_estado, id_empresa, status) VALUES ?";
               //declaracion de consulta para inser de alertas
               let sql_alertas ="INSERT IGNORE INTO eventosSeguimiento (auto_imeil, fecha, latitud, longitud, velocidad, altitud, direccion, MCC, MNC, ALC, Cell_ID, variacion_grados, cantidad_satelite, variacion_magneticaGps, codigo_estado, id_empresa, status) VALUES ?";
               
               
               
               //inicializar arreglo para guardar insert
               let values = [];
               let values_alertas = [];
               
               //mapear todos los insert que llegan
               dataValue.map(data =>{
                  //validar si la data posee una alerta 
                  if (estadosAlertas.includes(data.estado_vehiculo.estado_gps_id) ) {
                     //insertar la data al arreglo de valores
                     values_alertas.push(this.llenarValue(data));   
                  }
                  //insertar la data al arreglo de valores
                  values.push(this.llenarValue(data));
               });
               
               //insertar la data normal
               connection.query(sql, [values], function (error, results) {
                  if (error) throw error;
                  console.log('se inserto la data');
               });
               
               //validar si existe algun dato de alerta
               if (values_alertas.length>0) {
                  
                  //insertar la data de alertas 
                  connection.query(sql_alertas, [values_alertas], function (error, results) {
                     if (error) throw error;
                     console.log('se inserto la data de alertas');
                  });  
               }
            }
      }
          
   }

   //metodo encargado de retornar un arreglo
   llenarValue(data){
   
      return [
         data.imei,
         data.estado_vehiculo.fecha_evento,
         data.estado_vehiculo.latitud,
         data.estado_vehiculo.longitud,
         data.estado_vehiculo.velocidad,
         data.estado_vehiculo.altitud,
         data.direccion,
         data.MCC,
         data.MNC, 
         data.LAC,
         data.Cell_ID,
         data.estado_vehiculo.variacion_grados,
         data.cantidad_satelite,
         data.estado_vehiculo.variacion_magneticaGps ,
         data.estado_vehiculo.estado_gps_id,
         data.organizacion_id,
         1
       ];

   }

   //insertar en mysql cuando se recibe del api
   InsertarApi(dataValue){
        
      //declaracion de consulta para inser normal
      let sql ="INSERT IGNORE INTO eventosgps2 (auto_imeil, fecha, latitud, longitud, velocidad, altitud, direccion, MCC, MNC, ALC, Cell_ID, variacion_grados, cantidad_satelite, variacion_magneticaGps, codigo_estado, id_empresa, status) VALUES ?";
      //declaracion de consulta para inser de alertas
      //let sql_alertas ="INSERT IGNORE INTO eventosSeguimiento (auto_imeil, fecha, latitud, longitud, velocidad, altitud, direccion, MCC, MNC, ALC, Cell_ID, variacion_grados, cantidad_satelite, variacion_magneticaGps, codigo_estado, id_empresa, status) VALUES ?";
 

      values_insertar_api.push(this.llenarValueApi(dataValue));


      //contar para saber cuanta data hay
      if (values_insertar_api.length >=10) {
         //insertar la data al arreglo de valores
         values_insertar_api.push(this.llenarValueApi(dataValue));
         
         //insertar la data normal
         connection.query(sql, [values_insertar_api], function (error, results) {
         if (error) throw error;
            console.log('se inserto la data de 20 registros');
            values_insertar_api = [];

         });
         
      }
 
    
    
 
 
      //limpiar data
      let sql_limpiar = `DELETE FROM eventosgps WHERE id IN (select id from (select id FROM eventosgps  WHERE auto_imeil = ${dataValue.imei}  ORDER BY fecha DESC  LIMIT 10, 1) x)`;
    /*  connection.query(sql_limpiar, function (error, results) {
         if (error) throw error;
            //console.log('se inserto la data');
      });
   */

       
   }
   //insertar en mysql cuando se recibe del api
   InsertarApiAlerta(dataValue){
        
      //declaracion de consulta para inser normal
      let sql ="INSERT IGNORE INTO eventosgps (auto_imeil, fecha, latitud, longitud, velocidad, altitud, direccion, MCC, MNC, ALC, Cell_ID, variacion_grados, cantidad_satelite, variacion_magneticaGps, codigo_estado, id_empresa, status) VALUES ?";
      //declaracion de consulta para inser de alertas
      let sql_alertas ="INSERT IGNORE INTO eventosSeguimiento (auto_imeil, fecha, latitud, longitud, velocidad, altitud, direccion, MCC, MNC, ALC, Cell_ID, variacion_grados, cantidad_satelite, variacion_magneticaGps, codigo_estado, id_empresa, status) VALUES ?";
      
      //inicializar arreglo para guardar insert
      let values = [];
 
      //insertar la data al arreglo de valores
      values.push(this.llenarValueApi(dataValue));
  
      //insertar la data normal
      connection.query(sql, [values], function (error, results) {
         if (error) throw error;
            //console.log('se inserto la data');
      });

      //insertar la data de alertas 
      connection.query(sql_alertas, [values], function (error, results) {
         if (error) throw error;
            //console.log('se inserto la data de alertas');
      });  
       
   }
   //insertar en mysql cuando se recibe del api
   InsertarApiAlertaGeozona(dataValue){
      
       //declaracion de consulta para inser de alertas
      let sql_alertas ="INSERT IGNORE INTO reporteria_geozona (auto_imeil, id_geozona, nombre_geozona, condicion, vehiculo_id, fecha, latitud, longitud, velocidad, altitud, direccion, MCC, MNC, ALC, Cell_ID, variacion_grados, cantidad_satelite, variacion_magneticaGps, codigo_estado, id_empresa,flota_id,  status) VALUES ?";
      
      //inicializar arreglo para guardar insert
      let values = [];
   
      //insertar la data al arreglo de valores
      values.push(this.llenarValueApiGeozona(dataValue));
   
      //insertar la data normal
      connection.query(sql_alertas, [values], function (error, results) {
         if (error) throw error;
            console.log('se inserto la data');

      });
     

         
   }
   //metodo encargado de retornar un arreglo
   llenarValueApi(data){
      return [
         data.imei,
         data.fecha_evento,
         data.latitud,
         data.longitud,
         data.velocidad,
         data.altitud,
         data.direccion,
         data.MCC ,
         data.MNC , 
         data.LAC,
         data.Cell_ID ,
         data.variacion_grados ,
         data.cantidad_satelite ,
         data.variacion_magnetica,
         data.estado_gps_id,
         data.organizacion_id,
         1
         ];

   }

   //metodo encargado de retornar un arreglo
   llenarValueApiGeozona(data){
           
      return [
         data.imei,
         data.geozona,
         data.nombre_geozona,
         data.condicion_geozona,
         data.vehiculo_id,
         data.fecha_evento,
         data.latitud,
         data.longitud,
         data.velocidad,
         data.altitud,
         data.direccion,
         data.MCC ,
         data.MNC , 
         data.LAC,
         data.Cell_ID ,
         data.variacion_grados ,
         data.cantidad_satelite ,
         data.variacion_magnetica,
         data.estado_gps_id,
         data.organizacion_id,
         data.flota_id,
         1
         ];

   }

   //metodo encargado de actualizar el vehiculo
   actualizarVehiculo(data){

      //declaracion de consulta para inser normal
      let sql =`UPDATE autos SET 
               fecha  = '${data.fecha_evento}',
               latitud =${data.latitud} ,
               longitud=${data.longitud} ,
               velocidad=${data.velocidad},
               codigo_estado=${data.estado_gps_id},
               ACC=${data.ACC},
               bateriaCar=${data.bateriaCar},
               senialGSM1=${data.senialGSM1},
               nivelVoltaje=${data.nivelVoltaje},
               geozona=${data.geozona},
               fecha_geo='${data.fecha_geo}'
               WHERE 
               id_vehiculo  = ${data.vehiculo_id} `;
    
    
      //modificando la data
      connection.query(sql,  function (error, results) {
         if (error) throw error;
            console.log(`se modifico la data`);
      });
       
   }
   //metodo encargado de actualizar el vehiculo
   actualizarKilometraje(data){

      //declaracion de consulta para inser normal
      let sql =`UPDATE autos SET 
               kilometraje_acum='${data.kilometraje}',
               fecha_kilometraje_acum='${data.fecha_kilometraje}'
               WHERE 
               id_vehiculo  = ${data.vehiculo_id} `;
    
    
      //modificando la data
      connection.query(sql,  function (error, results) {
         if (error) throw error;
           // console.log('se modifico la data');
      });
       
   }
   //metodo encargado de buscar vehiculos
   async buscarVehiculos(){
      //declaracion de consulta para  seleccionar los vehiculos
      let sql_querry =`SELECT * FROM autos WHERE cuenta_id=28`;
      
      return new Promise((resolve, reject) => {
         
         //seleccionar vehiculos
         connection.query(sql_querry,  function (error, results) {
            if (error) throw reject(error);
               resolve(results);
         });  
      });
      
   }

   //metodo encargado de buscar relojes
   async buscarRelojes(flota_id, empresa_id){
      //declaracion de consulta para  seleccionar los vehiculos
      let sql_querry =`SELECT * FROM relojes WHERE flota_id=${flota_id} and  empresa_id = ${empresa_id} and estatus=1`;
      
      return new Promise((resolve, reject) => {
         
         //seleccionar vehiculos
         connection.query(sql_querry,  function (error, results) {
            if (error) throw reject(error);
               resolve(results);
         });  
      });
      
   }
   //metodo encargado de buscar geozonas
   async buscarGeozonas(flota_id, empresa_id){
      //declaracion de consulta para  seleccionar los vehiculos
      let sql_querry =`SELECT * FROM geozona WHERE flota_id=${flota_id} and  id_empresa = ${empresa_id} and status=1`;
      
      return new Promise((resolve, reject) => {
         
         //seleccionar vehiculos
         connection.query(sql_querry,  function (error, results) {
            if (error) throw reject(error);
               resolve(results);
         });  
      });
      
   }

   //metodo encargado de buscar geozonas
   async buscarHistorialVehiculo(auto_imeil, empresa_id, fecha1, fecha2){
      //declaracion de consulta para  seleccionar los vehiculos
      let sql_querry =`call buscar_historial('${empresa_id}','${auto_imeil}','${fecha1}','${fecha2}')`;

      return new Promise((resolve, reject) => {
         
         //seleccionar vehiculos
         connection.query(sql_querry,  function (error, results) {
            if (error) throw  reject(error);
             
               resolve(results);
         });  
      });
      
   }

   /**
    * metodo encargado de insertar cada vez que se reinicia el gps
    * @param {3} dataValue 
    */
   InsertarReset(dataValue){
        
      //declaracion de consulta para inser normal
      let sql =`INSERT INTO gps_reinicio (imei, empresa_id, flota_id, fecha, estado_senial_gps,protocolo,descripcion_vehiculo, estatus) VALUES ( ${dataValue.imei},${dataValue.organizacion_id},${dataValue.flota_id},  '${dataValue.fecha}',  ${dataValue.estado_senial_gps},  '${dataValue.protocolo}', '${dataValue.description}', ${dataValue.estatus})`;
 
      //insertar la data normal
      connection.query(sql, function (error, results) {
         if (error) throw error;
            console.log('se inserto la data');
      });

       
   }

   /**
    * metodo para validar que la fecha no sea futura 
    * si la fecha no es futura devolvera true
    * @param {*} fecha_evento 
    */
   validarFechaFutura(fecha_evento){

      //fecha actual
      var fecha_actual = new Date().getTime();
      //fecha convertida
      let fecha_convertida = new Date(fecha_evento).getTime();
      //validar que la fecha no sea mayor a la actual
      if (fecha_convertida>fecha_actual) {
         
         return null;

      }else{
         

         return true;
      }
   }

}
module.exports = BaseDatos;
/**
 * metodos que requieran conectarse a la base de datos
 * 
 */
var moment = require('moment'); // require

const mysql = require('mysql');
require('dotenv').config();

var connection = mysql.createPool({
   connectionLimit : 20,
   host:  process.env.GPS_DB_HOST,
   user:  process.env.GPS_DB_USERNAME,
   password:  process.env.GPS_DB_PASSWORD,
   database:  process.env.GPS_DB_DATABASE,
   port:  process.env.GPS_DB_PORT,
   
});



/**
 * metodo para buscar data del vehiculo
 * @param {*} imei 
 */
class BaseDatosGps{

    //metodo encargado de buscar vehiculos
    async buscarTramaVehiculo(imei, ultima_fecha){
 

      //declaracion de consulta para  seleccionar los vehiculos
      let sql_querry =`SELECT imei FROM gs_objects WHERE imei=${imei} limit 1`;

      //declaracion de consulta para  seleccionar los eventos del vehiculos
      let sql_querry_eventos =`SELECT * FROM gs_object_data_${imei} WHERE dt_tracker>'${this.formatDate(ultima_fecha)}' order by dt_tracker asc limit 50`;
      return new Promise((resolve, reject) => {
         
         //seleccionar vehiculos
         connection.query(sql_querry,  function (error, results) {
            if (error) throw error;
               //validar que exista data
              
               if(results.length==0){ 
                  //RESOLVER PROMESA
                  resolve(results);
               }else{
                 
                  //consultar los ultimos movimientos
                  connection.query(sql_querry_eventos,  function (error_eventos, results_eventos) {
                     if (error_eventos) throw error_eventos;
                        // console.log('buscando data');

                        //RESOLVER PROMESA
                        resolve(results_eventos);
                  });  
               }

              
             
         });  
      });
      
   }

   formatDate(date) {
      //OBTENER EL INSTANTE DE HOY
      let fecha= moment(new Date(date));

 
      //AGREGAR UN STRING CON EL FORMATO DEL TIEMPO QUE QUEREMOS SUMAR
     // let sumar_horas="05:00:00";

      //HACEMOS LA SUMA
     // fecha.add(moment.duration(sumar_horas));
 
      return fecha.format('YYYY-MM-DD HH:mm:ss');

   }
}
  

 
module.exports = BaseDatosGps;
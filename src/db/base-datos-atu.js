const mysql = require('mysql');
require('dotenv').config();

var connection = mysql.createPool({
   connectionLimit : 20,
   host:  process.env.DB_HOST,
   user:  process.env.DB_USERNAME,
   password:  process.env.DB_PASSWORD,
   database:  process.env.DB_DATABASE,
   port:  process.env.DB_PORT
   
});
 
 
class BaseDatosAtu{

      Insertar(dataValue){
        
         //declaracion de consulta para inser normal
         let sql ="INSERT IGNORE INTO eventos (Placa, Latitud, Longitud, Velocidad, TimeStamp) VALUES ?";
 
         
         
         //inicializar arreglo para guardar insert
         let values = [];
 
          
        //insertar la data al arreglo de valores
        values.push(this.llenarValue(dataValue));
/*          
         //insertar la data normal
         connection.query(sql, [values], function (error, results) {
            if (error) throw error;
             //  console.log('se inserto la data');
         }); */

 
          
   }

   consultar(fecha_inicial, fecha_final,placa){
      return new Promise((resolve, reject) => {
         //declaracion de consulta para inser normal
         let sql =`SELECT * FROM eventos_atu Where TimeStamp>='${fecha_inicial}' and TimeStamp<='${fecha_final}' and placa='${placa}'`;
    
         //insertar la data normal
         connection.query(sql, function (error, results) {
            if (error) throw error;
            resolve(results);
         });
         
      });

 
   }

   

   //metodo encargado de retornar un arreglo
   llenarValue(data){
      return [
            data.Placa, 
            data.Latitud, 
            data.Longitud, 
            data.Velocidad, 
            data.TimeStamp
         
       ];

   }
}



module.exports = BaseDatosAtu;
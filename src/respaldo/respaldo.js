/**
 * metodos que requieran conectarse a la base de datos
 * 
 */

//incluir module path para manejar directorios
const path = require('path');
const fs = require('fs');


/**
 * metodo encargado de guardar la data de los log en 
 * los archivos json
 * @param {*} data 
 * @param {*} capturador 
 */

function insertarRegistro(data_recibida) {
    //abjeto por defaul
    var obj = {
            table: []
        };
    return;
    let fecha = new Date();
    let fecha_actual = `${fecha.getDate()}-${fecha.getMonth() +1}-${fecha.getFullYear()}`;
    //variable para nombre del archivo
    let nombre_archivo = `respaldo-${fecha_actual}.json`;

    //validar si el archivo existe
    fs.exists(`src/respaldo/archivos/${nombre_archivo}`, function(exists){
        //existe
        if(exists){
            fs.readFile(`src/respaldo/archivos/${nombre_archivo}`, 'utf8', function readFileCallback(err, data){
                if (err){
                    console.log(err);
                } else {
                    //convirtiendo el objeto a json
                    obj = JSON.parse(data);
                    //iterar la nueva data a guardar
                    data_recibida.map(trama =>{
                          
                        //agregando la data al objeto
                        obj.table.push(llenarValue(trama));
                    });
                    //se convierte el json a string
                    var json = JSON.stringify(obj);
                    //escribiendo el archivo
                    //escribiendo el archivo
                    fs.writeFile(`src/respaldo/archivos/${nombre_archivo}`, json, (err) =>{
                        if (err) throw err;
                        //console.log('Se guardó en el archivo local');
                    });
                }
            });

        }else{
            //no existe
              //iterar la nueva data a guardar
              data_recibida.map(trama =>{
                          
                //agregando la data al objeto
                obj.table.push(llenarValue(trama));
            });
            //se convierte el json a string
            var json = JSON.stringify(obj);
            //escribiendo el archivo
            fs.writeFile(`src/respaldo/archivos/${nombre_archivo}`, json, (err) =>{
                if (err) throw err;
                //console.log('Se creo el archivo local');
            });
         }

        
    });

}  

function llenarValue(data) {
    return [
        data.imei,
        data.estado_vehiculo.fecha_evento,
        data.estado_vehiculo.latitud,
        data.estado_vehiculo.longitud,
        data.estado_vehiculo.velocidad,
        0,
        data.estado_vehiculo.direccion,
        data.MCC != 'undefined' ? data.MCC : 0,
        data.MNC != 'undefined' ? data.MNC :0, 
        data.LAC != 'undefined' ? data.LAC : 0,
        data.Cell_ID != 'undefined' ? data.Cell_ID : 0,
        data.estado_vehiculo.variacion_grados != 'undefined' ?data.estado_vehiculo.variacion_grados : 0,
        data.estado_vehiculo.cantidad_satelite != 'undefined' ? data.estado_vehiculo.cantidad_satelite : 0,
        data.estado_vehiculo.variacion_magnetica != 'undefined' ? data.estado_vehiculo.variacion_magnetica :0,
        data.estado_vehiculo.estado_gps_id,
        data.organizacion_id,
        1
      ];
}
 
exports.insertarRegistro=insertarRegistro;

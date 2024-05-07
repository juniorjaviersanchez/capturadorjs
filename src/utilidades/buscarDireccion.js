
// incluir modulo axios de Nodejs'.
const axios = require('axios');

const url_direcciones='http://138.68.56.41/nominatim/reverse.php';

/**
 * metodo para convertir cordenadas en direccion
 * @param {*} lat 
 * @param {*} long 
 */
function buscarDireccion(lat, long) {
    return new Promise((resolve, reject) =>{
        axios.get(url_direcciones, {
        params: {
            format: 'json',
            limit: 1,
            lat:lat,
            lon:long
        }
      })
      .then(function (response) {

        if (response.data.display_name) {
            
            resolve(response.data.display_name);
        }else{
            resolve(' ');

        }

      })
      .catch(function (error) {
       
        reject(error);
      });
      
      
    });
}


exports.buscarDireccion=buscarDireccion;

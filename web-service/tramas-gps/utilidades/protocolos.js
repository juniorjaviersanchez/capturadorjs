 /**
 * este modulo esta diseñado para manejar todos los paquetes que envie el gps
 */
//incluir module path para manejar directorios
const path = require('path');
//incluir la clase base de datos
const BaseDatos = require(path.resolve('./src/db', 'base-datos.js'));
//incluir la clase db para las conecciones a base de datos
const db = require(path.resolve('./src/db', 'db.js'));

const helpers = require(path.resolve('./servidores-tcp', 'helpers.js')); 
//incluir la clase de operaciones
const operacion = require('./operaciones');
//Variable para socket de la atu
const cliente_atu =require(path.resolve('./src/clientes-atu', 'tcp-atu.js'));

 /**
 * metodo para gestionar los paquetes de los gps
 * @param {*} data 
 * @param {*} socket 
 */
async function GestionarProtocolo(data, vehiculo) {
    //let respuesta=[];
    //let fecha_gps = obtenerFecha(data.dt_tracker);
     
    //data.dt_tracker=fecha_gps;
     
    //PAQUETE DEL GPS para la ubicacion
    await actualizarUbicacion(data[0], vehiculo);
   

}

/**
 * paquete de ubicacion
 * @param {*} trama 
 */
 async function actualizarUbicacion(trama, vehiculo) {

    trama.map((tram, index) =>{
        //buscar trama de ubicacion
        //buscarUbicacion(tram, vehiculo);

        //buscar trama de ubicacion
        //buscarUbicacionActualizar(trama[trama.length-1], vehiculo);
    
        //buscar alerta de motor
        //buscarAlertaMotor(tram, vehiculo);
        
        //buscar alerta de motor
        //buscarAlertaBateria(tram, vehiculo);
        
        //buscar trama de Geozona
        buscarGeozona(tram, vehiculo);

        if (index==trama.length-1) {
            return new Promise((resolve, reject) => {
                resolve(true)
            });  
        } 
    });


}

/**
 * metodo encargado de el paquete de ubicacion
 * @param {*} data 
 * @param {*} socket 
 */

function buscarUbicacion(data, vehiculo) {
    let objeto_respuesta= new Object();
    
        
    if (typeof data.params !== "object") {
        //parsear la data a json
        data.params = JSON.parse(data.params);
    }

       
    //obtener imei
    objeto_respuesta.imei=vehiculo.imeil;

    //obtener id de organizacion 
    objeto_respuesta.organizacion_id=vehiculo.cuenta_id ;

    // Obtener ID de flota
    objeto_respuesta.flota_id = vehiculo.id_flota ;

    //obtener id
    objeto_respuesta.vehiculo_id=vehiculo.id_vehiculo ;
    //obtener placa
    objeto_respuesta.vehiculo_placa=vehiculo.placa;

    //obtener cantidad de satelites
    objeto_respuesta.cantidad_satelite=12;
    
    //obtener estado de motor
    objeto_respuesta.ACC= typeof data.params.acc === 'undefined'?0 : data.params.acc;
 
    //obtener estado de la bateria
    objeto_respuesta.bateriaCar=typeof data.params.bats === 'undefined'?0 : data.params.bats; 
    //obtener estado de la señal
    objeto_respuesta.senialGSM1=typeof data.params.gsmlev === 'undefined'?0 : data.params.gsmlev;
    //obtener estado de bateria gps
    objeto_respuesta.nivelVoltaje=typeof data.params.batl === 'undefined'?0 : data.params.batl;  
    
    //obtener MCC (Mobile Network Codes)
    objeto_respuesta.MCC=typeof data.params.mcc === 'undefined'?0 : data.params.mcc;   
    //obtener MNC (Mobile Network Code)
    objeto_respuesta.MNC=typeof data.params.mnc === 'undefined'?0 : data.params.mnc;  
    //obtener LAC (Location Area Code)
    objeto_respuesta.LAC=0;

    //obtener Cell_ID ( Cell Tower ID)
    objeto_respuesta.Cell_ID=0;
  
    //obtener fecha
    objeto_respuesta.fecha_evento= obtenerFecha(data.dt_tracker);
    
    //obtener velocidad
    objeto_respuesta.velocidad=  data.speed;
    
    //obtener latitud
    objeto_respuesta.latitud= data.lat;
    
    //obtener longitud
    objeto_respuesta.longitud= data.lng;   

    //obtener altitud
    objeto_respuesta.altitud= data.altitude;   
    
    //obtener la direccion 
    objeto_respuesta.direccion= '';
         
    //obtener variacion en grados gps ejemplo 360°
    objeto_respuesta.variacion_grados = data.angle;

    // obtener variacion magnetica ejemplo N/O (noroeste)
    objeto_respuesta.variacion_magneticaGps = '';
    //id de geozona
    objeto_respuesta.geozona = vehiculo.geozona;
    //fecha de geozona
    objeto_respuesta.fecha_geo = vehiculo.fecha_geo ? obtenerFecha(vehiculo.fecha_geo) : obtenerFecha(data.dt_tracker);


    //obtener estado gps
    let estado_gps=obtenerEstadoGps(objeto_respuesta, vehiculo);

    objeto_respuesta.estado_gps_id = estado_gps;
    
    //inicializar kilometros recorridos en 0
    let kilometraje_recorrido = 0;

    //validar que la ultima ubicacion es valida
    if (vehiculo.latitud!=0 && vehiculo.longitud!=0) {
        
        //calcular odometro lat1,lon1,lat2,lon2
        kilometraje_recorrido = operacion.calcularDistanciaRecorrida(vehiculo.latitud, vehiculo.longitud, data.lat, data.lng );
        
    }

    //validar fecha del ultimo reportaje de kilometro
    if (obtenerFecha(vehiculo.fecha_kilometraje_acum).split(' ')[0]==obtenerFecha(data.dt_tracker).split(' ')[0]) {
        
        //hilometraje acumulado
        objeto_respuesta.kilometraje = parseFloat(vehiculo.kilometraje_acum + kilometraje_recorrido);
         
    }else{
        //hilometraje acumulado
        objeto_respuesta.kilometraje = 0;  
        
    }

    //fecha de actualizacion de kilometraje
    objeto_respuesta.fecha_kilometraje = obtenerFecha(data.dt_tracker).split(' ')[0];

    //intanciar clase de base de datos 
    mysql  = new BaseDatos();

    //modificando el vehiculo
    mysql.actualizarVehiculo(objeto_respuesta);
            
    mysql.actualizarKilometraje(objeto_respuesta);
          
    //modificando el vehiculo
    mysql.InsertarApi(objeto_respuesta);

    //verificar si el vehiculo envia a la atu
    if(vehiculo.envio_atu){

        //obtener la data para la atu
        let data_atu = [];

        data_atu.push({
            Placa: objeto_respuesta.vehiculo_placa,
            Latitud: objeto_respuesta.latitud,
            Longitud: objeto_respuesta.longitud,
            Velocidad: objeto_respuesta.velocidad,
            TimeStamp: objeto_respuesta.fecha_evento
        });  

        //enviar data a la atu
        cliente_atu.enviarData(data_atu);
    }

}/**
 * metodo encargado de el paquete de ubicacion
 * @param {*} data 
 * @param {*} socket 
 */

function buscarUbicacionActualizar(data, vehiculo) {
    let objeto_respuesta= new Object();
    
        
    if (typeof data.params !== "object") {
        //parsear la data a json
        data.params = JSON.parse(data.params);
    }

       
    //obtener imei
    objeto_respuesta.imei=vehiculo.imeil;

    //obtener id de organizacion 
    objeto_respuesta.organizacion_id=vehiculo.cuenta_id ;

    // Obtener ID de flota
    objeto_respuesta.flota_id = vehiculo.id_flota ;

    //obtener id
    objeto_respuesta.vehiculo_id=vehiculo.id_vehiculo ;
    //obtener placa
    objeto_respuesta.vehiculo_placa=vehiculo.placa;

    //obtener cantidad de satelites
    objeto_respuesta.cantidad_satelite=12;
    
    //obtener estado de motor
    objeto_respuesta.ACC= typeof data.params.acc === 'undefined'?0 : data.params.acc;
 
    //obtener estado de la bateria
    objeto_respuesta.bateriaCar=typeof data.params.bats === 'undefined'?0 : data.params.bats; 
    //obtener estado de la señal
    objeto_respuesta.senialGSM1=typeof data.params.gsmlev === 'undefined'?0 : data.params.gsmlev;
    //obtener estado de bateria gps
    objeto_respuesta.nivelVoltaje=typeof data.params.batl === 'undefined'?0 : data.params.batl;  
    
    //obtener MCC (Mobile Network Codes)
    objeto_respuesta.MCC=typeof data.params.mcc === 'undefined'?0 : data.params.mcc;   
    //obtener MNC (Mobile Network Code)
    objeto_respuesta.MNC=typeof data.params.mnc === 'undefined'?0 : data.params.mnc;  
    //obtener LAC (Location Area Code)
    objeto_respuesta.LAC=0;

    //obtener Cell_ID ( Cell Tower ID)
    objeto_respuesta.Cell_ID=0;
  
    //obtener fecha
    objeto_respuesta.fecha_evento= obtenerFecha(data.dt_tracker);
    
    //obtener velocidad
    objeto_respuesta.velocidad=  data.speed;
    
    //obtener latitud
    objeto_respuesta.latitud= data.lat;
    
    //obtener longitud
    objeto_respuesta.longitud= data.lng;   

    //obtener altitud
    objeto_respuesta.altitud= data.altitude;   
    
    //obtener la direccion 
    objeto_respuesta.direccion= '';
         
    //obtener variacion en grados gps ejemplo 360°
    objeto_respuesta.variacion_grados = data.angle;

    // obtener variacion magnetica ejemplo N/O (noroeste)
    objeto_respuesta.variacion_magneticaGps = '';
    //id de geozona
    objeto_respuesta.geozona = vehiculo.geozona;
    //fecha de geozona
    objeto_respuesta.fecha_geo = vehiculo.fecha_geo ? obtenerFecha(vehiculo.fecha_geo) : obtenerFecha(data.dt_tracker);


    //obtener estado gps
    let estado_gps=obtenerEstadoGps(objeto_respuesta, vehiculo);

    objeto_respuesta.estado_gps_id = estado_gps;
    
    //inicializar kilometros recorridos en 0
    let kilometraje_recorrido = 0;

    //validar que la ultima ubicacion es valida
    if (vehiculo.latitud!=0 && vehiculo.longitud!=0) {
        
        //calcular odometro lat1,lon1,lat2,lon2
        kilometraje_recorrido = operacion.calcularDistanciaRecorrida(vehiculo.latitud, vehiculo.longitud, data.lat, data.lng );
        
    }

    //validar fecha del ultimo reportaje de kilometro
    if (obtenerFecha(vehiculo.fecha_kilometraje_acum).split(' ')[0]==obtenerFecha(data.dt_tracker).split(' ')[0]) {
        
        //hilometraje acumulado
        objeto_respuesta.kilometraje = parseFloat(vehiculo.kilometraje_acum + kilometraje_recorrido);
         
    }else{
        //hilometraje acumulado
        objeto_respuesta.kilometraje = 0;  
        
    }

    //fecha de actualizacion de kilometraje
    objeto_respuesta.fecha_kilometraje = obtenerFecha(data.dt_tracker).split(' ')[0];

    //intanciar clase de base de datos 
    mysql  = new BaseDatos();

    //modificando el vehiculo
    mysql.actualizarVehiculo(objeto_respuesta);
            
    mysql.actualizarKilometraje(objeto_respuesta);
          
    //modificando el vehiculo
    mysql.InsertarApi(objeto_respuesta);
 

}

/**
 * metodo encargado de generar alerta de motor
 * @param {*} data 
 * @param {*} socket 
 */

function buscarAlertaMotor(data, vehiculo) {
   
       
    if (typeof data.params !== "object") {
        //parsear la data a json
        data.params = JSON.parse(data.params);
    }


    let estado_motor = typeof data.params.acc === 'undefined'?0 : data.params.acc;
    //validar si existe cambio en estado del motor
    if (vehiculo.ACC==estado_motor) {
        //retornar de la funcion ya que no existe alerta
        return;
    }
    
    let objeto_respuesta= new Object();
    
     
    //obtener imei
    objeto_respuesta.imei=vehiculo.imeil;

    //obtener id de organizacion 
    objeto_respuesta.organizacion_id=vehiculo.cuenta_id ;

    // Obtener ID de flota
    objeto_respuesta.flota_id = vehiculo.id_flota ;

    //obtener id
    objeto_respuesta.vehiculo_id=vehiculo.id_vehiculo ;
    //obtener placa
    objeto_respuesta.vehiculo_placa=vehiculo.placa;

    //obtener cantidad de satelites
    objeto_respuesta.cantidad_satelite=12;
    
    //obtener estado de motor
    objeto_respuesta.ACC= estado_motor;  
    //obtener estado de la bateria
    objeto_respuesta.bateriaCar=typeof data.params.bats === 'undefined'?0 : data.params.bats; 
    //obtener estado de la señal
    objeto_respuesta.senialGSM1=typeof data.params.gsmlev === 'undefined'?0 : data.params.gsmlev;
    //obtener estado de bateria gps
    objeto_respuesta.nivelVoltaje=typeof data.params.batl === 'undefined'?0 : data.params.batl;  
    
    //obtener MCC (Mobile Network Codes)
    objeto_respuesta.MCC=typeof data.params.mcc === 'undefined'?0 : data.params.mcc;   
    //obtener MNC (Mobile Network Code)
    objeto_respuesta.MNC=typeof data.params.mnc === 'undefined'?0 : data.params.mnc;  
    //obtener LAC (Location Area Code)
    objeto_respuesta.LAC=0;

    //obtener Cell_ID ( Cell Tower ID)
    objeto_respuesta.Cell_ID=0;
  
    //obtener fecha
    objeto_respuesta.fecha_evento= obtenerFecha(data.dt_tracker);
    
    //obtener velocidad
    objeto_respuesta.velocidad=  data.speed;
    
    //obtener latitud
    objeto_respuesta.latitud= data.lat;
    
    //obtener longitud
    objeto_respuesta.longitud= data.lng;   

    //obtener altitud
    objeto_respuesta.altitud= data.altitude;   
    
    //obtener la direccion 
    objeto_respuesta.direccion= '';
         
    //obtener variacion en grados gps ejemplo 360°
    objeto_respuesta.variacion_grados = data.angle;

    // obtener variacion magnetica ejemplo N/O (noroeste)
    objeto_respuesta.variacion_magneticaGps = '';
    //id de geozona
    objeto_respuesta.geozona = vehiculo.geozona;
    //fecha de geozona
    objeto_respuesta.fecha_geo = vehiculo.fecha_geo ? obtenerFecha(vehiculo.fecha_geo) : obtenerFecha(data.dt_tracker);

    //obtener estado gps
    //inicializar en encendido
    let estado_gps = 62465;
    //validar si es encendido o apagado
    if (estado_motor==0) {
        //asignar apagoda
        estado_gps = 62467;
    }
    
    objeto_respuesta.estado_gps_id = estado_gps;
    
 
    //intanciar clase de base de datos 
    mysql  = new BaseDatos();

    //modificando el vehiculo
    mysql.actualizarVehiculo(objeto_respuesta);
       
    //modificando el vehiculo
    mysql.InsertarApiAlerta(objeto_respuesta);
}

/**
 * metodo encargado de generar alerta de bateria
 * @param {*} data 
 * @param {*} socket 
 */

function buscarAlertaBateria(data, vehiculo) {
    
        
    if (typeof data.params !== "object") {
        //parsear la data a json
        data.params = JSON.parse(data.params);
    }


    let estado_bateria = typeof data.params.bats === 'undefined'?0 : data.params.bats;
    //validar si existe cambio en estado del motor
    if (vehiculo.bateriaCar==estado_bateria) {
        //retornar de la funcion ya que no existe alerta
        return;
    }
    
    let objeto_respuesta= new Object();
    
     
    //obtener imei
    objeto_respuesta.imei=vehiculo.imeil;

    //obtener id de organizacion 
    objeto_respuesta.organizacion_id=vehiculo.cuenta_id ;

    // Obtener ID de flota
    objeto_respuesta.flota_id = vehiculo.id_flota ;

    //obtener id
    objeto_respuesta.vehiculo_id=vehiculo.id_vehiculo ;
    //obtener placa
    objeto_respuesta.vehiculo_placa=vehiculo.placa;

    //obtener cantidad de satelites
    objeto_respuesta.cantidad_satelite=12;
    
    //obtener estado de motor
    objeto_respuesta.ACC=  typeof data.params.acc === 'undefined'?0 : data.params.acc;
    //obtener estado de la bateria
    objeto_respuesta.bateriaCar= estado_bateria; 
    //obtener estado de la señal
    objeto_respuesta.senialGSM1=typeof data.params.gsmlev === 'undefined'?0 : data.params.gsmlev;
    //obtener estado de bateria gps
    objeto_respuesta.nivelVoltaje=typeof data.params.batl === 'undefined'?0 : data.params.batl;  
    
    //obtener MCC (Mobile Network Codes)
    objeto_respuesta.MCC=typeof data.params.mcc === 'undefined'?0 : data.params.mcc;   
    //obtener MNC (Mobile Network Code)
    objeto_respuesta.MNC=typeof data.params.mnc === 'undefined'?0 : data.params.mnc;  
    //obtener LAC (Location Area Code)
    objeto_respuesta.LAC=0;

    //obtener Cell_ID ( Cell Tower ID)
    objeto_respuesta.Cell_ID=0;
  
    //obtener fecha
    objeto_respuesta.fecha_evento= obtenerFecha(data.dt_tracker);
    
    //obtener velocidad
    objeto_respuesta.velocidad=  data.speed;
    
    //obtener latitud
    objeto_respuesta.latitud= data.lat;
    
    //obtener longitud
    objeto_respuesta.longitud= data.lng;   

    //obtener altitud
    objeto_respuesta.altitud= data.altitude;   
    
    //obtener la direccion 
    objeto_respuesta.direccion= '';
         
    //obtener variacion en grados gps ejemplo 360°
    objeto_respuesta.variacion_grados = data.angle;

    // obtener variacion magnetica ejemplo N/O (noroeste)
    objeto_respuesta.variacion_magneticaGps = '';
    
    //id de geozona
    objeto_respuesta.geozona = vehiculo.geozona;
    //fecha de geozona
    objeto_respuesta.fecha_geo = vehiculo.fecha_geo ? obtenerFecha(vehiculo.fecha_geo) : obtenerFecha(data.dt_tracker);

    //obtener estado gps
    //inicializar en coectada
    let estado_gps = 64789;
    //validar si es conectada o desconectada
    if (estado_bateria==0) {
        //asignar desconectada
        estado_gps = 64787;
    }
    
    objeto_respuesta.estado_gps_id = estado_gps;
    
    //intanciar clase de base de datos 
    mysql  = new BaseDatos();

    //modificando el vehiculo
    mysql.actualizarVehiculo(objeto_respuesta);
       
    //modificando el vehiculo
    mysql.InsertarApiAlerta(objeto_respuesta);
}
/**
 * metodo encargado de generar alerta de geozona
 * @param {*} data 
 * @param {*} socket 
 */

async function buscarGeozona(data, vehiculo) {
     
    let objeto_respuesta= new Object();
     
    //obtener imei
    objeto_respuesta.imei=vehiculo.imeil;

    //obtener id de organizacion 
    objeto_respuesta.organizacion_id=vehiculo.cuenta_id ;

    // Obtener ID de flota
    objeto_respuesta.flota_id = vehiculo.id_flota ;

    //obtener id
    objeto_respuesta.vehiculo_id=vehiculo.id_vehiculo ;
    //obtener placa
    objeto_respuesta.vehiculo_placa=vehiculo.placa;

    //obtener cantidad de satelites
    objeto_respuesta.cantidad_satelite=data.cantidad_satelite;
    
    //obtener estado de motor
    objeto_respuesta.ACC=  vehiculo.ACC;
    //obtener estado de la bateria
    objeto_respuesta.bateriaCar= vehiculo.bateriaCar;
    //obtener estado de la señal
    objeto_respuesta.senialGSM1=vehiculo.senialGSM1;
    //obtener estado de bateria gps
    objeto_respuesta.nivelVoltaje=vehiculo.nivelVoltaje;  
    
    //obtener MCC (Mobile Network Codes)
    objeto_respuesta.MCC=0;   
    //obtener MNC (Mobile Network Code)
    objeto_respuesta.MNC=0;  
    //obtener LAC (Location Area Code)
    objeto_respuesta.LAC=0;

    //obtener Cell_ID ( Cell Tower ID)
    objeto_respuesta.Cell_ID=0;
  
    //obtener fecha
    objeto_respuesta.fecha_evento= obtenerFecha(data.fecha);
    
    //obtener velocidad
    objeto_respuesta.velocidad=  data.velocidad;
    
    //obtener latitud
    objeto_respuesta.latitud= data.latitud;
    
    //obtener longitud
    objeto_respuesta.longitud= data.longitud;   

    //obtener altitud
    objeto_respuesta.altitud= 0;   
    
    //obtener la direccion 
    objeto_respuesta.direccion= '';
         
    //obtener variacion en grados gps ejemplo 360°
    objeto_respuesta.variacion_grados = data.variacion_grados;

    // obtener variacion magnetica ejemplo N/O (noroeste)
    objeto_respuesta.variacion_magneticaGps = '';
    //inicializar estado de alerta en null
    objeto_respuesta.estado_gps_id = null;

    // Obtener zonas de la flota
    let zonas = await db.buscarZonas(objeto_respuesta.flota_id),
    // Crear objeto literal con valores preterminados
    enZona = {
        puntoDentro: false,
        zonaId: 0
    };

    // Verificar si hay zonas en la flota
    if(zonas.length > 0){
        // Invocar a la funcion que determina si el vehiculo está dentro o fuera de alguna de las zonas de la flota
        enZona = helpers.enZona(zonas, objeto_respuesta.latitud, objeto_respuesta.longitud);
    }


    // Verificar si está dentro zona
    if(enZona.puntoDentro){ 
        // Verificar si el vehiculo no tiene ultima zona
        if(vehiculo.geozona == 0){
                
            // Agregar ID de la zona en la propiedad geozona
            objeto_respuesta.geozona = enZona.zonaId;
            objeto_respuesta.fecha_geo = obtenerFecha(data.fecha);;
            objeto_respuesta.nombre_geozona = enZona.nombre_geozona;
            objeto_respuesta.condicion_geozona = enZona.condicion_geozona;

            //Primero punto dentro de zona
            objeto_respuesta.estado_gps_id = 3105;
    
        } 

    }else{
            //validar que esta dentro de una zona
            if(vehiculo.geozona != 0){
                // Agregar ID de la zona en la propiedad ha cero (0) 
                //el vehiculo esta saliendo de la zona
                objeto_respuesta.geozona = 0;
                //id de la geozona saliente
                objeto_respuesta.geozona_saliente = vehiculo.geozona;
                //Otros puntos dentro de zona
                objeto_respuesta.estado_gps_id = 3106;
                objeto_respuesta.fecha_geo = obtenerFecha(data.fecha);
                
                objeto_respuesta.nombre_geozona = enZona.nombre_geozona;
                objeto_respuesta.condicion_geozona = enZona.condicion_geozona;
    
    
            }
    
    
        }
    
    //si se encuentra una alerta
    if(objeto_respuesta.estado_gps_id){
 
        //intanciar clase de base de datos 
        mysql  = new BaseDatos();
    
        //modificando el vehiculo
        mysql.actualizarVehiculo(objeto_respuesta);

        //modificando el vehiculo
        //mysql.InsertarApi(objeto_respuesta);           
        //modificando el vehiculo
        mysql.InsertarApiAlertaGeozona(objeto_respuesta);

        //valor de la condicion de la geozona
  /*      let condicion = objeto_respuesta.condicion_geozona;

        //validar si se debe enviar a las frecuencias
        if (condicion=='TERMINAL_INICIAL' || condicion=='TERMINAL_FINAL' || condicion=='RELOJ') {
            
            objeto_respuesta.codigo_estado = objeto_respuesta.estado_gps_id;
            objeto_respuesta.fecha = objeto_respuesta.fecha_evento;
            //invocar funcion que se encarga de gestionar las frecuencias
            await db.gestionarFrecuencia(objeto_respuesta);
        }
*/
    } 
    
}


function obtenerEstadoGps(data, vehiculo) {
    let MINIMUM_SPEED_KPH = 0;
    let velocidad = data.velocidad;
    let grados = data.variacion_grados;

    let maxSpeed = vehiculo.velocidadMax;
            

if ((velocidad >  MINIMUM_SPEED_KPH) && (velocidad < maxSpeed) ) {
    //en movimiento
    codigo_gps = 61714;
    return codigo_gps;
        
}else if (velocidad <= MINIMUM_SPEED_KPH) {
    //  detenido
    return codigo_gps = 61715;
} else if (velocidad >= maxSpeed){
    //exeso de velocidad
    return codigo_gps = 61722;
}

return 61714;
}

/**
 * metodo encargado de obtener la fecha de peru
 * @param {*} fecha 
 */
function obtenerFecha(fecha) {

let fecha_gps = fecha;

let fecha_para_restar = parseInt((new Date(fecha_gps).getTime() / 1000).toFixed(0))

let fecha_restada = fecha_para_restar ;

let fecha_formateada = new Date(fecha_restada * 1000)

let hora_final = fecha_formateada.toTimeString().split(' ')[0];
let fecha_final;

let day = fecha_formateada.getDate()
let month = fecha_formateada.getMonth() + 1
let year = fecha_formateada.getFullYear()


fecha_final = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;


return `${fecha_final} ${hora_final}`;

}

 
 exports.GestionarProtocolo=GestionarProtocolo;
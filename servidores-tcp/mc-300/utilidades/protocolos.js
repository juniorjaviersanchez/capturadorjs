/**
 * este modulo esta diseñado para manejar todos los paquetes que envie el gps
 */
//incluir module path para manejar directorios
const path = require('path');

//incluir la clase TCPSocket
const TCPSocket = require(path.resolve('./src', 'tcp-socket.js'));

//incluir la clase TCPSocket
const Alertas = require(path.resolve('./src', 'alertasGps.js'));

//incluir la clase db para las conecciones a base de datos
const db = require(path.resolve('./src/db', 'db.js'));

//incluir modulo para buscar direcciones
const direccion = require(path.resolve('./src/utilidades', 'buscarDireccion.js'));

const CRC16 = require('./crc16-2');
//incluir la clase de operaciones
const operacion = require('./operaciones');

//libreria para conversiones ascii
const hex2ascii = require('hex2ascii')


const helpers = require('../../helpers');

/**
 * metodo para gestionar los paquetes de los gps
 * @param {*} data 
 * @param {*} socket 
 */
async function GestionarProtocolo(data, socket) {
    let respuesta=[];
 
    //PAQUETE DEL GPS
    respuesta.push(await paqueteUbicacion(data,socket));
           
 
    return respuesta;

}

/**
 * Funcion que permite partir arreglos
 *
 * @param arrayList {arrayList} Arreglo a partir
 * @param chunk_size {Integer} en cuantos
 */
function cortarArreglo(arrayList, chunk_size){
    let index = 0;
    let arrayLength = arrayList.length;
    let tempArray = [];
    
    for (index = 0; index < arrayLength; index += chunk_size) {
        myChunk = arrayList.slice(index, index+chunk_size);
        
        tempArray.push(myChunk);
    }

    return tempArray;
}

 
/**
 * metodo encargado de el paquete de ubicacion
 * @param {*} data 
 * @param {*} socket 
 */

async function buscarUbicacion(data,socket) {
    let objeto_respuesta= new Object();

    //intanciar clase TCPSocket
    tcpSocket  = new TCPSocket();

    //buscar vehiculo por id de socket
    let vehiculo = tcpSocket.obtenerPorId(socket.id);   
   
    //obtener el objeto con los datos generales
    objeto_respuesta=buscarObjetoRespuesta(data,socket);
    
    //CONVERTIR TRAMA A ASCII   
    let trama_ascii = data.toString();

    //separar trama
    let trama_ascii_separada = trama_ascii.split(",");
  
 
    //obtener fecha
    vehiculo.estado_vehiculo.fecha_evento= operacion.obtenerFecha(trama_ascii_separada);
    
    //obtener velocidad
    vehiculo.estado_vehiculo.velocidad= operacion.obtenerVelocidad(trama_ascii_separada);
    
    
    //obtener latitud
    vehiculo.estado_vehiculo.latitud= operacion.obtenerLatitud(trama_ascii_separada);
    
    //obtener longitud
    vehiculo.estado_vehiculo.longitud= operacion.obtenerLongitud(trama_ascii_separada);   
    
    //obtener la direccion 
    //vehiculo.estado_vehiculo.direccion= await direccion.buscarDireccion(vehiculo.estado_vehiculo.latitud, vehiculo.estado_vehiculo.longitud);
    vehiculo.estado_vehiculo.direccion= '';
     
    //obtener variacion en grados gps ejemplo 360°
    vehiculo.estado_vehiculo.variacion_grados = trama_ascii_separada[10];

    // obtener variacion magnetica ejemplo N/O (noroeste)
    vehiculo.estado_vehiculo.variacion_magneticaGps = trama_ascii_separada[6]+'/'+trama_ascii_separada[8];
      
    //obtener estado gps
    let estado_gps=operacion.obtenerEstadoGps(vehiculo, socket.id);
    vehiculo.estado_vehiculo.estado_gps_id = estado_gps;
    
    let alerta='nueva_ubicacion';

    //veriicar si existe alerta de exeso de velocidad
    if (estado_gps==61722) {
        //agregar alerta o notificacion
        alerta='alerta_velocidad';
        
        vehiculo.estado_vehiculo.direccion= await direccion.buscarDireccion(vehiculo.estado_vehiculo.latitud, vehiculo.estado_vehiculo.longitud);
 
    }

    objeto_respuesta.estado_vehiculo = JSON.parse(JSON.stringify(vehiculo.estado_vehiculo));

    // Actualizar estado del vehiculo en la clase
    tcpSocket.actualizarEstadoVehiculo(tcpSocket.id, vehiculo.estado_vehiculo);
 
    //retornar objeto

    return {
        alerta,
        objeto_respuesta
    }

    
}

function buscarObjetoRespuesta(data,socket,tipo='ubicacion') {
    let objeto_respuesta= new Object();
      
    //intanciar clase TCPSocket
    tcpSocket  = new TCPSocket();

    //buscar vehiculo por id de socket
    let vehiculo = tcpSocket.obtenerPorId(socket.id);    

    //obtener imei
    objeto_respuesta.imei=vehiculo.imei_gps;

    //obtener id de organizacion 
    objeto_respuesta.organizacion_id=vehiculo.organizacion_id;

    // Obtener ID de flota
    objeto_respuesta.flota_id = vehiculo.flota_id;

    //obtener id
    objeto_respuesta.vehiculo_id=vehiculo.vehiculo_id;
    //obtener placa
    objeto_respuesta.vehiculo_placa=vehiculo.vehiculo_placa;

    //obtener cantidad de satelites
    objeto_respuesta.cantidad_satelite=12;

    //obtener MCC (Mobile Network Codes)
    objeto_respuesta.MCC=0;

    //obtener MNC (Mobile Network Code)
    objeto_respuesta.MNC=0;

    //obtener LAC (Location Area Code)
    objeto_respuesta.LAC=0;

    //obtener Cell_ID ( Cell Tower ID)
    objeto_respuesta.Cell_ID=0;

    return objeto_respuesta;
}

/**
 * metodo para validar si se encuentra dentro de una geozona
 * @param {*} data 
 * @param {*} socket 
 */
async function buscarUbicacionZona(data,socket) {
    let objeto_respuesta= new Object();
    //obtener el objeto con los datos generales
    objeto_respuesta=buscarObjetoRespuesta(data,socket);

    //intanciar clase TCPSocket
    tcpSocket  = new TCPSocket();

    //buscar vehiculo por id de socket
    let vehiculo = tcpSocket.obtenerPorId(socket.id);   

        
    //CONVERTIR TRAMA A ASCII   
    let trama_ascii = data.toString();

    //separar trama
    let trama_ascii_separada = trama_ascii.split(",");
  
 
    //obtener fecha
    vehiculo.estado_vehiculo.fecha_evento= operacion.obtenerFecha(trama_ascii_separada);
    
    //obtener velocidad
    vehiculo.estado_vehiculo.velocidad= operacion.obtenerVelocidad(trama_ascii_separada);
    
    
    //obtener latitud
    vehiculo.estado_vehiculo.latitud= operacion.obtenerLatitud(trama_ascii_separada);
    
    //obtener longitud
    vehiculo.estado_vehiculo.longitud= operacion.obtenerLongitud(trama_ascii_separada);   
    
    //obtener la direccion 
    //vehiculo.estado_vehiculo.direccion= await direccion.buscarDireccion(vehiculo.estado_vehiculo.latitud, vehiculo.estado_vehiculo.longitud);
    vehiculo.estado_vehiculo.direccion= '';
     
    //obtener variacion en grados gps ejemplo 360°
    vehiculo.estado_vehiculo.variacion_grados = trama_ascii_separada[10];

    // obtener variacion magnetica ejemplo N/O (noroeste)
    vehiculo.estado_vehiculo.variacion_magneticaGps = trama_ascii_separada[6]+'/'+trama_ascii_separada[8];
      
    //obtener estado gps
    let estado_gps=operacion.obtenerEstadoGps(vehiculo, socket.id);
    vehiculo.estado_vehiculo.estado_gps_id = estado_gps;

  

    objeto_respuesta.estado_vehiculo = JSON.parse(JSON.stringify(vehiculo.estado_vehiculo));
    //retornar objeto
  
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
        enZona = helpers.enZona(zonas, vehiculo.estado_vehiculo.latitud, vehiculo.estado_vehiculo.longitud);
    }

    // Verificar si está dentro zona
    if(enZona.puntoDentro){

        // Verificar si el vehiculo no tiene ultima zona
        if(vehiculo.estado_vehiculo.ultima_zona == 0){
            
            // Agregar ID de la zona en la propiedad ultima_zona
            vehiculo.estado_vehiculo.ultima_zona = enZona.zonaId;
            vehiculo.estado_vehiculo.fecha_zona = operacion.obtenerFecha(trama_ascii_separada);

            //Primero punto dentro de zona
            vehiculo.estado_vehiculo.estado_gps_id = 3105;

        }else{

            vehiculo.estado_vehiculo.fecha_zona = operacion.obtenerFecha(trama_ascii_separada);
            //Otros puntos dentro de zona
            vehiculo.estado_vehiculo.estado_gps_id = 3107;

            
        }

        //agregar alerta o notificacion
        alerta ='alerta_zona';

        objeto_respuesta.estado_vehiculo = vehiculo.estado_vehiculo;

        // Actualizar estado del vehiculo en la clase
        tcpSocket.actualizarEstadoVehiculo(vehiculo.id, vehiculo.estado_vehiculo);

       
        //retornando objeto
        return {
            alerta,
            objeto_respuesta
        }
    
    }else{
        //validar que esta dentro de una zona
        if(vehiculo.estado_vehiculo.ultima_zona != 0){
            // Agregar ID de la zona en la propiedad ha cero (0) 
            //el vehiculo esta saliendo de la zona

            vehiculo.estado_vehiculo.ultima_zona = 0;
            //Otros puntos dentro de zona
            vehiculo.estado_vehiculo.estado_gps_id = 3106;
            vehiculo.estado_vehiculo.fecha_zona = operacion.obtenerFecha(trama_ascii_separada);
            //agregar alerta o notificacion
            objeto_respuesta.estado_vehiculo = vehiculo.estado_vehiculo;
         
            // Actualizar estado del vehiculo en la clase
            tcpSocket.actualizarEstadoVehiculo(vehiculo.id, vehiculo.estado_vehiculo);


            alerta = 'alerta_zona';
                  //retornando objeto
            return {
                 alerta,
                 objeto_respuesta
            }

        }


    }

    return null

 

}

 
async function asyncForEach(array, callback) {
    for (let index = 0; index < array.length; index++) {
      await callback(array[index], index, array);
    }
}


async function paqueteUbicacion(trama,socket) {

    let respuesta = {};
    let actualizar_vehiculo;

    //agregar arreglo de las alertas que se enviaran al cliente
    let lista_alertas=[];
    
    respuesta.nueva_ubicacion = [];
    respuesta.alerta_zona = [];
    respuesta.alerta_motor = [];
    respuesta.alerta_sos = [];
    respuesta.alerta_bateria_vehiculo = [];
    //buscar la respuesta que se le enviara al gps
    //este protocolo no requiere ubicacion
    respuesta.respuestaGps = null;
    let longitud_requerida=98;

    //cortar la data para ir sincronizando
    let cortar_data = cortarArreglo(trama, longitud_requerida); 

     //iterar la data cortada
    await asyncForEach(cortar_data, async (dataCortada) => {
       
        //agregar vehiculo a los clientes
        let seccion = await paqueteSecion(dataCortada,socket);

        //validar que el vehiculo existe y esta activo
        //si no se sale de la funcion
        if (!seccion) {
            return null;
        }
        //buscar trama de ubicacion
        let ubicacion_buscada = await buscarUbicacion(dataCortada,socket);
        //agregando alerta 
        lista_alertas.push(ubicacion_buscada.alerta);
        respuesta.nueva_ubicacion.push(ubicacion_buscada.objeto_respuesta);        
        
        //obtener informacion de terminal
        let InformacionGps = operacion.ObtenerInformacionGps(dataCortada);
 

        //buscar alerta de motor
        let alerta_motor = generarAlertaMotor(InformacionGps.acc, socket.id);
        //si exite una alerta se agrega al objeto que se le enviara al cliente

        if (alerta_motor!=null) {
            //buscar trama de motor
            let ubicacion_motor = await buscarUbicacionMotor(dataCortada,socket,InformacionGps.acc);
            //agregando alerta 
            lista_alertas.push(ubicacion_motor.alerta);
            respuesta.alerta_motor.push(ubicacion_motor.objeto_respuesta);        
        }

        //buscar alerta de panico
        let alerta_sos = generarAlertaPanico(InformacionGps.panic);
        //si exite una alerta se agrega al objeto que se le enviara al cliente

        if (alerta_sos!=null) {
            //buscar trama de motor
            let ubicacion_panico = await buscarUbicacionPanico(dataCortada,socket);
            //agregando alerta 
            lista_alertas.push(ubicacion_panico.alerta);
            respuesta.alerta_sos.push(ubicacion_panico.objeto_respuesta);
 
        }
  
        //buscar alerta de bateria de vehiculo
        let alerta_bateria_vehiculo = generarAlertaBateriaVehiculo(InformacionGps.bateria, socket.id);
        //si exite una alerta se agrega al objeto que se le enviara al cliente
        if (alerta_bateria_vehiculo!=null) {
            
            //buscar trama de bateria
            let ubicacion_bateria = await buscarUbicacionBateria(dataCortada,socket,InformacionGps.bateria);
            //agregando alerta 
            lista_alertas.push(ubicacion_bateria.alerta);
            respuesta.alerta_bateria_vehiculo.push(ubicacion_bateria.objeto_respuesta);       
        }

        //buscar alerta de zona
        let zona_buscada = await buscarUbicacionZona(dataCortada,socket);
        
        //valiar que exista la alerta
        if (zona_buscada) {   
            lista_alertas.push('alerta_zona');
            respuesta.alerta_zona.push(zona_buscada.objeto_respuesta);
        }
        
        
     });

    
    //insertar en la tabla de eventos de nuevas alertas de zonas
    await asyncForEach(respuesta.alerta_zona, async (alerta_zona) => {
        await db.insertarNuevaUbicacion(alerta_zona);
        await db.actualizarEstatusVehiculo(alerta_zona);
     
    });
 
    //insertar en la tabla de eventos de nuevas alertas de motor
    respuesta.alerta_motor.map(alerta_motor =>{
        db.insertarNuevaUbicacion(alerta_motor);
    });  

    
    //insertar en la tabla de eventos de nuevas alertas de batreria
    respuesta.alerta_bateria_vehiculo.map(alerta_bateria_vehiculo =>{
        db.insertarNuevaUbicacion(alerta_bateria_vehiculo);
    });  
 
    //insertar en la tabla de eventos de nuevas alertas de panico

    respuesta.alerta_sos.map(alerta_sos =>{
        db.insertarNuevaUbicacion(alerta_sos);
    }); 
   
    //insertar en la tabla de eventos de nuevas ubicaciones

    respuesta.nueva_ubicacion.map(nueva_ubicacion =>{
        db.insertarNuevaUbicacion(nueva_ubicacion);
        actualizar_vehiculo=nueva_ubicacion;
    }); 

    //actualizar en la base de datos en estado de vehiculo
    await db.actualizarEstatusVehiculo(actualizar_vehiculo);

    //arreglo de alertas o ubicaciones
    respuesta.alertas=  Array.from(new Set(lista_alertas)); 

    
    return respuesta;
}




/**
 * metedo para manejar el paquete de secion del gps
 * @param {*} data 
 * @param {*} socket 
 */
async function paqueteSecion(data, socket) {
    //intanciar clase TCPSocket
    tcpSocket  = new TCPSocket();
    
    //verificar si existe el cliente
    let cliente = tcpSocket.obtenerPorId(socket.id);

    //si el cliente ya existe se sale de la funcion
    if (cliente) {
      return true;  
    }

    let respuesta = new Object();
    let vehiculoEncontrado;
    try {
        //buscar los datos del vehiculo que tiene dicho gps
         vehiculoEncontrado = await db.buscarVehiculo(operacion.obtenerImeiGps(data));
         respuesta.alertas = [];
   
         if (vehiculoEncontrado=='vehiculo no existe') {
             console.log('============================='.red);
             console.log(vehiculoEncontrado);
             console.log('imei: '+operacion.obtenerImeiGps(data));
             console.log('============================='.red);

             return null
         }
         
        } catch (error) {
        console.log('Error:',error);
    }
 
    if(Object.entries(vehiculoEncontrado).length==0){
        console.log('Vehiculo no existe....');
        respuesta.respuestaGps=null;
        respuesta.alertas = [];

        return respuesta;
    }

    vehiculoEncontrado.id = socket.id;
    

    //setear los valores del gps atravez de setData
    tcpSocket.agregar(vehiculoEncontrado);
    
    console.log("se agrego el cliente socket-tcp a la lista");

    // enviando respuesta al gps
    return true;
}


function generarAlertaMotor(estatus, id_cliente) {
     //intanciar clase TCPSocket
     tcpSocket  = new TCPSocket();

     //buscar vehiculo por id de socket
     let vehiculo = tcpSocket.obtenerPorId(id_cliente);
 
     //verificar si no existe un cambio de estado
     if (vehiculo.estado_vehiculo.estado_motor==estatus) {
         return null;
     }
 
    return true;
}
 
/**
 * metodo encargado de el paquete de ubicacion
 * para motor encendido o apagado
 * @param {*} data 
 * @param {*} socket 
 */

async function buscarUbicacionMotor(data,socket, motor) {
    let objeto_respuesta= new Object();

    //intanciar clase TCPSocket
    tcpSocket  = new TCPSocket();

    //buscar vehiculo por id de socket
    let vehiculo = tcpSocket.obtenerPorId(socket.id);   
   
    //obtener el objeto con los datos generales
    objeto_respuesta=buscarObjetoRespuesta(data,socket);
    
    //CONVERTIR TRAMA A ASCII   
    let trama_ascii = data.toString();

    //separar trama
    let trama_ascii_separada = trama_ascii.split(",");
  
 
    //obtener fecha
    vehiculo.estado_vehiculo.fecha_evento= operacion.obtenerFecha(trama_ascii_separada);
    
    //obtener velocidad
    vehiculo.estado_vehiculo.velocidad= operacion.obtenerVelocidad(trama_ascii_separada);
    
    
    //obtener latitud
    vehiculo.estado_vehiculo.latitud= operacion.obtenerLatitud(trama_ascii_separada);
    
    //obtener longitud
    vehiculo.estado_vehiculo.longitud= operacion.obtenerLongitud(trama_ascii_separada);   
    
    //obtener la direccion 
    //vehiculo.estado_vehiculo.direccion= await direccion.buscarDireccion(vehiculo.estado_vehiculo.latitud, vehiculo.estado_vehiculo.longitud);
    vehiculo.estado_vehiculo.direccion= '';
     
    //obtener variacion en grados gps ejemplo 360°
    vehiculo.estado_vehiculo.variacion_grados = trama_ascii_separada[10];

    // obtener variacion magnetica ejemplo N/O (noroeste)
    vehiculo.estado_vehiculo.variacion_magneticaGps = trama_ascii_separada[6]+'/'+trama_ascii_separada[8];
      
    //obtener estado gps
    //se inicializa como motor apagado
    let estado_gps=62467;
    //validar si es motor encendido 
    if (motor==1) {
        estado_gps=62465; 
    }
    vehiculo.estado_vehiculo.estado_gps_id = estado_gps;
    
    let alerta='alerta_motor';

    objeto_respuesta.estado_vehiculo = JSON.parse(JSON.stringify(vehiculo.estado_vehiculo));

    // Actualizar estado del vehiculo en la clase
    tcpSocket.actualizarEstadoVehiculo(tcpSocket.id, vehiculo.estado_vehiculo);
 
    //retornar objeto

    return {
        alerta,
        objeto_respuesta
    }

    
}

/**
 * metodo para validar que esista un panico
 * @param {*} estatus 
 */
function generarAlertaPanico(estatus) {
            
    //verificar si no existe un cambio de estado
    if (estatus!=0) {
        return null;
    }

    return true;
}
 
/**
 * metodo encargado de el paquete de ubicacion
 * para motor encendido o apagado
 * @param {*} data 
 * @param {*} socket 
 */

async function buscarUbicacionPanico(data,socket) {
    let objeto_respuesta= new Object();

    //intanciar clase TCPSocket
    tcpSocket  = new TCPSocket();

    //buscar vehiculo por id de socket
    let vehiculo = tcpSocket.obtenerPorId(socket.id);   
   
    //obtener el objeto con los datos generales
    objeto_respuesta=buscarObjetoRespuesta(data,socket);
    
    //CONVERTIR TRAMA A ASCII   
    let trama_ascii = data.toString();

    //separar trama
    let trama_ascii_separada = trama_ascii.split(",");
  
 
    //obtener fecha
    vehiculo.estado_vehiculo.fecha_evento= operacion.obtenerFecha(trama_ascii_separada);
    
    //obtener velocidad
    vehiculo.estado_vehiculo.velocidad= operacion.obtenerVelocidad(trama_ascii_separada);
    
    
    //obtener latitud
    vehiculo.estado_vehiculo.latitud= operacion.obtenerLatitud(trama_ascii_separada);
    
    //obtener longitud
    vehiculo.estado_vehiculo.longitud= operacion.obtenerLongitud(trama_ascii_separada);   
    
    //obtener la direccion 
    vehiculo.estado_vehiculo.direccion= await direccion.buscarDireccion(vehiculo.estado_vehiculo.latitud, vehiculo.estado_vehiculo.longitud);
    //vehiculo.estado_vehiculo.direccion= '';
     
    //obtener variacion en grados gps ejemplo 360°
    vehiculo.estado_vehiculo.variacion_grados = trama_ascii_separada[10];

    // obtener variacion magnetica ejemplo N/O (noroeste)
    vehiculo.estado_vehiculo.variacion_magneticaGps = trama_ascii_separada[6]+'/'+trama_ascii_separada[8];
      
    //obtener estado gps
    //se inicializa como SOS
    let estado_gps=63553;
 
    vehiculo.estado_vehiculo.estado_gps_id = estado_gps;
    
    let alerta='alerta_sos';

    objeto_respuesta.estado_vehiculo = JSON.parse(JSON.stringify(vehiculo.estado_vehiculo));

    // Actualizar estado del vehiculo en la clase
    tcpSocket.actualizarEstadoVehiculo(tcpSocket.id, vehiculo.estado_vehiculo);
 
    //retornar objeto

    return {
        alerta,
        objeto_respuesta
    }

    
}

/**
 * metodo encargado de validar si existe una falla de bateria
 * @param {*} estatus 
 * @param {*} id_cliente 
 */
function generarAlertaBateriaVehiculo(estatus, id_cliente) {
    //intanciar clase TCPSocket
    tcpSocket  = new TCPSocket();

    //buscar vehiculo por id de socket
    let vehiculo = tcpSocket.obtenerPorId(id_cliente);

    //verificar si no existe un cambio de estado
    if (vehiculo.estado_vehiculo.estado_bateria_vehiculo==estatus) {
        return null;
    }


    return true;
}

 
/**
 * metodo encargado de el paquete de ubicacion
 * para bateria
 * @param {*} data 
 * @param {*} socket 
 */

async function buscarUbicacionBateria(data,socket, bateria) {
    let objeto_respuesta= new Object();

    //intanciar clase TCPSocket
    tcpSocket  = new TCPSocket();

    //buscar vehiculo por id de socket
    let vehiculo = tcpSocket.obtenerPorId(socket.id);   
   
    //obtener el objeto con los datos generales
    objeto_respuesta=buscarObjetoRespuesta(data,socket);
    
    //CONVERTIR TRAMA A ASCII   
    let trama_ascii = data.toString();

    //separar trama
    let trama_ascii_separada = trama_ascii.split(",");
  
 
    //obtener fecha
    vehiculo.estado_vehiculo.fecha_evento= operacion.obtenerFecha(trama_ascii_separada);
    
    //obtener velocidad
    vehiculo.estado_vehiculo.velocidad= operacion.obtenerVelocidad(trama_ascii_separada);
    
    
    //obtener latitud
    vehiculo.estado_vehiculo.latitud= operacion.obtenerLatitud(trama_ascii_separada);
    
    //obtener longitud
    vehiculo.estado_vehiculo.longitud= operacion.obtenerLongitud(trama_ascii_separada);   
    
    //obtener la direccion 
    vehiculo.estado_vehiculo.direccion= await direccion.buscarDireccion(vehiculo.estado_vehiculo.latitud, vehiculo.estado_vehiculo.longitud);
    //vehiculo.estado_vehiculo.direccion= '';
     
    //obtener variacion en grados gps ejemplo 360°
    vehiculo.estado_vehiculo.variacion_grados = trama_ascii_separada[10];

    // obtener variacion magnetica ejemplo N/O (noroeste)
    vehiculo.estado_vehiculo.variacion_magneticaGps = trama_ascii_separada[6]+'/'+trama_ascii_separada[8];
      
    //obtener estado gps
    //se inicializa como bateria desconectada
    let estado_gps=64787;
    //validar si es motor encendido 
    if (bateria==1) {
        estado_gps=64789; 
    }

    vehiculo.estado_vehiculo.estado_gps_id = estado_gps;
    
    let alerta='alerta_bateria_vehiculo';

    objeto_respuesta.estado_vehiculo = JSON.parse(JSON.stringify(vehiculo.estado_vehiculo));

    // Actualizar estado del vehiculo en la clase
    tcpSocket.actualizarEstadoVehiculo(tcpSocket.id, vehiculo.estado_vehiculo);
 
    //retornar objeto

    return {
        alerta,
        objeto_respuesta
    }

    
}


exports.GestionarProtocolo=GestionarProtocolo;
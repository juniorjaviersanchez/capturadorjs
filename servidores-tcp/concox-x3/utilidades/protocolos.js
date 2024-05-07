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
//incluir la clase base de datos
const BaseDatos = require(path.resolve('./src/db', 'base-datos.js'));


const helpers = require('../../helpers');

/**
 * metodo para gestionar los paquetes de los gps
 * @param {*} data 
 * @param {*} socket 
 */
async function GestionarProtocolo(data, socket) {
    let respuesta=[];
    //obtener el protocolo
    let protocolo = data[3].toString(16);
    let protocolo_puertas = data[4].toString(16);
    let ini1 = ''+data[0].toString(16);
    let ini2 = ''+data[0].toString(16);
    let inicial = ini1+ini2;


    console.log(`protocolo: ${protocolo}\n`.underline.yellow);


    switch (protocolo) {
       
        // protocolo de login
        case '1':
            respuesta.push(await paqueteSecion(data, socket));
            break;       
        // protocolo de paquete de latidos 
        case '13':
            respuesta.push(await paqueteLatidos(data,socket));
            break;       
        // protocolo de Paquete de ubicación
        case '22':
            
            respuesta.push(await paqueteUbicacion(data,socket));
            return respuesta;

            break;       
        // protocolo de alerta
        case '26':
            respuesta.push(await paqueteAlarma(data,socket));
            return respuesta;
        // protocolo de alerta
        case '27':
            respuesta.push(await paqueteAlarma(data,socket));
            return respuesta;
            
            break;
    
        default:
            break;
    }

    //validar que sea una trama para detector de puertas
    if (inicial=='7979' && protocolo_puertas=='94') {
        console.log(`protocolo para detector de puertas: ${protocolo_puertas}\n`.underline.yellow);
        
        //buscar paquete de trasmision de informacion (protocolo_puertas)
        //respuesta.push(await paqueteTransmisionInformacion(data,socket));
        //return respuesta; 
    }
 
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
 * metedo para manejar el paquete de secion del gps
 * @param {*} data 
 * @param {*} socket 
 */
async function paqueteSecion(data, socket) {
    let respuesta = new Object();
    let vehiculoEncontrado;
    let imei = operacion.obtenerImeiGps(data);

    try {
        //buscar los datos del vehiculo que tiene dicho gps
         vehiculoEncontrado = await db.buscarVehiculo(operacion.obtenerImeiGps(data));
         respuesta.alertas = [];

                  
         if (vehiculoEncontrado=='vehiculo no existe') {
            console.log('============================='.red);
            console.log(vehiculoEncontrado);
            console.log('imei: '+imei);
            console.log('============================='.red);

            return respuesta;
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
    
    //intanciar clase TCPSocket
    tcpSocket  = new TCPSocket();
    //setear los valores del gps atravez de setData
    tcpSocket.agregar(vehiculoEncontrado);
    
    console.log("se agrego el cliente socket-tcp a la lista");
    
    let data_reset= new Object();

    //obtener imei
    data_reset.imei=vehiculoEncontrado.imei_gps;
    
    //obtener imei
    data_reset.fecha=operacion.obtenerFechaActual();

    //obtener estatus
    data_reset.estatus=1;

    //obtener protocolo
    data_reset.estatus='X3';
                
    //obtener organizacion id
    data.organizacion_id=vehiculoEncontrado.organizacion_id;
                
    //obtener flota id
    data.flota_id=vehiculoEncontrado.flota_id;
                        
    //obtener descripcion vehiculo
    data.description=vehiculoEncontrado.vehiculo_placa;   

    //obtener estatus señal gps
    data_reset.estado_senial_gps=vehiculoEncontrado.estado_vehiculo.estado_senial_gps;
    
    //intanciar clase de base de datos 
    mysql  = new BaseDatos();
    //enviar data_reset a mysql
    mysql.InsertarReset(data_reset);

    //buscar la respuesta que se le enviara al gps
    respuesta.respuestaGps=buscarRespuesta(data);
    // enviando respuesta al gps
    return respuesta;
}



/**
 *metodo para buscar la respuesta que se le enviara al gps 
 * @param {*} data 
 */
function buscarRespuesta(data) {
    //verificar error de redundancia
    crc16 = new CRC16();

    // crearndo un array de byte para realizar la validacion de redundancia
    let listaCrc = Buffer.alloc(4);
    listaCrc[0] = 5;
    listaCrc[1] = data[3];
    listaCrc[2] = data[(data.length - 6)];
    listaCrc[3] = data[(data.length - 5)];
    
    //setear el crc usando la clase  CRC16();
    crc16.set(listaCrc);
    
    //obtener el valor de ccr usando la clase  CRC16();
    let resultado = crc16.get();
    
    //valor de crc 1
    let  valor_redundancia=resultado >> 8 & 0xFF;

    //valor de crc 2
    let  valor_redundancia2=resultado  & 0xFF;

    //creando array de byte para enviar la respuesta al gps
    let respuestaGps = Buffer.alloc(10);

    respuestaGps[0] = data[1];
    respuestaGps[1] = data[1];
    respuestaGps[2] = 5;
    respuestaGps[3] = data[3];
    respuestaGps[4] = data[(data.length - 6)];
    respuestaGps[5] = data[(data.length - 5)];
    respuestaGps[6] = valor_redundancia;
    respuestaGps[7] = valor_redundancia2;
    respuestaGps[8] = 13;
    respuestaGps[9] = 10;   

 return respuestaGps
}


/**
 * metodo encargado de comunicarce con la base de datos 
 * atraves de laravel para buscar los datos de un vehiculo
 * segun el gps que tenga instalado
 * @param {*} data 
 */




/**
 * metedo para manejar el paquete de latidos del gps
 * @param {*} data 
 * @param {*} socket 
 */
async function paqueteLatidos(data, socket) {
    let respuesta = new Object();
    //buscar la respuesta que se le enviara al gps
    respuesta.respuestaGps = await buscarRespuesta(data);
    respuesta.nueva_ubicacion = [];
    respuesta.alerta_motor = [];
    respuesta.alerta_bateria_vehiculo=[];

    //agregar arreglo de las alertas que se enviaran al cliente
    let lista_alertas=[];   
    
    //desifrar los datos de la trama gps
    

    //informacion del gps
    let contenidoInformativo = operacion.ObtenerInformacionGps(data, socket);
     
    //estado de la bateria del vehiculo
    let estado_bateria_vehiculo=contenidoInformativo.estado_bateria_vehiculo;

    //intanciar clase de Alertas
    alertas  = new Alertas();
    
    //buscar alerta de bateria de vehiculo
    let alerta_bateria_vehiculo = alertas.generarAlertaBateriaVehiculo(estado_bateria_vehiculo, socket.id);
    //si exite una alerta se agrega al objeto que se le enviara al cliente
    if (alerta_bateria_vehiculo!=null) {
        respuesta.alerta_bateria_vehiculo.push(alerta_bateria_vehiculo);
        lista_alertas.push('alerta_bateria_vehiculo');   
        
        //insertar en la base de datos
        await db.insertarNuevaUbicacion(alerta_bateria_vehiculo);
        //actualizar vehiculo en base de datos
        await db.actualizarEstatusVehiculo(alerta_bateria_vehiculo);
        
    }
    
    if (alerta_bateria_vehiculo==null) {
        
        //buscar alerta de latido de vehiculo
        let nueva_ubicacion = alertas.generarAlertaLatidoVehiculo(socket.id, data);
        
        respuesta.nueva_ubicacion.push(nueva_ubicacion);
        lista_alertas.push('nueva_ubicacion');
        
        //actualizar vehiculo en base de datos
        await db.actualizarEstatusVehiculo(nueva_ubicacion);
    }

    //arreglo de alertas o ubicaciones
    respuesta.alertas= lista_alertas;
    
    return respuesta;

}


/**
 * metodo para desifrar paquete de deteccion de puertas
 * @param {*} data 
 * @param {*} socket 
 */
async function paqueteTransmisionInformacion(data, socket) {
    let respuesta = new Object();
    respuesta.alerta_puerta=[];
    
    //desifrar los datos de la trama gps
    
    //obtener la informacion del detector
    // para saber si es solo voltaje o alereta de puerta
    let informacion_detector = operacion.obtenerDetectorInformacion(data);
    console.log('informacion_detector',informacion_detector);
    //solo actualizacion de voltaje
    if (informacion_detector.alerta_voltaje) {
        //intanciar clase TCPSocket
        tcpSocket  = new TCPSocket();

        //buscar vehiculo por id de socket
        let vehiculo = tcpSocket.obtenerPorId(socket.id);
       
        //actualizar voltaje 
        vehiculo.estado_vehiculo.voltaje_gps = informacion_detector.alerta_voltaje;

        console.log('Actualizacion de voltaje: ',informacion_detector.alerta_voltaje); 
        // Actualizar estado del vehiculo en la clase
        tcpSocket.actualizarEstadoVehiculo(socket.id, vehiculo.estado_vehiculo);

        //actualizar voltaje del gps en el vehiculo
        await db.actualizarVoltajeVehiculo(vehiculo.vehiculo_id, informacion_detector.alerta_voltaje); 
                
  
        return respuesta;
    }

    //alerta de puerta
    if (informacion_detector.alerta_voltaje) {

        //alerta de puerta

        //agregar arreglo de las alertas que se enviaran al cliente
        let lista_alertas=[];   

        //intanciar clase de Alertas
        alertas  = new Alertas();

        //buscar alerta de motor
        let alerta_puerta = alertas.generarAlertaPuerta(informacion_detector.alerta_puerta, socket.id);
        //si exite una alerta se agrega al objeto que se le enviara al cliente

        if (alerta_puerta!=null) {
            respuesta.alerta_puerta.push(alerta_puerta);
            lista_alertas.push('alerta_puerta');
                    
            //insertar en la base de datos
            await db.insertarNuevaUbicacion(respuesta.alerta_puerta);
            //actualizar vehiculo en base de datos
            await db.actualizarEstatusVehiculo(respuesta.alerta_puerta);
        }

    }
    //arreglo de alertas
    respuesta.alertas=  Array.from(new Set(lista_alertas)); 
    
    return respuesta;

}

/**
 * metodo encargado de el paquete de ubicacion
 * @param {*} data 
 * @param {*} socket 
 */




async function buscarUbicacion(data,socket ,cantidad_sincronizar) {
    let objeto_respuesta= new Object();

    //intanciar clase TCPSocket
    tcpSocket  = new TCPSocket();

    //buscar vehiculo por id de socket
    let vehiculo = tcpSocket.obtenerPorId(socket.id);   
   
    //obtener el objeto con los datos generales
    objeto_respuesta = buscarObjetoRespuesta(data,socket);
    
    //obtener curso y estado del vehiculo
    let course_status =operacion.obtenerCourseStatus(data);
    
    //obtener fecha
    vehiculo.estado_vehiculo.fecha_evento= operacion.obtenerFecha(data);
    
    //obtener velocidad
    vehiculo.estado_vehiculo.velocidad= operacion.obtenerVelocidad(data[19]);
    
    
    //obtener latitud
    vehiculo.estado_vehiculo.latitud= operacion.obtenerLatitud(data);
    
    //obtener longitud
    vehiculo.estado_vehiculo.longitud= operacion.obtenerLongitud(data);   
    
    //obtener direccion del vehiculo
    vehiculo.estado_vehiculo.direccion= '';
 
    //obtener variacion en grados gps ejemplo 360°
    vehiculo.estado_vehiculo.variacion_grados = course_status.curso;

    // obtener variacion magnetica ejemplo N/O (noroeste)
    vehiculo.estado_vehiculo.variacion_magneticaGps = course_status.variacion_magneticaGps;
      
    //obtener estado del motor segun la trama 
    let estatus_motor = operacion.obtenerEstadoMotor(data);
    
    //variable para guardar la alerta
    let alerta = 'nueva_ubicacion';

    //verificar si no existe un cambio de estado
    if (vehiculo.estado_vehiculo.estado_motor==estatus_motor) {
        
        //obtener estado gps
        let estado_gps=operacion.obtenerEstadoGps(vehiculo, socket.id);
        vehiculo.estado_vehiculo.estado_gps_id = estado_gps;

        alerta='nueva_ubicacion';

        //veriicar si existe alerta de exeso de velocidad
        if (estado_gps==3200) {
            //agregar alerta o notificacion
            alerta='alerta_velocidad';
        }
    }else{
        
        console.log('cambio de estado de motor');
        // si existe un cambio de estado se genera la alerta
        let descripcion = "Vehiculo apagado" ;
        let codigo_gps = "62467" ;

        if (estatus_motor==1) {

            descripcion = "Vehiculo encendido" ;
            codigo_gps = "62465" ;
                
        } 

        alerta='alerta_motor';

        vehiculo.estado_vehiculo.estado_gps_id = codigo_gps;
        vehiculo.estado_vehiculo.estado_motor=estatus_motor

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
    objeto_respuesta.cantidad_satelite= operacion.obtenerCantidadSatelites(data[10]);

    //obtener MCC (Mobile Network Codes)
    objeto_respuesta.MCC=operacion.obtenerMCC(data, tipo);

    //obtener MNC (Mobile Network Code)
    objeto_respuesta.MNC=operacion.obtenerMNC(data, tipo);

    //obtener LAC (Location Area Code)
    objeto_respuesta.LAC=operacion.obtenerLAC(data, tipo);

    //obtener Cell_ID ( Cell Tower ID)
    objeto_respuesta.Cell_ID=operacion.obtenerCellID(data, tipo);
    
    return objeto_respuesta;
    

}


async function buscarUbicacionZona(data,socket, cantidad_sincronizar) {
    let objeto_respuesta= new Object();
    //obtener el objeto con los datos generales
    objeto_respuesta = buscarObjetoRespuesta(data,socket);

    //intanciar clase TCPSocket
    tcpSocket  = new TCPSocket();

    //buscar vehiculo por id de socket
    let vehiculo = tcpSocket.obtenerPorId(socket.id);   
 
    //obtener curso y estado del vehiculo
    let course_status =operacion.obtenerCourseStatus(data);
    
    //obtener fecha
    vehiculo.estado_vehiculo.fecha_evento= operacion.obtenerFecha(data);
    
    //obtener velocidad
    vehiculo.estado_vehiculo.velocidad= operacion.obtenerVelocidad(data[19]);
    
    
    //obtener latitud
    vehiculo.estado_vehiculo.latitud= operacion.obtenerLatitud(data);
    
    //obtener longitud
    vehiculo.estado_vehiculo.longitud = operacion.obtenerLongitud(data);   
 
    if (cantidad_sincronizar>1){
        vehiculo.estado_vehiculo.direccion= '';
    
    }else{
        //obtener la direccion 
        vehiculo.estado_vehiculo.direccion= await direccion.buscarDireccion(vehiculo.estado_vehiculo.latitud, vehiculo.estado_vehiculo.longitud);
    }
 
    //obtener variacion en grados gps ejemplo 360°
    vehiculo.estado_vehiculo.variacion_grados = course_status.curso;

    // obtener variacion magnetica ejemplo N/O (noroeste)
    vehiculo.estado_vehiculo.variacion_magneticaGps = course_status.variacion_magneticaGps;


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
            vehiculo.estado_vehiculo.fecha_zona = operacion.obtenerFecha(data);

            //Primero punto dentro de zona
            vehiculo.estado_vehiculo.estado_gps_id = 3105;

        }else{

            vehiculo.estado_vehiculo.fecha_zona = operacion.obtenerFecha(data);
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
            vehiculo.estado_vehiculo.fecha_zona = operacion.obtenerFecha(data);
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
    //buscar la respuesta que se le enviara al gps
    //este protocolo no requiere ubicacion
    respuesta.respuestaGps = null;
    let longitud_requerida=39;

    //cortar la data para ir sincronizando
    let cortar_data = cortarArreglo(trama, longitud_requerida); 
    let cantidad_sincronizar=cortar_data.length;
    //iterar la data cortada
    await asyncForEach(cortar_data, async (dataCortada) => {
        //validar que la data sea correcta
        if(dataCortada.length!=longitud_requerida){
            console.log('ignorando trama invalida'.red);
            return ;
        }
        let ubicacion_buscada = await buscarUbicacion(dataCortada, socket, cantidad_sincronizar);
        
        //agregando alerta 
        lista_alertas.push(ubicacion_buscada.alerta);
        respuesta.nueva_ubicacion.push(ubicacion_buscada.objeto_respuesta);        
        
        let zona_buscada = await buscarUbicacionZona(dataCortada,socket, cantidad_sincronizar);
        //agregando alerta 
        if (zona_buscada) {   
            lista_alertas.push('alerta_zona');
            respuesta.alerta_zona.push(zona_buscada.objeto_respuesta);
        }
        
     });

    //insertar en la tabla de eventos de nuevas ubicaciones dentro de zona
    await asyncForEach(respuesta.alerta_zona, async (alerta_zona) => {
        await db.insertarNuevaUbicacion(alerta_zona);
        actualizar_vehiculo=alerta_zona;
    
    });

    //insertar en la tabla de eventos de nuevas ubicaciones
    await asyncForEach(respuesta.nueva_ubicacion, async (nueva_ubicacion) => {
        await db.insertarNuevaUbicacion(nueva_ubicacion);
        actualizar_vehiculo=nueva_ubicacion;
    
    });
  

    //actualizar en la base de datos en estado de vehiculo
    await db.actualizarEstatusVehiculo(actualizar_vehiculo);

    //arreglo de alertas o ubicaciones
    respuesta.alertas= Array.from(new Set(lista_alertas)); 
    
    return respuesta;
}

async function paqueteAlarma(data,socket) {
    let respuesta = {};
    let actualizar_estado_vehiculo;
     //intanciar clase TCPSocket
     tcpSocket  = new TCPSocket();
     
    //agregar arreglo de las alertas que se enviaran al cliente
    let lista_alertas=[];
    
    //buscar la respuesta que se le enviara al gps
    respuesta.respuestaGps = buscarRespuesta(data);

    //buscar alerta segun el contenido de informacion
    let buscar_alerta_protocolo_alerta = await buscarAlertaProtocoloAlerta(data,socket);

    if (buscar_alerta_protocolo_alerta) {
        lista_alertas.push(buscar_alerta_protocolo_alerta.alerta)
        respuesta[`${buscar_alerta_protocolo_alerta.alerta}`]=[buscar_alerta_protocolo_alerta.objeto_respuesta];
        //actualizar en la base de datos en estado de vehiculo
        await db.actualizarEstatusVehiculo(buscar_alerta_protocolo_alerta.objeto_respuesta);
        
        //insertar evento a la base de datos
        db.insertarNuevaUbicacion( buscar_alerta_protocolo_alerta.objeto_respuesta);

        //actualizar estado de vehiculo
        actualizar_estado_vehiculo = buscar_alerta_protocolo_alerta.objeto_respuesta;

    }

    //buscar alerta segun el contenido de informacion
    let buscar_alerta_lenguaje_alerta = await buscarAlertaLenguajeAlerta(data,socket);

    if (buscar_alerta_lenguaje_alerta) {
        lista_alertas.push(buscar_alerta_lenguaje_alerta.alerta);
        respuesta[`${buscar_alerta_lenguaje_alerta.alerta}`]=[buscar_alerta_lenguaje_alerta.objeto_respuesta];
        //actualizar en la base de datos en estado de vehiculo 
        db.actualizarEstatusVehiculo(buscar_alerta_lenguaje_alerta.objeto_respuesta);
        //insertar evento a la base de datos
        db.insertarNuevaUbicacion(buscar_alerta_lenguaje_alerta.objeto_respuesta);
        // Actualizar estado del vehiculo en la clase
        //actualizar_estado_vehiculo = buscar_alerta_lenguaje_alerta.objeto_respuesta;
        
    }

    // Actualizar estado del vehiculo en la clase
    //tcpSocket.actualizarEstadoVehiculo(socket.id, actualizar_estado_vehiculo);
   
    //arreglo de alertas o ubicaciones
    respuesta.alertas=Array.from(new Set(lista_alertas)); 
    

    return respuesta;

}

async function buscarAlertaLenguajeAlerta(data,socket) {
    //informacion del contenido de lenguaje de alerta gps
    let contenido_alerta = await operacion.obtenerAlertaLenguajeGps(data, socket);

    if (contenido_alerta.alerta==null) {
        return null;
    }
 
     let objeto_respuesta= new Object();
     //obtener el objeto con los datos generales
     objeto_respuesta= buscarObjetoRespuesta(data,socket, 'alerta');

     //intanciar clase TCPSocket
    tcpSocket  = new TCPSocket();

    //buscar vehiculo por id de socket
    let vehiculo = tcpSocket.obtenerPorId(socket.id);   

    //obtener curso y estado del vehiculo
    let course_status =operacion.obtenerCourseStatus(data);

    //obtener fecha
    vehiculo.estado_vehiculo.fecha_evento= operacion.obtenerFecha(data);
    
    //obtener velocidad
    vehiculo.estado_vehiculo.velocidad= operacion.obtenerVelocidad(data[19]);

    //obtener latitud
    vehiculo.estado_vehiculo.latitud= operacion.obtenerLatitud(data);
    
    //obtener longitud
    vehiculo.estado_vehiculo.longitud= operacion.obtenerLongitud(data);   
    
    //obtener la direccion 
    vehiculo.estado_vehiculo.direccion= await direccion.buscarDireccion(vehiculo.estado_vehiculo.latitud, vehiculo.estado_vehiculo.longitud);
    //vehiculo.estado_vehiculo.direccion= '';
    
    //obtener variacion en grados gps ejemplo 360°
    vehiculo.estado_vehiculo.variacion_grados = course_status.curso;

    // obtener variacion magnetica ejemplo N/O (noroeste)
    vehiculo.estado_vehiculo.variacion_magneticaGps = course_status.variacion_magneticaGps;
    
    //si el estado de protocolo es distinto a null se devuelve una alerta
    estado_gps=contenido_alerta.alerta;
    
    //actualizar el estado de vehiculo
    vehiculo.estado_vehiculo.estado_gps_id =estado_gps;     
    
    //obtener el objeto del estado de vewhiculo
    objeto_respuesta.estado_vehiculo = JSON.parse(JSON.stringify(vehiculo.estado_vehiculo));

    //descripcion de alerta
    let alerta = contenido_alerta.descripcion_alerta;

    return{
        alerta,
        objeto_respuesta
    }

}

async function buscarAlertaProtocoloAlerta(data, socket) {
    //informacion del gps
    let contenidoInformativo = operacion.ObtenerInformacionGps(data, socket, 'alerta');
    
    //protocolo de alertas
    let estado_protocolo_alerta =contenidoInformativo.protocolo_alerta;

    //si la alerta es null se sale 
    if (estado_protocolo_alerta==null) {
        return null;
    }

    let objeto_respuesta= new Object();
    //obtener el objeto con los datos generales
    objeto_respuesta=  buscarObjetoRespuesta(data,socket, 'alerta');

    //intanciar clase TCPSocket
    tcpSocket  = new TCPSocket();

    //buscar vehiculo por id de socket
    let vehiculo = tcpSocket.obtenerPorId(socket.id);   

    //obtener curso y estado del vehiculo
    let course_status =operacion.obtenerCourseStatus(data);

    //obtener fecha
    vehiculo.estado_vehiculo.fecha_evento= operacion.obtenerFecha(data);
    
    //obtener velocidad
    vehiculo.estado_vehiculo.velocidad= operacion.obtenerVelocidad(data[19]);

    //obtener latitud
    vehiculo.estado_vehiculo.latitud= operacion.obtenerLatitud(data);
    
    //obtener longitud
    vehiculo.estado_vehiculo.longitud= operacion.obtenerLongitud(data);   
    
    //obtener la direccion 
    vehiculo.estado_vehiculo.direccion= await direccion.buscarDireccion(vehiculo.estado_vehiculo.latitud, vehiculo.estado_vehiculo.longitud);
    //vehiculo.estado_vehiculo.direccion= '';
    
    //obtener variacion en grados gps ejemplo 360°
    vehiculo.estado_vehiculo.variacion_grados = course_status.curso;

    // obtener variacion magnetica ejemplo N/O (noroeste)
    vehiculo.estado_vehiculo.variacion_magneticaGps = course_status.variacion_magneticaGps;
    
    //si el estado de protocolo es distinto a null se devuelve una alerta
    estado_gps=contenidoInformativo.protocolo_alerta;
    
    //actualizar el estado de vehiculo
    vehiculo.estado_vehiculo.estado_gps_id = estado_gps;     
    
    //obtener el objeto del estado de vewhiculo
    objeto_respuesta.estado_vehiculo = JSON.parse(JSON.stringify(vehiculo.estado_vehiculo));

    //descripcion de alerta
    let alerta = contenidoInformativo.descripcion_protocolo_alerta;

    return{
        objeto_respuesta,
        alerta
    }
}
 
exports.GestionarProtocolo=GestionarProtocolo;
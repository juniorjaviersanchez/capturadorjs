/**
 * este modulo esta diseñado para realizar todos los calculos
 * y operaciones que se requieran para desifrar las tramas de datos 
 * de los gps
 */

 //incluir modulo para conversiones
const convertir=require('./conversiones');
//incluir module path para manejar directorios
const path = require('path');
//incluir la clase alertas
const Alertas = require(path.resolve('./src', 'alertasGps.js'));

//incluir la clase TCPSocket
const TCPSocket = require(path.resolve('./src', 'tcp-socket.js'));



/**
 * metodo encargado de decifrar el imei del gps
 * @param {*} data 
 */
function obtenerImeiGps(data) {
    //CONVERTIR TRAMA A ASCII   
    let trama_ascii = data.toString();

    //separar trama
    let trama_ascii_separada = trama_ascii.split(",");

    //imei esta en la posicion 1
    let imei =  trama_ascii_separada[1];
 
    return imei;
    
}

/**
 * metodo encargado de obtener el nivel de voltaje de la bateria del gps
 * @param {*} data 
 */
function obtenerNiveBateriaGps(data) {
    let trama = data[5].toString();
    let estado_bateria_gps=trama;
    let descripcion_bateria_gps='Bateria desconectada';
 

    switch (trama) {
        case '0':
            descripcion_bateria_gps='Bateria desconectada'; 
            break;
    
        case '1':
            descripcion_bateria_gps='Bateria extremadamente baja';
            break;
    
        case '2':
            descripcion_bateria_gps='Bateria muy baja';
            break;
        
        case '3':
            descripcion_bateria_gps='Bateria baja';
            break;
                    
        case '4':
            descripcion_bateria_gps='Bateria media';
            break;
                
        case '5':
            descripcion_bateria_gps='Bateria alta';
            break;
                              
        case '6':
            descripcion_bateria_gps='Bateria completa';
            break;
                     
        default:
            descripcion_bateria_gps='Bateria desconectada';
            break;
    }
 

return {estado_bateria_gps : estado_bateria_gps,
        descripcion_bateria_gps : descripcion_bateria_gps};

}

/**
 * metodo encargado de obtener la senial movil del gps
 * @param {*} data 
 */
function obtenerSenialGps(data){
    let trama = data[6].toString();
    let estado_senial_gps=trama;
    let descripcion_senial_gps='Desconectodo';

 
    switch (trama) {
        case '0':
            descripcion_senial_gps='Desconectodo'; 
            break;
    
        case '1':
            descripcion_senial_gps='señal extremadamente debil';
            break;
    
        case '2':
            descripcion_senial_gps='señal debil';
            break;
        
        case '3':
            descripcion_senial_gps='señal buena';
            break;
                    
        case '4':
            descripcion_senial_gps='señal excelente';
            break;
 
        default:
            descripcion_senial_gps='Bateria desconectada';
            break;
    }
 

return {estado_senial_gps : estado_senial_gps,
        descripcion_senial_gps : descripcion_senial_gps};

}

/**
 * metodo encargado de decifrar un paquete de informacion enviado
 * por el gps en forma de numero binario
 * @param {*} data 
 */
function ObtenerInformacionGps(data) {
    let trama_binario =[];
    //CONVERTIR TRAMA A ASCII   
    let trama_ascii = data.toString();

    //separar trama
    let trama_ascii_separada = trama_ascii.split(",");
      
    trama_binario[0] =  parseInt(trama_ascii_separada[12].substring(0, 2), 16).toString(2);
    trama_binario[1] =  parseInt(trama_ascii_separada[12].substring(2, 4), 16).toString(2);
    trama_binario[2] =  parseInt(trama_ascii_separada[12].substring(4, 6), 16).toString(2);
    trama_binario[3] =  parseInt(trama_ascii_separada[12].substring(6, 8), 16).toString(2);
    
    console.log('pecionaste panico',trama_binario[3]);
  
    let acc =trama_binario[2].substring(5, 6);
    let panic =trama_binario[3].substring(6, 7);
    let bateria =trama_binario[1].substring(4, 5);
    let vibracion =trama_binario[1].substring(5, 6);
    let removerBateria =trama_binario[1].substring(2, 3);
    let powerFailure =trama_binario[2].substring(2, 3);
    let corteEnerg =trama_binario[0].substring(3, 4);
 

    return {
        acc,
        panic,
        powerFailure,
        vibracion,
        removerBateria,
        bateria,
        corteEnerg,

    }
 
}


function obtenerAlertaLenguajeGps(data, tipo) {
    trama1= data[34];
    trama2= data[35];

    let protocolo_alerta=null;
    let descripcion_protocolo_alerta='';

    switch (trama1) {
        //sin alerta estatus normal
        case 0:
            descripcion_protocolo_alerta = 'normal';
            codigo_gps=null;
            break;
        //alerta SOS
        case 1:
            protocolo_alerta=63553;
            descripcion_protocolo_alerta='alerta_sos';
            break;
        //alerta_corte_energia
        case 2:
            protocolo_alerta=64787;
            descripcion_protocolo_alerta='alerta_corte_energia';
            break;
        //alerta_de_vibracion
        case  3:
            protocolo_alerta=63601;
            descripcion_protocolo_alerta='alerta_de_vibracion';
             break;
        //alerta_de_vibracion
        case  9:
            protocolo_alerta=63602;
            descripcion_protocolo_alerta='alerta_de_vibracion';
            break;
        //alerta_cambio_de_sim
        case 10:
            protocolo_alerta=64794;
            descripcion_protocolo_alerta='alerta_cambio_de_sim';
            break;
        //alerta_modo_avion
        case 12:
            protocolo_alerta=3303;
            descripcion_protocolo_alerta='alerta_modo_avion';
            break;
        //alerta_de_manipulación
        case 13:  
            protocolo_alerta=64791;
            descripcion_protocolo_alerta='alerta_de_manipulación';
            
            break;
    
        default:
            break;
    }

    return{
        alerta: protocolo_alerta,
        descripcion_alerta: descripcion_protocolo_alerta
    }
    
}


function obtenerFecha(data) {
    
    let hhmmss = data[3]; 
    let fecha = data[11];    
    console.log('fecha',fecha);
    let YY = fecha.substring(4,6);
    let MM = fecha.substring(2,4).padStart(2, '0');
    let DD = fecha.substring(0,2).padStart(2, '0');
    let hh = hhmmss.substring(0,2).padStart(2, '0');
    let mm = hhmmss.substring(2,4).padStart(2, '0');
    let ss = hhmmss.substring(4,6).padStart(2, '0');



    //algunos gps devuelven fecha corta ejemplo 2020=20
    // por lo que el año sea completo o si no se completa
    if (YY < 100) {
         YY = 2000+parseInt(YY);
    }
 


    let fecha_gps = `${YY}-${MM}-${DD} ${hh}:${mm}:${ss}`;
 
    let fecha_para_restar = parseInt((new Date(fecha_gps).getTime() / 1000).toFixed(0))
 
    let fecha_restada = fecha_para_restar - 18000;
   
    let fecha_formateada = new Date(fecha_restada * 1000)
   
    let hora_final = fecha_formateada.toTimeString().split(' ')[0];
    let fecha_final;

    let day = fecha_formateada.getDate()
    let month = fecha_formateada.getMonth() + 1
    let year = fecha_formateada.getFullYear()

 
    fecha_final = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
 
 
    return `${fecha_final} ${hora_final}`;

 
}


 

function obtenerLatitud(data) {
/*
    let lat1=data[5].substring(0,2);
    let lat2=data[5].substring(2,9);
    let latitude1 =parseFloat(lat2)/60;	      
    let latitud=(parseInt(lat1)+latitude1)*-1;
  */

    let lat=data[5];
 
    return -(Number(lat.slice(0,2)) + (Number(lat.slice(2,9))/60))

 //   return latitud;
}

function obtenerLongitud(data) {
/*
    let longi1= data[7].substring(0,3);
    let longi2= data[7].substring(4,10);
    let longitude =parseFloat(longi2)/60;	      	      
    let longitud=(parseInt(longi1)+longitude)*-1;
  */ 
    let long= data[7];

    return -(Number(long.slice(0,3)) + (Number(long.slice(3,10))/60))
  
  //  return longitud;
}

function obtenerVelocidad(data) {
    //obtener velocidad
    let velocidad = data[9].substring(0,3);

    return velocidad;
}

function obtenerCantidadSatelites(data) {
    let data_convertida = data.toString(16);
    let cantSate = data_convertida.substring(1, 2);

    return parseInt(cantSate,16);
}


function obtenerMCC(data, tipo='ubicacion') {
    let trama1;
    let trama2;

    if (tipo=='ubicacion') {
        
        trama1= data[22].toString(16);
        trama2= data[23].toString(16);
        
    }else{
        trama1= data[23].toString(16);
        trama2= data[24].toString(16);
    }
   
   
    let unir_cadena=trama1+""+trama2;
    let MCC=parseInt(unir_cadena,16);

    return MCC;
}


function obtenerMNC(data, tipo='ubicacion') {
    let trama;
    if (tipo=='ubicacion') {
        trama= data[24].toString(16);
    }else{
        trama= data[25].toString(16);     
    }


    let MNC=parseInt(trama,16);

    return MNC;
}

function obtenerLAC(data, tipo='ubicacion') {
    let trama1;
    let trama2;

    if (tipo=='ubicacion') {
        
        trama1= data[25].toString(16);
        trama2= data[26].toString(16);
        
    }else{
        trama1= data[26].toString(16);
        trama2= data[27].toString(16);
    }

    let unir_cadena=trama1+""+trama2;
    let LAC=parseInt(unir_cadena,16);

    return LAC;
}


function obtenerCellID(data,  tipo='ubicacion') {
    let trama1;
    let trama2;
    let trama3;

    if (tipo=='ubicacion') {
        
        trama1= data[27].toString(16);
        trama2= data[28].toString(16);
        trama3= data[29].toString(16);
        
    }else{

        trama1= data[28].toString(16);
        trama2= data[29].toString(16);
        trama3= data[30].toString(16);
    }


    let unir_cadena=trama1+""+trama2+""+trama3;
    let CellID=parseInt(unir_cadena,16);

    return CellID;
}

function obtenerCourseStatus(data) {
    let trama_binario1 =  data[20].toString(2);
    let trama_binario2 =  data[21].toString(2);
    let unir_binario =  trama_binario1+""+trama_binario2;
    
    //cadena de binario 16
    let byte1  = unir_binario.substring(0,1);
    let byte2  = unir_binario.substring(1,2);
    let byte3  = unir_binario.substring(2,3);
    let byte4  = unir_binario.substring(3,4);
    let byte5  = unir_binario.substring(4,5);
    let byte6  = unir_binario.substring(5,6);
    let byte7  = unir_binario.substring(6,7);
    let byte8  = unir_binario.substring(7,8);
    let byte9  = unir_binario.substring(8,9);
    let byte10 = unir_binario.substring(9,10);
    let byte11 = unir_binario.substring(10,11);
    let byte12 = unir_binario.substring(11,12);
    let byte13 = unir_binario.substring(12,13);
    let byte14 = unir_binario.substring(13,14);
    let byte15 = unir_binario.substring(14,15);
    let byte16 = unir_binario.substring(15,16);

    let grados=byte7+""+byte8+""+byte9+""+byte10+""+byte11+""+byte12+""+byte13+""+byte14+""+byte15+""+byte16;
    
    //obtenemos el curso del vehiculop
    let curso = bin2dec(grados);

    let latitud_norte = byte6 == 1 ? 'N' : 'S';
    let longitud_este = byte5 == 1 ? 'O' : 'E';
    let variacion_magneticaGps = latitud_norte+"/"+longitud_este;

    return {
        curso,
        variacion_magneticaGps
    }


}

//convertir de binario a decimal
function bin2dec(num){ 
    return num.split('').reverse().reduce(function(x, y, i){ return (y === '1') ? x + Math.pow(2, i) : x; }, 0); 
} 

function obtenerEstadoGps(data, id_cliente) {
    let MINIMUM_SPEED_KPH = 7;
    let velocidad = data.estado_vehiculo.velocidad;
    let grados = data.estado_vehiculo.variacion_grados;

    //intanciar clase TCPSocket
    tcpSocket  = new TCPSocket();
    
    //buscar vehiculo por id de socket
    let vehiculo = tcpSocket.obtenerPorId(id_cliente);
    
    let maxSpeed = vehiculo.velocidad_max;
            

    if ((velocidad >  MINIMUM_SPEED_KPH) && (velocidad < maxSpeed)) {
        //en movimiento
        
         if (grados>=0 && grados<=44) {
             codigo_gps = 61714;
             return codigo_gps;
        }
        if (grados>=45 && grados<=90) {
             codigo_gps = 61714;   
             return codigo_gps;
        }
        if (grados>=91 && grados<=135) {
             codigo_gps = 61714;
             return codigo_gps;
        }
        if (grados>=136 && grados<=180) {
             codigo_gps = 61714;
             return codigo_gps;
        }
        if (grados>=181 && grados<=225) {
             codigo_gps = 61714;
             return codigo_gps;
        }
        if (grados>=226 && grados<=260) {
             codigo_gps = 61714;
             return codigo_gps;
        } 
        if (grados>=261 && grados<=305) {
             codigo_gps = 61714;
             return codigo_gps;
        }
        if (grados>=306 && grados<=360) {
            codigo_gps = 61714;
            return codigo_gps;
        }
  
} else if (velocidad >= maxSpeed){
    //exeso de velocidad
    return codigo_gps = 61722;
   }
   else if (velocidad <= MINIMUM_SPEED_KPH) {
       //  detenido
       data.estado_vehiculo.velocidad=0;
       return codigo_gps = 61715;
   }
return 61714;
}

153


function convertirHexaAsci(hexx) {
    var hex = hexx.toString();//force conversion
    var str = '';
    for (var i = 0; (i < hex.length && hex.substr(i, 2) !== '00'); i += 2)
        str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
    return str;
}

exports.obtenerEstadoGps=obtenerEstadoGps;
exports.obtenerCourseStatus=obtenerCourseStatus;
exports.obtenerCellID=obtenerCellID;
exports.obtenerLAC=obtenerLAC;
exports.obtenerMNC=obtenerMNC;
exports.obtenerMCC=obtenerMCC;
exports.obtenerCantidadSatelites=obtenerCantidadSatelites;
exports.obtenerVelocidad=obtenerVelocidad;
exports.obtenerImeiGps=obtenerImeiGps;
exports.obtenerNiveBateriaGps=obtenerNiveBateriaGps;
exports.obtenerSenialGps=obtenerSenialGps;
exports.ObtenerInformacionGps=ObtenerInformacionGps;
exports.obtenerFecha=obtenerFecha;
exports.obtenerLatitud=obtenerLatitud;
exports.obtenerLongitud=obtenerLongitud;
exports.obtenerAlertaLenguajeGps=obtenerAlertaLenguajeGps;
exports.convertirHexaAsci=convertirHexaAsci;

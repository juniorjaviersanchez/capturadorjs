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
    let array_imei=[];
    
    for (let i = 4; i < 12; i++) {
        
        array_imei.push(data[i]);
        
    }
    
    return convertir.toHexString(array_imei);
    
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
function ObtenerInformacionGps(data, socket, tipo='latido') {
    let trama_binario;

    if (tipo=='latido') {
        trama_binario =  data[4].toString(2).padStart(8, '0');
    }else{
        trama_binario =  data[31].toString(2).padStart(8, '0');
    }
 
    //let Bit0 = trama_binario.substring(7, 8);
    let Bit1 = trama_binario.substring(6, 7);
    let Bit2 = trama_binario.substring(5, 6);
    let Bit3_5 = trama_binario.substring(2, 5);
    let Bit6 = trama_binario.substring(1, 2);
    let Bit7 = trama_binario.substring(0, 1);
 
    
    // estado del motor
    let estado_motor = Bit1;
    let descripcion_estado_motor = Bit1==1 ? "Vehiculo encendido":"Vehiculo apagado";

    //estado de la bateria del vehiculo
    let estado_bateria_vehiculo = Bit2;
    let descripcion_bateria_vehiculo = Bit2==1 ? "Bateria Conectada" :"Bateria desconectada";

    //alerta del protocolo de alertas
    let protocolo_de_alerta = Bit3_5;
    let descripcion_protocolo_alerta='';
    let protocolo_alerta=null;

    switch (protocolo_de_alerta) {
        // protocolo_alerta dice sin alerta estado normal
        case '000':
            protocolo_alerta=null;
            descripcion_protocolo_alerta='';
            break;
        // protocolo_alerta dice alerta de vibracion
        case '001':
            protocolo_alerta=63601;
            descripcion_protocolo_alerta='alerta_de_vibracion';
            break;
        // protocolo_alerta dice Alarma de corte de energía
        //case '010':
        //descripcion_protocolo_alerta='Alerta de Vibracion';
        //    break;
        // protocolo_alerta dice bateria gps baja
        case '011':
            protocolo_alerta=64784;
            descripcion_protocolo_alerta='alerta_bateria_gps';

            break;
        // protocolo_alerta dice SOS
        case '100':
            protocolo_alerta=63553;
            descripcion_protocolo_alerta='alerta_sos';

            break;
                                            
        default:
            break;
    }
 

    return {
        estado_motor,
        descripcion_estado_motor,
        estado_bateria_vehiculo,
        descripcion_bateria_vehiculo,
        protocolo_alerta,
        descripcion_protocolo_alerta,

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
    
    //convertir los valores de la trama a decimal
    let YY = data[4].toString();
    let MM = data[5].toString().padStart(2, '0');
    let DD = data[6].toString().padStart(2, '0');
    let hh = data[7].toString().padStart(2, '0');
    let mm = data[8].toString().padStart(2, '0');
    let ss = data[9].toString().padStart(2, '0');

      //algunos gps devuelven fecha corta ejemplo 2020=20
     // por lo que el año sea completo o si no se completa
     if (YY < 100) {
        YY = 2000+parseInt(YY);
      }

    let fecha_gps = `${YY}-${MM}-${DD} ${hh}:${mm}:${ss}`;
 
    let fecha_para_restar = parseInt((new Date(fecha_gps).getTime() / 1000).toFixed(0))
 
    let fecha_restada = fecha_para_restar;
   
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

    //convertir los valores de la trama a decimal
    let lati1= ''+data[11].toString(16).padStart(2, '0');
    let lati2=  ''+data[12].toString(16).padStart(2, '0');
    let lati3=  ''+data[13].toString(16).padStart(2, '0');
    let lati4= ''+data[14].toString(16).padStart(2, '0');
    let unir_cadena=  lati1+lati2+lati3+lati4;
    let latitud=(parseInt(unir_cadena,16)/1800000)*-1;  

    return latitud;
}

function obtenerLongitud(data) {

    let longi1= ''+data[15].toString(16).padStart(2, '0');
    let longi2= ''+data[16].toString(16).padStart(2, '0');
    let longi3= ''+data[17].toString(16).padStart(2, '0');
    let longi4= ''+data[18].toString(16).padStart(2, '0');
    let unir_cadena=  longi1+longi2+longi3+longi4;
    let longitud=(parseInt(unir_cadena,16)/1800000)*-1;

    return longitud;
}

function obtenerVelocidad(data) {
    let velocidad = data.toString();
    
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
    let trama_binario1 =  data[20].toString(2).padStart(8, '0');
    let trama_binario2 =  data[21].toString(2).padStart(8, '0');
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

    }else if (velocidad >= maxSpeed){
        //exeso de velocidad
        return codigo_gps = 61722;
    }else if (velocidad <= MINIMUM_SPEED_KPH) {
        //  detenido
        data.estado_vehiculo.velocidad=0;
        return codigo_gps = 61715;
    }


return 61714;
}

function obtenerFechaActual() {

    const d = new Date();

    let day = d.getDate()
    let month = d.getMonth() + 1
    let year = d.getFullYear()

 
    let date = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    const time = d.toTimeString().split(' ')[0];
  
    return `${date} ${time}`
      
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
exports.obtenerFechaActual=obtenerFechaActual;
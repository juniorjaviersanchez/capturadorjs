//incluir module path para manejar directorios
const path = require('path');
//incluir la clase TCPSocket
const TCPSocket = require(path.resolve('./src', 'tcp-socket.js'));
//incluir la clase de operaciones
const operacion = require(path.resolve('./servidores-tcp/concox/utilidades', 'operaciones.js'));

class Alertas{
 
     /**
     * metodo para validar alerta de motor 
     * vehiculo encendido
     * vehiculo apagado
     * @param {*} estatus 
     */

    generarAlertaMotor(estatus, id_cliente) {
        //intanciar clase TCPSocket
        tcpSocket  = new TCPSocket();
 
        //buscar vehiculo por id de socket
        let vehiculo = tcpSocket.obtenerPorId(id_cliente);
 
        //verificar si no existe un cambio de estado
        if (vehiculo.estado_vehiculo.estado_motor==estatus) {
            return null;
        }

        // si existe un cambio de estado se genera la alerta
        let descripcion = "Vehiculo apagado" ;
        let codigo_gps = "62467" ;

        if (estatus==1) {

            descripcion = "Vehiculo encendido" ;
            codigo_gps = "62465" ;
                
        } 

        // si existe un cambio de estado se genera la alerta
        //se actualizan los datos del cambio
        //obtener status de bateria
        vehiculo.estado_vehiculo.estado_motor = estatus;
        vehiculo.estado_vehiculo.descripcion_motor = descripcion;
        //obtener codigo de gps
        vehiculo.estado_vehiculo.estado_gps_id = codigo_gps;
        //obtener fecha
        vehiculo.estado_vehiculo.fecha_evento= this.obtenerFechaActual();

        //se crea el objeto que se enviara al cliente
        let alerta_motor = new Object();
        
        //obtener imei
        alerta_motor.imei=vehiculo.imei_gps;
    
        //obtener id de organizacion 
        alerta_motor.organizacion_id=vehiculo.organizacion_id;
    
        // Obtener ID de flota
        alerta_motor.flota_id = vehiculo.flota_id;
    
        //obtener id
        alerta_motor.vehiculo_id=vehiculo.vehiculo_id;

        // Actualizar estado del vehiculo en la clase
        tcpSocket.actualizarEstadoVehiculo(id_cliente, vehiculo.estado_vehiculo);
        //estado de vehiculo 
        alerta_motor.estado_vehiculo = JSON.parse(JSON.stringify(vehiculo.estado_vehiculo));




        return alerta_motor;
     }
     
     /**
      * generar alerta de panico
      * @param {*} estatus 
      * @param {*} id_cliente 
      */
     generarAlertaPanico(estatus, id_cliente) {
        //intanciar clase TCPSocket
        tcpSocket  = new TCPSocket();
 
        //buscar vehiculo por id de socket
        let vehiculo = tcpSocket.obtenerPorId(id_cliente);
 
        //verificar si no existe un cambio de estado
        if (estatus!=0) {
            return null;
        }

        // si existe un cambio de estado se genera la alerta
        let descripcion = "alerta sos" ;
        let codigo_gps = "63553" ;


        // si existe un cambio de estado se genera la alerta
        //se actualizan los datos del cambio

        vehiculo.estado_vehiculo.descripcion_motor = descripcion;
        //obtener codigo de gps
        vehiculo.estado_vehiculo.estado_gps_id = codigo_gps;
        //obtener fecha
        vehiculo.estado_vehiculo.fecha_evento= this.obtenerFechaActual();

        //se crea el objeto que se enviara al cliente
        let alerta_sos = new Object();
        
        //obtener imei
        alerta_sos.imei=vehiculo.imei_gps;
    
        //obtener id de organizacion 
        alerta_sos.organizacion_id=vehiculo.organizacion_id;
    
        // Obtener ID de flota
        alerta_sos.flota_id = vehiculo.flota_id;
    
        //obtener id
        alerta_sos.vehiculo_id=vehiculo.vehiculo_id;
        // Actualizar estado del vehiculo en la clase
        tcpSocket.actualizarEstadoVehiculo(id_cliente, vehiculo.estado_vehiculo);

        //estado de vehiculo 
        alerta_sos.estado_vehiculo = JSON.parse(JSON.stringify(vehiculo.estado_vehiculo));





        return alerta_sos;
     }
   
    /**
     * metodo para validar alerta de bateria del vehiculo
     * bateria conectada
     * bateria desconectada 
     * @param {*} estatus 
     */
    generarAlertaBateriaVehiculo(estatus, id_cliente){ 
        //intanciar clase TCPSocket
        tcpSocket  = new TCPSocket();

        //buscar vehiculo por id de socket
        let vehiculo = tcpSocket.obtenerPorId(id_cliente);

        //verificar si no existe un cambio de estado
        if (vehiculo.estado_vehiculo.estado_bateria_vehiculo==estatus || estatus==0) {
            return null;
        }
 
      
        let descripcion = "Bateria de vehiculo Conectada" ;
        let codigo_gps = "64789" ;     
        

        // si existe un cambio de estado se genera la alerta
        //se actualizan los datos del cambio
        //obtener status de bateria
        vehiculo.estado_vehiculo.estado_bateria_vehiculo = estatus;
        vehiculo.estado_vehiculo.descripcion_bateria_vehiculo = descripcion;
        //obtener codigo de gps
        vehiculo.estado_vehiculo.estado_gps_id = codigo_gps;
        //obtener fecha
        vehiculo.estado_vehiculo.fecha_evento= this.obtenerFechaActual();

 
        //se crea el objeto que se enviara al cliente
        let alerta_bateria_vehiculo = new Object();

        //obtener imei
        alerta_bateria_vehiculo.imei=vehiculo.imei_gps;
    
        //obtener id de organizacion 
        alerta_bateria_vehiculo.organizacion_id=vehiculo.organizacion_id;
    
        // Obtener ID de flota
        alerta_bateria_vehiculo.flota_id = vehiculo.flota_id;
    
        //obtener id
        alerta_bateria_vehiculo.vehiculo_id=vehiculo.vehiculo_id;
        // Actualizar estado del vehiculo en la clase
        tcpSocket.actualizarEstadoVehiculo(id_cliente, vehiculo.estado_vehiculo);

        //estado de vehiculo 
        alerta_bateria_vehiculo.estado_vehiculo = JSON.parse(JSON.stringify(vehiculo.estado_vehiculo));
        


        return alerta_bateria_vehiculo;
     }
         /**
     * metodo para validar alerta de bateria del vehiculo
     * bateria conectada
     * bateria desconectada 
     * @param {*} estatus 
     */
    generarAlertaPuerta(estatus, id_cliente){ 
        //intanciar clase TCPSocket
        tcpSocket  = new TCPSocket();

        //buscar vehiculo por id de socket
        let vehiculo = tcpSocket.obtenerPorId(id_cliente);

        //verificar si no existe un cambio de estado
        if (vehiculo.estado_vehiculo.estado_puerta==estatus) {
            return null;
        }

        let descripcion = "" ;
        let codigo_gps = "" ;
        //puerta abierta
        if (estatus==1 || estatus==3) {
            descripcion = "Puerta Abierta" ;
            codigo_gps = "62673" ;     
        } 

        //puerta cerrada        
        if (estatus==0 || estatus==2) {
            descripcion = "Puerta Cerrada" ;
            codigo_gps = "62549" ;     
        } 

        // si existe un cambio de estado se genera la alerta
        //se actualizan los datos del cambio
        //obtener status de bateria
        vehiculo.estado_vehiculo.estado_puerta = estatus;
        vehiculo.estado_vehiculo.descripcion_puerta = descripcion;
        //obtener codigo de gps
        vehiculo.estado_vehiculo.estado_gps_id = codigo_gps;
        //obtener fecha
        vehiculo.estado_vehiculo.fecha_evento= this.obtenerFechaActual();

 
        //se crea el objeto que se enviara al cliente
        let alerta_bateria_vehiculo = new Object();

        //obtener imei
        alerta_bateria_vehiculo.imei=vehiculo.imei_gps;
    
        //obtener id de organizacion 
        alerta_bateria_vehiculo.organizacion_id=vehiculo.organizacion_id;
    
        // Obtener ID de flota
        alerta_bateria_vehiculo.flota_id = vehiculo.flota_id;
    
        //obtener id
        alerta_bateria_vehiculo.vehiculo_id=vehiculo.vehiculo_id;

        // Actualizar estado del vehiculo en la clase
        tcpSocket.actualizarEstadoVehiculo(id_cliente, vehiculo.estado_vehiculo);
        //estado de vehiculo 
        alerta_bateria_vehiculo.estado_vehiculo = JSON.parse(JSON.stringify(vehiculo.estado_vehiculo));
        


        return alerta_bateria_vehiculo;
     }

     generarAlertaLatidoVehiculo( id_cliente, data){
        
        
        //intanciar clase TCPSocket
        tcpSocket  = new TCPSocket();

        //buscar vehiculo por id de socket
        let vehiculo = tcpSocket.obtenerPorId(id_cliente); 

        //obtener fecha
        vehiculo.estado_vehiculo.fecha_evento= this.obtenerFechaActual();
      
        //bateria interna de gps
        let obtenerBateriaGps = operacion.obtenerNiveBateriaGps(data);
        let estado_bateria_gps = obtenerBateriaGps.estado_bateria_gps;
        let descripcion_bateria_gps = obtenerBateriaGps.descripcion_bateria_gps
        
        //obtener estado y descripcion de bateria gps
        vehiculo.estado_vehiculo.estado_bateria_gps= estado_bateria_gps;
        vehiculo.estado_vehiculo.descripcion_bateria_gps= descripcion_bateria_gps;
         
        //senial gps 
        let obtenerSenialGps = operacion.obtenerSenialGps(data);
        let estado_senial_gps = obtenerSenialGps.estado_senial_gps;
        let descripcion_senial_gps = obtenerSenialGps.descripcion_senial_gps;
         
        //obtener estado y descripcion de senial gps
        vehiculo.estado_vehiculo.estado_senial_gps = estado_senial_gps;
        vehiculo.estado_vehiculo.descripcion_senial_gps = descripcion_senial_gps;
          
        //se crea el objeto que se enviara al cliente
        let nuevo_latido = new Object();

        //obtener imei
        nuevo_latido.imei=vehiculo.imei_gps;

        //obtener id de organizacion 
        nuevo_latido.organizacion_id=vehiculo.organizacion_id;

        // Obtener ID de flota
        nuevo_latido.flota_id = vehiculo.flota_id;

        //obtener id
        nuevo_latido.vehiculo_id=vehiculo.vehiculo_id;
        
        // Actualizar estado del vehiculo en la clase
        tcpSocket.actualizarEstadoVehiculo(id_cliente, vehiculo.estado_vehiculo);
        //estado de vehiculo 
        nuevo_latido.estado_vehiculo = JSON.parse(JSON.stringify(vehiculo.estado_vehiculo));
        

         
      return nuevo_latido;
            
    }

     
 obtenerFechaActual() {

    const d = new Date();

    let day = d.getDate()
    let month = d.getMonth() + 1
    let year = d.getFullYear()

 
    let date = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    const time = d.toTimeString().split(' ')[0];
  
    return `${date} ${time}`
      
}


}

module.exports = Alertas;
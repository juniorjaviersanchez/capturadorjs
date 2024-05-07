// Arreglo para almacenar lista de sockets-tcp (vehiculos)
let tpcSockets = [];

// Clase que permite manipular el arreglo
class TCPSocket {


    agregar(data){
        
        tpcSockets.push(data);
    }


    obtenerPorId(id){

        return tpcSockets.find(tpcSocket =>{
            return tpcSocket.id === id;
        });
    }

    todos()
    {
        return tpcSockets;
    }

    eliminar(id){

        let tpcSocketsRestantes = tpcSockets.filter(tpcSocket =>{
            return tpcSocket.id !== id;
        });

        tpcSockets = tpcSocketsRestantes;

    }

    actualizarEstadoVehiculo(id, estadoVehiculo){
        let tpcSocket = tpcSockets.find(tpcSock =>{
            return tpcSock.id == id;
        });

        if(tpcSocket){
            tpcSocket.estado_vehiculo = estadoVehiculo;
        }

        
    }


}

module.exports = TCPSocket;
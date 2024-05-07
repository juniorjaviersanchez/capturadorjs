
/**
 * 
 * @param {*} zonas 
 * @param {*} lat 
 * @param {*} long 
 * Funcion encargado de verificar si la ubicacion del vehiculo 
 * está dentro o fuera de las zonas dadas.
 */
const enZona = (zonas, lat, long) =>{

    let zonasId =[] ;
    let nombres =[] ;
    let condicion =[] ;
    let zonaId =0 ;
    let puntoDentro = false;
    let ultima_zona = null;
    let condicion_geozona = '';
    let nombre_geozona = '';
    // Interar zona del flota
    zonas.map(zona =>{
        let intersections = 0;

        let zoneVertices = [];
        
        if (zona.latitud1) {  zoneVertices.push({"id":1,"zona_id":zona.id_geozona,"latitud":zona.latitud1,"longitud":zona.longitud1}); }
        if (zona.latitud2) {  zoneVertices.push({"id":2,"zona_id":zona.id_geozona,"latitud":zona.latitud2,"longitud":zona.longitud2}); }
        if (zona.latitud3) {  zoneVertices.push({"id":3,"zona_id":zona.id_geozona,"latitud":zona.latitud3,"longitud":zona.longitud3}); }
        if (zona.latitud4) {  zoneVertices.push({"id":4,"zona_id":zona.id_geozona,"latitud":zona.latitud4,"longitud":zona.longitud4}); }
        if (zona.latitud5) {  zoneVertices.push({"id":5,"zona_id":zona.id_geozona,"latitud":zona.latitud5,"longitud":zona.longitud5}); }
        if (zona.latitud6) {  zoneVertices.push({"id":6,"zona_id":zona.id_geozona,"latitud":zona.latitud6,"longitud":zona.longitud6}); }
        if (zona.latitud7) {  zoneVertices.push({"id":7,"zona_id":zona.id_geozona,"latitud":zona.latitud7,"longitud":zona.longitud7}); }
        if (zona.latitud8) {  zoneVertices.push({"id":8,"zona_id":zona.id_geozona,"latitud":zona.latitud8,"longitud":zona.longitud8}); }
        if (zona.latitud1) {  zoneVertices.push({"id":9,"zona_id":zona.id_geozona,"latitud":zona.latitud1,"longitud":zona.longitud1}); }


        // Itera los puntos de la zona
        for (let i = 1; i < zoneVertices.length; i++) {

            let vertexOne = zoneVertices[i - 1],
                vertexSecond = zoneVertices[i],
                minLongVertex = Math.min(vertexOne['longitud'], vertexSecond['longitud']),
                maxLongVertex = Math.max(vertexOne['longitud'], vertexSecond['longitud']),
                maxLatVertex = Math.max(vertexOne['latitud'], vertexSecond['latitud']);
    
    
            if(long > minLongVertex && long <= maxLongVertex && lat <= maxLatVertex && vertexOne['longitud'] != vertexSecond['longitud']){
    
                let xInters = (long - vertexOne['longitud']) * (vertexSecond['latitud'] - vertexOne['latitud']) / (vertexSecond['longitud'] - vertexOne['longitud']) + vertexOne['latitud'];
    
                if(vertexOne['latitud'] == vertexSecond['latitud'] || lat <= xInters){
                    intersections++;
                   
                }
    
            }
    
        }
    
        // Resultado numero par = Fuera de zona
        // Resultadi numero impar = Dentro zona

        // Sacar el modulo de interseciones, para saber si es un numero par o impar
        if(intersections % 2 != 0){
            // Si el numero es impar está dentro de zona
            zonasId.push(zona.id_geozona);
            nombres.push(zona.nombre);
            condicion.push(zona.condicion);
        }

    });


    // validar que el punto este dentro de una geozona o mas
    if (zonasId.length > 0){
        puntoDentro = true;
        zonaId =  zonasId[0];
        nombre_geozona = nombres[0];
        condicion_geozona = condicion[0];
    }



    // Retorna valor booleano
    return {
        puntoDentro,
        zonaId,
        condicion_geozona,
        nombre_geozona
    };

}



module.exports = {
    enZona
}
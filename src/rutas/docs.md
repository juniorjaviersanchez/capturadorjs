## Agregar zona

Para agregar una zona, se requiere enviar una peticion de tipo `POST`
en la ruta `/agregar-zona`, es necesario enviar el objeto zona con todos sus puntos

```json
{
    "id":1,
    "organizacion_id":1,
    "flota_id":1,
    "nombre":"Paradero la punta",
    "descripcion":"Paradero de prueba",
    "tipo":"PARADERO",
    "fecha_creacion":"2020-03-25 18:15:50",
    "fecha_modificacion":"2020-03-25 18:15:50",
    "fecha_eliminacion":null,
    "color":"#0837de",
    "velocidad_max":90,
    "modelo":"LIBRE",
    "estatus":1,
    "puntos":[
        {
            "id":1,
            "zona_id":1,
            "latitud":-12.072748702020313,
            "longitud":-77.16341972351074
        },
        {
            "id":2,
            "zona_id":1,
            "latitud":-12.073188261421096,
            "longitud":-77.1641508463898
        },
    ]
    
}
```

## Quitar zona
Para quitar una zona es necesario enviar una peticion de tipo `DELETE`
a la ruta `/quitar-zona/{id}` {id} es ID de la zona a quitar

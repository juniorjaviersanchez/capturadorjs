
const fs = require('fs');

/**
 * 
 * @param {*} req 
 * @param {*} res 
 * Metodo para agregar zona a la lista
 */

const agregar = (req, res) =>{

    let zonasLocales = [];
    try {

        // Asignar zonasLocales desde un archivo JSON
        zonasLocales = require('../db/zonas-locales.json');
        
    } catch (error) {
        // Si el archivo JSON no contiene registro, entonces el arreglo será vaccio
        zonasLocales = [];
    }

    let zona = req.body;
    zonasLocales.push(zona);

    // Escribir en el archivo JSON
    fs.writeFile('src/db/zonas-locales.json', JSON.stringify(zonasLocales), (err) =>{
        if (err) throw err;
        console.log('Se guardó la zona en el archivo local');
    });
    
    res.json({
        ok: true,
        message: 'Se agregó zona!'
    });
}


/**
 * 
 * @param {*} req 
 * @param {*} res 
 * Metodo para quitar una zona de la lista
 */
const quitar = (req, res) =>{

    let zonaId = req.params.id;

    let zonasLocales = [];
    try {

        // Asignar zonasLocales desde un archivo JSON
        zonasLocales = require('../db/zonas-locales.json');
        
    } catch (error) {
        // Si el archivo JSON no contiene registro, entonces el arreglo será vaccio
        zonasLocales = [];
    }

    let zonasFiltradas = zonasLocales.filter(zona =>{
        return zona.id != zonaId;
    });

    zonasLocales = zonasFiltradas;

    // Escribir en el archivo JSON
    fs.writeFile('src/db/zonas-locales.json', JSON.stringify(zonasLocales), (err) =>{
        if (err) throw err;
        console.log('Se quitó la zona del archivo local');
    });


    res.json({
        ok: true,
        message: 'Zona quitada!'
    });
}


module.exports = {
    agregar,
    quitar
}
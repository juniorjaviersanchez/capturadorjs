
const fs = require('fs');

/**
 * 
 * @param {*} req 
 * @param {*} res 
 * Metodo para sincronizar
 * */

const sincronizar = (req, res) =>{

    console.log(req.body);

    res.json({
        ok: true,
        message: 'Se agregó la sinconizacion'
    });


}


 


module.exports = {
    sincronizar
}
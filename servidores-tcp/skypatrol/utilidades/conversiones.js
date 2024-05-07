//modulo para converciones

// convertir array de byte a hexadecimal
function toHexString(byteArray) {
    return Array.from(byteArray, function(byte) {
      return ('0' + (byte & 0xFF).toString(16)).slice(-2);
    }).join('')
  }
  
// convertir byte a hexadecimal


  exports.toHexString=toHexString;
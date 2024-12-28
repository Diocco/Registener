export const formatearPrecio=(input:HTMLInputElement,funcionRecarga:Function)=>{
    // Le da la funcion al input del pago 1 para calcular el vuelto
    input.addEventListener('input',()=>{
        // Obtiene y elimina cualquier carácter que no sea número o punto decimal
        let value = input.value.replace(/[^0-9]/g, '');  // Elimina cualquier carácter no numérico
        if (value) {
            const valueNumerico = Number(value) / 100
            value = parseFloat(valueNumerico.toString()).toFixed(2);     // Formatea a decimales
            input.value = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(Number(value));
        } else {
            input.value = '';  // Restablece si no hay números
        }
        funcionRecarga() // Vuelve a calcular el total
    })
}
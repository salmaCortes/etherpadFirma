try {
    // Suponiendo que estás seleccionando un elemento con id 'myElement'
    var element = $('#myElement')[0];
    if (!element) {
        throw new TypeError('Elemento no definido');
    }
    // Resto del código
} catch (error) {
    console.error('Error capturado:', error);
    // Puedes registrar el error en un sistema de logging en el servidor
    // fetch('/logError', { method: 'POST', body: JSON.stringify({ error: error.message }) });
}

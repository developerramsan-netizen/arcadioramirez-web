/**
 * Rating – Arcadio Ramírez
 * Recibe calificación del chat y la registra en los logs de Netlify.
 * Los logs se ven en: Netlify Dashboard → Functions → rating → Logs
 */
exports.handler = async (event) => {
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type'
            },
            body: ''
        };
    }

    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        const { rating, turns, problem, timestamp } = JSON.parse(event.body);

        const stars = '★'.repeat(rating) + '☆'.repeat(5 - rating);
        const fecha = new Date(timestamp).toLocaleString('es-CO', {
            timeZone: 'America/Bogota',
            dateStyle: 'short',
            timeStyle: 'short'
        });

        // Registro visible en Netlify Functions → Logs
        console.log('══════════════════════════════════════');
        console.log(`CALIFICACIÓN DEL CHAT`);
        console.log(`Fecha:       ${fecha}`);
        console.log(`Estrellas:   ${stars} (${rating}/5)`);
        console.log(`Mensajes:    ${turns} intercambios`);
        console.log(`Problema:    ${problem || 'No especificado'}`);
        console.log('══════════════════════════════════════');

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({ ok: true })
        };
    } catch (err) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: err.message })
        };
    }
};

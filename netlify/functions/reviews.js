exports.handler = async function () {
    return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            name: 'Arcadio Ramírez Servicio Técnico',
            rating: 4.8,
            totalReviews: 46,
            reviews: [
                { author: 'Carlos M.', initials: 'CM', avatar: '', rating: 5, text: 'Excelente servicio. El técnico llegó puntual, diagnosticó mi lavadora rápidamente y la dejó funcionando perfecto. Muy profesional y honesto con los precios.', timeAgo: 'hace 2 semanas' },
                { author: 'Laura P.', initials: 'LP', avatar: '', rating: 5, text: 'Mi nevera dejó de enfriar y en menos de 2 horas ya estaba reparada. Rápido, económico y con garantía. 100% recomendado para Kennedy y alrededores.', timeAgo: 'hace 1 mes' },
                { author: 'Jorge R.', initials: 'JR', avatar: '', rating: 5, text: 'Llevan más de 40 años con este negocio y se nota la experiencia. Arreglaron mi secadora que otros técnicos no pudieron.', timeAgo: 'hace 1 mes' },
                { author: 'María C.', initials: 'MC', avatar: '', rating: 5, text: 'Muy buen servicio, llegaron el mismo día que llamé. El técnico explicó todo detalladamente. Quedé muy satisfecha.', timeAgo: 'hace 2 meses' },
                { author: 'Pedro A.', initials: 'PA', avatar: '', rating: 5, text: 'Servicio rápido y confiable. Mi lavadora lleva años con ellos y siempre queda perfecta. Los recomiendo totalmente.', timeAgo: 'hace 3 meses' },
            ]
        })
    };
};
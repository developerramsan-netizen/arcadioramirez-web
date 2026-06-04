exports.handler = async function () {
    try {
        const apiKey  = process.env.GOOGLE_API_KEY;
        const placeId = process.env.GOOGLE_PLACE_ID;

        const res = await fetch(
            `https://places.googleapis.com/v1/places/${placeId}` +
            `?fields=displayName,rating,userRatingCount,reviews` +
            `&languageCode=es&key=${apiKey}`,
            { headers: { 'X-Goog-FieldMask': 'displayName,rating,userRatingCount,reviews' } }
        );

        const data = await res.json();

        // Misma lógica que tu ReviewsController
        const reviews = (data.reviews || [])
            .filter(r => r.rating >= 4)
            .map(r => ({
                author:   r.authorAttribution?.displayName ?? '',
                avatar:   r.authorAttribution?.photoUri ?? '',
                rating:   r.rating,
                text:     r.text?.text ?? '',
                timeAgo:  r.relativePublishTimeDescription ?? '',
                initials: getInitials(r.authorAttribution?.displayName ?? '')
            }));

        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name:         data.displayName?.text ?? 'Arcadio Ramírez',
                rating:       data.rating ?? 4.8,
                totalReviews: data.userRatingCount ?? 0,
                reviews
            })
        };
    } catch (err) {
        return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
    }
};

function getInitials(name) {
    const parts = name.trim().split(' ');
    return parts.length >= 2
        ? (parts[0][0] + parts[1][0]).toUpperCase()
        : name[0]?.toUpperCase() ?? '?';
}
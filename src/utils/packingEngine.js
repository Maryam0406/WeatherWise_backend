export function generatePackingSuggestions({ willRain, avgTemp }) {
    const suggestions = [];

    if (willRain) {
        suggestions.push('Umbrella', 'Rain Jacket');
    }

    if (avgTemp >= 28) {
        suggestions.push('Sunscreen', 'Sunglasses');
    }

    if (avgTemp <= 15) {
        suggestions.push('Warm Jacket', 'Gloves');
    }

    if (!willRain && avgTemp > 15 && avgTemp < 28) {
        suggestions.push('Light Jacket');
    }

    //always useful
    suggestions.push('Phone charger');
    return suggestions;

}    
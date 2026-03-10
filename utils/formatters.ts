export const cleanLocation = (location: string): string => {
    if (!location) return '';

    // 1. Remove coordinates (e.g., "12.3456, 78.9012" or "12.3456")
    let cleaned = location.replace(/[-+]?\d{1,3}\.\d{4,}/g, '');

    // 2. Remove anything in parentheses
    cleaned = cleaned.replace(/\s*\(.*?\)\s*/g, ' ');

    // 3. Remove "India" or postal codes
    cleaned = cleaned.replace(/,\s*India\s*$/i, '');
    cleaned = cleaned.replace(/\s*\d{6,}\s*/g, '');

    // 4. Split by comma and clean individual parts
    let parts = cleaned.split(',')
        .map(p => p.trim())
        // Remove administrative suffixes like "WV", "PO", "Ward X" etc.
        .map(p => p.replace(/\s+(WV|PO|SO|Ward|Pt)\s*\d*$/gi, '').trim())
        .filter(p => p.length > 0 && !/^[-+\d,.\s]+$/.test(p));

    // 5. If we have multiple parts, take 1 or 2 most relevant ones
    if (parts.length > 2) {
        cleaned = parts.slice(0, 2).join(', ');
    } else if (parts.length > 0) {
        cleaned = parts.join(', ');
    } else {
        cleaned = location.split(',')[0].trim().replace(/\s+WV$/i, '');
    }

    // 6. Final cleanup 
    cleaned = cleaned.replace(/^[,\s]+|[,\s]+$/g, '').trim();

    // 7. Max length safety
    if (cleaned.length > 30) {
        cleaned = cleaned.substring(0, 27) + '...';
    }

    return cleaned || 'Unknown Location';
};

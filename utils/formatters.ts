/**
 * Robustly removes jargon, plus codes, sector codes, postcodes, and coordinates 
 * from location strings to keep only the place name.
 */
export const cleanLocation = (name: string): string => {
    if (!name) return "";

    let cleaned = name;

    // 1. Remove Plus Codes (e.g., 8GGV+PX Coimbatore, WV4X+RCP, etc.)
    cleaned = cleaned.replace(/[a-zA-Z0-9]{4,8}\+[a-zA-Z0-9]{2,4}/g, "");

    // 2. Remove Coordinates like (17.4375, 78.4483)
    cleaned = cleaned.replace(/\(?\-?\d+\.\d+,\s*\-?\d+\.\d+\)?/g, "");

    // 3. Remove Postcode/Sector codes (e.g., WV4, NW10, SW1A, E17, 110001)
    cleaned = cleaned.replace(/\b[A-Z]{1,2}\d{1,2}[A-Z]{0,2}\b/g, "");
    cleaned = cleaned.replace(/\b\d{5,6}\b/g, "");

    // 4. Remove technical IDs
    cleaned = cleaned.replace(/\b(rdp|rcp|wv|nw|se|sw)\b/gi, "");

    // 5. Cleanup spacing and stray commas/dashes
    cleaned = cleaned.replace(/^[,\s\-–—]+|[,\s\-–—]+$/g, ""); // Leading/trailing
    cleaned = cleaned.replace(/\s+/g, " "); // Normalize spaces
    cleaned = cleaned.replace(/ ,/g, ",");
    cleaned = cleaned.replace(/,+(\s*,)+/g, ","); // Remove multiple commas
    cleaned = cleaned.replace(/^,\s*/, ""); // Remove comma at start

    return cleaned.trim() || name;
};

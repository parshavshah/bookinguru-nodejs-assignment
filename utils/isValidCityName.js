function isValidCityName(cityName) {
    // Check if input is valid
    if (!cityName || typeof cityName !== 'string') {
        return false;
    }

    const name = cityName.trim();

    // Skip if too short
    if (name.length < 3) {
        return false;
    }

    // Check for common corrupt patterns
    const lowerName = name.toLowerCase();

    // Skip monitoring stations, power plants, industrial zones
    if (lowerName.includes('station') ||
        lowerName.includes('powerplant') ||
        lowerName.includes('industrial') ||
        lowerName.includes('district') ||
        lowerName.includes('zone') ||
        lowerName.includes('monitoring')) {
        return false;
    }

    // Skip entries with numbers (like "Station 104", "Area 22")
    if (/\d/.test(name)) {
        return false;
    }

    // Skip entries with "Area" suffix (like "Warsaw (Area)")
    if (lowerName.includes('area') || lowerName.includes('(area)')) {
        return false;
    }

    // Skip entries with "Unknown" variations
    if (lowerName.includes('unknown')) {
        return false;
    }

    // Skip entries with "Point" variations
    if (lowerName.includes('point')) {
        return false;
    }

    // Skip entries with excessive mixed case (like "wArSaW")
    const mixedCaseCount = (name.match(/[a-z][A-Z]|[A-Z][a-z]/g) || []).length;
    if (mixedCaseCount > name.length * 0.3) {
        return false;
    }

    // Skip entries with too many special characters
    const specialCharCount = (name.match(/[^a-zA-Z\s\-']/g) || []).length;
    if (specialCharCount > name.length * 0.2) {
        return false;
    }

    // Skip entries that are just repeated characters or patterns
    if (/(.)\1{3,}/.test(name)) {
        return false;
    }

    return true;
}


module.exports = isValidCityName;
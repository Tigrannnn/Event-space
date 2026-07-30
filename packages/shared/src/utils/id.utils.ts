export function isUuid(value: unknown): boolean {
    if (typeof value !== 'string') return false;
    // Strict UUID v4-ish pattern (covers v1-v5 forms) without validating variants
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(value);
}

export default isUuid;

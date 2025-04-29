const parseRetainedMedia = (input) => {
    if (!input) return [];

    if (Array.isArray(input)) {
        return input.filter(Boolean); // Buang elemen falsy jika perlu
    }

    try {
        // Hapus titik koma di akhir dan whitespace berlebih
        const cleanedInput = input.trim().replace(/;(?=\s*\]$)/, '');
        const parsed = JSON.parse(cleanedInput);

        // Pastikan hasil parse adalah array string URL
        return Array.isArray(parsed)
            ? parsed.filter(item => typeof item === 'string' && item.trim() !== '')
            : [];
    } catch (e) {
        console.warn("retainedMedia gagal di-parse, fallback ke []\nInput:", input, "\nError:", e.message);
        return [];
    }
};

module.exports = parseRetainedMedia;

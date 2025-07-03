/**
 * Utility untuk membangun URL WhatsApp dan membuat pesan notifikasi mitra.
 */

/**
 * Membersihkan nomor telepon menjadi format internasional (62)
 * @param {string} phone - Nomor telepon mitra
 * @returns {string} Nomor telepon yang dibersihkan
 */
function cleanPhoneNumber(phone) {
    return phone.replace(/^(\+|0)/, "62");
}

/**
 * Generate URL WhatsApp
 * @param {string} phoneNumber - Nomor mitra
 * @param {string} message - Isi pesan
 * @returns {string} URL WhatsApp
 */
function generateWhatsAppUrl(phoneNumber, message) {
    const cleaned = cleanPhoneNumber(phoneNumber);
    const encoded = encodeURIComponent(message);
    return `https://wa.me/${cleaned}?text=${encoded}`;
}

/**
 * Buat pesan WhatsApp rekap order
 * @param {object} partner - Data mitra
 * @param {Array} orders - Daftar pesanan
 * @returns {object} Detail notifikasi WhatsApp
 */
function generatePartnerOrderNotification(order) {
    const partner = order.orderItems[0].partner;
    const user = order.user;

    const messageLines = [
        `Halo ${partner.owner_name}, ada pesanan baru dari Sekolah Kopi Raisa:\n`,
        `🛒 Pesanan dari ${user.name} (Order ID: ${order.id}):`
    ];

    const totalItems = {};   // Semua item
    const noteGroups = {};   // Item yang dikelompokkan berdasarkan catatan

    for (const item of order.orderItems) {
        const productName = item.product.name;
        const quantity = item.quantity;
        const note = item.custom_note?.trim();

        // Akumulasi total item
        if (!totalItems[productName]) totalItems[productName] = 0;
        totalItems[productName] += quantity;

        // Kelompokkan berdasarkan catatan jika ada
        if (note) {
            const noteKey = note.toLowerCase();
            if (!noteGroups[noteKey]) noteGroups[noteKey] = {};
            if (!noteGroups[noteKey][productName]) noteGroups[noteKey][productName] = 0;
            noteGroups[noteKey][productName] += quantity;
        }
    }

    // Bagian A: Rekap total semua item
    messageLines.push(`\nA. Jumlah yang dipesan:`);
    for (const [product, qty] of Object.entries(totalItems)) {
        messageLines.push(`- ${product} (${qty} pcs)`);
    }

    // Bagian B: Rincian item berdasarkan catatan (jika ada)
    const noteKeys = Object.keys(noteGroups);
    if (noteKeys.length > 0) {
        messageLines.push(`\nB. Rincian pesanan dengan catatan:`);
        for (const note of noteKeys) {
            messageLines.push(`- Catatan: "${note}"`);
            for (const [product, qty] of Object.entries(noteGroups[note])) {
                messageLines.push(`  • ${product} (${qty} pcs)`);
            }
        }
    }

    messageLines.push(`\nStatus Saat Ini: ${order.status}`);
    messageLines.push(`\nMohon untuk segera diproses. Terima kasih!`);

    const message = messageLines.join('\n');
    const whatsappUrl = generateWhatsAppUrl(partner.phone_number, message);

    return {
        orderId: order.id,
        partnerId: partner.id,
        partnerName: partner.owner_name,
        message,
        whatsappUrl,
    };
}

// Ekspor fungsi yang baru
module.exports = {
    generateWhatsAppUrl,
    generatePartnerOrderNotification,

};

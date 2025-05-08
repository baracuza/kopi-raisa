/**
 * Utility untuk membangun URL WhatsApp dan membuat pesan notifikasi mitra.
 */

/**
 * Membersihkan nomor telepon menjadi format internasional (62)
 */
function cleanPhoneNumber(phone) {
    return phone.replace(/^(\+|0)/, "62");
}

/**
 * Generate URL WhatsApp
 * @param {string} phoneNumber - nomor mitra
 * @param {string} message - isi pesan
 * @returns {string} URL WhatsApp
 */
function generateWhatsAppUrl(phoneNumber, message) {
    const cleaned = cleanPhoneNumber(phoneNumber);
    const encoded = encodeURIComponent(message);
    return `https://wa.me/${cleaned}?text=${encoded}`;
}

/**
 * Buat pesan WhatsApp rekap order
 * @param {object} partner - data mitra
 * @param {Array} orders - daftar order
 * @returns {object} detail notifikasi
 */
function generatePartnerOrderNotification(partner, orders) {
    let message = `Halo ${partner.owner_name}, berikut adalah rekap pesanan terbaru dari Sekolah Kopi Raisa:\n\n`;

    orders.forEach((order) => {
        message += `🛒 Pesanan oleh ${order.user.name}:\n`;
        order.orderItems.forEach((item) => {
            message += `- ${item.product.name} (${item.quantity} pcs)\n`;
            if (item.custom_note) {
                message += `  Catatan: ${item.custom_note}\n`;
            }
        });
        message += `Status: ${order.status}\n\n`;
    });

    const whatsappUrl = generateWhatsAppUrl(partner.phone_number, message);

    return {
        partnerId: partner.id,
        partnerName: partner.owner_name,
        partnerPhoneNumber: partner.phone_number,
        message,
        whatsappUrl,
    };
}

module.exports = {
    generateWhatsAppUrl,
    generatePartnerOrderNotification,
};

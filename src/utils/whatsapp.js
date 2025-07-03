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
 * Buat pesan WhatsApp yang merinci setiap pesanan secara individual.
 * @param {object} partner - Data mitra.
 * @param {Array} orders - Daftar pesanan yang sudah diproses service.
 * @returns {object} Detail notifikasi WhatsApp.
 */
function generatePartnerOrderNotification(partner, orders) {
    const messageLines = [
        `Halo ${partner.owner_name}, berikut adalah rincian pesanan baru dari Sekolah Kopi Raisa:\n`
    ];

    // Loop melalui setiap pesanan
    for (const order of orders) {
        // Buat header untuk setiap pesanan
        messageLines.push(`--------------------------------------`);
        messageLines.push(`🛒 Pesanan dari: *${order.user.name}*`);
        messageLines.push(`   Order ID: ${order.id}`);
        messageLines.push(`   Status: ${order.status}`);
        messageLines.push(`\n   *Rincian Item:*`);

        // Loop melalui setiap item dalam pesanan tersebut
        for (const item of order.orderItems) {
            const productName = item.product.name;
            const quantity = item.quantity;

            console.log(`[WhatsApp Util] Memproses item ID: ${item.id}, Catatan dari DB:`, item.custom_note);
            // Cek jika catatan ada atau tidak, jika tidak ada beri nilai "-"
            const note = item.custom_note?.trim() || "-";

            messageLines.push(`   - ${productName} (${quantity} pcs)`);
            messageLines.push(`     Catatan: ${note}`);
        }
        messageLines.push(``); // Beri baris kosong sebagai pemisah antar pesanan
    }

    messageLines.push(`--------------------------------------`);
    messageLines.push(`Mohon untuk segera diproses. Terima kasih!`);

    const message = messageLines.join('\n');
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
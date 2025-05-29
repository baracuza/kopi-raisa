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
function generatePartnerOrderNotification(partner, orders) {
    const messageLines = [
        `Halo ${partner.owner_name}, berikut adalah rekap pesanan terbaru dari Sekolah Kopi Raisa:\n`
    ];

    // Kelompokkan pesanan berdasarkan nama user
    const ordersByUser = {};

    for (const order of orders) {
        const username = order.user.name;
        if (!ordersByUser[username]) {
            ordersByUser[username] = [];
        }
        ordersByUser[username].push(order);
    }

    // Proses per user
    for (const [username, userOrders] of Object.entries(ordersByUser)) {
        const totalItems = {};        // Semua pesanan (termasuk dengan catatan)
        const noteGroups = {};        // Hanya pesanan dengan catatan
        let latestStatus = userOrders.at(-1)?.status?.toUpperCase() || "UNKNOWN";

        for (const order of userOrders) {
            for (const item of order.orderItems) {
                const { name: productName } = item.product;
                const quantity = item.quantity;
                const note = item.custom_note?.trim();

                // Tambahkan ke total item
                if (!totalItems[productName]) {
                    totalItems[productName] = 0;
                }
                totalItems[productName] += quantity;

                // Jika ada catatan, simpan ke noteGroups
                if (note) {
                    const noteKey = note.toLowerCase();
                    if (!noteGroups[noteKey]) {
                        noteGroups[noteKey] = {};
                    }
                    if (!noteGroups[noteKey][productName]) {
                        noteGroups[noteKey][productName] = 0;
                    }
                    noteGroups[noteKey][productName] += quantity;
                }
            }
        }

        messageLines.push(`\n🛒 Pesanan oleh ${username} (Order ID: ${orderId}):`);

        // Total produk tanpa rincian catatan
        messageLines.push(`A. Jumlah yang dipesan (baik yang ada catatan maupun tidak) :`);
        for (const [product, qty] of Object.entries(totalItems)) {
            messageLines.push(`- ${product} (${qty} pcs)`);
        }

        // Tambahkan bagian catatan jika ada
        const noteKeys = Object.keys(noteGroups);
        if (noteKeys.length > 0) {
            messageLines.push(`\nB. Jumlah pesanan disertai catatan:`);
            for (const note of noteKeys) {
                messageLines.push(`- ${note}`);
                for (const [product, qty] of Object.entries(noteGroups[note])) {
                    messageLines.push(`  ${product} (${qty} pcs)`);
                }
            }
        }

        messageLines.push(`\nStatus: ${latestStatus}`);
        messageLines.push(`\nNote : \nPoin A = Total pesanan pembeli yang memiliki catatan maupun tidak\nPoin B = Jumlah Pesanan pembeli berdasarkan Catatannya\n`);
    }

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

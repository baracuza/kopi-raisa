/**
 * Fungsi untuk mengirim pesan WhatsApp menggunakan URL WhatsApp
 * @param {string} phoneNumber - Nomor telepon penerima dalam format internasional (contoh: 6281234567890 untuk Indonesia)
 * @param {string} message - Pesan yang akan dikirim
 */
const sendWhatsAppMessage = async (phoneNumber, message) => {
    try {
        const encodedMessage = encodeURIComponent(message);
        const waUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
        
        console.log('URL WhatsApp yang dihasilkan:', waUrl);

        // Membuka URL WhatsApp di tab baru menggunakan metode window.open
        window.open(waUrl, '_blank');
    } catch (error) {
        console.error('Gagal membuat URL WhatsApp:', error.message);
    }
};

// Contoh penggunaan: Panggil fungsi ini ketika sebuah produk dibeli
const notifyPartnerOnPurchase = async (partnerPhoneNumber, productName, buyerName, fetchCustomMessage) => {
    try {
        let customMessage = null;
        if (typeof fetchCustomMessage === 'function') {
            customMessage = await fetchCustomMessage(partnerPhoneNumber, productName, buyerName);
        }
        const defaultMessage = `Halo, produk Anda "${productName}" telah dibeli oleh ${buyerName}. Silakan cek dashboard Anda untuk detail lebih lanjut.`;
        const message = customMessage || defaultMessage;
        await sendWhatsAppMessage(partnerPhoneNumber, message);
    } catch (error) {
        console.error('Gagal mengambil custom message atau mengirim pesan:', error.message);
    }
};

module.exports = {
    sendWhatsAppMessage,
    notifyPartnerOnPurchase,
};


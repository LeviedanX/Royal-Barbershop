<?php

namespace App\Services;

use Midtrans\Config;
use Midtrans\Snap;
use Midtrans\Transaction; // ⬅️ TAMBAH INI

class MidtransService
{
    public function __construct()
    {
        // ambil dari config/services.php → .env
        Config::$serverKey    = config('services.midtrans.server_key');
        Config::$clientKey    = config('services.midtrans.client_key');
        Config::$isProduction = (bool) config('services.midtrans.is_production', false);

        // opsi standar rekomendasi Midtrans
        Config::$isSanitized  = true;
        Config::$is3ds        = true;

        // --- FIX untuk error "Undefined array key 10023" (CURLOPT_HTTPHEADER) ---
        if (!is_array(Config::$curlOptions)) {
            Config::$curlOptions = [];
        }

        if (!array_key_exists(CURLOPT_HTTPHEADER, Config::$curlOptions)) {
            Config::$curlOptions[CURLOPT_HTTPHEADER] = [];
        }
    }

    /**
     * Bungkus pemanggilan Snap::getSnapToken
     */
    public function createTransactionToken(array $params): string
    {
        return Snap::getSnapToken($params);
    }

    /**
     * Ambil status transaksi dari Midtrans (server-to-server).
     */
    public function getTransactionStatus(string $orderId)
    {
        return Transaction::status($orderId);
    }
}

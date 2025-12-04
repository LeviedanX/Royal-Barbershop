<?php

namespace App\Services;

use Midtrans\Config;
use Midtrans\Snap;
use Midtrans\Transaction;

class MidtransService
{
    public function __construct()
    {
        // Load Midtrans config from services.php and .env
        Config::$serverKey    = config('services.midtrans.server_key');
        Config::$clientKey    = config('services.midtrans.client_key');
        Config::$isProduction = (bool) config('services.midtrans.is_production', false);

        // Midtrans recommended defaults
        Config::$isSanitized = true;
        Config::$is3ds       = true;

        // Fix for "Undefined array key 10023" (CURLOPT_HTTPHEADER)
        if (!is_array(Config::$curlOptions)) {
            Config::$curlOptions = [];
        }

        if (!array_key_exists(CURLOPT_HTTPHEADER, Config::$curlOptions)) {
            Config::$curlOptions[CURLOPT_HTTPHEADER] = [];
        }
    }

    /**
     * Wrapper for Snap::getSnapToken.
     */
    public function createTransactionToken(array $params): string
    {
        return Snap::getSnapToken($params);
    }

    /**
     * Get transaction status from Midtrans (server-to-server).
     */
    public function getTransactionStatus(string $orderId)
    {
        return Transaction::status($orderId);
    }
}

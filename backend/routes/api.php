<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\BookingController;
use App\Http\Controllers\BarberController;
use App\Http\Controllers\ServiceController;
use App\Http\Controllers\ReviewController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\AnnouncementController;
use App\Http\Controllers\CustomerServiceController;
use App\Http\Controllers\GalleryController;
use App\Http\Controllers\AdminUserController;
use App\Http\Controllers\AdminBusinessHourController;
use App\Http\Controllers\AdminCatalogController;
use App\Http\Controllers\AdminPaymentController;
use App\Http\Controllers\AdminAccessLogController;
use App\Http\Controllers\AdminPayoutController;
use App\Http\Controllers\BarberDashboardController;

// =======================================================
// ===================== PUBLIC ==========================
// =======================================================

// Auth publik
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login',    [AuthController::class, 'login']);

// Midtrans callback (tidak pakai auth:sanctum)
Route::post('/midtrans/callback', [PaymentController::class, 'callback']);

// Katalog layanan & barber boleh dilihat siapa saja
Route::get('/services', [ServiceController::class, 'index']);
Route::get('/services/{service}', [ServiceController::class, 'show']);

Route::get('/barbers', [BarberController::class, 'index']);
Route::get('/barbers/{barber}', [BarberController::class, 'show']);

// Gallery & Queue PUBLIC
Route::get('/hairstyles', [GalleryController::class, 'index']);
Route::get('/queue', [BookingController::class, 'queue']);

// Pengumuman publik
Route::get('/announcements', [AnnouncementController::class, 'index']);

// =======================================================
// ===================== BUTUH LOGIN =====================
// =======================================================

Route::middleware('auth:sanctum')->group(function () {

    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);

    // Booking (bikin antrian, lihat booking milik sendiri, ubah status)
    Route::post('/bookings', [BookingController::class, 'store']);
    Route::get('/bookings/my', [BookingController::class, 'myBookings']);
    Route::put('/bookings/{booking}', [BookingController::class, 'update']);
    Route::delete('/bookings/{booking}', [BookingController::class, 'destroy']);
    Route::patch('/bookings/{booking}/status', [BookingController::class, 'updateStatus']);

    // Review
    Route::post('/bookings/{booking}/review', [ReviewController::class, 'store']);

    // Payment (buat Snap token)
    Route::post('/payments/{booking}/create', [PaymentController::class, 'createSnap']);
    Route::post('/payments/{booking}/confirm', [PaymentController::class, 'confirmStatus']);

    // Dashboard khusus barber
    Route::get('/barber/dashboard', [BarberDashboardController::class, 'index']);

    // CRUD pengumuman (admin)
    Route::post('/announcements', [AnnouncementController::class, 'store']);
    Route::put('/announcements/{announcement}', [AnnouncementController::class, 'update']);
    Route::delete('/announcements/{announcement}', [AnnouncementController::class, 'destroy']);

    // Customer Service (butuh login)
    Route::get('/cs/tickets', [CustomerServiceController::class, 'index']);
    Route::post('/cs/tickets', [CustomerServiceController::class, 'store']);
    Route::get('/cs/tickets/{ticket}', [CustomerServiceController::class, 'show']);
    Route::post('/cs/tickets/{ticket}/reply', [CustomerServiceController::class, 'reply']);

    // ================= ADMIN ROUTES =================
    Route::prefix('admin')->group(function () {

        // USER & BARBER & CUSTOMER & PASSWORD
        Route::get('/barbers', [AdminUserController::class, 'indexBarbers']);
        Route::post('/barbers', [AdminUserController::class, 'storeBarber']);
        Route::put('/barbers/{barber}', [AdminUserController::class, 'updateBarber']);
        Route::delete('/barbers/{barber}', [AdminUserController::class, 'destroyBarber']);

        Route::get('/customers', [AdminUserController::class, 'indexCustomers']);
        Route::post('/customers', [AdminUserController::class, 'storeCustomer']);
        Route::put('/customers/{user}', [AdminUserController::class, 'updateCustomer']);
        Route::delete('/customers/{user}', [AdminUserController::class, 'destroyCustomer']);

        Route::post('/change-my-password', [AdminUserController::class, 'changeMyPassword']);
        Route::post('/users/{user}/change-password', [AdminUserController::class, 'adminChangeUserPassword']);

        // ===== ALIAS supaya cocok dengan adminUserApi.js =====
        Route::prefix('users')->group(function () {
            Route::get('/barbers', [AdminUserController::class, 'indexBarbers']);
            Route::post('/barbers', [AdminUserController::class, 'storeBarber']);
            Route::put('/barbers/{barber}', [AdminUserController::class, 'updateBarber']);
            Route::delete('/barbers/{barber}', [AdminUserController::class, 'destroyBarber']);

            Route::get('/customers', [AdminUserController::class, 'indexCustomers']);
            Route::post('/customers', [AdminUserController::class, 'storeCustomer']);
            Route::put('/customers/{user}', [AdminUserController::class, 'updateCustomer']);
            Route::delete('/customers/{user}', [AdminUserController::class, 'destroyCustomer']);
        });

        // BUSINESS HOURS & TUTUP TOKO
        Route::get('/business-hours', [AdminBusinessHourController::class, 'index']);
        Route::put('/business-hours/{businessHour}', [AdminBusinessHourController::class, 'update']);
        Route::post('/close-shop', [AdminBusinessHourController::class, 'closeShop']);
        Route::post('/open-shop-default', [AdminBusinessHourController::class, 'openShopDefault']);

        // CATALOG: SERVICES, HAIRSTYLES, COUPONS, PROMOS, REVIEWS
        Route::get('/services', [AdminCatalogController::class, 'indexServices']);
        Route::post('/services', [AdminCatalogController::class, 'storeService']);
        Route::put('/services/{service}', [AdminCatalogController::class, 'updateService']);
        Route::delete('/services/{service}', [AdminCatalogController::class, 'destroyService']);

        Route::get('/hairstyles', [AdminCatalogController::class, 'indexHairstyles']);
        Route::post('/hairstyles', [AdminCatalogController::class, 'storeHairstyle']);
        Route::put('/hairstyles/{hairstyle}', [AdminCatalogController::class, 'updateHairstyle']);
        Route::delete('/hairstyles/{hairstyle}', [AdminCatalogController::class, 'destroyHairstyle']);

        Route::get('/coupons', [AdminCatalogController::class, 'indexCoupons']);
        Route::post('/coupons', [AdminCatalogController::class, 'storeCoupon']);
        Route::put('/coupons/{coupon}', [AdminCatalogController::class, 'updateCoupon']);
        Route::delete('/coupons/{coupon}', [AdminCatalogController::class, 'destroyCoupon']);

        Route::get('/promos', [AdminCatalogController::class, 'indexPromos']);
        Route::post('/promos', [AdminCatalogController::class, 'storePromo']);
        Route::put('/promos/{promo}', [AdminCatalogController::class, 'updatePromo']);
        Route::delete('/promos/{promo}', [AdminCatalogController::class, 'destroyPromo']);

        Route::get('/reviews', [AdminCatalogController::class, 'indexReviews']);
        Route::delete('/reviews/{review}', [AdminCatalogController::class, 'destroyReview']);

        // PAYMENTS (histori transaksi Midtrans)
        Route::get('/payments', [AdminPaymentController::class, 'index']);
        Route::get('/payments/{payment}', [AdminPaymentController::class, 'show']);
        Route::post('/payments', [AdminPaymentController::class, 'store']);
        Route::put('/payments/{payment}', [AdminPaymentController::class, 'update']);
        Route::delete('/payments/{payment}', [AdminPaymentController::class, 'destroy']); // <ƒ?" TAMBAH INI

        // PAYOUTS (simulasi pencairan ke e-wallet / bank)
        Route::get('/payouts', [AdminPayoutController::class, 'index']);
        Route::post('/payouts', [AdminPayoutController::class, 'store']);
        Route::get('/payouts/{payout}', [AdminPayoutController::class, 'show']);
        Route::patch('/payouts/{payout}/status', [AdminPayoutController::class, 'updateStatus']);
        Route::delete('/payouts/{payout}', [AdminPayoutController::class, 'destroy']);
        
        // ACCESS LOGS
        Route::get('/access-logs', [AdminAccessLogController::class, 'index']);
        Route::delete('/access-logs/{accessLog}', [AdminAccessLogController::class, 'destroy']);
        Route::delete('/access-logs', [AdminAccessLogController::class, 'clearAll']);
    });
});

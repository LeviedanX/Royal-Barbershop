<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Barber;
use App\Models\BusinessHour;
use Illuminate\Support\Facades\Hash;

class InitialUserSeeder extends Seeder
{
    public function run(): void
    {
        // Admin
        $admin = User::create([
            'name'     => 'Admin',
            'email'    => 'admin@barber.com',
            'password' => Hash::make('password'),
            'role'     => 'admin',
            'phone'    => '081234567890',
        ]);

        // Barber (user + barber profile)
        $barberUser = User::create([
            'name'     => 'Barber Satu',
            'email'    => 'barber1@barber.com',
            'password' => Hash::make('password'),
            'role'     => 'barber',
            'phone'    => '081234567891',
        ]);

        $barber = Barber::create([
            'user_id'                 => $barberUser->id,
            'display_name'            => 'Barber Top 1',
            'bio'                     => 'Spesialis fade & crop',
            'skill_level'             => 'master',
            'base_price'              => 50000,
            'avg_rating'              => 4.8,
            'total_reviews'           => 20,
            'total_completed_orders'  => 50,
            'is_active'               => true,
        ]);

        // Customer
        $customer = User::create([
            'name'     => 'Customer Pertama',
            'email'    => 'customer1@barber.com',
            'password' => Hash::make('password'),
            'role'     => 'customer',
            'phone'    => '081234567892',
        ]);

        // Business hours: buka 07:00 - 21:00 tiap hari
        for ($day = 0; $day < 7; $day++) {
            BusinessHour::create([
                'day_of_week' => $day,       // 0 = Minggu
                'open_time'   => '07:00',
                'close_time'  => '21:00',
                'is_closed'   => false,
            ]);
        }
    }
}

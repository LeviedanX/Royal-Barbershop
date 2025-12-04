<?php

namespace Database\Seeders;

use App\Models\BusinessHour;
use Illuminate\Database\Seeder;

class BusinessHoursSeeder extends Seeder
{
    public function run(): void
    {
        // 0 = Minggu, 1 = Senin, ..., 6 = Sabtu
        $default = [
            0, 1, 2, 3, 4, 5, 6,
        ];

        foreach ($default as $day) {
            BusinessHour::updateOrCreate(
                ['day_of_week' => $day],
                [
                    'open_time'  => '07:00:00',
                    'close_time' => '21:00:00',
                    'is_closed'  => false,
                ]
            );
        }
    }
}

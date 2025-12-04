<?php

namespace App\Http\Controllers;

use App\Models\Hairstyle;
use Illuminate\Http\Request;

class GalleryController extends Controller
{
    /**
     * GET /api/hairstyles
     * List semua gaya rambut + mapping ke service (kalau ada).
     */
    public function index()
    {
        $hairstyles = Hairstyle::with('service')->get();

        return response()->json($hairstyles);
    }
}

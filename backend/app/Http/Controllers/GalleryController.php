<?php

namespace App\Http\Controllers;

use App\Models\Hairstyle;
use Illuminate\Http\Request;

class GalleryController extends Controller
{
    /**
     * GET /api/hairstyles
     * List all hairstyles and map to service if available.
     */
    public function index()
    {
        $hairstyles = Hairstyle::with('service')->get();

        return response()->json($hairstyles);
    }
}

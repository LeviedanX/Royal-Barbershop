<?php

namespace App\Http\Middleware;

use App\Models\AccessLog;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class LogAccess
{
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        try {
            AccessLog::create([
                'user_id'    => optional($request->user())->id,
                'method'     => $request->method(),
                'path'       => $request->path(),
                'ip'         => $request->ip(),
                'user_agent' => $request->userAgent(),
            ]);
        } catch (\Throwable $e) {
            // jangan sampai logging bikin request error
        }

        return $response;
    }
}


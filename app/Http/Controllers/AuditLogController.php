<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\AuditLog;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AuditLogController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();

        $logs = AuditLog::where('user_id', $user->id)
            ->orderByDesc('created_at')
            ->paginate(50);

        return Inertia::render('audit-logs/index', [
            'logs' => $logs,
        ]);
    }
}

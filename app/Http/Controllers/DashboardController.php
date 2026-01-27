<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Services\BalanceService;
use App\Models\TransactionEvent;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __construct(
        private readonly BalanceService $balanceService
    ) {}

    public function index(Request $request): Response
    {
        $user = $request->user();

        $balances = $this->balanceService->getAllCurrentBalances($user);

        $recentTransactions = TransactionEvent::with('ammunitionType')
            ->where('user_id', $user->id)
            ->orderByDesc('event_date')
            ->orderByDesc('created_at')
            ->limit(10)
            ->get();

        return Inertia::render('dashboard', [
            'balances' => $balances,
            'recentTransactions' => $recentTransactions,
        ]);
    }
}

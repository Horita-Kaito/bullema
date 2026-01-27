<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\AmmunitionType;
use App\Models\TransactionEvent;
use App\Services\BalanceService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BalanceController extends Controller
{
    public function __construct(
        private readonly BalanceService $balanceService
    ) {}

    public function index(Request $request): Response
    {
        $user = $request->user();
        $balances = $this->balanceService->getAllCurrentBalances($user);

        return Inertia::render('balances/index', [
            'balances' => $balances,
        ]);
    }

    public function show(Request $request, AmmunitionType $ammunitionType): Response
    {
        $user = $request->user();

        // Ensure the ammunition type belongs to the current user
        if ($ammunitionType->user_id !== $user->id) {
            abort(404);
        }

        $transactions = TransactionEvent::where('user_id', $user->id)
            ->where('ammunition_type_id', $ammunitionType->id)
            ->with('ammunitionType')
            ->orderByDesc('event_date')
            ->orderByDesc('created_at')
            ->get();

        $balance = $this->balanceService->getCurrentBalance($user, $ammunitionType);

        return Inertia::render('balances/show', [
            'ammunitionType' => $ammunitionType,
            'transactions' => $transactions,
            'balance' => $balance,
        ]);
    }
}

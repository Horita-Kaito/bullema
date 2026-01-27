<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\Attachment;
use App\Models\TransactionEvent;
use App\Services\BalanceService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class InspectionController extends Controller
{
    public function __construct(
        private readonly BalanceService $balanceService
    ) {}

    public function index(Request $request): Response
    {
        $user = $request->user();
        $balances = $this->balanceService->getAllCurrentBalances($user);

        $totalBalance = $balances->sum('balance');
        $totalTransactions = TransactionEvent::where('user_id', $user->id)->count();
        $lastEvent = TransactionEvent::where('user_id', $user->id)
            ->orderByDesc('event_date')
            ->orderByDesc('created_at')
            ->first();

        return Inertia::render('inspection/index', [
            'user' => $user,
            'balances' => $balances,
            'totalBalance' => $totalBalance,
            'totalTransactions' => $totalTransactions,
            'lastEventDate' => $lastEvent?->event_date,
        ]);
    }

    public function balance(Request $request): Response
    {
        $user = $request->user();
        $balances = $this->balanceService->getAllCurrentBalances($user);
        $totalBalance = $balances->sum('balance');

        return Inertia::render('inspection/balance', [
            'balances' => $balances,
            'totalBalance' => $totalBalance,
            'printDate' => now()->format('Y年m月d日 H:i'),
        ]);
    }

    public function ledger(Request $request): Response
    {
        $user = $request->user();
        $balances = $this->balanceService->getAllCurrentBalances($user);

        $ledgerGroups = $balances->map(function ($balance) use ($user) {
            $transactions = TransactionEvent::where('user_id', $user->id)
                ->where('ammunition_type_id', $balance['ammunition_type']->id)
                ->orderBy('event_date')
                ->orderBy('created_at')
                ->get();

            // Calculate running balance
            $runningBalance = 0;
            $transactionsWithBalance = $transactions->map(function ($transaction) use (&$runningBalance) {
                $runningBalance += $transaction->quantity;
                return array_merge($transaction->toArray(), [
                    'running_balance' => $runningBalance,
                ]);
            });

            return [
                'ammunition_type' => $balance['ammunition_type'],
                'transactions' => $transactionsWithBalance,
                'current_balance' => $balance['balance'],
            ];
        })->filter(fn($group) => count($group['transactions']) > 0)->values();

        return Inertia::render('inspection/ledger', [
            'ledgerGroups' => $ledgerGroups,
            'printDate' => now()->format('Y年m月d日 H:i'),
        ]);
    }

    public function attachments(Request $request): Response
    {
        $user = $request->user();

        $attachments = Attachment::whereHas('transactionEvent', function ($query) use ($user) {
            $query->where('user_id', $user->id);
        })
            ->with(['transactionEvent.ammunitionType'])
            ->orderByDesc('created_at')
            ->get()
            ->map(function ($attachment) {
                return array_merge($attachment->toArray(), [
                    'transaction_event' => $attachment->transactionEvent,
                ]);
            });

        return Inertia::render('inspection/attachments', [
            'attachments' => $attachments,
            'printDate' => now()->format('Y年m月d日 H:i'),
        ]);
    }
}

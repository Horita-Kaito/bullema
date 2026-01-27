<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\TransactionEvent;
use App\Services\BalanceService;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;

class ReportController extends Controller
{
    public function __construct(
        private readonly BalanceService $balanceService
    ) {}

    public function index(Request $request): InertiaResponse
    {
        return Inertia::render('reports/index');
    }

    public function pdf(Request $request): Response
    {
        $user = $request->user();

        $startDate = $request->input('start_date');
        $endDate = $request->input('end_date', now()->format('Y-m-d'));

        $transactions = TransactionEvent::where('user_id', $user->id)
            ->when($startDate, fn($q) => $q->where('event_date', '>=', $startDate))
            ->where('event_date', '<=', $endDate)
            ->with('ammunitionType')
            ->orderBy('event_date')
            ->orderBy('created_at')
            ->get();

        $balances = $this->balanceService->getAllCurrentBalances($user);

        // Simple HTML-based PDF response
        // In production, use laravel-dompdf or similar
        $html = view('reports.ledger-pdf', [
            'user' => $user,
            'transactions' => $transactions,
            'balances' => $balances,
            'startDate' => $startDate,
            'endDate' => $endDate,
            'generatedAt' => now()->format('Y年m月d日 H:i'),
        ])->render();

        return response($html, 200, [
            'Content-Type' => 'text/html',
        ]);
    }

    public function csv(Request $request): Response
    {
        $user = $request->user();

        $startDate = $request->input('start_date');
        $endDate = $request->input('end_date', now()->format('Y-m-d'));

        $transactions = TransactionEvent::where('user_id', $user->id)
            ->when($startDate, fn($q) => $q->where('event_date', '>=', $startDate))
            ->where('event_date', '<=', $endDate)
            ->with('ammunitionType')
            ->orderBy('event_date')
            ->orderBy('created_at')
            ->get();

        $csv = "日付,種別,実包種別,口径,数量,備考\n";

        foreach ($transactions as $t) {
            $eventTypeLabels = [
                'acquisition' => '譲受',
                'consumption' => '消費',
                'transfer' => '譲渡',
                'disposal' => '廃棄',
                'custody_out' => '保管委託',
                'custody_return' => '保管委託返却',
                'correction' => '訂正',
            ];

            $csv .= sprintf(
                "%s,%s,%s,%s,%d,\"%s\"\n",
                $t->event_date,
                $eventTypeLabels[$t->event_type] ?? $t->event_type,
                $t->ammunitionType?->category ?? '',
                $t->ammunitionType?->caliber ?? '',
                $t->quantity,
                str_replace('"', '""', $t->notes ?? '')
            );
        }

        $filename = 'ammunition_ledger_' . now()->format('Ymd_His') . '.csv';

        return response($csv, 200, [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
        ]);
    }
}

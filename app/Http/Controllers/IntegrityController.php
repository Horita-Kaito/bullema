<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\TransactionEvent;
use App\Services\TransactionHashService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class IntegrityController extends Controller
{
    public function __construct(
        private readonly TransactionHashService $hashService
    ) {}

    public function check(Request $request): Response
    {
        $user = $request->user();

        $transactions = TransactionEvent::where('user_id', $user->id)
            ->orderBy('created_at')
            ->get();

        $results = [];
        $isValid = true;

        foreach ($transactions as $index => $transaction) {
            $expectedHash = $this->hashService->calculateHash($transaction);
            $hashValid = $transaction->record_hash === $expectedHash;

            // Check chain continuity
            $chainValid = true;
            if ($index > 0) {
                $previousTransaction = $transactions[$index - 1];
                $chainValid = $transaction->previous_hash === $previousTransaction->record_hash;
            } else {
                // First transaction should have null previous_hash
                $chainValid = $transaction->previous_hash === null;
            }

            $valid = $hashValid && $chainValid;
            if (!$valid) {
                $isValid = false;
            }

            $results[] = [
                'id' => $transaction->id,
                'event_date' => $transaction->event_date,
                'event_type' => $transaction->event_type,
                'hash_valid' => $hashValid,
                'chain_valid' => $chainValid,
                'valid' => $valid,
            ];
        }

        return Inertia::render('integrity/check', [
            'results' => $results,
            'isValid' => $isValid,
            'totalRecords' => count($transactions),
            'checkedAt' => now()->format('Y年m月d日 H:i:s'),
        ]);
    }
}

<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Http\Requests\Transaction\StoreTransactionEventRequest;
use App\Models\AmmunitionType;
use App\Models\TransactionEvent;
use App\UseCases\Transaction\CreateTransactionAction;
use App\UseCases\Transaction\GetTransactionAction;
use App\UseCases\Transaction\ListTransactionsAction;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TransactionEventController extends Controller
{
    /**
     * Display a listing of transaction events.
     */
    public function index(Request $request, ListTransactionsAction $action): Response
    {
        $filters = $request->only(['event_type', 'ammunition_type_id', 'date_from', 'date_to']);

        return Inertia::render('transactions/index', [
            'transactions' => $action->execute($request->user(), $filters),
            'ammunitionTypes' => AmmunitionType::forUser($request->user())->active()->get(),
            'filters' => $filters,
        ]);
    }

    /**
     * Show the form for creating a new transaction event.
     */
    public function create(Request $request): Response
    {
        return Inertia::render('transactions/create', [
            'ammunitionTypes' => AmmunitionType::forUser($request->user())->active()->get(),
        ]);
    }

    /**
     * Store a newly created transaction event.
     */
    public function store(
        StoreTransactionEventRequest $request,
        CreateTransactionAction $action
    ): RedirectResponse {
        $action->execute($request->user(), $request->validated());

        return redirect()
            ->route('transactions.index')
            ->with('success', '出納を記録しました。');
    }

    /**
     * Display the specified transaction event.
     */
    public function show(
        Request $request,
        TransactionEvent $transaction,
        GetTransactionAction $action
    ): Response {
        $transaction = $action->execute($request->user(), $transaction->id);

        return Inertia::render('transactions/show', [
            'transaction' => $transaction,
        ]);
    }

    /**
     * Show the form for creating a correction.
     */
    public function createCorrection(Request $request, TransactionEvent $transaction): Response
    {
        $this->authorizeForUser($request->user(), $transaction);

        return Inertia::render('transactions/correct', [
            'originalTransaction' => $transaction->load('ammunitionType'),
        ]);
    }

    /**
     * Store a correction event.
     */
    public function storeCorrection(
        Request $request,
        TransactionEvent $transaction,
        CreateTransactionAction $action
    ): RedirectResponse {
        $this->authorizeForUser($request->user(), $transaction);

        $validated = $request->validate([
            'quantity' => ['required', 'integer'],
            'correction_reason' => ['required', 'string', 'max:1000'],
        ]);

        // Calculate the correction amount (difference)
        $correctionQuantity = $validated['quantity'] - $transaction->quantity;

        $action->execute($request->user(), [
            'ammunition_type_id' => $transaction->ammunition_type_id,
            'event_type' => TransactionEvent::EVENT_TYPE_CORRECTION,
            'quantity' => $correctionQuantity,
            'event_date' => now()->format('Y-m-d'),
            'correction_reason' => $validated['correction_reason'],
            'original_event_id' => $transaction->id,
        ]);

        return redirect()
            ->route('transactions.show', $transaction)
            ->with('success', '訂正を記録しました。');
    }

    /**
     * Check if the user can access the transaction.
     */
    private function authorizeForUser($user, TransactionEvent $transaction): void
    {
        if ($transaction->user_id !== $user->id) {
            abort(403);
        }
    }
}

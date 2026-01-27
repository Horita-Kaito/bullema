<?php

declare(strict_types=1);

namespace App\UseCases\Transaction;

use App\Models\TransactionEvent;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class ListTransactionsAction
{
    /**
     * List transaction events for a user.
     *
     * @param array{
     *   event_type?: string,
     *   ammunition_type_id?: int,
     *   date_from?: string,
     *   date_to?: string,
     * } $filters
     */
    public function execute(User $user, array $filters = [], int $perPage = 20): LengthAwarePaginator
    {
        $query = TransactionEvent::with('ammunitionType')
            ->forUser($user)
            ->orderByDesc('event_date')
            ->orderByDesc('created_at');

        if (!empty($filters['event_type'])) {
            $query->where('event_type', $filters['event_type']);
        }

        if (!empty($filters['ammunition_type_id'])) {
            $query->where('ammunition_type_id', $filters['ammunition_type_id']);
        }

        $query->dateRange($filters['date_from'] ?? null, $filters['date_to'] ?? null);

        return $query->paginate($perPage);
    }
}

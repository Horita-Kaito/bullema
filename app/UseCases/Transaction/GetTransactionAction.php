<?php

declare(strict_types=1);

namespace App\UseCases\Transaction;

use App\Models\TransactionEvent;
use App\Models\User;

class GetTransactionAction
{
    /**
     * Get a transaction event with relations.
     */
    public function execute(User $user, int $transactionId): TransactionEvent
    {
        return TransactionEvent::with(['ammunitionType', 'attachments', 'corrections', 'originalEvent'])
            ->forUser($user)
            ->findOrFail($transactionId);
    }
}

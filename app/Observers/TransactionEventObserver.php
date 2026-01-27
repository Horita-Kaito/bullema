<?php

declare(strict_types=1);

namespace App\Observers;

use App\Models\AuditLog;
use App\Models\TransactionEvent;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Request;

class TransactionEventObserver
{
    /**
     * Handle the TransactionEvent "created" event.
     */
    public function created(TransactionEvent $transactionEvent): void
    {
        $this->logAudit('create', $transactionEvent, null, $transactionEvent->toArray());
    }

    /**
     * Handle the TransactionEvent "updating" event.
     */
    public function updating(TransactionEvent $transactionEvent): void
    {
        // Only allow updating record_hash and previous_hash (set during creation)
        $dirty = $transactionEvent->getDirty();
        $allowedFields = ['record_hash', 'previous_hash'];

        foreach (array_keys($dirty) as $field) {
            if (!in_array($field, $allowedFields)) {
                throw new \RuntimeException(
                    'Transaction events cannot be modified after creation. Use correction events instead.'
                );
            }
        }
    }

    /**
     * Handle the TransactionEvent "deleting" event.
     */
    public function deleting(TransactionEvent $transactionEvent): bool
    {
        // Prevent deletion
        throw new \RuntimeException(
            'Transaction events cannot be deleted. Use correction events instead.'
        );
    }

    /**
     * Log an audit entry.
     */
    private function logAudit(
        string $action,
        TransactionEvent $transactionEvent,
        ?array $oldValues,
        ?array $newValues
    ): void {
        AuditLog::create([
            'user_id' => Auth::id(),
            'action' => $action,
            'auditable_type' => TransactionEvent::class,
            'auditable_id' => $transactionEvent->id,
            'old_values' => $oldValues,
            'new_values' => $newValues,
            'ip_address' => Request::ip(),
            'user_agent' => Request::userAgent(),
            'url' => Request::fullUrl(),
        ]);
    }
}

<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\TransactionEvent;
use App\Models\User;

class TransactionHashService
{
    /**
     * Calculate hash for a transaction event.
     */
    public function calculateHash(array $eventData, ?string $previousHash): string
    {
        $dataToHash = [
            'user_id' => $eventData['user_id'],
            'ammunition_type_id' => $eventData['ammunition_type_id'],
            'event_type' => $eventData['event_type'],
            'quantity' => $eventData['quantity'],
            'event_date' => $eventData['event_date'],
            'notes' => $eventData['notes'] ?? null,
            'location' => $eventData['location'] ?? null,
            'counterparty_name' => $eventData['counterparty_name'] ?? null,
            'counterparty_address' => $eventData['counterparty_address'] ?? null,
            'counterparty_permit_number' => $eventData['counterparty_permit_number'] ?? null,
            'disposal_method' => $eventData['disposal_method'] ?? null,
            'correction_reason' => $eventData['correction_reason'] ?? null,
            'original_event_id' => $eventData['original_event_id'] ?? null,
            'previous_hash' => $previousHash,
        ];

        return hash('sha256', json_encode($dataToHash, JSON_UNESCAPED_UNICODE));
    }

    /**
     * Get the hash of the most recent transaction event for a user.
     */
    public function getPreviousHash(User $user): ?string
    {
        $lastEvent = TransactionEvent::where('user_id', $user->id)
            ->orderByDesc('id')
            ->first();

        return $lastEvent?->record_hash;
    }

    /**
     * Verify the hash chain integrity for a user's events.
     *
     * @return array{valid: bool, errors: array<string>}
     */
    public function verifyChain(User $user): array
    {
        $events = TransactionEvent::where('user_id', $user->id)
            ->orderBy('id')
            ->get();

        $errors = [];
        $previousHash = null;

        foreach ($events as $event) {
            // Check if previous_hash matches
            if ($event->previous_hash !== $previousHash) {
                $errors[] = "イベントID {$event->id}: 前のハッシュが一致しません";
            }

            // Recalculate and verify hash
            $expectedHash = $this->calculateHash($event->toArray(), $previousHash);
            if ($event->record_hash !== $expectedHash) {
                $errors[] = "イベントID {$event->id}: ハッシュが一致しません（改ざんの可能性）";
            }

            $previousHash = $event->record_hash;
        }

        return [
            'valid' => empty($errors),
            'errors' => $errors,
        ];
    }
}

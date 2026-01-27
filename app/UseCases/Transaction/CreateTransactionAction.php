<?php

declare(strict_types=1);

namespace App\UseCases\Transaction;

use App\Models\TransactionEvent;
use App\Models\User;
use App\Services\TransactionHashService;
use Illuminate\Support\Facades\DB;

class CreateTransactionAction
{
    public function __construct(
        private readonly TransactionHashService $hashService
    ) {}

    /**
     * Create a new transaction event.
     *
     * @param array{
     *   ammunition_type_id: int,
     *   event_type: string,
     *   quantity: int,
     *   event_date: string,
     *   notes?: string|null,
     *   location?: string|null,
     *   counterparty_name?: string|null,
     *   counterparty_address?: string|null,
     *   counterparty_permit_number?: string|null,
     *   disposal_method?: string|null,
     * } $data
     */
    public function execute(User $user, array $data): TransactionEvent
    {
        return DB::transaction(function () use ($user, $data) {
            // Adjust quantity sign based on event type
            $quantity = abs($data['quantity']);
            if (in_array($data['event_type'], TransactionEvent::NEGATIVE_EVENT_TYPES)) {
                $quantity = -$quantity;
            }

            $eventData = [
                'user_id' => $user->id,
                'ammunition_type_id' => $data['ammunition_type_id'],
                'event_type' => $data['event_type'],
                'quantity' => $quantity,
                'event_date' => $data['event_date'],
                'notes' => $data['notes'] ?? null,
                'location' => $data['location'] ?? null,
                'counterparty_name' => $data['counterparty_name'] ?? null,
                'counterparty_address' => $data['counterparty_address'] ?? null,
                'counterparty_permit_number' => $data['counterparty_permit_number'] ?? null,
                'disposal_method' => $data['disposal_method'] ?? null,
            ];

            // Calculate hash
            $previousHash = $this->hashService->getPreviousHash($user);
            $eventData['previous_hash'] = $previousHash;
            $eventData['record_hash'] = $this->hashService->calculateHash($eventData, $previousHash);

            return TransactionEvent::create($eventData);
        });
    }
}

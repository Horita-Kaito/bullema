<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\AmmunitionType;
use App\Models\TransactionEvent;
use App\Models\User;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class BalanceService
{
    /**
     * Get current balances for all ammunition types for a user.
     *
     * @return Collection<int, array{ammunition_type: AmmunitionType, balance: int, last_event_date: string|null}>
     */
    public function getAllCurrentBalances(User $user): Collection
    {
        $ammunitionTypes = AmmunitionType::where('user_id', $user->id)
            ->where('is_active', true)
            ->get();

        return $ammunitionTypes->map(function (AmmunitionType $ammunitionType) use ($user) {
            $balance = $this->getCurrentBalance($user, $ammunitionType);
            $lastEvent = TransactionEvent::where('user_id', $user->id)
                ->where('ammunition_type_id', $ammunitionType->id)
                ->orderByDesc('event_date')
                ->orderByDesc('created_at')
                ->first();

            return [
                'ammunition_type' => $ammunitionType,
                'balance' => $balance,
                'last_event_date' => $lastEvent?->event_date,
            ];
        });
    }

    /**
     * Get current balance for a specific ammunition type.
     */
    public function getCurrentBalance(User $user, AmmunitionType $ammunitionType): int
    {
        return (int) TransactionEvent::where('user_id', $user->id)
            ->where('ammunition_type_id', $ammunitionType->id)
            ->sum('quantity');
    }

    /**
     * Get balance at a specific date.
     */
    public function getBalanceAtDate(User $user, AmmunitionType $ammunitionType, string $date): int
    {
        return (int) TransactionEvent::where('user_id', $user->id)
            ->where('ammunition_type_id', $ammunitionType->id)
            ->where('event_date', '<=', $date)
            ->sum('quantity');
    }

    /**
     * Get all balances at a specific date.
     *
     * @return Collection<int, array{ammunition_type: AmmunitionType, balance: int}>
     */
    public function getAllBalancesAtDate(User $user, string $date): Collection
    {
        $ammunitionTypes = AmmunitionType::where('user_id', $user->id)
            ->where('is_active', true)
            ->get();

        return $ammunitionTypes->map(function (AmmunitionType $ammunitionType) use ($user, $date) {
            return [
                'ammunition_type' => $ammunitionType,
                'balance' => $this->getBalanceAtDate($user, $ammunitionType, $date),
            ];
        });
    }

    /**
     * Get balance history (daily balances) for a date range.
     *
     * @return Collection<int, array{date: string, balance: int}>
     */
    public function getBalanceHistory(
        User $user,
        AmmunitionType $ammunitionType,
        string $startDate,
        string $endDate
    ): Collection {
        $events = TransactionEvent::where('user_id', $user->id)
            ->where('ammunition_type_id', $ammunitionType->id)
            ->where('event_date', '<=', $endDate)
            ->orderBy('event_date')
            ->orderBy('created_at')
            ->get();

        $history = collect();
        $currentDate = $startDate;
        $runningBalance = 0;

        // Calculate balance before start date
        $runningBalance = $events
            ->filter(fn($e) => $e->event_date < $startDate)
            ->sum('quantity');

        while ($currentDate <= $endDate) {
            $dayEvents = $events->filter(fn($e) => $e->event_date === $currentDate);
            $runningBalance += $dayEvents->sum('quantity');

            $history->push([
                'date' => $currentDate,
                'balance' => $runningBalance,
            ]);

            $currentDate = date('Y-m-d', strtotime($currentDate . ' +1 day'));
        }

        return $history;
    }
}

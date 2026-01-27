<?php

declare(strict_types=1);

namespace App\UseCases\AmmunitionType;

use App\Models\AmmunitionType;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class ListAmmunitionTypesAction
{
    /**
     * List ammunition types for a user.
     *
     * @param array{show_inactive?: bool} $filters
     */
    public function execute(User $user, array $filters = [], int $perPage = 20): LengthAwarePaginator
    {
        $query = AmmunitionType::forUser($user)
            ->orderBy('category')
            ->orderBy('caliber');

        if (empty($filters['show_inactive'])) {
            $query->active();
        }

        return $query->paginate($perPage);
    }
}

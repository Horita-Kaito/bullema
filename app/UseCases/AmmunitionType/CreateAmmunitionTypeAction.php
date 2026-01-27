<?php

declare(strict_types=1);

namespace App\UseCases\AmmunitionType;

use App\Models\AmmunitionType;
use App\Models\User;

class CreateAmmunitionTypeAction
{
    /**
     * Create a new ammunition type.
     *
     * @param array{category: string, caliber: string, manufacturer?: string|null, notes?: string|null} $data
     */
    public function execute(User $user, array $data): AmmunitionType
    {
        return AmmunitionType::create([
            'user_id' => $user->id,
            'category' => $data['category'],
            'caliber' => $data['caliber'],
            'manufacturer' => $data['manufacturer'] ?? null,
            'notes' => $data['notes'] ?? null,
            'is_active' => true,
        ]);
    }
}

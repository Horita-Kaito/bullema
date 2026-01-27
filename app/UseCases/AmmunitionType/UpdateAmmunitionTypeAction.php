<?php

declare(strict_types=1);

namespace App\UseCases\AmmunitionType;

use App\Models\AmmunitionType;

class UpdateAmmunitionTypeAction
{
    /**
     * Update an ammunition type.
     *
     * @param array{category?: string, caliber?: string, manufacturer?: string|null, notes?: string|null, is_active?: bool} $data
     */
    public function execute(AmmunitionType $ammunitionType, array $data): AmmunitionType
    {
        $ammunitionType->update($data);

        return $ammunitionType->refresh();
    }
}

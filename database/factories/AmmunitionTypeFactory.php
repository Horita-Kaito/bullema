<?php

namespace Database\Factories;

use App\Models\AmmunitionType;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\AmmunitionType>
 */
class AmmunitionTypeFactory extends Factory
{
    protected $model = AmmunitionType::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $categories = ['散弾', 'ライフル弾', '空気銃弾'];
        $calibers = [
            '散弾' => ['12番', '20番', '410番'],
            'ライフル弾' => ['.223 Remington', '.308 Winchester', '.30-06 Springfield'],
            '空気銃弾' => ['4.5mm', '5.5mm'],
        ];

        $category = $this->faker->randomElement($categories);

        return [
            'user_id' => User::factory(),
            'category' => $category,
            'caliber' => $this->faker->randomElement($calibers[$category]),
            'manufacturer' => $this->faker->optional(0.7)->company(),
            'notes' => $this->faker->optional(0.3)->sentence(),
            'is_active' => true,
        ];
    }

    /**
     * Indicate that the ammunition type is inactive.
     */
    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => false,
        ]);
    }
}

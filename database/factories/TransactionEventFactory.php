<?php

namespace Database\Factories;

use App\Models\AmmunitionType;
use App\Models\TransactionEvent;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\TransactionEvent>
 */
class TransactionEventFactory extends Factory
{
    protected $model = TransactionEvent::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $eventType = $this->faker->randomElement(['acquisition', 'consumption', 'transfer', 'disposal']);
        $quantity = $this->faker->numberBetween(1, 100);

        // Make quantity negative for decreasing events
        if (in_array($eventType, TransactionEvent::NEGATIVE_EVENT_TYPES)) {
            $quantity = -$quantity;
        }

        return [
            'user_id' => User::factory(),
            'ammunition_type_id' => AmmunitionType::factory(),
            'event_type' => $eventType,
            'quantity' => $quantity,
            'event_date' => $this->faker->dateTimeBetween('-1 year', 'now')->format('Y-m-d'),
            'notes' => $this->faker->optional(0.3)->sentence(),
            'record_hash' => hash('sha256', $this->faker->uuid()),
            'previous_hash' => null,
        ];
    }

    /**
     * Indicate that this is an acquisition event.
     */
    public function acquisition(): static
    {
        return $this->state(fn (array $attributes) => [
            'event_type' => 'acquisition',
            'quantity' => abs($attributes['quantity']),
            'counterparty_name' => $this->faker->company(),
        ]);
    }

    /**
     * Indicate that this is a consumption event.
     */
    public function consumption(): static
    {
        return $this->state(fn (array $attributes) => [
            'event_type' => 'consumption',
            'quantity' => -abs($attributes['quantity']),
            'location' => $this->faker->city() . '射撃場',
        ]);
    }

    /**
     * Indicate that this is a transfer event.
     */
    public function transfer(): static
    {
        return $this->state(fn (array $attributes) => [
            'event_type' => 'transfer',
            'quantity' => -abs($attributes['quantity']),
            'counterparty_name' => $this->faker->name(),
            'counterparty_address' => $this->faker->address(),
            'counterparty_permit_number' => '第' . $this->faker->numberBetween(100, 9999) . '号',
        ]);
    }

    /**
     * Indicate that this is a disposal event.
     */
    public function disposal(): static
    {
        return $this->state(fn (array $attributes) => [
            'event_type' => 'disposal',
            'quantity' => -abs($attributes['quantity']),
            'disposal_method' => $this->faker->randomElement(['警察署への届出', '不発弾処理', '回収業者']),
        ]);
    }
}

<?php

declare(strict_types=1);

namespace Tests\Unit\Services;

use App\Models\TransactionEvent;
use App\Models\User;
use App\Models\AmmunitionType;
use App\Services\TransactionHashService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TransactionHashServiceTest extends TestCase
{
    use RefreshDatabase;

    private TransactionHashService $service;
    private User $user;
    private AmmunitionType $ammunitionType;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = new TransactionHashService();
        $this->user = User::factory()->create();
        $this->ammunitionType = AmmunitionType::factory()->create([
            'user_id' => $this->user->id,
        ]);
    }

    public function test_calculate_hash_returns_64_character_string(): void
    {
        $eventData = [
            'user_id' => $this->user->id,
            'ammunition_type_id' => $this->ammunitionType->id,
            'event_type' => 'acquisition',
            'quantity' => 100,
            'event_date' => '2024-01-01',
            'notes' => null,
            'location' => null,
            'counterparty_name' => null,
            'counterparty_address' => null,
            'counterparty_permit_number' => null,
            'disposal_method' => null,
            'correction_reason' => null,
            'original_event_id' => null,
        ];

        $hash = $this->service->calculateHash($eventData, null);

        $this->assertEquals(64, strlen($hash));
        $this->assertMatchesRegularExpression('/^[a-f0-9]{64}$/', $hash);
    }

    public function test_calculate_hash_is_deterministic(): void
    {
        $eventData = [
            'user_id' => $this->user->id,
            'ammunition_type_id' => $this->ammunitionType->id,
            'event_type' => 'acquisition',
            'quantity' => 100,
            'event_date' => '2024-01-01',
        ];

        $hash1 = $this->service->calculateHash($eventData, null);
        $hash2 = $this->service->calculateHash($eventData, null);

        $this->assertEquals($hash1, $hash2);
    }

    public function test_calculate_hash_changes_with_different_data(): void
    {
        $eventData1 = [
            'user_id' => $this->user->id,
            'ammunition_type_id' => $this->ammunitionType->id,
            'event_type' => 'acquisition',
            'quantity' => 100,
            'event_date' => '2024-01-01',
        ];

        $eventData2 = [
            'user_id' => $this->user->id,
            'ammunition_type_id' => $this->ammunitionType->id,
            'event_type' => 'acquisition',
            'quantity' => 101, // Different quantity
            'event_date' => '2024-01-01',
        ];

        $hash1 = $this->service->calculateHash($eventData1, null);
        $hash2 = $this->service->calculateHash($eventData2, null);

        $this->assertNotEquals($hash1, $hash2);
    }

    public function test_calculate_hash_changes_with_different_previous_hash(): void
    {
        $eventData = [
            'user_id' => $this->user->id,
            'ammunition_type_id' => $this->ammunitionType->id,
            'event_type' => 'acquisition',
            'quantity' => 100,
            'event_date' => '2024-01-01',
        ];

        $hash1 = $this->service->calculateHash($eventData, null);
        $hash2 = $this->service->calculateHash($eventData, 'previous_hash_value');

        $this->assertNotEquals($hash1, $hash2);
    }

    public function test_get_previous_hash_returns_null_when_no_events(): void
    {
        $previousHash = $this->service->getPreviousHash($this->user);

        $this->assertNull($previousHash);
    }

    public function test_get_previous_hash_returns_last_event_hash(): void
    {
        $event = TransactionEvent::factory()->create([
            'user_id' => $this->user->id,
            'ammunition_type_id' => $this->ammunitionType->id,
            'record_hash' => 'test_hash_value_12345678901234567890123456789012',
        ]);

        $previousHash = $this->service->getPreviousHash($this->user);

        $this->assertEquals('test_hash_value_12345678901234567890123456789012', $previousHash);
    }

    public function test_verify_chain_returns_valid_for_empty_chain(): void
    {
        $result = $this->service->verifyChain($this->user);

        $this->assertTrue($result['valid']);
        $this->assertEmpty($result['errors']);
    }

    public function test_verify_chain_returns_valid_for_correct_chain(): void
    {
        // Create first event
        $eventData1 = [
            'user_id' => $this->user->id,
            'ammunition_type_id' => $this->ammunitionType->id,
            'event_type' => 'acquisition',
            'quantity' => 100,
            'event_date' => '2024-01-01',
            'notes' => null,
            'location' => null,
            'counterparty_name' => null,
            'counterparty_address' => null,
            'counterparty_permit_number' => null,
            'disposal_method' => null,
            'correction_reason' => null,
            'original_event_id' => null,
            'previous_hash' => null,
        ];
        $hash1 = $this->service->calculateHash($eventData1, null);
        TransactionEvent::factory()->create(array_merge($eventData1, ['record_hash' => $hash1]));

        // Create second event
        $eventData2 = [
            'user_id' => $this->user->id,
            'ammunition_type_id' => $this->ammunitionType->id,
            'event_type' => 'consumption',
            'quantity' => -30,
            'event_date' => '2024-01-02',
            'notes' => null,
            'location' => null,
            'counterparty_name' => null,
            'counterparty_address' => null,
            'counterparty_permit_number' => null,
            'disposal_method' => null,
            'correction_reason' => null,
            'original_event_id' => null,
            'previous_hash' => $hash1,
        ];
        $hash2 = $this->service->calculateHash($eventData2, $hash1);
        TransactionEvent::factory()->create(array_merge($eventData2, ['record_hash' => $hash2]));

        $result = $this->service->verifyChain($this->user);

        $this->assertTrue($result['valid']);
        $this->assertEmpty($result['errors']);
    }

    public function test_verify_chain_detects_tampered_hash(): void
    {
        $eventData = [
            'user_id' => $this->user->id,
            'ammunition_type_id' => $this->ammunitionType->id,
            'event_type' => 'acquisition',
            'quantity' => 100,
            'event_date' => '2024-01-01',
            'notes' => null,
            'location' => null,
            'counterparty_name' => null,
            'counterparty_address' => null,
            'counterparty_permit_number' => null,
            'disposal_method' => null,
            'correction_reason' => null,
            'original_event_id' => null,
            'previous_hash' => null,
            'record_hash' => 'tampered_hash_value_that_is_definitely_wrong_here',
        ];
        TransactionEvent::factory()->create($eventData);

        $result = $this->service->verifyChain($this->user);

        $this->assertFalse($result['valid']);
        $this->assertNotEmpty($result['errors']);
        $this->assertStringContainsString('改ざん', $result['errors'][0]);
    }

    public function test_verify_chain_detects_broken_chain(): void
    {
        // Create first event with correct hash
        $eventData1 = [
            'user_id' => $this->user->id,
            'ammunition_type_id' => $this->ammunitionType->id,
            'event_type' => 'acquisition',
            'quantity' => 100,
            'event_date' => '2024-01-01',
            'notes' => null,
            'location' => null,
            'counterparty_name' => null,
            'counterparty_address' => null,
            'counterparty_permit_number' => null,
            'disposal_method' => null,
            'correction_reason' => null,
            'original_event_id' => null,
            'previous_hash' => null,
        ];
        $hash1 = $this->service->calculateHash($eventData1, null);
        TransactionEvent::factory()->create(array_merge($eventData1, ['record_hash' => $hash1]));

        // Create second event with WRONG previous_hash (chain broken)
        $eventData2 = [
            'user_id' => $this->user->id,
            'ammunition_type_id' => $this->ammunitionType->id,
            'event_type' => 'consumption',
            'quantity' => -30,
            'event_date' => '2024-01-02',
            'notes' => null,
            'location' => null,
            'counterparty_name' => null,
            'counterparty_address' => null,
            'counterparty_permit_number' => null,
            'disposal_method' => null,
            'correction_reason' => null,
            'original_event_id' => null,
            'previous_hash' => 'wrong_previous_hash', // This breaks the chain
        ];
        $hash2 = $this->service->calculateHash($eventData2, 'wrong_previous_hash');
        TransactionEvent::factory()->create(array_merge($eventData2, ['record_hash' => $hash2]));

        $result = $this->service->verifyChain($this->user);

        $this->assertFalse($result['valid']);
        $this->assertNotEmpty($result['errors']);
        $this->assertStringContainsString('前のハッシュが一致しません', $result['errors'][0]);
    }
}

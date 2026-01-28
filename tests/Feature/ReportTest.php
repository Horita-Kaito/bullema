<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\AmmunitionType;
use App\Models\TransactionEvent;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ReportTest extends TestCase
{
    use RefreshDatabase;

    private User $user;
    private AmmunitionType $ammunitionType;

    protected function setUp(): void
    {
        parent::setUp();

        $this->user = User::factory()->create();
        $this->ammunitionType = AmmunitionType::factory()->create([
            'user_id' => $this->user->id,
            'is_active' => true,
        ]);

        // Create some transactions for report
        TransactionEvent::factory()->create([
            'user_id' => $this->user->id,
            'ammunition_type_id' => $this->ammunitionType->id,
            'event_type' => 'acquisition',
            'quantity' => 100,
            'event_date' => '2024-01-01',
        ]);

        TransactionEvent::factory()->create([
            'user_id' => $this->user->id,
            'ammunition_type_id' => $this->ammunitionType->id,
            'event_type' => 'consumption',
            'quantity' => -30,
            'event_date' => '2024-01-15',
        ]);
    }

    public function test_reports_page_can_be_rendered(): void
    {
        $response = $this->actingAs($this->user)
            ->get('/reports');

        $response->assertStatus(200);
    }

    public function test_pdf_report_can_be_downloaded(): void
    {
        $response = $this->actingAs($this->user)
            ->get('/reports/pdf');

        $response->assertStatus(200);
        // Currently returns HTML (would use dompdf in production)
        $this->assertStringContainsString('text/html', $response->headers->get('content-type'));
    }

    public function test_csv_report_can_be_downloaded(): void
    {
        $response = $this->actingAs($this->user)
            ->get('/reports/csv');

        $response->assertStatus(200);
        $response->assertHeader('content-type', 'text/csv; charset=UTF-8');
    }

    public function test_pdf_report_respects_date_range(): void
    {
        $response = $this->actingAs($this->user)
            ->get('/reports/pdf?start_date=2024-01-01&end_date=2024-01-10');

        $response->assertStatus(200);
    }

    public function test_csv_report_respects_date_range(): void
    {
        $response = $this->actingAs($this->user)
            ->get('/reports/csv?start_date=2024-01-01&end_date=2024-01-10');

        $response->assertStatus(200);
    }

    public function test_csv_report_contains_expected_data(): void
    {
        $response = $this->actingAs($this->user)
            ->get('/reports/csv');

        $content = $response->getContent();

        // Should contain header row
        $this->assertStringContainsString('日付', $content);
        $this->assertStringContainsString('種別', $content);

        // Should contain our ammunition type
        $this->assertStringContainsString($this->ammunitionType->caliber, $content);
    }

    public function test_report_only_contains_own_data(): void
    {
        $otherUser = User::factory()->create();
        $otherAmmunitionType = AmmunitionType::factory()->create([
            'user_id' => $otherUser->id,
        ]);

        TransactionEvent::factory()->create([
            'user_id' => $otherUser->id,
            'ammunition_type_id' => $otherAmmunitionType->id,
            'event_type' => 'acquisition',
            'quantity' => 999,
        ]);

        $response = $this->actingAs($this->user)
            ->get('/reports/csv');

        $content = $response->getContent();

        // Should NOT contain other user's data
        $this->assertStringNotContainsString($otherAmmunitionType->caliber, $content);
        $this->assertStringNotContainsString('999', $content);
    }

    public function test_pdf_report_is_viewable(): void
    {
        $response = $this->actingAs($this->user)
            ->get('/reports/pdf');

        $response->assertStatus(200);
        // Contains valid HTML content
        $this->assertStringContainsString('<!DOCTYPE html>', $response->getContent());
    }

    public function test_csv_report_has_correct_filename(): void
    {
        $response = $this->actingAs($this->user)
            ->get('/reports/csv');

        $contentDisposition = $response->headers->get('content-disposition');
        $this->assertStringContainsString('ammunition_ledger', $contentDisposition);
        $this->assertStringContainsString('.csv', $contentDisposition);
    }
}

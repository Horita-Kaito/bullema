<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Builder;

class TransactionEvent extends Model
{
    use HasFactory;

    public const EVENT_TYPE_ACQUISITION = 'acquisition';
    public const EVENT_TYPE_CONSUMPTION = 'consumption';
    public const EVENT_TYPE_TRANSFER = 'transfer';
    public const EVENT_TYPE_DISPOSAL = 'disposal';
    public const EVENT_TYPE_CUSTODY_OUT = 'custody_out';
    public const EVENT_TYPE_CUSTODY_RETURN = 'custody_return';
    public const EVENT_TYPE_CORRECTION = 'correction';

    public const EVENT_TYPES = [
        self::EVENT_TYPE_ACQUISITION,
        self::EVENT_TYPE_CONSUMPTION,
        self::EVENT_TYPE_TRANSFER,
        self::EVENT_TYPE_DISPOSAL,
        self::EVENT_TYPE_CUSTODY_OUT,
        self::EVENT_TYPE_CUSTODY_RETURN,
        self::EVENT_TYPE_CORRECTION,
    ];

    // Event types that increase balance
    public const POSITIVE_EVENT_TYPES = [
        self::EVENT_TYPE_ACQUISITION,
        self::EVENT_TYPE_CUSTODY_RETURN,
    ];

    // Event types that decrease balance
    public const NEGATIVE_EVENT_TYPES = [
        self::EVENT_TYPE_CONSUMPTION,
        self::EVENT_TYPE_TRANSFER,
        self::EVENT_TYPE_DISPOSAL,
        self::EVENT_TYPE_CUSTODY_OUT,
    ];

    protected $fillable = [
        'user_id',
        'ammunition_type_id',
        'event_type',
        'quantity',
        'event_date',
        'notes',
        'location',
        'counterparty_name',
        'counterparty_address',
        'counterparty_permit_number',
        'disposal_method',
        'correction_reason',
        'original_event_id',
        'record_hash',
        'previous_hash',
    ];

    protected $casts = [
        'event_date' => 'date:Y-m-d',
        'quantity' => 'integer',
    ];

    /**
     * Get the user that created this event.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the ammunition type for this event.
     */
    public function ammunitionType(): BelongsTo
    {
        return $this->belongsTo(AmmunitionType::class);
    }

    /**
     * Get the attachments for this event.
     */
    public function attachments(): HasMany
    {
        return $this->hasMany(Attachment::class);
    }

    /**
     * Get the original event (for corrections).
     */
    public function originalEvent(): BelongsTo
    {
        return $this->belongsTo(TransactionEvent::class, 'original_event_id');
    }

    /**
     * Get the correction events for this event.
     */
    public function corrections(): HasMany
    {
        return $this->hasMany(TransactionEvent::class, 'original_event_id');
    }

    /**
     * Check if this event type increases balance.
     */
    public function isPositive(): bool
    {
        return in_array($this->event_type, self::POSITIVE_EVENT_TYPES);
    }

    /**
     * Check if this event type decreases balance.
     */
    public function isNegative(): bool
    {
        return in_array($this->event_type, self::NEGATIVE_EVENT_TYPES);
    }

    /**
     * Check if this is a correction event.
     */
    public function isCorrection(): bool
    {
        return $this->event_type === self::EVENT_TYPE_CORRECTION;
    }

    /**
     * Scope a query to events for a specific user.
     */
    public function scopeForUser(Builder $query, User $user): Builder
    {
        return $query->where('user_id', $user->id);
    }

    /**
     * Scope a query to events within a date range.
     */
    public function scopeDateRange(Builder $query, ?string $from, ?string $to): Builder
    {
        if ($from) {
            $query->where('event_date', '>=', $from);
        }
        if ($to) {
            $query->where('event_date', '<=', $to);
        }
        return $query;
    }
}

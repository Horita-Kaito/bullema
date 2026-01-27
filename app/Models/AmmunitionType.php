<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Builder;

class AmmunitionType extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'category',
        'caliber',
        'manufacturer',
        'notes',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    /**
     * Get the user that owns the ammunition type.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the transaction events for this ammunition type.
     */
    public function transactionEvents(): HasMany
    {
        return $this->hasMany(TransactionEvent::class);
    }

    /**
     * Scope a query to only include active ammunition types.
     */
    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope a query to only include ammunition types for a specific user.
     */
    public function scopeForUser(Builder $query, User $user): Builder
    {
        return $query->where('user_id', $user->id);
    }

    /**
     * Get the display name (category + caliber).
     */
    public function getDisplayNameAttribute(): string
    {
        return "{$this->category} / {$this->caliber}";
    }
}

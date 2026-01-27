<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Attachment extends Model
{
    protected $fillable = [
        'transaction_event_id',
        'file_path',
        'original_name',
        'mime_type',
        'file_size',
        'file_hash',
    ];

    protected $casts = [
        'file_size' => 'integer',
    ];

    public function transactionEvent(): BelongsTo
    {
        return $this->belongsTo(TransactionEvent::class);
    }
}

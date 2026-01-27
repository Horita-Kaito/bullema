<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('transaction_events', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->restrictOnDelete();
            $table->foreignId('ammunition_type_id')->constrained()->restrictOnDelete();

            $table->enum('event_type', [
                'acquisition',      // 譲受
                'consumption',      // 消費
                'transfer',         // 譲渡
                'disposal',         // 廃棄
                'custody_out',      // 保管委託
                'custody_return',   // 保管委託から返却
                'correction',       // 訂正
            ])->comment('イベント種別');

            $table->integer('quantity')->comment('数量（正:増加、負:減少）');
            $table->date('event_date')->comment('発生日');
            $table->text('notes')->nullable()->comment('備考');

            // 消費時
            $table->string('location', 255)->nullable()->comment('使用場所');

            // 譲受/譲渡時
            $table->string('counterparty_name', 255)->nullable()->comment('相手方氏名');
            $table->text('counterparty_address')->nullable()->comment('相手方住所');
            $table->string('counterparty_permit_number', 100)->nullable()->comment('相手方許可証番号');

            // 廃棄時
            $table->string('disposal_method', 255)->nullable()->comment('廃棄方法');

            // 訂正時
            $table->text('correction_reason')->nullable()->comment('訂正理由');
            $table->foreignId('original_event_id')->nullable()
                ->constrained('transaction_events')->restrictOnDelete()
                ->comment('訂正対象イベント');

            // 改ざん防止
            $table->string('record_hash', 64)->comment('SHA-256ハッシュ');
            $table->string('previous_hash', 64)->nullable()->comment('直前レコードのハッシュ');

            $table->timestamps();

            // インデックス
            $table->index('user_id');
            $table->index('ammunition_type_id');
            $table->index('event_date');
            $table->index('event_type');
            $table->index('created_at');
            $table->index(['user_id', 'event_date']);
            $table->index(['user_id', 'ammunition_type_id', 'event_date']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('transaction_events');
    }
};

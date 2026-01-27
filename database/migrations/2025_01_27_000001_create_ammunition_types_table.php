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
        Schema::create('ammunition_types', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->restrictOnDelete();
            $table->string('category', 100)->comment('種別（散弾、ライフル弾等）');
            $table->string('caliber', 100)->comment('番径・口径');
            $table->string('manufacturer', 255)->nullable()->comment('メーカー');
            $table->text('notes')->nullable()->comment('備考');
            $table->boolean('is_active')->default(true)->comment('有効フラグ');
            $table->timestamps();

            $table->index('user_id');
            $table->index('category');
            $table->index('is_active');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ammunition_types');
    }
};

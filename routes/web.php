<?php

use App\Http\Controllers\AmmunitionTypeController;
use App\Http\Controllers\AttachmentController;
use App\Http\Controllers\AuditLogController;
use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\BalanceController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\InspectionController;
use App\Http\Controllers\IntegrityController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\TransactionEventController;
use Illuminate\Support\Facades\Route;

// Authentication (guests only)
Route::middleware('guest')->group(function () {
    Route::get('/login', [AuthController::class, 'create'])->name('login');
    Route::post('/login', [AuthController::class, 'store']);
    Route::get('/register', [AuthController::class, 'showRegistrationForm'])->name('register');
    Route::post('/register', [AuthController::class, 'register']);
});

// Authenticated routes
Route::middleware('auth')->group(function () {
    Route::post('/logout', [AuthController::class, 'destroy'])->name('logout');

    // Dashboard
    Route::get('/', [DashboardController::class, 'index'])->name('dashboard');

    // Ammunition Types
    Route::prefix('ammunition-types')->name('ammunition-types.')->group(function () {
        Route::get('/', [AmmunitionTypeController::class, 'index'])->name('index');
        Route::get('/create', [AmmunitionTypeController::class, 'create'])->name('create');
        Route::post('/', [AmmunitionTypeController::class, 'store'])->name('store');
        Route::get('/{ammunitionType}/edit', [AmmunitionTypeController::class, 'edit'])->name('edit');
        Route::put('/{ammunitionType}', [AmmunitionTypeController::class, 'update'])->name('update');
    });

    // Transaction Events
    Route::prefix('transactions')->name('transactions.')->group(function () {
        Route::get('/', [TransactionEventController::class, 'index'])->name('index');
        Route::get('/create', [TransactionEventController::class, 'create'])->name('create');
        Route::post('/', [TransactionEventController::class, 'store'])->name('store');
        Route::get('/{transaction}', [TransactionEventController::class, 'show'])->name('show');
        Route::get('/{transaction}/correct', [TransactionEventController::class, 'createCorrection'])->name('correct');
        Route::post('/{transaction}/correct', [TransactionEventController::class, 'storeCorrection'])->name('correct.store');
    });

    // Balances
    Route::prefix('balances')->name('balances.')->group(function () {
        Route::get('/', [BalanceController::class, 'index'])->name('index');
        Route::get('/{ammunitionType}', [BalanceController::class, 'show'])->name('show');
    });

    // Attachments
    Route::prefix('attachments')->name('attachments.')->group(function () {
        Route::post('/', [AttachmentController::class, 'store'])->name('store');
        Route::get('/{attachment}/download', [AttachmentController::class, 'download'])->name('download');
        Route::get('/{attachment}/preview', [AttachmentController::class, 'preview'])->name('preview');
    });

    // Reports
    Route::prefix('reports')->name('reports.')->group(function () {
        Route::get('/', [ReportController::class, 'index'])->name('index');
        Route::get('/pdf', [ReportController::class, 'pdf'])->name('pdf');
        Route::get('/csv', [ReportController::class, 'csv'])->name('csv');
    });

    // Inspection Mode
    Route::prefix('inspection')->name('inspection.')->group(function () {
        Route::get('/', [InspectionController::class, 'index'])->name('index');
        Route::get('/balance', [InspectionController::class, 'balance'])->name('balance');
        Route::get('/ledger', [InspectionController::class, 'ledger'])->name('ledger');
        Route::get('/attachments', [InspectionController::class, 'attachments'])->name('attachments');
    });

    // Audit Logs
    Route::get('/audit-logs', [AuditLogController::class, 'index'])->name('audit-logs.index');

    // Integrity Check
    Route::get('/integrity-check', [IntegrityController::class, 'check'])->name('integrity.check');
});

<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Http\Requests\AmmunitionType\StoreAmmunitionTypeRequest;
use App\Http\Requests\AmmunitionType\UpdateAmmunitionTypeRequest;
use App\Models\AmmunitionType;
use App\UseCases\AmmunitionType\CreateAmmunitionTypeAction;
use App\UseCases\AmmunitionType\ListAmmunitionTypesAction;
use App\UseCases\AmmunitionType\UpdateAmmunitionTypeAction;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AmmunitionTypeController extends Controller
{
    /**
     * Display a listing of ammunition types.
     */
    public function index(Request $request, ListAmmunitionTypesAction $action): Response
    {
        $filters = $request->only(['show_inactive']);

        return Inertia::render('ammunition-types/index', [
            'ammunitionTypes' => $action->execute($request->user(), $filters),
            'filters' => $filters,
        ]);
    }

    /**
     * Show the form for creating a new ammunition type.
     */
    public function create(): Response
    {
        return Inertia::render('ammunition-types/create');
    }

    /**
     * Store a newly created ammunition type.
     */
    public function store(
        StoreAmmunitionTypeRequest $request,
        CreateAmmunitionTypeAction $action
    ): RedirectResponse {
        $action->execute($request->user(), $request->validated());

        return redirect()
            ->route('ammunition-types.index')
            ->with('success', '実包マスタを登録しました。');
    }

    /**
     * Show the form for editing an ammunition type.
     */
    public function edit(AmmunitionType $ammunitionType): Response
    {
        $this->authorizeForUser(request()->user(), 'update', $ammunitionType);

        return Inertia::render('ammunition-types/edit', [
            'ammunitionType' => $ammunitionType,
        ]);
    }

    /**
     * Update the specified ammunition type.
     */
    public function update(
        UpdateAmmunitionTypeRequest $request,
        AmmunitionType $ammunitionType,
        UpdateAmmunitionTypeAction $action
    ): RedirectResponse {
        $action->execute($ammunitionType, $request->validated());

        return redirect()
            ->route('ammunition-types.index')
            ->with('success', '実包マスタを更新しました。');
    }

    /**
     * Check if the user can perform the action on the ammunition type.
     */
    private function authorizeForUser($user, string $ability, AmmunitionType $ammunitionType): void
    {
        if ($ammunitionType->user_id !== $user->id) {
            abort(403);
        }
    }
}

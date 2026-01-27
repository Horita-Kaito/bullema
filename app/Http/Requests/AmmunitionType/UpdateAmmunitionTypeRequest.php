<?php

declare(strict_types=1);

namespace App\Http\Requests\AmmunitionType;

use Illuminate\Foundation\Http\FormRequest;

class UpdateAmmunitionTypeRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        $ammunitionType = $this->route('ammunitionType');

        return $ammunitionType->user_id === $this->user()->id;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'category' => ['required', 'string', 'max:100'],
            'caliber' => ['required', 'string', 'max:100'],
            'manufacturer' => ['nullable', 'string', 'max:255'],
            'notes' => ['nullable', 'string', 'max:1000'],
            'is_active' => ['sometimes', 'boolean'],
        ];
    }

    /**
     * Get custom attributes for validator errors.
     *
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'category' => '種別',
            'caliber' => '番径・口径',
            'manufacturer' => 'メーカー',
            'notes' => '備考',
            'is_active' => '有効フラグ',
        ];
    }
}

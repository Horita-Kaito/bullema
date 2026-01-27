<?php

declare(strict_types=1);

namespace App\Http\Requests\Transaction;

use App\Models\AmmunitionType;
use App\Models\TransactionEvent;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreTransactionEventRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $rules = [
            'ammunition_type_id' => [
                'required',
                'integer',
                Rule::exists('ammunition_types', 'id')->where(function ($query) {
                    $query->where('user_id', $this->user()->id)
                          ->where('is_active', true);
                }),
            ],
            'event_type' => [
                'required',
                'string',
                Rule::in(array_diff(TransactionEvent::EVENT_TYPES, [TransactionEvent::EVENT_TYPE_CORRECTION])),
            ],
            'quantity' => ['required', 'integer', 'min:1'],
            'event_date' => ['required', 'date', 'before_or_equal:today'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ];

        // Add conditional rules based on event type
        $eventType = $this->input('event_type');

        if ($eventType === TransactionEvent::EVENT_TYPE_CONSUMPTION) {
            $rules['location'] = ['nullable', 'string', 'max:255'];
        }

        if (in_array($eventType, [TransactionEvent::EVENT_TYPE_ACQUISITION, TransactionEvent::EVENT_TYPE_TRANSFER])) {
            $rules['counterparty_name'] = ['nullable', 'string', 'max:255'];
            $rules['counterparty_address'] = ['nullable', 'string', 'max:1000'];
            $rules['counterparty_permit_number'] = ['nullable', 'string', 'max:100'];
        }

        if ($eventType === TransactionEvent::EVENT_TYPE_DISPOSAL) {
            $rules['disposal_method'] = ['nullable', 'string', 'max:255'];
        }

        return $rules;
    }

    /**
     * Get custom attributes for validator errors.
     *
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'ammunition_type_id' => '実包種別',
            'event_type' => 'イベント種別',
            'quantity' => '数量',
            'event_date' => '発生日',
            'notes' => '備考',
            'location' => '使用場所',
            'counterparty_name' => '相手方氏名',
            'counterparty_address' => '相手方住所',
            'counterparty_permit_number' => '相手方許可証番号',
            'disposal_method' => '廃棄方法',
        ];
    }
}

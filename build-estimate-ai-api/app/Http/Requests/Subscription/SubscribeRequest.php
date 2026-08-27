<?php

namespace App\Http\Requests\Subscription;

use Illuminate\Foundation\Http\FormRequest;

class SubscribeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'subscription_plan_id' => ['required', 'string', 'exists:subscription_plans,id'],
            'billing_interval' => ['sometimes', 'string', 'in:monthly,yearly'],
        ];
    }
}

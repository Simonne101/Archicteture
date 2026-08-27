<?php

namespace App\Http\Requests\Analysis;

use Illuminate\Foundation\Http\FormRequest;

class UpdateMeasurementRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'label' => ['sometimes', 'nullable', 'string', 'max:255'],
            'length' => ['sometimes', 'nullable', 'numeric', 'min:0'],
            'width' => ['sometimes', 'nullable', 'numeric', 'min:0'],
            'height' => ['sometimes', 'nullable', 'numeric', 'min:0'],
            'surface' => ['sometimes', 'nullable', 'numeric', 'min:0'],
            'thickness' => ['sometimes', 'nullable', 'numeric', 'min:0'],
            'volume' => ['sometimes', 'nullable', 'numeric', 'min:0'],
            'unit' => ['sometimes', 'string', 'max:10'],
        ];
    }
}

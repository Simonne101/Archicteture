<?php

namespace App\Http\Requests\Analysis;

use Illuminate\Foundation\Http\FormRequest;

class ReviewAnalysisRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'measurements' => ['sometimes', 'array'],
            'measurements.*.id' => ['required_with:measurements', 'string'],
            'measurements.*.label' => ['sometimes', 'nullable', 'string', 'max:255'],
            'measurements.*.length' => ['sometimes', 'nullable', 'numeric', 'min:0'],
            'measurements.*.width' => ['sometimes', 'nullable', 'numeric', 'min:0'],
            'measurements.*.height' => ['sometimes', 'nullable', 'numeric', 'min:0'],
            'measurements.*.surface' => ['sometimes', 'nullable', 'numeric', 'min:0'],
            'measurements.*.thickness' => ['sometimes', 'nullable', 'numeric', 'min:0'],
            'measurements.*.volume' => ['sometimes', 'nullable', 'numeric', 'min:0'],
            'measurements.*.unit' => ['sometimes', 'string', 'max:10'],
        ];
    }
}

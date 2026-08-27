<?php

namespace App\Http\Requests\Project;

use App\Support\CurrencyRegistry;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateProjectRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'description' => ['sometimes', 'nullable', 'string'],
            'project_type' => ['sometimes', 'nullable', 'string', Rule::in(config('build_estimate.construction_types'))],
            'location' => ['sometimes', 'nullable', 'string', 'max:255'],
            'country_code' => ['sometimes', 'string', Rule::in(array_keys(CurrencyRegistry::countries()))],
            'metadata' => ['sometimes', 'nullable', 'array'],
        ];
    }
}

<?php

namespace App\Http\Requests\Project;

use App\Support\CurrencyRegistry;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreProjectRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            // Optional: the frontend never surfaces "organization" as a
            // concept, so it never sends this. Falls back to the user's own
            // organization in the controller. Kept accepting it explicitly
            // for API clients that do manage multiple organizations.
            'organization_id' => [
                'sometimes',
                'string',
                Rule::exists('organizations', 'id'),
            ],
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'project_type' => ['nullable', 'string', Rule::in(config('build_estimate.construction_types'))],
            'location' => ['nullable', 'string', 'max:255'],
            // The country drives locally-relevant material units (sac,
            // roue, barre...) via App\Support\CurrencyRegistry + the unit
            // conversion catalog — required so every project has a real
            // unit context from the start. It no longer drives any price:
            // the estimation engine computes quantities only.
            'country_code' => ['required', 'string', Rule::in(array_keys(CurrencyRegistry::countries()))],
            'metadata' => ['nullable', 'array'],
        ];
    }
}

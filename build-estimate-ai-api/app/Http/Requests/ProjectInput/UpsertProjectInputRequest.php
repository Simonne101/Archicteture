<?php

namespace App\Http\Requests\ProjectInput;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Every field is optional (spec §7: information can come from the AI
 * analysis instead of manual entry) but whatever IS submitted must be
 * physically sane — no negative surfaces/heights/counts (spec §26).
 */
class UpsertProjectInputRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'dimensions' => ['sometimes', 'array'],
            'dimensions.land_length' => ['sometimes', 'nullable', 'numeric', 'min:0'],
            'dimensions.land_width' => ['sometimes', 'nullable', 'numeric', 'min:0'],
            'dimensions.building_length' => ['sometimes', 'nullable', 'numeric', 'min:0'],
            'dimensions.building_width' => ['sometimes', 'nullable', 'numeric', 'min:0'],
            'dimensions.approximate_surface' => ['sometimes', 'nullable', 'numeric', 'min:0'],

            'structure' => ['sometimes', 'array'],
            'structure.levels' => ['sometimes', 'nullable', 'integer', 'min:1'],
            'structure.ceiling_height' => ['sometimes', 'nullable', 'numeric', 'min:0'],
            'structure.foundation_type' => ['sometimes', 'nullable', 'string', 'max:100'],
            'structure.slab_type' => ['sometimes', 'nullable', 'string', 'max:100'],
            'structure.roof_type' => ['sometimes', 'nullable', 'string', 'max:100'],

            'foundations' => ['sometimes', 'array'],
            'foundations.footing_type' => ['sometimes', 'nullable', 'string', 'max:100'],
            'foundations.depth' => ['sometimes', 'nullable', 'numeric', 'min:0'],
            'foundations.width' => ['sometimes', 'nullable', 'numeric', 'min:0'],
            'foundations.length' => ['sometimes', 'nullable', 'numeric', 'min:0'],

            'walls' => ['sometimes', 'array'],
            'walls.thickness' => ['sometimes', 'nullable', 'numeric', 'min:0'],
            'walls.height' => ['sometimes', 'nullable', 'numeric', 'min:0'],
            'walls.block_type' => ['sometimes', 'nullable', 'string', 'max:100'],

            'openings' => ['sometimes', 'array'],
            'openings.door_count' => ['sometimes', 'nullable', 'integer', 'min:0'],
            'openings.doors' => ['sometimes', 'array'],
            'openings.doors.*.width' => ['numeric', 'min:0'],
            'openings.doors.*.height' => ['numeric', 'min:0'],
            'openings.window_count' => ['sometimes', 'nullable', 'integer', 'min:0'],
            'openings.windows' => ['sometimes', 'array'],
            'openings.windows.*.width' => ['numeric', 'min:0'],
            'openings.windows.*.height' => ['numeric', 'min:0'],

            'reinforced_concrete' => ['sometimes', 'array'],
            'reinforced_concrete.columns' => ['sometimes', 'array'],
            'reinforced_concrete.columns.*.count' => ['integer', 'min:0'],
            'reinforced_concrete.columns.*.section' => ['nullable', 'string', 'max:50'],
            'reinforced_concrete.beams' => ['sometimes', 'array'],
            'reinforced_concrete.beams.*.count' => ['integer', 'min:0'],
            'reinforced_concrete.beams.*.section' => ['nullable', 'string', 'max:50'],
            'reinforced_concrete.slabs' => ['sometimes', 'array'],
            'reinforced_concrete.slabs.*.thickness' => ['numeric', 'min:0'],
            'reinforced_concrete.rebar_diameter_mm' => ['sometimes', 'nullable', 'numeric', 'min:0'],

            'roofing' => ['sometimes', 'array'],
            'roofing.type' => ['sometimes', 'nullable', 'string', 'max:100'],
            'roofing.surface' => ['sometimes', 'nullable', 'numeric', 'min:0'],
            'roofing.pitch' => ['sometimes', 'nullable', 'numeric', 'min:0'],
            'roofing.covering' => ['sometimes', 'nullable', 'string', 'max:100'],

            'materials' => ['sometimes', 'array'],
            'materials.*.material_code' => ['required_with:materials', 'string', 'exists:materials,code'],

            'notes' => ['sometimes', 'nullable', 'string'],
        ];
    }
}

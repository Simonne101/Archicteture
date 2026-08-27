<?php

namespace App\Http\Resources;

use App\Models\Estimate;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin Estimate */
class EstimateResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'project_id' => $this->project_id,
            'plan_id' => $this->plan_id,
            'analysis_id' => $this->analysis_id,
            'status' => $this->status->value,
            'country_code' => $this->country_code,
            'calculation_version' => $this->calculation_version,
            'error_message' => $this->error_message,
            'items' => EstimateItemResource::collection($this->whenLoaded('items')),
            // spec §22: never presented as a certified/final figure.
            'certified' => false,
            'warning' => 'Cette estimation utilise des ratios par défaut non certifiés par un professionnel du BTP. À valider avant tout usage réel.',
            'created_at' => $this->created_at,
        ];
    }
}

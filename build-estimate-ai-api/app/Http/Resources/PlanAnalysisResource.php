<?php

namespace App\Http\Resources;

use App\Models\PlanAnalysis;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin PlanAnalysis */
class PlanAnalysisResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'plan_id' => $this->plan_id,
            'status' => $this->status->value,
            'provider' => $this->provider,
            'model' => $this->model,
            'confidence_score' => $this->confidence_score,
            'calculation_version' => $this->calculation_version,
            'started_at' => $this->started_at,
            'completed_at' => $this->completed_at,
            'error_message' => $this->error_message,
            'normalized_result' => $this->normalized_result,
            'measurements' => MeasurementResource::collection($this->whenLoaded('measurements')),
            'reviewed_at' => $this->reviewed_at,
            'confirmed_at' => $this->confirmed_at,
            'is_confirmed' => $this->isConfirmed(),
            'created_at' => $this->created_at,
        ];
    }
}

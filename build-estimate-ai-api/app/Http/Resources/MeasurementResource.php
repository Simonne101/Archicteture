<?php

namespace App\Http\Resources;

use App\Models\Measurement;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin Measurement */
class MeasurementResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'category' => $this->category->value,
            'label' => $this->label,
            'length' => $this->length,
            'width' => $this->width,
            'height' => $this->height,
            'surface' => $this->surface,
            'thickness' => $this->thickness,
            'volume' => $this->volume,
            'unit' => $this->unit,
            'source' => $this->source->value,
            'confidence' => $this->confidence,
        ];
    }
}

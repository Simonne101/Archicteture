<?php

namespace App\Models;

use App\Enums\MeasurementCategory;
use App\Enums\MeasurementSource;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Measurement extends Model
{
    use HasFactory, HasUlids;

    protected $fillable = [
        'plan_analysis_id',
        'category',
        'label',
        'length',
        'width',
        'height',
        'surface',
        'thickness',
        'volume',
        'unit',
        'source',
        'confidence',
    ];

    protected function casts(): array
    {
        return [
            'category' => MeasurementCategory::class,
            'source' => MeasurementSource::class,
            'length' => 'float',
            'width' => 'float',
            'height' => 'float',
            'surface' => 'float',
            'thickness' => 'float',
            'volume' => 'float',
            'confidence' => 'float',
        ];
    }

    public function planAnalysis(): BelongsTo
    {
        return $this->belongsTo(PlanAnalysis::class);
    }
}

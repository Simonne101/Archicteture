<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EstimateItem extends Model
{
    use HasFactory, HasUlids;

    protected $fillable = [
        'estimate_id',
        'material_id',
        'description',
        'quantity',
        'unit',
        'quantity_base',
        'base_unit',
        'display_unit',
        'display_unit_configured',
        'calculation_method',
        'assumptions',
        'confidence',
        'unit_price',
        'total_price',
        'currency',
        'metadata',
    ];

    protected function casts(): array
    {
        return [
            'quantity' => 'float',
            'quantity_base' => 'float',
            'display_unit_configured' => 'boolean',
            'confidence' => 'float',
            'assumptions' => 'array',
            'unit_price' => 'float',
            'total_price' => 'float',
            'metadata' => 'array',
        ];
    }

    public function estimate(): BelongsTo
    {
        return $this->belongsTo(Estimate::class);
    }

    public function material(): BelongsTo
    {
        return $this->belongsTo(Material::class);
    }
}

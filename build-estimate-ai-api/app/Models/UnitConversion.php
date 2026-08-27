<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UnitConversion extends Model
{
    use HasFactory, HasUlids;

    protected $fillable = [
        'material_id',
        'country_code',
        'city',
        'from_unit_id',
        'to_unit_id',
        'factor',
        'verified',
        'notes',
        'is_default',
    ];

    protected function casts(): array
    {
        return [
            'factor' => 'float',
            'verified' => 'boolean',
            'is_default' => 'boolean',
        ];
    }

    public function material(): BelongsTo
    {
        return $this->belongsTo(Material::class);
    }

    public function fromUnit(): BelongsTo
    {
        return $this->belongsTo(Unit::class, 'from_unit_id');
    }

    public function toUnit(): BelongsTo
    {
        return $this->belongsTo(Unit::class, 'to_unit_id');
    }
}

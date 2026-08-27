<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MaterialPrice extends Model
{
    use HasFactory, HasUlids;

    protected $fillable = [
        'material_id',
        'region',
        'country_code',
        'supplier',
        'unit_price',
        'currency',
        'valid_from',
        'valid_until',
        'source',
    ];

    protected function casts(): array
    {
        return [
            'unit_price' => 'float',
            'valid_from' => 'date',
            'valid_until' => 'date',
        ];
    }

    public function material(): BelongsTo
    {
        return $this->belongsTo(Material::class);
    }
}

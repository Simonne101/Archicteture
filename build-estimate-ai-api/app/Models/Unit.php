<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Unit extends Model
{
    use HasFactory, HasUlids;

    protected $fillable = [
        'code',
        'name',
        'symbol',
        'type',
        'active',
    ];

    protected function casts(): array
    {
        return [
            'active' => 'boolean',
        ];
    }

    public function isPhysical(): bool
    {
        return $this->type === 'physical';
    }

    public function isCommercial(): bool
    {
        return $this->type === 'commercial';
    }
}

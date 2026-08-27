<?php

namespace App\Models;

use App\Enums\UsageMetric;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UsageRecord extends Model
{
    use HasFactory, HasUlids;

    protected $fillable = [
        'organization_id',
        'metric',
        'period',
        'count',
    ];

    protected function casts(): array
    {
        return [
            'metric' => UsageMetric::class,
        ];
    }

    public function organization(): BelongsTo
    {
        return $this->belongsTo(Organization::class);
    }
}

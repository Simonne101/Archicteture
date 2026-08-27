<?php

namespace App\Models;

use App\Enums\EstimateStatus;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Estimate extends Model
{
    use HasFactory, HasUlids, SoftDeletes;

    protected $fillable = [
        'project_id',
        'plan_id',
        'analysis_id',
        'status',
        'subtotal',
        'total',
        'currency',
        'country_code',
        'calculation_version',
        'ai_provider',
        'ai_model',
        'input_snapshot',
        'error_message',
        'created_by',
    ];

    protected function casts(): array
    {
        return [
            'status' => EstimateStatus::class,
            'subtotal' => 'float',
            'total' => 'float',
            'input_snapshot' => 'array',
        ];
    }

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    public function plan(): BelongsTo
    {
        return $this->belongsTo(Plan::class);
    }

    public function analysis(): BelongsTo
    {
        return $this->belongsTo(PlanAnalysis::class, 'analysis_id');
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function items(): HasMany
    {
        return $this->hasMany(EstimateItem::class);
    }

    public function reports(): HasMany
    {
        return $this->hasMany(Report::class);
    }
}

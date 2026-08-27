<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProjectInput extends Model
{
    use HasFactory, HasUlids;

    protected $fillable = [
        'project_id',
        'dimensions',
        'structure',
        'foundations',
        'walls',
        'openings',
        'reinforced_concrete',
        'roofing',
        'materials',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'dimensions' => 'array',
            'structure' => 'array',
            'foundations' => 'array',
            'walls' => 'array',
            'openings' => 'array',
            'reinforced_concrete' => 'array',
            'roofing' => 'array',
            'materials' => 'array',
        ];
    }

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }
}

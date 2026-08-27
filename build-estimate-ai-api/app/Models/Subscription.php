<?php

namespace App\Models;

use App\Enums\SubscriptionStatus;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Subscription extends Model
{
    use HasFactory, HasUlids;

    protected $fillable = [
        'organization_id',
        'subscription_plan_id',
        'status',
        'billing_interval',
        'current_period_start',
        'current_period_end',
        'cancel_at_period_end',
        'canceled_at',
        'payment_provider',
        'payment_provider_subscription_id',
    ];

    protected function casts(): array
    {
        return [
            'status' => SubscriptionStatus::class,
            'current_period_start' => 'datetime',
            'current_period_end' => 'datetime',
            'cancel_at_period_end' => 'boolean',
            'canceled_at' => 'datetime',
        ];
    }

    public function organization(): BelongsTo
    {
        return $this->belongsTo(Organization::class);
    }

    public function plan(): BelongsTo
    {
        return $this->belongsTo(SubscriptionPlan::class, 'subscription_plan_id');
    }

    /**
     * A subscription with cancel_at_period_end=true stays status=Active
     * (and therefore usable) until current_period_end passes — matching how
     * Stripe et al. behave; only a scheduled job flips it to Canceled then.
     */
    public function isActive(): bool
    {
        if (! $this->status->grantsAccess()) {
            return false;
        }

        return ! $this->current_period_end || now()->lt($this->current_period_end);
    }
}

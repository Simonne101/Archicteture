<?php

namespace App\Services;

use App\Models\AuditLog;
use App\Models\Organization;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;

/**
 * Records key domain events (spec §42) so an organization's activity can be
 * reconstructed after the fact — who did what, and when. Never used for
 * access control, only for audit trail.
 */
class AuditLogService
{
    public function log(string $action, ?Model $auditable = null, ?User $user = null, ?Organization $organization = null, array $metadata = []): AuditLog
    {
        return AuditLog::create([
            'organization_id' => $organization?->id,
            'user_id' => $user?->id,
            'action' => $action,
            'auditable_type' => $auditable?->getMorphClass(),
            'auditable_id' => $auditable?->getKey(),
            'metadata' => $metadata,
            'ip_address' => request()?->ip(),
        ]);
    }
}

<?php

namespace App\Policies;

use App\Models\Plan;
use App\Models\Project;
use App\Models\User;

class PlanPolicy
{
    public function view(User $user, Plan $plan): bool
    {
        return $plan->project->organization->roleFor($user) !== null;
    }

    /**
     * Called as $this->authorize('create', [Plan::class, $project]) since a
     * Plan doesn't exist yet at upload time.
     */
    public function create(User $user, Project $project): bool
    {
        return $project->organization->roleFor($user)?->canEditContent() ?? false;
    }

    public function delete(User $user, Plan $plan): bool
    {
        return $plan->project->organization->roleFor($user)?->canEditContent() ?? false;
    }
}

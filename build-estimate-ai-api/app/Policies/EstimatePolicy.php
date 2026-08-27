<?php

namespace App\Policies;

use App\Models\Estimate;
use App\Models\Project;
use App\Models\User;

class EstimatePolicy
{
    public function view(User $user, Estimate $estimate): bool
    {
        return $estimate->project->organization->roleFor($user) !== null;
    }

    /**
     * Called as $this->authorize('create', [Estimate::class, $project]).
     */
    public function create(User $user, Project $project): bool
    {
        return $project->organization->roleFor($user)?->canEditContent() ?? false;
    }
}

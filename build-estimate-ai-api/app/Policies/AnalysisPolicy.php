<?php

namespace App\Policies;

use App\Models\PlanAnalysis;
use App\Models\User;

class AnalysisPolicy
{
    public function view(User $user, PlanAnalysis $analysis): bool
    {
        return $analysis->plan->project->organization->roleFor($user) !== null;
    }

    public function review(User $user, PlanAnalysis $analysis): bool
    {
        return $analysis->plan->project->organization->roleFor($user)?->canEditContent() ?? false;
    }

    public function confirm(User $user, PlanAnalysis $analysis): bool
    {
        return $analysis->plan->project->organization->roleFor($user)?->canEditContent() ?? false;
    }
}

<?php

namespace App\Policies;

use App\Models\Estimate;
use App\Models\Report;
use App\Models\User;

class ReportPolicy
{
    public function view(User $user, Report $report): bool
    {
        return $report->estimate->project->organization->roleFor($user) !== null;
    }

    /**
     * Called as $this->authorize('create', [Report::class, $estimate]).
     */
    public function create(User $user, Estimate $estimate): bool
    {
        return $estimate->project->organization->roleFor($user)?->canEditContent() ?? false;
    }

    public function download(User $user, Report $report): bool
    {
        return $this->view($user, $report);
    }
}

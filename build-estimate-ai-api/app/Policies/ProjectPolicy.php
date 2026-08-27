<?php

namespace App\Policies;

use App\Models\Organization;
use App\Models\Project;
use App\Models\User;

class ProjectPolicy
{
    /**
     * Any authenticated user can list projects (results are scoped to their
     * own organizations in the controller/service, not filtered here).
     */
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Project $project): bool
    {
        return $project->organization->roleFor($user) !== null;
    }

    /**
     * Called as $this->authorize('create', [Project::class, $organization])
     * since a Project doesn't exist yet at creation time.
     */
    public function create(User $user, Organization $organization): bool
    {
        return $organization->roleFor($user)?->canEditContent() ?? false;
    }

    public function update(User $user, Project $project): bool
    {
        return $project->organization->roleFor($user)?->canEditContent() ?? false;
    }

    /**
     * Deletion is destructive (cascades to plans/estimates/reports in later
     * phases), so it's restricted to owner/admin rather than any content editor.
     */
    public function delete(User $user, Project $project): bool
    {
        return $project->organization->roleFor($user)?->canManageMembers() ?? false;
    }
}

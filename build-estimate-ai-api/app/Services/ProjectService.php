<?php

namespace App\Services;

use App\Enums\ProjectStatus;
use App\Models\Organization;
use App\Models\Project;
use App\Models\User;
use App\Support\CurrencyRegistry;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

class ProjectService
{
    public function __construct(private readonly AuditLogService $auditLog) {}

    public function create(array $data, Organization $organization, User $creator): Project
    {
        // The real, user-facing endpoint (StoreProjectRequest) requires
        // country_code — this fallback only exists for internal callers
        // (seeders, test fixtures) that build a project purely as a
        // prerequisite for testing something else and don't care which
        // market it's in.
        $countryCode = $data['country_code'] ?? config('build_estimate.default_country');
        $currency = $data['currency'] ?? CurrencyRegistry::currencyForCountry($countryCode) ?? config('build_estimate.default_currency');

        $project = DB::transaction(fn () => Project::create([
            'organization_id' => $organization->id,
            'created_by' => $creator->id,
            'name' => $data['name'],
            'description' => $data['description'] ?? null,
            'project_type' => $data['project_type'] ?? null,
            'location' => $data['location'] ?? null,
            'country_code' => $countryCode,
            'currency' => $currency,
            'status' => ProjectStatus::Draft,
            'metadata' => $data['metadata'] ?? null,
        ]));

        $this->auditLog->log('project.created', $project, $creator, $organization);

        return $project;
    }

    public function update(Project $project, array $data): Project
    {
        // Changing the country re-derives the currency unless one was sent
        // explicitly (already validated against that country elsewhere) —
        // but existing estimates keep their own snapshotted currency/country
        // regardless (spec §5: never rewritten retroactively).
        if (array_key_exists('country_code', $data) && ! array_key_exists('currency', $data)) {
            $data['currency'] = CurrencyRegistry::currencyForCountry($data['country_code']) ?? $project->currency;
        }

        $project->fill(array_intersect_key($data, array_flip([
            'name', 'description', 'project_type', 'location', 'country_code', 'currency', 'metadata',
        ])));
        $project->save();

        return $project;
    }

    public function delete(Project $project): void
    {
        // Soft delete only for now — hard cleanup of associated plans/reports
        // on the storage disk lands in Phase 3+ once those tables exist
        // (spec §65).
        $project->delete();
    }

    /**
     * Paginated, searchable, filterable list of projects belonging to any
     * organization the given user is a member of (spec §47/§48).
     */
    public function listForUser(User $user, array $filters, int $perPage = 15): LengthAwarePaginator
    {
        $organizationIds = $user->organizations()->pluck('organizations.id');

        $query = Project::query()
            ->whereIn('organization_id', $organizationIds)
            ->with(['organization', 'creator']);

        if (! empty($filters['organization_id'])) {
            $query->where('organization_id', $filters['organization_id']);
        }

        if (! empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (! empty($filters['search'])) {
            $query->where('name', 'like', '%'.$filters['search'].'%');
        }

        $sort = in_array($filters['sort'] ?? null, ['name', 'status', 'created_at'], true)
            ? $filters['sort']
            : 'created_at';
        $direction = ($filters['direction'] ?? 'desc') === 'asc' ? 'asc' : 'desc';

        return $query->orderBy($sort, $direction)->paginate($perPage);
    }
}

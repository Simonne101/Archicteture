<?php

namespace App\Services;

use App\Enums\PlanStatus;
use App\Enums\UsageMetric;
use App\Models\Plan;
use App\Models\Project;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class PlanService
{
    public function __construct(
        private readonly UsageService $usage,
        private readonly AuditLogService $auditLog,
    ) {}

    public function upload(UploadedFile $file, Project $project, User $uploader): Plan
    {
        $organization = $project->organization;
        $fileSizeMb = (int) ceil($file->getSize() / 1024 / 1024);

        $this->usage->ensureCanConsume($organization, UsageMetric::PlansUploaded, actor: $uploader);
        $this->usage->ensureCanConsume($organization, UsageMetric::StorageUsedMb, $fileSizeMb, $uploader);

        $disk = config('build_estimate.storage_disk');

        // Internal filename only — never derived from the client-supplied
        // name (spec §11). original_filename is kept purely for display.
        $extension = strtolower($file->extension() ?: $file->getClientOriginalExtension());
        $internalName = Str::uuid()->toString().'.'.$extension;
        $path = "projects/{$project->id}/plans/{$internalName}";

        Storage::disk($disk)->put($path, file_get_contents($file->getRealPath()));

        $plan = DB::transaction(fn () => Plan::create([
            'project_id' => $project->id,
            'uploaded_by' => $uploader->id,
            'original_filename' => $file->getClientOriginalName(),
            'storage_path' => $path,
            'mime_type' => $file->getMimeType(),
            'file_size' => $file->getSize(),
            'checksum' => hash_file('sha256', $file->getRealPath()),
            'status' => PlanStatus::Ready,
            // page_count is left null here — populated during analysis
            // preprocessing (Phase 4) once the plan is actually parsed;
            // never fabricated ahead of time (spec §84).
        ]));

        $this->usage->increment($organization, UsageMetric::PlansUploaded);
        $this->usage->increment($organization, UsageMetric::StorageUsedMb, $fileSizeMb);
        $this->auditLog->log('plan.uploaded', $plan, $uploader, $organization);

        return $plan;
    }

    /**
     * Soft-deletes the plan record. The physical file is intentionally left
     * in place so a soft-deleted plan stays recoverable — permanent file
     * cleanup only happens on force-delete (spec §65), not implemented yet.
     */
    public function delete(Plan $plan): void
    {
        $plan->delete();
    }
}

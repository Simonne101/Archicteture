<?php

namespace App\Services\Analysis;

use App\Enums\AnalysisStatus;
use App\Enums\MeasurementCategory;
use App\Enums\MeasurementSource;
use App\Enums\PlanStatus;
use App\Enums\UsageMetric;
use App\Exceptions\PlanAnalysisException;
use App\Models\Plan;
use App\Models\PlanAnalysis;
use App\Models\Project;
use App\Models\ProjectInput;
use App\Models\User;
use App\Services\AuditLogService;
use App\Services\UsageService;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

/**
 * Lets a project reach estimation from the manually-filled technical form
 * alone (spec §7/§16: data doesn't have to come from an uploaded plan). This
 * deliberately does NOT add a second calculation path — it converts the form
 * into the exact same Plan → PlanAnalysis → Measurement shape the AI pipeline
 * produces, so EstimationService/ConcreteRule/RebarRule run completely
 * unchanged regardless of which path fed them.
 *
 * A real (if minimal) text file is written to the private disk as the
 * "plan" — Plan.storage_path is NOT NULL by design (a Plan is always a real
 * document on disk, spec §11) and this keeps that invariant true rather than
 * faking an empty file.
 */
class ManualAnalysisService
{
    public function __construct(
        private readonly UsageService $usage,
        private readonly AuditLogService $auditLog,
    ) {}

    public function createFromInput(Project $project, ProjectInput $input, User $user): PlanAnalysis
    {
        $measurements = $this->deriveWallMeasurements($input);

        if ($measurements === []) {
            throw new PlanAnalysisException(
                'Données insuffisantes pour une estimation manuelle. Renseignez au minimum les dimensions du bâtiment '.
                '(ou la surface approximative) ainsi que la hauteur et l\'épaisseur des murs.'
            );
        }

        $organization = $project->organization;
        $this->usage->ensureCanConsume($organization, UsageMetric::AnalysesRun, actor: $user);

        $analysis = DB::transaction(function () use ($project, $input, $user, $measurements) {
            $content = $this->summarize($input);
            $disk = config('build_estimate.storage_disk');
            $path = "projects/{$project->id}/plans/".Str::uuid()->toString().'.txt';
            Storage::disk($disk)->put($path, $content);

            $plan = Plan::create([
                'project_id' => $project->id,
                'uploaded_by' => $user->id,
                'original_filename' => 'Saisie manuelle.txt',
                'storage_path' => $path,
                'mime_type' => 'text/plain',
                'file_size' => strlen($content),
                'checksum' => hash('sha256', $content),
                'status' => PlanStatus::Analyzed,
            ]);

            $analysis = PlanAnalysis::create([
                'plan_id' => $plan->id,
                'status' => AnalysisStatus::Completed,
                'provider' => 'manual',
                'calculation_version' => config('build_estimate.calculation_version'),
                // Not an AI confidence score — 1.0 signals "directly
                // user-provided", not "certified" (the estimate warning
                // stays regardless, spec §22).
                'confidence_score' => 1.0,
                'started_at' => now(),
                'completed_at' => now(),
                // The user just typed these values themselves — there is no
                // separate "AI guess" to confirm, so this is pre-confirmed.
                'confirmed_by' => $user->id,
                'confirmed_at' => now(),
            ]);

            foreach ($measurements as $measurement) {
                $analysis->measurements()->create($measurement);
            }

            return $analysis;
        });

        $this->usage->increment($organization, UsageMetric::AnalysesRun);
        $this->auditLog->log('analysis.created_manually', $analysis, $user, $organization);

        return $analysis->fresh('measurements');
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function deriveWallMeasurements(ProjectInput $input): array
    {
        $dimensions = $input->dimensions ?? [];
        $walls = $input->walls ?? [];
        $structure = $input->structure ?? [];

        $height = $walls['height'] ?? null;
        $thickness = $walls['thickness'] ?? null;

        if (! $height || ! $thickness) {
            return [];
        }

        $perimeter = null;

        if (! empty($dimensions['building_length']) && ! empty($dimensions['building_width'])) {
            $perimeter = 2 * ($dimensions['building_length'] + $dimensions['building_width']);
        } elseif (! empty($dimensions['approximate_surface'])) {
            // No explicit footprint given — approximate a square footprint
            // from the surface alone. A rough fallback, not physics; the
            // estimate stays labeled non-certified regardless (spec §22).
            $side = sqrt($dimensions['approximate_surface']);
            $perimeter = 4 * $side;
        }

        if (! $perimeter) {
            return [];
        }

        $levels = $structure['levels'] ?? 1;

        return [[
            'category' => MeasurementCategory::Wall,
            'label' => 'Murs extérieurs (saisie manuelle)',
            'length' => round($perimeter * $levels, 2),
            'height' => $height,
            'thickness' => $thickness,
            'unit' => 'm',
            'source' => MeasurementSource::User,
            'confidence' => null,
        ]];
    }

    private function summarize(ProjectInput $input): string
    {
        return "Estimation basée sur une saisie manuelle des informations du projet (aucun plan importé).\n\n".
            json_encode([
                'dimensions' => $input->dimensions,
                'structure' => $input->structure,
                'walls' => $input->walls,
                'foundations' => $input->foundations,
                'openings' => $input->openings,
                'roofing' => $input->roofing,
                'materials' => $input->materials,
            ], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
    }
}

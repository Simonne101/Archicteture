<?php

namespace Tests\Feature\Plans;

use App\Models\Project;
use App\Models\User;
use App\Services\OrganizationService;
use App\Services\ProjectService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class PlanUploadTest extends TestCase
{
    use RefreshDatabase;

    private function makeProject(User $user): Project
    {
        $organization = app(OrganizationService::class)->create(['name' => 'Cabinet A'], $user);

        return app(ProjectService::class)->create(['name' => 'Villa Almadies'], $organization, $user);
    }

    public function test_a_member_can_upload_a_pdf_plan(): void
    {
        Storage::fake(config('build_estimate.storage_disk'));

        $user = User::factory()->create();
        $project = $this->makeProject($user);
        $file = UploadedFile::fake()->create('plan-rdc.pdf', 500, 'application/pdf');

        $response = $this->actingAs($user)->postJson("/api/v1/projects/{$project->id}/plans", [
            'file' => $file,
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.original_filename', 'plan-rdc.pdf')
            ->assertJsonPath('data.status', 'ready');

        $this->assertDatabaseHas('plans', [
            'project_id' => $project->id,
            'original_filename' => 'plan-rdc.pdf',
        ]);

        $plan = $project->plans()->first();
        Storage::disk(config('build_estimate.storage_disk'))->assertExists($plan->storage_path);

        // The internal storage path must never leak through the API.
        $response->assertJsonMissingPath('data.storage_path');
    }

    public function test_uploading_an_unsupported_file_type_is_rejected(): void
    {
        Storage::fake(config('build_estimate.storage_disk'));

        $user = User::factory()->create();
        $project = $this->makeProject($user);
        $file = UploadedFile::fake()->create('malware.exe', 100, 'application/x-msdownload');

        $response = $this->actingAs($user)->postJson("/api/v1/projects/{$project->id}/plans", [
            'file' => $file,
        ]);

        $response->assertStatus(422)->assertJsonPath('success', false);
        $this->assertDatabaseCount('plans', 0);
    }

    public function test_uploading_a_file_over_the_size_limit_is_rejected(): void
    {
        Storage::fake(config('build_estimate.storage_disk'));

        $user = User::factory()->create();
        $project = $this->makeProject($user);
        $tooLargeKb = config('build_estimate.max_upload_size_kb') + 1024;
        $file = UploadedFile::fake()->create('plan-enorme.pdf', $tooLargeKb, 'application/pdf');

        $response = $this->actingAs($user)->postJson("/api/v1/projects/{$project->id}/plans", [
            'file' => $file,
        ]);

        $response->assertStatus(422)->assertJsonPath('success', false);
    }

    public function test_a_guest_cannot_upload_a_plan(): void
    {
        Storage::fake(config('build_estimate.storage_disk'));

        $user = User::factory()->create();
        $project = $this->makeProject($user);
        $file = UploadedFile::fake()->create('plan.pdf', 100, 'application/pdf');

        $this->postJson("/api/v1/projects/{$project->id}/plans", ['file' => $file])
            ->assertStatus(401);
    }

    public function test_a_user_outside_the_project_organization_cannot_upload_a_plan(): void
    {
        Storage::fake(config('build_estimate.storage_disk'));

        $owner = User::factory()->create();
        $project = $this->makeProject($owner);

        $outsider = User::factory()->create();
        $file = UploadedFile::fake()->create('plan.pdf', 100, 'application/pdf');

        $this->actingAs($outsider)
            ->postJson("/api/v1/projects/{$project->id}/plans", ['file' => $file])
            ->assertStatus(403);
    }

    public function test_a_user_outside_the_project_organization_cannot_view_a_plan(): void
    {
        Storage::fake(config('build_estimate.storage_disk'));

        $owner = User::factory()->create();
        $project = $this->makeProject($owner);
        $file = UploadedFile::fake()->create('plan.pdf', 100, 'application/pdf');

        $this->actingAs($owner)->postJson("/api/v1/projects/{$project->id}/plans", ['file' => $file]);
        $plan = $project->plans()->first();

        $outsider = User::factory()->create();

        $this->actingAs($outsider)
            ->getJson("/api/v1/plans/{$plan->id}")
            ->assertStatus(403);
    }
}

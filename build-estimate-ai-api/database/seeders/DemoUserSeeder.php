<?php

namespace Database\Seeders;

use App\Enums\AccountType;
use App\Models\User;
use App\Services\OrganizationService;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

/**
 * The one account that bypasses usage quotas entirely (App\Enums\AccountType
 * ::bypassesUsageLimits() / UsageService), so anyone can run the full
 * upload → analyze → estimate → report workflow repeatedly without hitting
 * "quota reached". Credentials come from .env, not hardcoded, so a public
 * deployment can (and should) override them — see .env.example.
 */
class DemoUserSeeder extends Seeder
{
    public function run(): void
    {
        $email = env('DEMO_USER_EMAIL', 'demo@buildestimate.ai');
        $password = env('DEMO_USER_PASSWORD', 'password');

        $demoUser = User::updateOrCreate(
            ['email' => $email],
            [
                'name' => 'Jean Dupont',
                'password' => Hash::make($password),
                'company_name' => 'Cabinet Architecture Dupont',
                'job_title' => 'Architecte associé',
                'email_verified_at' => now(),
            ]
        );

        // account_type is deliberately not mass-assignable (spec: never
        // trust it from a request) — forceFill is the explicit, trusted
        // exception for internal setup code like this seeder.
        $demoUser->forceFill(['account_type' => AccountType::Demo])->save();

        if (! $demoUser->defaultOrganization()) {
            app(OrganizationService::class)->create(
                ['name' => 'Cabinet Architecture Dupont'],
                $demoUser
            );
        }
    }
}

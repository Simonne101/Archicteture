<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class LogoutTest extends TestCase
{
    use RefreshDatabase;

    public function test_an_authenticated_user_can_log_out(): void
    {
        User::factory()->create([
            'email' => 'jean@example.com',
            'password' => Hash::make('Password123!'),
        ]);

        $this->postJson('/api/v1/auth/login', [
            'email' => 'jean@example.com',
            'password' => 'Password123!',
        ])->assertStatus(200);

        $this->postJson('/api/v1/auth/logout')
            ->assertStatus(200)
            ->assertJsonPath('success', true);

        // The session-backed "web" guard (what Sanctum's stateful auth
        // actually checks against) must no longer report a logged-in user.
        $this->assertFalse(Auth::guard('web')->check());
        $this->assertEmpty(array_filter(
            array_keys(session()->all()),
            fn (string $key) => str_starts_with($key, 'login_web_')
        ));
    }

    public function test_a_guest_cannot_log_out(): void
    {
        $response = $this->postJson('/api/v1/auth/logout');

        $response->assertStatus(401)->assertJsonPath('success', false);
    }
}

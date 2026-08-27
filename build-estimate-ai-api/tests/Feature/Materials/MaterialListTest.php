<?php

namespace Tests\Feature\Materials;

use App\Models\User;
use Database\Seeders\MaterialSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MaterialListTest extends TestCase
{
    use RefreshDatabase;

    public function test_an_authenticated_user_can_list_active_materials(): void
    {
        $this->seed(MaterialSeeder::class);
        $user = User::factory()->create();

        $response = $this->actingAs($user)->getJson('/api/v1/materials');

        $response->assertStatus(200)->assertJsonCount(8, 'data');
        $this->assertContains('ciment', collect($response->json('data'))->pluck('code')->all());
    }

    public function test_a_guest_cannot_list_materials(): void
    {
        $this->getJson('/api/v1/materials')->assertStatus(401);
    }
}

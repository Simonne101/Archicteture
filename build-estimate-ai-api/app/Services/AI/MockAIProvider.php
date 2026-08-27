<?php

namespace App\Services\AI;

use App\DTOs\AIAnalysisResult;
use App\Models\Plan;

/**
 * Simulates a real AI analysis pipeline with realistic, structured fake
 * data — no external API call, no cost, fully deterministic-ish via Faker.
 * Lets the entire upload → analyze → review → estimate → report workflow
 * be exercised in dev/CI without an AI provider (spec §82).
 */
class MockAIProvider implements AIProviderInterface
{
    public function analyzePlan(Plan $plan): AIAnalysisResult
    {
        $rooms = $this->fakeRooms();
        $walls = $this->fakeWalls();
        $openings = $this->fakeOpenings();

        return new AIAnalysisResult(
            dimensions: [
                ['label' => 'Longueur totale', 'value' => 17.4, 'unit' => 'm', 'confidence' => 0.96],
                ['label' => 'Largeur totale', 'value' => 14.0, 'unit' => 'm', 'confidence' => 0.94],
            ],
            rooms: $rooms,
            walls: $walls,
            openings: $openings,
            levels: [
                ['label' => 'Rez-de-chaussée', 'height' => 3.0, 'unit' => 'm', 'confidence' => 0.9],
            ],
            areas: [
                ['label' => 'Surface habitable', 'value' => round(array_sum(array_column($rooms, 'surface')), 2), 'unit' => 'm²', 'confidence' => 0.88],
            ],
            structures: [
                ['label' => 'Fondation', 'type' => 'semelle filante', 'confidence' => 0.7],
            ],
            materialsHints: ['béton armé', 'parpaing', 'toiture tôle'],
            confidenceScore: fake()->randomFloat(2, 0.65, 0.98),
            warnings: fake()->boolean(30) ? ['Certaines cotes du plan sont peu lisibles et nécessitent une vérification manuelle.'] : [],
            raw: ['provider' => 'mock', 'plan_id' => $plan->id, 'generated_at' => now()->toIso8601String()],
        );
    }

    public function name(): string
    {
        return 'mock';
    }

    private function fakeRooms(): array
    {
        $names = ['Salon', 'Cuisine', 'Chambre 1', 'Chambre 2', 'Salle de bain', 'Couloir'];

        return collect($names)->map(fn (string $name) => [
            'label' => $name,
            'surface' => fake()->randomFloat(1, 4, 28),
            'unit' => 'm²',
            'confidence' => fake()->randomFloat(2, 0.75, 0.98),
        ])->all();
    }

    private function fakeWalls(): array
    {
        return collect(range(1, 6))->map(fn (int $i) => [
            'label' => "Mur {$i}",
            'length' => fake()->randomFloat(2, 2, 10),
            'thickness' => fake()->randomElement([0.15, 0.2, 0.25]),
            'height' => 3.0,
            'unit' => 'm',
            'confidence' => fake()->randomFloat(2, 0.7, 0.97),
        ])->all();
    }

    private function fakeOpenings(): array
    {
        $types = ['porte', 'fenêtre', 'baie vitrée'];

        return collect(range(1, 5))->map(fn (int $i) => [
            'label' => ucfirst($types[$i % 3])." {$i}",
            'type' => $types[$i % 3],
            'width' => fake()->randomFloat(2, 0.6, 2.4),
            'height' => fake()->randomFloat(2, 1.0, 2.2),
            'unit' => 'm',
            'confidence' => fake()->randomFloat(2, 0.7, 0.95),
        ])->all();
    }
}

<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Subscription\SubscribeRequest;
use App\Http\Resources\SubscriptionResource;
use App\Models\Organization;
use App\Models\SubscriptionPlan;
use App\Services\SubscriptionService;
use App\Services\UsageService;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;

class SubscriptionController extends Controller
{
    public function __construct(
        private readonly SubscriptionService $subscriptions,
        private readonly UsageService $usage,
    ) {}

    public function show(Organization $organization): JsonResponse
    {
        $this->authorize('view', $organization);

        $subscription = $organization->currentSubscription()?->load('plan');

        return ApiResponse::success([
            'subscription' => $subscription ? new SubscriptionResource($subscription) : null,
            'usage' => $this->usage->summary($organization),
        ]);
    }

    public function store(SubscribeRequest $request, Organization $organization): JsonResponse
    {
        $this->authorize('manageBilling', $organization);

        $plan = SubscriptionPlan::findOrFail($request->validated('subscription_plan_id'));

        [$subscription, $checkoutUrl] = $this->subscriptions->subscribe(
            $organization,
            $plan,
            $request->validated('billing_interval', 'monthly'),
            config('app.frontend_url').'/pricing?checkout=success',
            config('app.frontend_url').'/pricing?checkout=canceled',
        );

        return ApiResponse::success([
            'subscription' => new SubscriptionResource($subscription->load('plan')),
            'checkout_url' => $checkoutUrl,
        ], 'Abonnement mis à jour.', 201);
    }

    public function cancel(Organization $organization): JsonResponse
    {
        $this->authorize('manageBilling', $organization);

        $subscription = $organization->currentSubscription();

        if (! $subscription) {
            return ApiResponse::error("Cette organisation n'a pas d'abonnement actif.", [], 404);
        }

        $subscription = $this->subscriptions->cancel($subscription);

        return ApiResponse::success(new SubscriptionResource($subscription->load('plan')), 'Abonnement résilié à la fin de la période en cours.');
    }
}

<?php

namespace App\Providers;

use App\Models\PlanAnalysis;
use App\Policies\AnalysisPolicy;
use App\Services\AI\AIProviderInterface;
use App\Services\Payment\PaymentProviderInterface;
use Illuminate\Auth\Middleware\Authenticate;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;
use InvalidArgumentException;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->bind(AIProviderInterface::class, function () {
            $name = config('ai.provider');
            $class = config("ai.providers.{$name}");

            if (! $class) {
                throw new InvalidArgumentException("Unknown AI provider [{$name}]. Check AI_PROVIDER and config/ai.php.");
            }

            return $this->app->make($class);
        });

        $this->app->bind(PaymentProviderInterface::class, function () {
            $name = config('payment.provider');
            $class = config("payment.providers.{$name}");

            if (! $class) {
                throw new InvalidArgumentException("Unknown payment provider [{$name}]. Check PAYMENT_PROVIDER and config/payment.php.");
            }

            return $this->app->make($class);
        });
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // PlanAnalysis → AnalysisPolicy: doesn't match Laravel's naming
        // convention (which would look for PlanAnalysisPolicy), but the
        // spec (§35) explicitly names the class AnalysisPolicy — mapped
        // explicitly here instead of renaming away from the spec.
        Gate::policy(PlanAnalysis::class, AnalysisPolicy::class);

        // This is a pure API backend — there is no "login" page to redirect
        // to. Without this, an unauthenticated request that doesn't send
        // Accept: application/json (e.g. a browser navigating straight to a
        // download link) makes Authenticate::redirectTo() call route('login'),
        // which doesn't exist, turning a clean 401 into an unhandled 500.
        Authenticate::redirectUsing(fn () => null);

        // Protects register/login/forgot-password/reset-password against
        // credential-stuffing and enumeration abuse (spec section 40).
        RateLimiter::for('auth', function (Request $request) {
            return Limit::perMinute(10)->by($request->ip());
        });

        // File uploads and AI analysis are the most expensive/abusable
        // endpoints (disk + external API cost) — throttle per user.
        RateLimiter::for('uploads', function (Request $request) {
            return Limit::perMinute(20)->by($request->user()?->id ?: $request->ip());
        });

        RateLimiter::for('analysis', function (Request $request) {
            return Limit::perMinute(10)->by($request->user()?->id ?: $request->ip());
        });

        RateLimiter::for('reports', function (Request $request) {
            return Limit::perMinute(15)->by($request->user()?->id ?: $request->ip());
        });
    }
}

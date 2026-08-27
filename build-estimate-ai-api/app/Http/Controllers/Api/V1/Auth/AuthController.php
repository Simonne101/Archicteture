<?php

namespace App\Http\Controllers\Api\V1\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\ForgotPasswordRequest;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Requests\Auth\ResetPasswordRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use App\Services\OrganizationService;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;

class AuthController extends Controller
{
    public function __construct(private readonly OrganizationService $organizations) {}

    public function register(RegisterRequest $request): JsonResponse
    {
        $user = DB::transaction(function () use ($request) {
            $user = User::create([
                ...$request->safe()->except(['password']),
                'password' => $request->validated('password'),
            ]);

            // A user never manages "organizations" in this product — this
            // personal one exists purely so Project/billing/usage, which are
            // organization-scoped internally, have somewhere to attach.
            $this->organizations->create(['name' => $user->name], $user);

            return $user;
        });

        Auth::login($user);
        $request->session()->regenerate();

        return ApiResponse::success(new UserResource($user), 'Compte créé avec succès.', 201);
    }

    public function login(LoginRequest $request): JsonResponse
    {
        if (! Auth::attempt($request->only('email', 'password'), remember: true)) {
            return ApiResponse::error('Identifiants incorrects.', [
                'email' => ['Ces identifiants ne correspondent à aucun compte.'],
            ], 422);
        }

        $request->session()->regenerate();

        return ApiResponse::success(new UserResource(Auth::user()), 'Connexion réussie.');
    }

    public function logout(Request $request): JsonResponse
    {
        Auth::guard('web')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return ApiResponse::success(null, 'Déconnexion réussie.');
    }

    public function me(Request $request): JsonResponse
    {
        return ApiResponse::success(new UserResource($request->user()));
    }

    public function forgotPassword(ForgotPasswordRequest $request): JsonResponse
    {
        // Response is identical whether or not the email exists, to avoid
        // leaking which addresses have an account.
        Password::sendResetLink($request->only('email'));

        return ApiResponse::success(null, 'Si un compte existe pour cette adresse, un email de réinitialisation a été envoyé.');
    }

    public function resetPassword(ResetPasswordRequest $request): JsonResponse
    {
        $status = Password::reset(
            $request->only('email', 'password', 'password_confirmation', 'token'),
            function (User $user, string $password) {
                $user->forceFill([
                    'password' => Hash::make($password),
                    'remember_token' => Str::random(60),
                ])->save();
            }
        );

        if ($status !== Password::PASSWORD_RESET) {
            return ApiResponse::error('Ce lien de réinitialisation est invalide ou expiré.', [], 422);
        }

        return ApiResponse::success(null, 'Mot de passe réinitialisé avec succès.');
    }
}

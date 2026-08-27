<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use App\Enums\AccountType;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'phone',
        'company_name',
        'job_title',
        'avatar',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * In-memory default for a freshly-built model. The users.account_type
     * column also defaults to "free" at the DB level, but MySQL doesn't
     * hand column defaults back to Eloquent after INSERT — without this,
     * $user->account_type is null (not "free") on the very instance
     * User::create() returns, until the model is reloaded from the
     * database. That would crash the very first read of it (e.g.
     * UserResource right after registration).
     */
    protected $attributes = [
        'account_type' => 'free',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'account_type' => AccountType::class,
        ];
    }

    /**
     * account_type is deliberately absent from $fillable — it must never be
     * settable via mass assignment from a request body (spec §22: the
     * backend reads the real type from the database, never trusts a client-
     * supplied value). It's only ever set directly on the model (seeders,
     * a future admin action).
     */
    public function isDemo(): bool
    {
        return $this->account_type === AccountType::Demo;
    }

    public function isAdmin(): bool
    {
        return $this->account_type === AccountType::Admin;
    }

    /**
     * Organizations this user belongs to (any role).
     */
    public function organizations(): BelongsToMany
    {
        return $this->belongsToMany(Organization::class)
            ->withPivot('role')
            ->withTimestamps();
    }

    /**
     * Organizations this user owns.
     */
    public function ownedOrganizations(): HasMany
    {
        return $this->hasMany(Organization::class, 'owner_id');
    }

    /**
     * The organization used implicitly when the frontend doesn't specify one
     * (spec: the multi-tenant Organization model stays internal — a normal
     * user never sees or picks one). This is the personal organization
     * created automatically at registration, i.e. the first one they joined.
     */
    public function defaultOrganization(): ?Organization
    {
        return $this->organizations()->oldest('organization_user.created_at')->first();
    }
}

<?php

namespace App\Http\Resources;

use App\Models\Organization;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin Organization */
class OrganizationResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'role' => $this->when(
                $request->user() && $this->relationLoaded('users'),
                fn () => $this->roleFor($request->user())?->value
            ),
            'is_owner' => $this->owner_id === $request->user()?->id,
            'created_at' => $this->created_at,
        ];
    }
}

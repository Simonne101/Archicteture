<?php

namespace App\Http\Resources;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin User */
class UserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'phone' => $this->phone,
            'company_name' => $this->company_name,
            'job_title' => $this->job_title,
            'avatar' => $this->avatar,
            'account_type' => $this->account_type->value,
            // The frontend never asks the user to pick an organization — it
            // just needs this id to scope project creation/listing.
            'organization_id' => $this->defaultOrganization()?->id,
            'email_verified_at' => $this->email_verified_at,
            'created_at' => $this->created_at,
        ];
    }
}

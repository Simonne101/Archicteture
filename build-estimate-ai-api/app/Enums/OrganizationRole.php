<?php

namespace App\Enums;

enum OrganizationRole: string
{
    case Owner = 'owner';
    case Admin = 'admin';
    case Member = 'member';
    case Viewer = 'viewer';

    /**
     * Roles allowed to manage organization membership (invite/remove/change roles).
     */
    public function canManageMembers(): bool
    {
        return in_array($this, [self::Owner, self::Admin], true);
    }

    /**
     * Roles allowed to create/edit/delete projects and their content.
     */
    public function canEditContent(): bool
    {
        return in_array($this, [self::Owner, self::Admin, self::Member], true);
    }
}

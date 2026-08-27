<?php

namespace App\Enums;

enum AccountType: string
{
    case Demo = 'demo';
    case Free = 'free';
    case Pro = 'pro';
    case Admin = 'admin';

    /**
     * Accounts that bypass the organization's usage quotas entirely (spec:
     * demo accounts must never see "quota reached" / "upgrade your plan").
     * Admins bypass too — an internal account auditing the product isn't
     * meant to compete with real customers for their org's monthly quota.
     */
    public function bypassesUsageLimits(): bool
    {
        return in_array($this, [self::Demo, self::Admin], true);
    }
}

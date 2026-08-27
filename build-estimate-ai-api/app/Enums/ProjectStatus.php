<?php

namespace App\Enums;

enum ProjectStatus: string
{
    case Draft = 'draft';
    case Processing = 'processing';
    case Review = 'review';
    case Estimated = 'estimated';
    case Completed = 'completed';
    case Failed = 'failed';
    case Archived = 'archived';
}

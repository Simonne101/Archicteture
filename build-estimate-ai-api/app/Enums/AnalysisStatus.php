<?php

namespace App\Enums;

enum AnalysisStatus: string
{
    case Queued = 'queued';
    case Processing = 'processing';
    case Completed = 'completed';
    case NeedsReview = 'needs_review';
    case Failed = 'failed';
}

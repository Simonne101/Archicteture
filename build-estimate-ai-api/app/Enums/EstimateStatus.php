<?php

namespace App\Enums;

enum EstimateStatus: string
{
    case Processing = 'processing';
    case Completed = 'completed';
    case Failed = 'failed';
}

<?php

namespace App\Enums;

enum PlanStatus: string
{
    case Uploaded = 'uploaded';
    case Validating = 'validating';
    case Ready = 'ready';
    case Processing = 'processing';
    case Analyzed = 'analyzed';
    case Failed = 'failed';
}

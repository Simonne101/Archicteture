<?php

namespace App\Enums;

enum MeasurementCategory: string
{
    case Room = 'room';
    case Wall = 'wall';
    case Opening = 'opening';
    case Level = 'level';
    case Area = 'area';
    case Structure = 'structure';
}

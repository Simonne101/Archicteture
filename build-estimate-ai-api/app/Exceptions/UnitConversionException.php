<?php

namespace App\Exceptions;

use RuntimeException;

/**
 * Never thrown to force a guess — the estimate still completes using the
 * physical (base) unit when no commercial conversion is configured. This
 * exists only for the explicit "configure this conversion" admin action
 * (not yet built), kept as a distinct type so it's never confused with
 * EstimationException's "can't calculate at all" meaning.
 */
class UnitConversionException extends RuntimeException {}

<?php

namespace App\Models;

use App\Support\CurrencyRegistry;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Material extends Model
{
    use HasFactory, HasUlids;

    protected $fillable = [
        'code',
        'name',
        'category',
        'unit',
        'density',
        'default_price',
        'currency',
        'metadata',
        'active',
    ];

    protected function casts(): array
    {
        return [
            'density' => 'float',
            'default_price' => 'float',
            'metadata' => 'array',
            'active' => 'boolean',
        ];
    }

    public function prices(): HasMany
    {
        return $this->hasMany(MaterialPrice::class);
    }

    public function unitConversions(): HasMany
    {
        return $this->hasMany(UnitConversion::class);
    }

    /**
     * The price to use for a project in the given country — real per-market
     * pricing, never a single default silently relabeled with whatever
     * currency the project happens to use (spec: no fake conversion).
     *
     * Resolution order: (1) an exact price for this country; (2) if none,
     * any price sharing that country's currency — a defensible fallback
     * given not every country in a shared currency zone (e.g. every XOF
     * country) has its own distinct seeded price yet, never a fallback
     * across DIFFERENT currencies. Both cases pick the most recent row
     * whose validity window covers today (spec §24).
     */
    public function currentPrice(string $countryCode): ?MaterialPrice
    {
        $exact = $this->priceQuery()->where('country_code', $countryCode)->first();

        if ($exact) {
            return $exact;
        }

        $currency = CurrencyRegistry::currencyForCountry($countryCode);

        if (! $currency) {
            return null;
        }

        return $this->priceQuery()->where('currency', $currency)->first();
    }

    private function priceQuery()
    {
        return $this->prices()
            ->where('valid_from', '<=', now())
            ->where(fn ($q) => $q->whereNull('valid_until')->orWhere('valid_until', '>=', now()))
            ->orderByDesc('valid_from');
    }
}

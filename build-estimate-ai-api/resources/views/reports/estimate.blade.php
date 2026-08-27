<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>Rapport d'estimation — {{ $project->name }}</title>
    <style>
        @page { margin: 28px 36px; }
        body { font-family: "Helvetica", sans-serif; font-size: 11px; color: #06132b; }
        .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #08cbbd; padding-bottom: 10px; margin-bottom: 16px; }
        .brand { font-size: 16px; font-weight: bold; color: #031128; }
        .brand span { color: #08cbbd; }
        .meta { text-align: right; font-size: 9px; color: #536078; }
        h2 { font-size: 13px; color: #031128; border-bottom: 1px solid #dce3ec; padding-bottom: 4px; margin-top: 18px; }
        table { width: 100%; border-collapse: collapse; margin-top: 6px; }
        th, td { padding: 5px 6px; text-align: left; font-size: 10px; border-bottom: 1px solid #eef1f5; }
        th { background: #f5f8fa; color: #536078; text-transform: uppercase; font-size: 8.5px; letter-spacing: .4px; }
        td.num, th.num { text-align: right; }
        .info-grid { display: flex; gap: 24px; margin-top: 6px; }
        .info-col { flex: 1; }
        .info-col div { margin-bottom: 3px; }
        .label { color: #708097; }
        .total-row td { font-weight: bold; font-size: 12px; color: #08aaad; border-top: 2px solid #031128; }
        .warning { background: #fff5df; border: 1px solid #f59d05; border-radius: 4px; padding: 8px 10px; margin-top: 14px; font-size: 9.5px; color: #6b4a00; }
        .footer { margin-top: 24px; font-size: 8px; color: #a3aebd; text-align: center; }
    </style>
</head>
<body>
    <div class="header">
        <div class="brand">BUILD ESTIMATE <span>AI</span></div>
        <div class="meta">
            Rapport généré le {{ $generatedAt->format('d/m/Y à H:i') }}<br>
            Version de calcul : {{ $estimate->calculation_version }}
        </div>
    </div>

    <h2>Projet</h2>
    <div class="info-grid">
        <div class="info-col">
            <div><span class="label">Nom :</span> {{ $project->name }}</div>
            <div><span class="label">Type :</span> {{ $project->project_type ?? '—' }}</div>
            <div><span class="label">Localisation :</span> {{ $project->location ?? '—' }}</div>
            <div><span class="label">Pays :</span> {{ \App\Support\CurrencyRegistry::countryName($estimate->country_code) ?? '—' }}</div>
        </div>
        <div class="info-col">
            <div><span class="label">Organisation :</span> {{ $project->organization->name }}</div>
            <div><span class="label">Préparé par :</span> {{ $estimate->creator->name }}</div>
            <div><span class="label">Plan analysé :</span> {{ $plan->original_filename }}</div>
        </div>
    </div>

    <h2>Résumé</h2>
    <table>
        <tr><td>Confiance de l'analyse IA</td><td class="num">{{ $estimate->analysis->confidence_score !== null ? number_format($estimate->analysis->confidence_score * 100, 1).' %' : '—' }}</td></tr>
        <tr><td>Fournisseur IA</td><td class="num">{{ $estimate->ai_provider ?? '—' }}</td></tr>
        <tr><td>Nombre de matériaux estimés</td><td class="num">{{ $estimate->items->count() }}</td></tr>
    </table>

    <h2>Matériaux et quantités</h2>
    <table>
        <thead>
            <tr>
                <th>Matériau</th>
                <th class="num">Quantité</th>
                <th>Unité</th>
                <th>Équivalent local</th>
            </tr>
        </thead>
        <tbody>
            @foreach ($estimate->items as $item)
                <tr>
                    <td>{{ $item->description }}</td>
                    <td class="num">{{ number_format($item->quantity, 2, ',', ' ') }}</td>
                    <td>{{ $item->unit }}</td>
                    <td>
                        @forelse ($equivalents[$item->id] ?? [] as $alt)
                            ≈ {{ number_format($alt['quantity'], 2, ',', ' ') }} {{ $alt['label'] }}{{ ! $alt['verified'] ? ' (indicatif)' : '' }}@if (! $loop->last)<br>@endif
                        @empty
                            —
                        @endforelse
                    </td>
                </tr>
            @endforeach
        </tbody>
    </table>

    <div class="warning">
        ⚠ Cette estimation utilise des ratios par défaut non certifiés par un professionnel du BTP.
        Les quantités doivent être vérifiées et validées avant tout usage réel
        (achat de matériaux, planification de chantier, etc.). Ce rapport présente une estimation
        quantitative des matériaux — il ne constitue pas un devis ni une estimation financière.
    </div>

    <div class="footer">
        Build Estimate AI — Rapport généré automatiquement, à titre indicatif uniquement.
    </div>
</body>
</html>

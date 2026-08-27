<?php

namespace App\Notifications;

use App\Models\PlanAnalysis;
use Illuminate\Notifications\Notification;

class AnalysisCompletedNotification extends Notification
{
    public function __construct(public PlanAnalysis $analysis) {}

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'analysis.completed',
            'plan_analysis_id' => $this->analysis->id,
            'plan_id' => $this->analysis->plan_id,
            'status' => $this->analysis->status->value,
            'confidence_score' => $this->analysis->confidence_score,
            'message' => $this->analysis->status->value === 'needs_review'
                ? "L'analyse du plan est terminée mais nécessite une vérification manuelle."
                : "L'analyse du plan est terminée.",
        ];
    }
}

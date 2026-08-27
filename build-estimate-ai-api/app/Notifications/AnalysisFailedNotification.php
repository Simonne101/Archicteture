<?php

namespace App\Notifications;

use App\Models\PlanAnalysis;
use Illuminate\Notifications\Notification;

class AnalysisFailedNotification extends Notification
{
    public function __construct(public PlanAnalysis $analysis) {}

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'analysis.failed',
            'plan_analysis_id' => $this->analysis->id,
            'plan_id' => $this->analysis->plan_id,
            'error_message' => $this->analysis->error_message,
            'message' => "L'analyse du plan a échoué.",
        ];
    }
}

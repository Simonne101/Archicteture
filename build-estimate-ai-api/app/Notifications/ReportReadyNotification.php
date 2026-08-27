<?php

namespace App\Notifications;

use App\Models\Report;
use Illuminate\Notifications\Notification;

class ReportReadyNotification extends Notification
{
    public function __construct(public Report $report) {}

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'report.ready',
            'report_id' => $this->report->id,
            'estimate_id' => $this->report->estimate_id,
            'message' => 'Le rapport PDF est prêt à être téléchargé.',
        ];
    }
}

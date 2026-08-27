<?php

namespace App\Notifications;

use App\Models\Estimate;
use Illuminate\Notifications\Notification;

class EstimateReadyNotification extends Notification
{
    public function __construct(public Estimate $estimate) {}

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'estimate.ready',
            'estimate_id' => $this->estimate->id,
            'project_id' => $this->estimate->project_id,
            'item_count' => $this->estimate->items()->count(),
            'message' => "L'estimation est prête.",
        ];
    }
}

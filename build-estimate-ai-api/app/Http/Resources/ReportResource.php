<?php

namespace App\Http\Resources;

use App\Enums\ReportStatus;
use App\Models\Report;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin Report */
class ReportResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'estimate_id' => $this->estimate_id,
            'status' => $this->status->value,
            'file_size' => $this->file_size,
            'error_message' => $this->error_message,
            'download_url' => $this->when(
                $this->status === ReportStatus::Completed,
                fn () => route('reports.download', $this->id)
            ),
            'created_at' => $this->created_at,
        ];
    }
}

<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\Attachment;
use App\Models\TransactionEvent;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Symfony\Component\HttpFoundation\StreamedResponse;

class AttachmentController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'transaction_event_id' => 'required|exists:transaction_events,id',
            'file' => 'required|file|max:10240|mimes:pdf,jpg,jpeg,png,gif,webp',
        ]);

        $user = $request->user();
        $transaction = TransactionEvent::where('id', $request->transaction_event_id)
            ->where('user_id', $user->id)
            ->firstOrFail();

        $file = $request->file('file');
        $path = $file->store('attachments/' . $user->id, 'local');
        $hash = hash_file('sha256', $file->getRealPath());

        $attachment = Attachment::create([
            'transaction_event_id' => $transaction->id,
            'file_path' => $path,
            'original_name' => $file->getClientOriginalName(),
            'mime_type' => $file->getMimeType(),
            'file_size' => $file->getSize(),
            'file_hash' => $hash,
        ]);

        return back()->with('success', 'ファイルをアップロードしました');
    }

    public function download(Request $request, Attachment $attachment): BinaryFileResponse|Response
    {
        $user = $request->user();

        // Verify ownership through the transaction
        if ($attachment->transactionEvent->user_id !== $user->id) {
            abort(404);
        }

        $path = Storage::disk('local')->path($attachment->file_path);

        if (!file_exists($path)) {
            abort(404, 'ファイルが見つかりません');
        }

        return response()->download($path, $attachment->original_name);
    }

    public function preview(Request $request, Attachment $attachment): StreamedResponse|Response
    {
        $user = $request->user();

        // Verify ownership through the transaction
        if ($attachment->transactionEvent->user_id !== $user->id) {
            abort(404);
        }

        $path = Storage::disk('local')->path($attachment->file_path);

        if (!file_exists($path)) {
            abort(404, 'ファイルが見つかりません');
        }

        return response()->file($path, [
            'Content-Type' => $attachment->mime_type,
        ]);
    }
}

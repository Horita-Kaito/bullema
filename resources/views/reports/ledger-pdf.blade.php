<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>実包出納帳簿</title>
    <style>
        body {
            font-family: 'Hiragino Kaku Gothic ProN', 'Hiragino Sans', 'Yu Gothic', sans-serif;
            font-size: 12px;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 20px;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 2px solid #333;
        }
        .header h1 {
            margin: 0 0 10px;
            font-size: 24px;
        }
        .header .meta {
            color: #666;
            font-size: 11px;
        }
        .user-info {
            margin-bottom: 20px;
            padding: 15px;
            background: #f5f5f5;
            border-radius: 4px;
        }
        .user-info h2 {
            margin: 0 0 10px;
            font-size: 14px;
        }
        .user-info dl {
            margin: 0;
            display: grid;
            grid-template-columns: 100px 1fr;
            gap: 5px;
        }
        .user-info dt {
            color: #666;
        }
        .user-info dd {
            margin: 0;
            font-weight: bold;
        }
        .balance-summary {
            margin-bottom: 20px;
        }
        .balance-summary h2 {
            font-size: 14px;
            margin: 0 0 10px;
        }
        .balance-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
        }
        .balance-table th,
        .balance-table td {
            padding: 8px 12px;
            text-align: left;
            border: 1px solid #ddd;
        }
        .balance-table th {
            background: #f0f0f0;
            font-weight: bold;
        }
        .balance-table .amount {
            text-align: right;
            font-weight: bold;
        }
        .balance-table .positive {
            color: #16a34a;
        }
        .balance-table .negative {
            color: #dc2626;
        }
        .transactions h2 {
            font-size: 14px;
            margin: 0 0 10px;
        }
        .transaction-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 11px;
        }
        .transaction-table th,
        .transaction-table td {
            padding: 6px 8px;
            text-align: left;
            border: 1px solid #ddd;
        }
        .transaction-table th {
            background: #f0f0f0;
            font-weight: bold;
        }
        .transaction-table .date {
            white-space: nowrap;
        }
        .transaction-table .quantity {
            text-align: right;
            font-weight: bold;
        }
        .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
            text-align: center;
            font-size: 10px;
            color: #666;
        }
        .signature-area {
            margin-top: 40px;
            display: flex;
            justify-content: space-around;
        }
        .signature-box {
            width: 200px;
            text-align: center;
        }
        .signature-box .line {
            border-bottom: 1px solid #333;
            height: 50px;
            margin-bottom: 5px;
        }
        .signature-box .label {
            font-size: 11px;
            color: #666;
        }
        @media print {
            body {
                padding: 0;
            }
            .page-break {
                page-break-before: always;
            }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>実包出納帳簿</h1>
        <p class="meta">
            @if($startDate)
                {{ $startDate }} 〜 {{ $endDate }}
            @else
                〜 {{ $endDate }} まで
            @endif
            ｜ 出力日時: {{ $generatedAt }}
        </p>
    </div>

    <div class="user-info">
        <h2>所持許可者情報</h2>
        <dl>
            <dt>氏名</dt>
            <dd>{{ $user->name }}</dd>
            <dt>メールアドレス</dt>
            <dd>{{ $user->email }}</dd>
        </dl>
    </div>

    <div class="balance-summary">
        <h2>現在残高</h2>
        <table class="balance-table">
            <thead>
                <tr>
                    <th>種別</th>
                    <th>口径</th>
                    <th>メーカー</th>
                    <th class="amount">残高</th>
                </tr>
            </thead>
            <tbody>
                @foreach($balances as $balance)
                <tr>
                    <td>{{ $balance['ammunition_type']->category }}</td>
                    <td>{{ $balance['ammunition_type']->caliber }}</td>
                    <td>{{ $balance['ammunition_type']->manufacturer ?? '-' }}</td>
                    <td class="amount {{ $balance['balance'] > 0 ? 'positive' : ($balance['balance'] < 0 ? 'negative' : '') }}">
                        {{ number_format($balance['balance']) }}発
                    </td>
                </tr>
                @endforeach
            </tbody>
            <tfoot>
                <tr>
                    <th colspan="3">合計</th>
                    <th class="amount">{{ number_format($balances->sum('balance')) }}発</th>
                </tr>
            </tfoot>
        </table>
    </div>

    <div class="transactions">
        <h2>出納記録</h2>
        <table class="transaction-table">
            <thead>
                <tr>
                    <th class="date">日付</th>
                    <th>種別</th>
                    <th>実包</th>
                    <th class="quantity">数量</th>
                    <th>備考</th>
                </tr>
            </thead>
            <tbody>
                @php
                    $eventTypeLabels = [
                        'acquisition' => '譲受',
                        'consumption' => '消費',
                        'transfer' => '譲渡',
                        'disposal' => '廃棄',
                        'custody_out' => '保管委託',
                        'custody_return' => '保管委託返却',
                        'correction' => '訂正',
                    ];
                @endphp
                @forelse($transactions as $transaction)
                <tr>
                    <td class="date">{{ $transaction->event_date }}</td>
                    <td>{{ $eventTypeLabels[$transaction->event_type] ?? $transaction->event_type }}</td>
                    <td>
                        {{ $transaction->ammunitionType?->category ?? '-' }} /
                        {{ $transaction->ammunitionType?->caliber ?? '-' }}
                    </td>
                    <td class="quantity {{ $transaction->quantity > 0 ? 'positive' : 'negative' }}">
                        {{ $transaction->quantity > 0 ? '+' : '' }}{{ number_format($transaction->quantity) }}
                    </td>
                    <td>{{ $transaction->notes ?? '-' }}</td>
                </tr>
                @empty
                <tr>
                    <td colspan="5" style="text-align: center; color: #666;">
                        出納記録がありません
                    </td>
                </tr>
                @endforelse
            </tbody>
        </table>
    </div>

    <div class="signature-area">
        <div class="signature-box">
            <div class="line"></div>
            <div class="label">所持許可者署名</div>
        </div>
        <div class="signature-box">
            <div class="line"></div>
            <div class="label">確認者署名</div>
        </div>
    </div>

    <div class="footer">
        <p>本帳簿はハッシュチェーンにより改ざん防止されています。</p>
        <p>Bullema - 実包管理システム</p>
    </div>
</body>
</html>

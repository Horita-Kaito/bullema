# Laravel開発スキル

## 概要

このスキルはLaravelでの開発タスクを支援します。

## コントローラー作成

Inertia.jsと連携するコントローラーの作成パターン：

```php
<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Http\Requests\StoreExampleRequest;
use App\UseCases\Example\CreateExampleAction;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class ExampleController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Examples/Index', [
            'examples' => Example::paginate(),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Examples/Create');
    }

    public function store(
        StoreExampleRequest $request,
        CreateExampleAction $action,
    ): RedirectResponse {
        $example = $action->execute($request->validated());

        return redirect()
            ->route('examples.show', $example)
            ->with('success', '登録しました');
    }
}
```

## UseCase/Action作成

```php
<?php

declare(strict_types=1);

namespace App\UseCases\Example;

use App\Models\Example;
use Illuminate\Support\Facades\DB;

final class CreateExampleAction
{
    public function __construct(
        private SomeService $service,
    ) {}

    /**
     * @param array{name: string, ...} $data
     */
    public function execute(array $data): Example
    {
        return DB::transaction(function () use ($data) {
            $example = new Example($data);
            $example->save();

            return $example->fresh();
        });
    }
}
```

## FormRequest作成

```php
<?php

declare(strict_types=1);

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreExampleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'name.required' => '名前は必須です',
        ];
    }
}
```

## マイグレーション作成

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('examples', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->restrictOnDelete();
            $table->string('name');
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index('user_id');
            $table->index('is_active');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('examples');
    }
};
```

## テスト作成

```php
<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\User;
use App\Models\Example;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ExampleTest extends TestCase
{
    use RefreshDatabase;

    public function test_can_create_example(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->post('/examples', [
            'name' => 'テスト',
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('examples', [
            'name' => 'テスト',
        ]);
    }
}
```

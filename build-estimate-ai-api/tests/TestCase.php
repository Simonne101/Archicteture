<?php

namespace Tests;

use Illuminate\Foundation\Testing\TestCase as BaseTestCase;

abstract class TestCase extends BaseTestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        // Every API test simulates a request coming from the React SPA so
        // that Sanctum's EnsureFrontendRequestsAreStateful middleware treats
        // it as stateful (session-based) auth, exactly like a real browser
        // request from FRONTEND_URL would.
        $this->withHeader('Referer', config('app.frontend_url', 'http://localhost:5173'));
    }
}

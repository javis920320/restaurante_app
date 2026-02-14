<?php

use App\Http\Controllers\Controller;

test('base controller has authorize method', function () {
    $reflection = new ReflectionClass(Controller::class);
    $methods = array_map(fn($method) => $method->getName(), $reflection->getMethods());
    
    expect($methods)->toContain('authorize');
});

test('base controller uses AuthorizesRequests trait', function () {
    $traits = class_uses(Controller::class);
    
    expect($traits)->toContain('Illuminate\Foundation\Auth\Access\AuthorizesRequests');
});

test('base controller uses ValidatesRequests trait', function () {
    $traits = class_uses(Controller::class);
    
    expect($traits)->toContain('Illuminate\Foundation\Validation\ValidatesRequests');
});

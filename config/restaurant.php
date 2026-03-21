<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Payment Before Preparation
    |--------------------------------------------------------------------------
    |
    | When enabled, kitchen and bar staff cannot move order items to
    | "en_preparacion" until the order has been paid (payment_status = 'paid').
    |
    | Set REQUIRE_PAYMENT_BEFORE_PREPARATION=true in your .env file to enable.
    | Default: true (gastrobar / pay-first model)
    |
    */
    'require_payment_before_preparation' => env('REQUIRE_PAYMENT_BEFORE_PREPARATION', true),
];

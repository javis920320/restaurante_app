<?php

use App\Models\Mesa;
use App\Models\User;
test('register order screen can be rendered', function () {
    $user=User::factory()->create();
    $this->actingAs($user);
    $mesa=Mesa::factory()->create();    
    $response = $this->get('/pedido/'.$mesa->id);

    $response->assertStatus(200);
}); 

?>
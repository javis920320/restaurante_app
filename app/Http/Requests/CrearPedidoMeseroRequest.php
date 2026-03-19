<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CrearPedidoMeseroRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        // Solo usuarios autenticados (meseros, admins)
        return $this->user() !== null;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'mesa_id' => 'required|integer|exists:mesas,id',
            'cliente_id' => 'nullable|integer|exists:clientes,id',
            'items' => 'required|array|min:1',
            'items.*.producto_id' => 'required|integer|exists:platos,id',
            'items.*.cantidad' => 'required|integer|min:1|max:100',
            'items.*.notas' => 'nullable|string|max:500',
            'notas' => 'nullable|string|max:1000',
        ];
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array
     */
    public function messages(): array
    {
        return [
            'mesa_id.required' => 'Debe seleccionar una mesa.',
            'mesa_id.exists' => 'La mesa seleccionada no existe.',
            'items.required' => 'Debe agregar al menos un producto al pedido.',
            'items.min' => 'Debe agregar al menos un producto al pedido.',
            'items.*.producto_id.required' => 'El ID del producto es obligatorio.',
            'items.*.producto_id.exists' => 'El producto seleccionado no existe.',
            'items.*.cantidad.required' => 'La cantidad es obligatoria.',
            'items.*.cantidad.min' => 'La cantidad debe ser al menos 1.',
            'items.*.cantidad.max' => 'La cantidad no puede ser mayor a 100.',
        ];
    }
}

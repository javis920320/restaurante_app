<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class RestauranteRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $restauranteId = $this->route('restaurante') ? $this->route('restaurante')->id : null;

        return [
            'nombre' => [
                'required',
                'string',
                'max:255',
                Rule::unique('restaurantes', 'nombre')->ignore($restauranteId),
            ],
            'direccion' => 'nullable|string|max:500',
            'telefono' => 'nullable|string|max:50',
            'email' => 'nullable|email|max:255',
            'activo' => 'nullable|boolean',
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
            'nombre.required' => 'El nombre del restaurante es obligatorio.',
            'nombre.unique' => 'Ya existe un restaurante con ese nombre.',
            'email.email' => 'El correo electrónico no es válido.',
        ];
    }
}

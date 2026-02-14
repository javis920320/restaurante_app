<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class MesaRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        // La autorización se manejará con Policies
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $mesaId = $this->route('mesa') ? $this->route('mesa')->id : null;

        return [
            'nombre' => [
                'required',
                'string',
                'max:255',
                Rule::unique('mesas', 'nombre')->ignore($mesaId)
            ],
            'capacidad' => 'required|integer|min:1|max:100',
            'restaurante_id' => 'required|integer|exists:restaurantes,id',
            'estado' => [
                'nullable',
                'string',
                Rule::in(['disponible', 'ocupada'])
            ],
            'activa' => 'nullable|boolean',
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
            'nombre.required' => 'El nombre de la mesa es obligatorio.',
            'nombre.unique' => 'Ya existe una mesa con ese nombre.',
            'capacidad.required' => 'La capacidad es obligatoria.',
            'capacidad.min' => 'La capacidad debe ser al menos 1.',
            'capacidad.max' => 'La capacidad no puede ser mayor a 100.',
            'restaurante_id.required' => 'El restaurante es obligatorio.',
            'restaurante_id.exists' => 'El restaurante seleccionado no existe.',
        ];
    }
}

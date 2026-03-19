<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;

class UserRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()->can('gestionar usuarios');
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $userId = $this->route('usuario')?->id;

        $rules = [
            'name'    => ['required', 'string', 'max:255'],
            'email'   => ['required', 'string', 'email', 'max:255', Rule::unique('users', 'email')->ignore($userId)],
            'activo'  => ['boolean'],
            'roles'   => ['array'],
            'roles.*' => ['string', 'exists:roles,name'],
        ];

        if ($this->isMethod('POST')) {
            $rules['password'] = ['required', 'confirmed', Password::defaults()];
        } else {
            $rules['password'] = ['nullable', 'confirmed', Password::defaults()];
        }

        return $rules;
    }
}

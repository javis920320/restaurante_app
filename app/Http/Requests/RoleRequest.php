<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class RoleRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()->can('gestionar roles');
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $roleId = $this->route('role')?->id;

        return [
            'name'          => ['required', 'string', 'max:255', Rule::unique('roles', 'name')->ignore($roleId)],
            'permissions'   => ['array'],
            'permissions.*' => ['string', 'exists:permissions,name'],
        ];
    }
}

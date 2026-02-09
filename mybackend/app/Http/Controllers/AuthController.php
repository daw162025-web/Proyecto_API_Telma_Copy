<?php

namespace App\Http\Controllers;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    /**
     * Login y generación del token JWT
     */
    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);
        if (!$token = Auth::attempt($credentials)) {
            return response()->json([
                'message' => 'Credenciales incorrectas'
            ], 401);
        }
        return response()->json([
            'access_token' => $token,
            'token_type' => 'bearer',
            'expires_in' => Auth::factory()->getTTL() * 60,
            'user' => Auth::user()
        ]);
    }

    /**
     * Registro de usuario
     */
    public function register(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:6',
        ]);
        $data['password'] = Hash::make($data['password']);
        $user = User::create($data);
//        $token = Auth::login($user);
//        return $this->respondWithToken($token);
        return response()->json([
            'message' => 'Usuario registrado correctamente',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
            ],
        ], 201);
    }

    /**
     * Usuario autenticado
     */
    public function me()
    {
        return response()->json(Auth::user());
    }

    /**
     * Logout (invalida el token)
     */
    public function logout()
    {
        Auth::logout();
        return response()->json([
            'message' => 'Sesión cerrada correctamente'
        ]);
    }

    /**
     * Refrescar token
     */
    public function refresh()
    {
        return $this->respondWithToken(Auth::refresh());
    }

    /**
     * Respuesta estándar con token
     */
    protected function respondWithToken($token)
    {
        return response()->json([
            'access_token' => $token,
            'token_type' => 'bearer',
            'expires_in' => Auth::factory()->getTTL() * 60,
//            'user' => Auth::user()
        ]);
    }
}

<?php

namespace App\Http\Controllers;

use App\Models\Petition;
use App\Models\Category;
use App\Models\File;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Exception; // Para los try-catch

class PetitionController extends Controller
{
    /*Metodos auxiliares*/
    private function sendResponse($data, $message, $code = 200) {
        return response()->json([
            'success' => true,
            'data'    => $data,
            'message' => $message
        ], $code);
    }

    private function sendError($error, $errorMessages = [], $code = 404) {
        $response = [
            'success' => false,
            'message' => $error,
        ];
        if (!empty($errorMessages)) {
            $response['errors'] = $errorMessages;
        }
        return response()->json($response, $code);
    }
    /**
     * INDEX: Listar todas las peticiones
     */
    public function index()
    {
        try {
            // Cargamos 'categoria' y 'files' para que el JSON venga completo
            $petitions = Petition::with(['category', 'files', 'user'])->get();
            return $this->sendResponse($petitions, 'Peticiones recuperadas con exito.');
        } catch (Exception $e) {
            return $this->sendError('Error al recuperar las peticiones',[$e->getMessage(), $e->getCode()]);
        }
    }

//    /**
//     * LIST MINE: Listar mis peticiones
//     */
    public function listMine()
    {
        try {
            $user = Auth::user(); // Obtenemos usuario desde el Token JWT
            $petitions = Petition::where('user_id', $user->id)
                ->with(['user','category', 'files'])
                ->get();

            return $this->sendResponse($petitions, 'Tus peticiones recuperadas con exito.');
        } catch (Exception $e) {
            return $this->sendError('Error al recuperar las peticiones',[$e->getMessage(), $e->getCode()]);
        }
    }

    /**
     * SHOW: Ver una petición
     */
    public function show($id)
    {
        try {
            $petition = Petition::with(['category', 'files', 'user'])->findOrFail($id);
            return $this->sendResponse($petition, 'Peticion recuperada con exito.');
        } catch (Exception $e) {
            return $this->sendError('Error al recuperar las peticiones',[$e->getMessage(), $e->getCode()]);
        }
    }

    /**
     * STORE: Crear petición
     */
    public function store(Request $request) {
        // 1. Validamos los campos
        $validator = Validator::make($request->all(), [
            'title'       => 'required|max:255',
            'description' => 'required',
            'destinatary' => 'required',
            'category_id' => 'required|exists:categories,id',
            'file'        => 'required|file|mimes:jpg,jpeg,png,pdf|max:4096',
        ]);

        if ($validator->fails()) {
            return $this->sendError('Error de validación', $validator->errors(), 422);
        }

        try {
            // 2. Guardamos el archivo
            if ($file = $request->file('file')) {
                // Guarda en storage/app/public/peticiones
                $path = $file->store('peticiones', 'public');

                // 3. Creamos la petición
                $petition = new Petition($request->all());
                $petition->image = $path;
                $petition->user_id = Auth::id();
                $petition->signeds = 0;
                $petition->status  = 'pending';
                $petition->save();
                $petition->users()->attach(Auth::id());

                // 4. Guardamos el registro del archivo en la tabla 'files'
                $petition->files()->create([
                    'name'      => $file->getClientOriginalName(),
                    'file_path' => $path
                ]);

                return $this->sendResponse($petition->load('files'), 'Petición creada con éxito', 201);
            }

            return $this->sendError('El archivo es obligatorio', [], 422);

        } catch (Exception $e) {
            return $this->sendError('Error al crear la petición', [$e->getMessage()], 500);
        }
    }

    /**cd myb
     * UPDATE: Actualizar
     */
    public function update(Request $request, $id)
    {
        try {
            $petition = Petition::findOrFail($id);

            if ($request->user()->cannot('update', $petition)) {
                return $this->sendError('No autorizado', [], 403);
            }

            $petition->update($request->only(['title', 'description', 'destinatary', 'category_id']));

            if ($request->hasFile('file')) {
                $file = $request->file('file');
                $cleanName = str_replace(' ', '_', $file->getClientOriginalName());
                $finalName = time() . '_' . $cleanName;

                // Guardamos el archivo físicamente
                $path = $file->storeAs('petitions', $finalName, 'public');

                // Actualizamos también la columna 'image' de la tabla 'petitions'
                $petition->image = $path;
                $petition->save();

                // Actualizamos o creamos el registro en la tabla 'files'
                $fileRecord = $petition->files()->first();

                if ($fileRecord) {
                    $fileRecord->update([
                        'name' => $file->getClientOriginalName(),
                        'file_path' => $path
                    ]);
                } else {
                    $petition->files()->create([
                        'name' => $file->getClientOriginalName(),
                        'file_path' => $path
                    ]);
                }
            }

            return $this->sendResponse($petition->load('files'), 'Petición actualizada con éxito');

        } catch (Exception $e) {
            return $this->sendError('Error al actualizar', [$e->getMessage()], 500);
        }
    }

    /**
     * DESTROY: Borrar
     */
    public function destroy($id)
    {
        try {
            // 1. Buscar la petición
            $petition = \App\Models\Petition::find($id);

            if (!$petition) {
                return response()->json(['message' => 'Petición no encontrada'], 404);
            }

            // 2. Verificar que eres el dueño
            if ($petition->user_id !== \Illuminate\Support\Facades\Auth::id()) {
                return response()->json(['message' => 'No autorizado'], 403);
            }

            // --- ZONA DE LIMPIEZA (El arreglo) ---

            // A. Borrar archivos adjuntos antiguos (Error anterior)
            try {
                \Illuminate\Support\Facades\DB::table('files')->where('petition_id', $id)->delete();
            } catch (\Exception $e) {}

            // B. Borrar las firmas en la tabla intermedia (EL ERROR ACTUAL)
            try {
                \Illuminate\Support\Facades\DB::table('petition_user')->where('petition_id', $id)->delete();
            } catch (\Exception $e) {}

            // -------------------------------------

            // 3. Borrar la imagen del disco
            if ($petition->image) {
                try {
                    if (\Illuminate\Support\Facades\Storage::disk('public')->exists($petition->image)) {
                        \Illuminate\Support\Facades\Storage::disk('public')->delete($petition->image);
                    }
                } catch (\Exception $e) {}
            }

            // 4. Borrar la petición
            $petition->delete();

            return response()->json(['message' => 'Petición eliminada correctamente'], 200);

        } catch (\Throwable $e) {
            // Si sale otro error, te lo chivará aquí
            return response()->json(['message' => 'Error eliminando', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * FIRMAR
     */
    public function sign(Request $request, $id)
    {
        try {
            $petition = Petition::findOrFail($id);
            $user = Auth::user();

            // Comprobar si ya firmó
            $signed = $petition->userSigners()->where('user_id', $user->id)->exists();
            if ($signed) {
                return $this->sendError('Ya has firmado esta peticion', [], 403);
            }

            // Adjuntar firma
            $petition->userSigners()->attach($user->id);

            // Actualizar contador
            $petition->signeds = $petition->signeds + 1;
            $petition->save();

            return $this->sendResponse($petition, 'Petición firmada con éxito', 201);

        } catch (Exception $e) {
            return $this->sendError('No se pudo firmar la petición', [$e->getMessage()], 500);
        }
    }

    /**
     * CAMBIAR ESTADO
     */
    public function changeStatus(Request $request, $id)
    {
        try {
            $petition = Petition::findOrFail($id);
            $petition->status = 'accepted';
            $petition->save();

            return $this->sendResponse('Estado cambiado a accepted con exito', 200);
        } catch (Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }


}

<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Http\Resources\UserResource;

class MeController extends Controller
{
    public function show(Request $request)
    {
        return new UserResource($request->user()->loadMissing(['planners', 'orders']));
    }
}

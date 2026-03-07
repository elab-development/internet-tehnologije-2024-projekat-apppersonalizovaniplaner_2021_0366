<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\Hash;

enum UserRole: string
{


    case ADMIN = 'admin';


    case CUSTOMER = 'customer';


}
class User extends Authenticatable
{
    
    use HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
             'role' => UserRole::class,
        ];
    }
    public function setPasswordAttribute($value): void
    {
        if ($value && !str_starts_with($value, '$2y$')) {
            $this->attributes['password'] = Hash::make($value);
        } else {
            $this->attributes['password'] = $value;
        }
    }
    public function planners(): HasMany
    {
        return $this->hasMany(Planner::class);
    }

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }
}

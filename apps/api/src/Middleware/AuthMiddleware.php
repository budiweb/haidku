<?php
declare(strict_types=1);

namespace HaidKu\Middleware;

class AuthMiddleware
{
    public static function getUserId(): string
    {
        // 1. Cek Header X-User-Id atau X-Guest-Id
        if (!empty($_SERVER['HTTP_X_USER_ID'])) {
            return trim($_SERVER['HTTP_X_USER_ID']);
        }
        if (!empty($_SERVER['HTTP_X_GUEST_ID'])) {
            return trim($_SERVER['HTTP_X_GUEST_ID']);
        }

        // 2. Cek Bearer Token
        $authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
        if (str_starts_with($authHeader, 'Bearer ')) {
            $token = trim(substr($authHeader, 7));
            if ($token !== '') {
                // Sederhana & aman: token dapat berupa user ID terenkripsi atau UUID langsung
                return $token;
            }
        }

        // 3. Fallback guest ID lokal berbasis cookie atau session
        if (!empty($_COOKIE['haidku_user_id'])) {
            return $_COOKIE['haidku_user_id'];
        }

        // Default default guest profile id untuk testing dev
        return 'guest-default-profile';
    }
}


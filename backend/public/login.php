<?php
require_once __DIR__ . '/../src/Database.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);

    $username = $data['username'] ?? null;
    $password = $data['password'] ?? null;

    if ($username && $password) {
        try {
            $pdo = Database::getConnection();
            $stmt = $pdo->prepare('SELECT * FROM usuarios WHERE username = ? AND activo = TRUE');
            $stmt->execute([$username]);
            $user = $stmt->fetch();

            if ($user && password_verify($password, $user['password_hash'])) {
                // Password is correct. Return user data, but remove the hash.
                unset($user['password_hash']);
                echo json_encode($user);
            } else {
                // Invalid username or password
                http_response_code(401);
                echo json_encode(['error' => 'Credenciales incorrectas']);
            }
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
        }
    } else {
        http_response_code(400);
        echo json_encode(['error' => 'Username and password are required']);
    }
} else {
    http_response_code(405);
    echo json_encode(['error' => 'Method Not Allowed']);
}

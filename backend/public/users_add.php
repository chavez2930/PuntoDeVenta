<?php
require_once __DIR__ . '/../src/Database.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);

    $rol_id = $data['rol_id'] ?? null;
    $nombre = $data['nombre'] ?? '';
    $apellido = $data['apellido'] ?? '';
    $email = $data['email'] ?? '';
    $username = $data['username'] ?? '';
    $password = $data['password'] ?? '';

    if ($rol_id && $nombre && $email && $username && $password) {
        try {
            $pdo = Database::getConnection();
            
            $password_hash = password_hash($password, PASSWORD_DEFAULT);

            $stmt = $pdo->prepare(
                'INSERT INTO usuarios (rol_id, nombre, apellido, email, username, password_hash) VALUES (?, ?, ?, ?, ?, ?) RETURNING id, rol_id, nombre, apellido, email, username, activo'
            );
            $stmt->execute([$rol_id, $nombre, $apellido, $email, $username, $password_hash]);
            $newUser = $stmt->fetch();

            echo json_encode($newUser);
        } catch (PDOException $e) {
            http_response_code(500);
            // Check for unique constraint violation
            if ($e->getCode() == 23505) {
                 echo json_encode(['error' => 'Username or email already exists.']);
            } else {
                 echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
            }
        }
    } else {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid input: all fields are required']);
    }
} else {
    http_response_code(405);
    echo json_encode(['error' => 'Method Not Allowed']);
}

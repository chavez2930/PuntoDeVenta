<?php
require_once __DIR__ . '/../src/Database.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $id = $_GET['id'] ?? null;
    $data = json_decode(file_get_contents('php://input'), true);

    if ($id) {
        $rol_id = $data['rol_id'] ?? null;
        $nombre = $data['nombre'] ?? '';
        $apellido = $data['apellido'] ?? '';
        $email = $data['email'] ?? '';
        $username = $data['username'] ?? '';
        $password = $data['password'] ?? '';
        $activo = $data['activo'] ?? true;

        if ($rol_id && $nombre && $email && $username) {
            try {
                $pdo = Database::getConnection();
                
                if (!empty($password)) {
                    $password_hash = password_hash($password, PASSWORD_DEFAULT);
                    $stmt = $pdo->prepare(
                        'UPDATE usuarios SET rol_id = ?, nombre = ?, apellido = ?, email = ?, username = ?, password_hash = ?, activo = ? WHERE id = ? RETURNING id, rol_id, nombre, apellido, email, username, activo'
                    );
                    $stmt->execute([$rol_id, $nombre, $apellido, $email, $username, $password_hash, $activo, $id]);
                } else {
                    // Don't update the password
                    $stmt = $pdo->prepare(
                        'UPDATE usuarios SET rol_id = ?, nombre = ?, apellido = ?, email = ?, username = ?, activo = ? WHERE id = ? RETURNING id, rol_id, nombre, apellido, email, username, activo'
                    );
                    $stmt->execute([$rol_id, $nombre, $apellido, $email, $username, $activo, $id]);
                }
                
                $updatedUser = $stmt->fetch();
                echo json_encode($updatedUser);

            } catch (PDOException $e) {
                http_response_code(500);
                if ($e->getCode() == 23505) {
                     echo json_encode(['error' => 'Username or email already exists.']);
                } else {
                     echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
                }
            }
        } else {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid input: required fields are missing']);
        }
    } else {
        http_response_code(400);
        echo json_encode(['error' => 'User ID not specified']);
    }
} else {
    http_response_code(405);
    echo json_encode(['error' => 'Method Not Allowed']);
}

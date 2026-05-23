<?php
require_once __DIR__ . '/../src/Database.php';

header('Content-Type: application/json');

try {
    $pdo = Database::getConnection();
    $stmt = $pdo->query('SELECT id, rol_id, nombre, apellido, email, username, activo FROM usuarios ORDER BY nombre');
    $users = $stmt->fetchAll();
    echo json_encode($users);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to fetch users']);
}

<?php
require_once __DIR__ . '/../src/Database.php';

header('Content-Type: application/json');

try {
    $pdo = Database::getConnection();
    $stmt = $pdo->query('SELECT * FROM roles ORDER BY id');
    $roles = $stmt->fetchAll();
    echo json_encode($roles);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to fetch roles']);
}
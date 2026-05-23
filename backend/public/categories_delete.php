<?php
require_once __DIR__ . '/../src/Database.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $id = $_GET['id'] ?? null;

    if ($id) {
        try {
            $pdo = Database::getConnection();
            $stmt = $pdo->prepare('UPDATE categorias SET activo = FALSE WHERE id = ?');
            $stmt->execute([$id]);
            
            if ($stmt->rowCount() > 0) {
                http_response_code(204); // No Content
            } else {
                http_response_code(404); // Not Found
                echo json_encode(['error' => 'Category not found']);
            }
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
        }
    } else {
        http_response_code(400);
        echo json_encode(['error' => 'Category ID not specified']);
    }
} else {
    http_response_code(405);
    echo json_encode(['error' => 'Method Not Allowed']);
}

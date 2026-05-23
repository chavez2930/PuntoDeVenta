<?php
require_once __DIR__ . '/../src/Database.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $id = $_GET['id'] ?? null;

    if ($id) {
        // To prevent critical errors, you might want to avoid deleting user ID 1
        if ($id == 1) {
            http_response_code(403);
            echo json_encode(['error' => 'Cannot delete the primary admin user.']);
            exit;
        }

        try {
            $pdo = Database::getConnection();
            $stmt = $pdo->prepare('UPDATE usuarios SET activo = FALSE WHERE id = ?');
            $stmt->execute([$id]);
            
            if ($stmt->rowCount() > 0) {
                http_response_code(204); // No Content
            } else {
                http_response_code(404); // Not Found
                echo json_encode(['error' => 'User not found.']);
            }
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
        }
    } else {
        http_response_code(400);
        echo json_encode(['error' => 'User ID not specified']);
    }
} else {
    http_response_code(405);
    echo json_encode(['error' => 'Method Not Allowed']);
}

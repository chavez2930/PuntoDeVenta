<?php
require_once __DIR__ . '/../src/Database.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $id = $_GET['id'] ?? null;
    $data = json_decode(file_get_contents('php://input'), true);

    if ($id) {
        $nombre = $data['nombre'] ?? '';
        $descripcion = $data['descripcion'] ?? null;

        if (!empty($nombre)) {
            try {
                $pdo = Database::getConnection();
                $stmt = $pdo->prepare(
                    'UPDATE categorias SET nombre = ?, descripcion = ? WHERE id = ? RETURNING *'
                );
                $stmt->execute([$nombre, $descripcion, $id]);
                $updatedCategory = $stmt->fetch();
                echo json_encode($updatedCategory);
            } catch (PDOException $e) {
                http_response_code(500);
                echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
            }
        } else {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid input: name is required']);
        }
    } else {
        http_response_code(400);
        echo json_encode(['error' => 'Category ID not specified']);
    }
} else {
    http_response_code(405);
    echo json_encode(['error' => 'Method Not Allowed']);
}

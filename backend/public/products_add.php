<?php
require_once __DIR__ . '/../src/Database.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);

    $nombre = $data['nombre'] ?? '';
    $precio_venta = $data['precio_venta'] ?? 0;
    $stock = $data['stock'] ?? 0;
    $categoria_id = $data['categoria_id'] ?? null;

    if (!empty($nombre) && $precio_venta > 0 && $categoria_id) {
        try {
            $pdo = Database::getConnection();
            $stmt = $pdo->prepare(
                'INSERT INTO productos (nombre, precio_venta, stock, categoria_id) VALUES (?, ?, ?, ?) RETURNING *'
            );
            $stmt->execute([$nombre, $precio_venta, $stock, $categoria_id]);
            $newProduct = $stmt->fetch();
            echo json_encode($newProduct);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
        }
    } else {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid input']);
    }
} else {
    http_response_code(405);
    echo json_encode(['error' => 'Method Not Allowed']);
}

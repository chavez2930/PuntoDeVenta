<?php
require_once __DIR__ . '/../src/Database.php';

header('Content-Type: application/json');

try {
    $pdo = Database::getConnection();
    $stmt = $pdo->query('SELECT * FROM vista_ventas_diarias ORDER BY fecha DESC');
    $sales_summary = $stmt->fetchAll();
    echo json_encode($sales_summary);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to fetch sales summary']);
}

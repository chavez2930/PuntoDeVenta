<?php
require_once __DIR__ . '/../src/Database.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);

    $userId = $data['user_id'] ?? 1; // Default to user 1 for now
    $items = $data['cart'] ?? [];
    $payments = $data['payments'] ?? [];
    $discount = $data['discount'] ?? 0;

    if (!empty($items) && !empty($payments)) {
        try {
            $pdo = Database::getConnection();
            
            // The database function `procesar_venta` expects a specific JSON format
            $db_items = [];
            foreach ($items as $item) {
                $db_items[] = [
                    'producto_id' => $item['producto_id'],
                    'cantidad' => $item['cantidad'],
                    'descuento' => $item['descuento'] ?? 0,
                ];
            }

            $stmt = $pdo->prepare("SELECT procesar_venta(p_usuario_id := ?, p_items := ?, p_pagos := ?, p_descuento := ?)");
            $stmt->execute([$userId, json_encode($db_items), json_encode($payments), $discount]);
            $saleId = $stmt->fetchColumn();

            if ($saleId) {
                // If the sale was successful, you might want to return the new sale details
                // For now, we'll just return the ID
                echo json_encode(['success' => true, 'sale_id' => $saleId]);
            } else {
                throw new Exception("Failed to process sale.");
            }

        } catch (Exception $e) {
            http_response_code(500);
            // The exception message from the database function is often very informative
            echo json_encode(['error' => 'Sale processing failed: ' . $e->getMessage()]);
        }
    } else {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid input: cart and payments are required']);
    }
} else {
    http_response_code(405);
    echo json_encode(['error' => 'Method Not Allowed']);
}

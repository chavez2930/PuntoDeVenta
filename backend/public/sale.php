<?php

require_once __DIR__ . '/../src/Database.php';

$pageTitle = 'Nueva Venta';
$pdo = Database::getConnection();

$stmt = $pdo->query('SELECT id, nombre, precio_venta FROM productos WHERE activo = TRUE AND stock > 0 ORDER BY nombre');
$products_list = $stmt->fetchAll();
$products_by_id = [];
foreach ($products_list as $product) {
    $products_by_id[$product['id']] = $product;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $items = [];
    if (isset($_POST['products'])) {
        foreach ($_POST['products'] as $productId => $data) {
            if (isset($products_by_id[$productId]) && !empty($data['quantity']) && $data['quantity'] > 0) {
                $items[] = [
                    'producto_id' => (int)$productId,
                    'cantidad'    => (int)$data['quantity'],
                ];
            }
        }
    }

    if (!empty($items)) {
        try {
            // En una aplicación real, estos valores serían dinámicos (sesión de usuario, selección de método de pago)
            $userId = 1; // Asumimos que el usuario con ID 1 existe
            $paymentMethodId = 1; // Asumimos que el método de pago es 'Efectivo'

            $total_pagado = 0;
            foreach ($items as $item) {
                $precio = $products_by_id[$item['producto_id']]['precio_venta'];
                $total_pagado += $precio * $item['cantidad'];
            }

            $pagos = [[
                'metodo_pago_id' => $paymentMethodId,
                'monto'          => $total_pagado,
                'referencia'     => null
            ]];

            $stmt = $pdo->prepare("SELECT procesar_venta(p_usuario_id := ?, p_items := ?, p_pagos := ?)");
            $stmt->execute([$userId, json_encode($items), json_encode($pagos)]);
            $saleId = $stmt->fetchColumn();

            $message = "Venta completada con éxito. ID de la venta: " . $saleId;

        } catch (PDOException $e) {
            $error = "Error al procesar la venta: " . $e->getMessage();
        }
    } else {
        $error = "Por favor, selecciona al menos un producto.";
    }
}

$products = $products_list;
$content = __DIR__ . '/../views/sale_form.php';
include __DIR__ . '/../views/layout.php';

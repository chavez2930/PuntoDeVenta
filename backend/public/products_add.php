<?php
require_once __DIR__ . '/../src/Database.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);

    $nombre         = $data['nombre'] ?? '';
    $categoria_id   = $data['categoria_id'] ?? null;
    $codigo_barras  = $data['codigo_barras'] ?? null;
    $sku            = $data['sku'] ?? null;
    $descripcion    = $data['descripcion'] ?? null;
    $precio_compra  = $data['precio_compra'] ?? 0;
    $precio_venta   = $data['precio_venta'] ?? 0;
    $stock          = $data['stock'] ?? 0;
    $stock_minimo   = $data['stock_minimo'] ?? 0;
    $unidad_medida  = $data['unidad_medida'] ?? 'pza';
    $peso_variable  = $data['peso_variable'] ?? false;
    $activo         = $data['activo'] ?? true;

    if (!empty($nombre) && $precio_venta > 0 && $categoria_id) {
        try {
            $pdo = Database::getConnection();
            $stmt = $pdo->prepare(
                'INSERT INTO productos
                    (nombre, categoria_id, codigo_barras, sku, descripcion, precio_compra, precio_venta, stock, stock_minimo, unidad_medida, peso_variable, activo)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                 RETURNING *'
            );
            $stmt->execute([
                $nombre,
                $categoria_id,
                $codigo_barras,
                $sku,
                $descripcion,
                $precio_compra,
                $precio_venta,
                $stock,
                $stock_minimo,
                $unidad_medida,
                $peso_variable ? 'true' : 'false',
                $activo ? 'true' : 'false'
            ]);
            $newProduct = $stmt->fetch();
            echo json_encode($newProduct);
        } catch (PDOException $e) {
            http_response_code(500);
            // Violación de unicidad (ej. SKU o código de barras repetido)
            if ($e->getCode() == 23505) {
                echo json_encode(['error' => 'El SKU o código de barras ya existe.']);
            } else {
                echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
            }
        }
    } else {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid input: nombre, precio_venta y categoria_id son obligatorios']);
    }
} else {
    http_response_code(405);
    echo json_encode(['error' => 'Method Not Allowed']);
}
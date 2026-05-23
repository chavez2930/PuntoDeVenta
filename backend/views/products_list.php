<h1>Lista de Productos</h1>

<?php if (empty($products)): ?>
    <p>No se encontraron productos.</p>
<?php else: ?>
    <table border="1" style="width:100%; border-collapse: collapse;">
        <thead>
            <tr>
                <th>Nombre</th>
                <th>Precio</th>
                <th>Stock</th>
                <th>Categoría</th>
                <th>Estado</th>
            </tr>
        </thead>
        <tbody>
            <?php foreach ($products as $product): ?>
                <tr style="<?= ($product['bajo_minimo']) ? 'background-color: #ffcccc;' : '' ?>">
                    <td><?= htmlspecialchars($product['nombre']) ?></td>
                    <td>$<?= number_format($product['precio_venta'], 2) ?></td>
                    <td><?= htmlspecialchars($product['stock_actual']) ?></td>
                    <td><?= htmlspecialchars($product['categoria']) ?></td>
                    <td><?= ($product['bajo_minimo']) ? 'Bajo Mínimo' : 'OK' ?></td>
                </tr>
            <?php endforeach; ?>
        </tbody>
    </table>
<?php endif; ?>

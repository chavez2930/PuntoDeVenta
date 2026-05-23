<h1>New Sale</h1>

<?php if (isset($message)): ?>
    <p style="color: green;"><?= $message ?></p>
<?php endif; ?>
<?php if (isset($error)): ?>
    <p style="color: red;"><?= $error ?></p>
<?php endif; ?>

<form method="POST" action="sale.php">
    <table border="1" style="width:100%; border-collapse: collapse;">
        <thead>
            <tr>
                <th>Producto</th>
                <th>Precio</th>
                <th>Cantidad</th>
            </tr>
        </thead>
        <tbody>
            <?php foreach ($products as $product): ?>
                <tr>
                    <td><?= htmlspecialchars($product['nombre']) ?></td>
                    <td>$<?= number_format($product['precio_venta'], 2) ?></td>
                    <td>
                        <input type="number" name="products[<?= $product['id'] ?>][quantity]" min="0" style="width: 60px;">
                    </td>
                </tr>
            <?php endforeach; ?>
        </tbody>
    </table>
    <br>
    <button type="submit">Terminar Venta</button>
</form>

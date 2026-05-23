<h1>Completed Sales</h1>

<?php if (empty($sales)): ?>
    <p>No hay ventas completadas.</p>
<?php else: ?>
    <table border="1" style="width:100%; border-collapse: collapse;">
        <thead>
            <tr>
                <th>ID</th>
                <th>Folio</th>
                <th>Total</th>
                <th>Fecha</th>
                <th>Usuario</th>
            </tr>
        </thead>
        <tbody>
            <?php foreach ($sales as $sale): ?>
                <tr>
                    <td><?= $sale['id'] ?></td>
                    <td><?= htmlspecialchars($sale['folio']) ?></td>
                    <td>$<?= number_format($sale['total'], 2) ?></td>
                    <td><?= $sale['creado_en'] ?></td>
                    <td><?= htmlspecialchars($sale['usuario_nombre']) ?></td>
                </tr>
            <?php endforeach; ?>
        </tbody>
    </table>
<?php endif; ?>

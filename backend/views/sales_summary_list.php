<h1>Reporte de Ventas Diarias</h1>

<?php if (empty($sales_summary)): ?>
    <p>No se encontraron ventas.</p>
<?php else: ?>
    <table border="1" style="width:100%; border-collapse: collapse;">
        <thead>
            <tr>
                <th>Fecha</th>
                <th>Nº de Ventas</th>
                <th>Ingresos Totales</th>
                <th>Ticket Promedio</th>
                <th>Ventas Canceladas</th>
            </tr>
        </thead>
        <tbody>
            <?php foreach ($sales_summary as $summary): ?>
                <tr>
                    <td><?= htmlspecialchars($summary['fecha']) ?></td>
                    <td><?= $summary['num_ventas'] ?></td>
                    <td>$<?= number_format($summary['total_ingresos'], 2) ?></td>
                    <td>$<?= number_format($summary['ticket_promedio'], 2) ?></td>
                    <td><?= $summary['ventas_canceladas'] ?></td>
                </tr>
            <?php endforeach; ?>
        </tbody>
    </table>
<?php endif; ?>

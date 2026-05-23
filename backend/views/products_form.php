<h1>Add New Product</h1>

<?php if (isset($error)): ?>
    <p style="color: red;"><?= $error ?></p>
<?php endif; ?>

<form method="POST" action="products_add.php">
    <label for="nombre">Nombre del producto:</label><br>
    <input type="text" id="nombre" name="nombre" required><br><br>

    <label for="precio_venta">Precio:</label><br>
    <input type="number" id="precio_venta" name="precio_venta" step="0.01" min="0" required><br><br>

    <label for="stock">Stock:</label><br>
    <input type="number" id="stock" name="stock" min="0" value="0"><br><br>

    <label for="categoria_id">Categoría:</label><br>
    <select id="categoria_id" name="categoria_id" required>
        <option value="">Seleccionar una categoría</option>
        <?php foreach ($categories as $category): ?>
            <option value="<?= $category['id'] ?>"><?= htmlspecialchars($category['nombre']) ?></option>
        <?php endforeach; ?>
    </select><br><br>

    <button type="submit">Añadir Producto</button>
</form>

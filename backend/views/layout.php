<!DOCTYPE html>
<html>
<head>
    <title>Punto de Venta</title>
    <style>
        body { font-family: sans-serif; }
        nav { background-color: #f2f2f2; padding: 10px; margin-bottom: 20px; }
        nav a { margin-right: 15px; text-decoration: none; color: #333; }
        nav a:hover { text-decoration: underline; }
    </style>
</head>
<body>
    <nav>
        <a href="index.php?page=home">Inicio</a>
        <a href="index.php?page=products">Productos</a>
        <a href="index.php?page=products_add">Añadir un Producto</a>
        <a href="index.php?page=sale">Venta Nueva</a>
        <a href="index.php?page=sales_view">Ver Todas las Ventas</a>
    </nav>

    <?php
    if (isset($content) && file_exists($content)) {
        include $content;
    } else {
        echo "<h1>Page not found</h1>";
    }
    ?>
</body>
</html>

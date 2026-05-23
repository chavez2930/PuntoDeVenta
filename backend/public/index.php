<?php

require_once __DIR__ . '/../src/Database.php';

$page = $_GET['page'] ?? 'home';

switch ($page) {
    case 'products':
        require 'products.php';
        break;
    case 'products_add':
        require 'products_add.php';
        break;
    case 'sale':
        require 'sale.php';
        break;
    case 'sales_view':
        require 'sales_view.php';
        break;
    default:
        $content = __DIR__ . '/../views/home.php';
        include __DIR__ . '/../views/layout.php';
        break;
}

<?php
require_once __DIR__ . '/src/Database.php';

// This is a CLI script, not a web page
if (php_sapi_name() !== 'cli') {
    die("This script can only be run from the command line.");
}

$users = [
    [ 'id' => 1, 'nombre' => 'Carlos Mendoza', 'apellido' => 'M', 'email' => 'admin@pos.com', 'username' => 'admin', 'password' => 'admin123', 'rol_id' => 1, 'activo' => true ],
    [ 'id' => 2, 'nombre' => 'María García', 'apellido' => 'G', 'email' => 'cajero@pos.com', 'username' => 'cajero', 'password' => 'cajero123', 'rol_id' => 2, 'activo' => true ],
    [ 'id' => 3, 'nombre' => 'Roberto Sánchez', 'apellido' => 'S', 'email' => 'supervisor@pos.com', 'username' => 'supervisor', 'password' => 'super123', 'rol_id' => 3, 'activo' => true ]
];

try {
    $pdo = Database::getConnection();
    $pdo->beginTransaction();

    $stmt = $pdo->prepare(
        'INSERT INTO usuarios (id, rol_id, nombre, apellido, email, username, password_hash, activo) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT (id) DO NOTHING' // Or DO UPDATE if you want to overwrite
    );

    foreach ($users as $user) {
        $password_hash = password_hash($user['password'], PASSWORD_DEFAULT);
        $stmt->execute([
            $user['id'],
            $user['rol_id'],
            $user['nombre'],
            $user['apellido'],
            $user['email'],
            $user['username'],
            $password_hash,
            $user['activo']
        ]);
        echo "Processed user: " . $user['username'] . "\n";
    }

    $pdo->commit();
    echo "\nUser seeding completed successfully!\n";

} catch (Exception $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    die("An error occurred: " . $e->getMessage() . "\n");
}

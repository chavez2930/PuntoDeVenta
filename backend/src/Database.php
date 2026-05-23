<?php

class Database
{
    private static $pdo;

    public static function getConnection()
    {
        if (self::$pdo === null) {
            $config = require __DIR__ . '/../config/database.php';
            $dsn = "pgsql:host={$config['host']};port={$config['port']};dbname={$config['dbname']}";
            try {
                self::$pdo = new PDO($dsn, $config['user'], $config['password'], [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::ATTR_EMULATE_PREPARES => false,
                ]);
            } catch (PDOException $e) {
                // Se debe almacenar este log
                die('Conexión fallida: ' . $e->getMessage());
            }
        }
        return self::$pdo;
    }
}

-- ============================================================
--  SISTEMA POS EMPRESARIAL - PostgreSQL
--  Base de datos: pos_sistema
--  Versión: 1.0
--
--  INSTRUCCIONES:
--  1. Conéctate a la base "postgres"
--  2. Ejecuta solo el bloque CREATE DATABASE
--  3. Conéctate a "pos_sistema"
--  4. Ejecuta el resto del script
-- ============================================================


-- ============================================================
--  PASO 1: CREAR BASE DE DATOS
--  (ejecutar conectado a "postgres")
-- ============================================================
-- CREATE DATABASE pos_sistema
--     WITH ENCODING = 'UTF8'
--     TEMPLATE = template0;
--
-- \c pos_sistema


-- ============================================================
--  PASO 2: EJECUTAR TODO LO SIGUIENTE EN "pos_sistema"
-- ============================================================

-- ------------------------------------------------------------
--  EXTENSIONES
-- ------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";


-- ============================================================
--  SECCIÓN 1: TABLAS
-- ============================================================

CREATE TABLE roles (
    id          SERIAL          PRIMARY KEY,
    nombre      VARCHAR(50)     NOT NULL UNIQUE,
    descripcion TEXT,
    activo      BOOLEAN         NOT NULL DEFAULT TRUE,
    creado_en   TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE TABLE usuarios (
    id              SERIAL          PRIMARY KEY,
    rol_id          INT             NOT NULL REFERENCES roles(id),
    nombre          VARCHAR(100)    NOT NULL,
    apellido        VARCHAR(100)    NOT NULL,
    email           VARCHAR(150)    NOT NULL UNIQUE,
    username        VARCHAR(60)     NOT NULL UNIQUE,
    password_hash   TEXT            NOT NULL,
    activo          BOOLEAN         NOT NULL DEFAULT TRUE,
    ultimo_acceso   TIMESTAMPTZ,
    creado_en       TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    actualizado_en  TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE TABLE categorias (
    id              SERIAL          PRIMARY KEY,
    nombre          VARCHAR(100)    NOT NULL UNIQUE,
    descripcion     TEXT,
    activo          BOOLEAN         NOT NULL DEFAULT TRUE,
    creado_en       TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE TABLE productos (
    id              SERIAL          PRIMARY KEY,
    categoria_id    INT             REFERENCES categorias(id),
    codigo_barras   VARCHAR(60)     UNIQUE,
    sku             VARCHAR(60)     UNIQUE,
    nombre          VARCHAR(200)    NOT NULL,
    descripcion     TEXT,
    precio_compra   NUMERIC(12,2)   NOT NULL DEFAULT 0  CHECK (precio_compra  >= 0),
    precio_venta    NUMERIC(12,2)   NOT NULL             CHECK (precio_venta   >= 0),
    impuesto_pct    NUMERIC(5,2)    NOT NULL DEFAULT 0  CHECK (impuesto_pct   BETWEEN 0 AND 100),
    stock           NUMERIC(12,3)   NOT NULL DEFAULT 0  CHECK (stock          >= 0),
    stock_minimo    NUMERIC(12,3)   NOT NULL DEFAULT 0  CHECK (stock_minimo   >= 0),
    unidad_medida   VARCHAR(20)     NOT NULL DEFAULT 'pieza',
    peso_variable   BOOLEAN         NOT NULL DEFAULT FALSE,
    activo          BOOLEAN         NOT NULL DEFAULT TRUE,
    creado_en       TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    actualizado_en  TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE TABLE metodos_pago (
    id          SERIAL          PRIMARY KEY,
    nombre      VARCHAR(80)     NOT NULL UNIQUE,
    tipo        VARCHAR(30)     NOT NULL
                    CHECK (tipo IN ('efectivo','electronico','credito','vale','otro')),
    activo      BOOLEAN         NOT NULL DEFAULT TRUE,
    creado_en   TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE TABLE ventas (
    id          BIGSERIAL       PRIMARY KEY,
    folio       VARCHAR(30)     NOT NULL UNIQUE,
    usuario_id  INT             NOT NULL REFERENCES usuarios(id),
    subtotal    NUMERIC(14,2)   NOT NULL DEFAULT 0  CHECK (subtotal  >= 0),
    descuento   NUMERIC(14,2)   NOT NULL DEFAULT 0  CHECK (descuento >= 0),
    impuestos   NUMERIC(14,2)   NOT NULL DEFAULT 0  CHECK (impuestos >= 0),
    total       NUMERIC(14,2)   NOT NULL DEFAULT 0  CHECK (total     >= 0),
    estado      VARCHAR(20)     NOT NULL DEFAULT 'completada'
                    CHECK (estado IN ('completada','cancelada','devuelta')),
    notas       TEXT,
    terminal_id VARCHAR(50),
    creado_en   TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE TABLE detalle_venta (
    id              BIGSERIAL       PRIMARY KEY,
    venta_id        BIGINT          NOT NULL REFERENCES ventas(id) ON DELETE CASCADE,
    producto_id     INT             NOT NULL REFERENCES productos(id),
    cantidad        NUMERIC(12,3)   NOT NULL CHECK (cantidad > 0),
    precio_unitario NUMERIC(12,2)   NOT NULL CHECK (precio_unitario >= 0),
    impuesto_pct    NUMERIC(5,2)    NOT NULL DEFAULT 0,
    descuento       NUMERIC(12,2)   NOT NULL DEFAULT 0 CHECK (descuento >= 0),
    subtotal        NUMERIC(14,2)   NOT NULL CHECK (subtotal >= 0)
);

CREATE TABLE ventas_pagos (
    id              BIGSERIAL       PRIMARY KEY,
    venta_id        BIGINT          NOT NULL REFERENCES ventas(id) ON DELETE CASCADE,
    metodo_pago_id  INT             NOT NULL REFERENCES metodos_pago(id),
    monto           NUMERIC(14,2)   NOT NULL CHECK (monto > 0),
    referencia      VARCHAR(100),
    creado_en       TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE TABLE movimientos_inventario (
    id              BIGSERIAL       PRIMARY KEY,
    producto_id     INT             NOT NULL REFERENCES productos(id),
    usuario_id      INT             NOT NULL REFERENCES usuarios(id),
    tipo            VARCHAR(30)     NOT NULL
                        CHECK (tipo IN ('entrada','salida_venta','ajuste','devolucion','merma')),
    cantidad        NUMERIC(12,3)   NOT NULL,
    stock_anterior  NUMERIC(12,3)   NOT NULL,
    stock_nuevo     NUMERIC(12,3)   NOT NULL,
    referencia_id   BIGINT,
    notas           TEXT,
    creado_en       TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE TABLE auditoria_logs (
    id               BIGSERIAL   PRIMARY KEY,
    tabla_nombre     VARCHAR(100) NOT NULL,
    operacion        VARCHAR(10)  NOT NULL CHECK (operacion IN ('INSERT','UPDATE','DELETE')),
    registro_id      TEXT         NOT NULL,
    datos_anteriores JSONB,
    datos_nuevos     JSONB,
    usuario_db       TEXT         NOT NULL DEFAULT current_user,
    usuario_app_id   INT          REFERENCES usuarios(id),
    ip_origen        INET,
    creado_en        TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);


-- ============================================================
--  SECCIÓN 2: ÍNDICES
-- ============================================================

CREATE INDEX idx_ventas_fecha         ON ventas (creado_en DESC);
CREATE INDEX idx_ventas_usuario       ON ventas (usuario_id);
CREATE INDEX idx_ventas_estado        ON ventas (estado);
CREATE INDEX idx_ventas_folio         ON ventas (folio);

CREATE INDEX idx_productos_barcode    ON productos (codigo_barras) WHERE codigo_barras IS NOT NULL;
CREATE INDEX idx_productos_sku        ON productos (sku)           WHERE sku IS NOT NULL;
CREATE INDEX idx_productos_categoria  ON productos (categoria_id);
CREATE INDEX idx_productos_activo     ON productos (activo);

CREATE INDEX idx_detalle_venta_id     ON detalle_venta (venta_id);
CREATE INDEX idx_detalle_producto_id  ON detalle_venta (producto_id);

CREATE INDEX idx_movinv_producto      ON movimientos_inventario (producto_id);
CREATE INDEX idx_movinv_fecha         ON movimientos_inventario (creado_en DESC);

CREATE INDEX idx_auditoria_tabla      ON auditoria_logs (tabla_nombre, creado_en DESC);
CREATE INDEX idx_auditoria_operacion  ON auditoria_logs (operacion);


-- ============================================================
--  SECCIÓN 3: FUNCIONES
-- ============================================================

CREATE OR REPLACE FUNCTION validar_stock(p_items JSONB)
RETURNS TABLE (
    producto_id  INT,
    nombre       TEXT,
    stock_actual NUMERIC,
    requerido    NUMERIC,
    ok           BOOLEAN
)
LANGUAGE plpgsql STABLE AS $$
BEGIN
    RETURN QUERY
    SELECT
        p.id,
        p.nombre,
        p.stock,
        (item->>'cantidad')::NUMERIC,
        p.stock >= (item->>'cantidad')::NUMERIC
    FROM jsonb_array_elements(p_items) AS item
    JOIN productos p ON p.id = (item->>'producto_id')::INT
    WHERE p.activo = TRUE;
END;
$$;


CREATE OR REPLACE FUNCTION generar_folio()
RETURNS TEXT
LANGUAGE plpgsql AS $$
DECLARE
    v_fecha     TEXT   := TO_CHAR(NOW(), 'YYYYMMDD');
    v_secuencia BIGINT;
BEGIN
    SELECT COALESCE(MAX(CAST(SPLIT_PART(folio, '-', 3) AS BIGINT)), 0) + 1
    INTO   v_secuencia
    FROM   ventas
    WHERE  folio LIKE 'POS-' || v_fecha || '-%';

    RETURN 'POS-' || v_fecha || '-' || LPAD(v_secuencia::TEXT, 5, '0');
END;
$$;


CREATE OR REPLACE FUNCTION procesar_venta(
    p_usuario_id  INT,
    p_items       JSONB,
    p_pagos       JSONB,
    p_descuento   NUMERIC  DEFAULT 0,
    p_notas       TEXT     DEFAULT NULL,
    p_terminal_id VARCHAR  DEFAULT NULL
)
RETURNS BIGINT
LANGUAGE plpgsql AS $$
DECLARE
    v_venta_id      BIGINT;
    v_folio         TEXT;
    v_subtotal      NUMERIC(14,2) := 0;
    v_impuestos     NUMERIC(14,2) := 0;
    v_total         NUMERIC(14,2) := 0;
    v_total_pagado  NUMERIC(14,2) := 0;
    v_item          JSONB;
    v_pago          JSONB;
    v_prod_id       INT;
    v_cantidad      NUMERIC(12,3);
    v_desc_item     NUMERIC(12,2);
    v_precio        NUMERIC(12,2);
    v_imp_pct       NUMERIC(5,2);
    v_subtotal_item NUMERIC(14,2);
    v_stock_actual  NUMERIC(12,3);
BEGIN
    -- 1. Validar stock
    IF EXISTS (SELECT 1 FROM validar_stock(p_items) WHERE ok = FALSE) THEN
        RAISE EXCEPTION 'Stock insuficiente para uno o más productos.';
    END IF;

    -- 2. Calcular totales
    FOR v_item IN SELECT * FROM jsonb_array_elements(p_items) LOOP
        SELECT precio_venta, impuesto_pct
        INTO   v_precio, v_imp_pct
        FROM   productos
        WHERE  id = (v_item->>'producto_id')::INT;

        v_cantidad      := (v_item->>'cantidad')::NUMERIC;
        v_desc_item     := COALESCE((v_item->>'descuento')::NUMERIC, 0);
        v_subtotal_item := ROUND((v_precio * v_cantidad) - v_desc_item, 2);
        v_subtotal      := v_subtotal  + v_subtotal_item;
        v_impuestos     := v_impuestos + ROUND(v_subtotal_item * v_imp_pct / 100, 2);
    END LOOP;

    v_total := ROUND(v_subtotal + v_impuestos - p_descuento, 2);

    -- 3. Validar pago suficiente
    SELECT COALESCE(SUM((pago->>'monto')::NUMERIC), 0)
    INTO   v_total_pagado
    FROM   jsonb_array_elements(p_pagos) AS pago;

    IF v_total_pagado < v_total THEN
        RAISE EXCEPTION 'Pago insuficiente. Total: %, Pagado: %', v_total, v_total_pagado;
    END IF;

    -- 4. Insertar venta
    v_folio := generar_folio();
    INSERT INTO ventas (folio, usuario_id, subtotal, descuento, impuestos, total, notas, terminal_id)
    VALUES (v_folio, p_usuario_id, v_subtotal, p_descuento, v_impuestos, v_total, p_notas, p_terminal_id)
    RETURNING id INTO v_venta_id;

    -- 5. Insertar detalle y descontar inventario
    FOR v_item IN SELECT * FROM jsonb_array_elements(p_items) LOOP
        v_prod_id   := (v_item->>'producto_id')::INT;
        v_cantidad  := (v_item->>'cantidad')::NUMERIC;
        v_desc_item := COALESCE((v_item->>'descuento')::NUMERIC, 0);

        SELECT precio_venta, impuesto_pct, stock
        INTO   v_precio, v_imp_pct, v_stock_actual
        FROM   productos WHERE id = v_prod_id
        FOR UPDATE;

        v_subtotal_item := ROUND((v_precio * v_cantidad) - v_desc_item, 2);

        INSERT INTO detalle_venta
            (venta_id, producto_id, cantidad, precio_unitario, impuesto_pct, descuento, subtotal)
        VALUES
            (v_venta_id, v_prod_id, v_cantidad, v_precio, v_imp_pct, v_desc_item, v_subtotal_item);

        UPDATE productos
        SET stock = stock - v_cantidad, actualizado_en = NOW()
        WHERE id = v_prod_id;

        INSERT INTO movimientos_inventario
            (producto_id, usuario_id, tipo, cantidad, stock_anterior, stock_nuevo, referencia_id)
        VALUES
            (v_prod_id, p_usuario_id, 'salida_venta', -v_cantidad,
             v_stock_actual, v_stock_actual - v_cantidad, v_venta_id);
    END LOOP;

    -- 6. Insertar pagos
    FOR v_pago IN SELECT * FROM jsonb_array_elements(p_pagos) LOOP
        INSERT INTO ventas_pagos (venta_id, metodo_pago_id, monto, referencia)
        VALUES (
            v_venta_id,
            (v_pago->>'metodo_pago_id')::INT,
            (v_pago->>'monto')::NUMERIC,
            v_pago->>'referencia'
        );
    END LOOP;

    RETURN v_venta_id;
END;
$$;


-- ============================================================
--  SECCIÓN 4: TRIGGERS
-- ============================================================

CREATE OR REPLACE FUNCTION trg_check_stock_negativo()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    IF NEW.stock < 0 THEN
        RAISE EXCEPTION 'Stock negativo no permitido. Producto id=%, stock resultante: %',
            NEW.id, NEW.stock;
    END IF;
    RETURN NEW;
END;
$$;

CREATE TRIGGER check_stock_negativo
BEFORE UPDATE OF stock ON productos
FOR EACH ROW EXECUTE FUNCTION trg_check_stock_negativo();


CREATE OR REPLACE FUNCTION trg_update_timestamp()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    NEW.actualizado_en := NOW();
    RETURN NEW;
END;
$$;

CREATE TRIGGER update_timestamp_productos
BEFORE UPDATE ON productos
FOR EACH ROW EXECUTE FUNCTION trg_update_timestamp();

CREATE TRIGGER update_timestamp_usuarios
BEFORE UPDATE ON usuarios
FOR EACH ROW EXECUTE FUNCTION trg_update_timestamp();


CREATE OR REPLACE FUNCTION trg_auditoria_generica()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
    v_registro_id TEXT;
    v_anterior    JSONB := NULL;
    v_nuevo       JSONB := NULL;
BEGIN
    IF TG_OP = 'DELETE' THEN
        v_registro_id := OLD.id::TEXT;
        v_anterior    := to_jsonb(OLD);
    ELSIF TG_OP = 'INSERT' THEN
        v_registro_id := NEW.id::TEXT;
        v_nuevo       := to_jsonb(NEW);
    ELSE
        v_registro_id := NEW.id::TEXT;
        v_anterior    := to_jsonb(OLD);
        v_nuevo       := to_jsonb(NEW);
    END IF;

    INSERT INTO auditoria_logs (tabla_nombre, operacion, registro_id, datos_anteriores, datos_nuevos)
    VALUES (TG_TABLE_NAME, TG_OP, v_registro_id, v_anterior, v_nuevo);

    IF TG_OP = 'DELETE' THEN RETURN OLD; END IF;
    RETURN NEW;
END;
$$;

CREATE TRIGGER audit_ventas
AFTER INSERT OR UPDATE OR DELETE ON ventas
FOR EACH ROW EXECUTE FUNCTION trg_auditoria_generica();

CREATE TRIGGER audit_productos
AFTER INSERT OR UPDATE OR DELETE ON productos
FOR EACH ROW EXECUTE FUNCTION trg_auditoria_generica();

CREATE TRIGGER audit_usuarios
AFTER INSERT OR UPDATE OR DELETE ON usuarios
FOR EACH ROW EXECUTE FUNCTION trg_auditoria_generica();

CREATE TRIGGER audit_movimientos_inventario
AFTER INSERT OR UPDATE OR DELETE ON movimientos_inventario
FOR EACH ROW EXECUTE FUNCTION trg_auditoria_generica();


-- ============================================================
--  SECCIÓN 5: VISTAS
-- ============================================================

CREATE OR REPLACE VIEW vista_ventas_diarias AS
SELECT
    DATE(v.creado_en)                                       AS fecha,
    COUNT(v.id)                                             AS num_ventas,
    SUM(v.subtotal)                                         AS subtotal_total,
    SUM(v.descuento)                                        AS descuentos_total,
    SUM(v.impuestos)                                        AS impuestos_total,
    SUM(v.total)                                            AS total_ingresos,
    AVG(v.total)                                            AS ticket_promedio,
    COUNT(v.id) FILTER (WHERE v.estado = 'cancelada')       AS ventas_canceladas
FROM ventas v
WHERE v.estado IN ('completada','cancelada')
GROUP BY DATE(v.creado_en)
ORDER BY fecha DESC;


CREATE OR REPLACE VIEW vista_productos_mas_vendidos AS
SELECT
    p.id,
    p.codigo_barras,
    p.nombre                            AS producto,
    c.nombre                            AS categoria,
    SUM(d.cantidad)                     AS unidades_vendidas,
    SUM(d.subtotal)                     AS ingresos_totales,
    COUNT(DISTINCT d.venta_id)          AS num_transacciones
FROM detalle_venta d
JOIN ventas      v ON v.id = d.venta_id    AND v.estado = 'completada'
JOIN productos   p ON p.id = d.producto_id
LEFT JOIN categorias c ON c.id = p.categoria_id
GROUP BY p.id, p.codigo_barras, p.nombre, c.nombre
ORDER BY unidades_vendidas DESC;


CREATE OR REPLACE VIEW vista_stock_actual AS
SELECT
    p.id,
    p.codigo_barras,
    p.sku,
    p.nombre,
    c.nombre                            AS categoria,
    p.stock                             AS stock_actual,
    p.stock_minimo,
    p.unidad_medida,
    p.precio_venta,
    (p.stock <= p.stock_minimo)         AS bajo_minimo,
    p.activo
FROM productos p
LEFT JOIN categorias c ON c.id = p.categoria_id
ORDER BY p.nombre;


CREATE OR REPLACE VIEW vista_corte_caja AS
SELECT
    DATE(v.creado_en)                   AS fecha,
    mp.nombre                           AS metodo_pago,
    mp.tipo,
    COUNT(DISTINCT v.id)                AS num_ventas,
    SUM(vp.monto)                       AS monto_total
FROM ventas_pagos vp
JOIN ventas       v  ON v.id  = vp.venta_id  AND v.estado = 'completada'
JOIN metodos_pago mp ON mp.id = vp.metodo_pago_id
WHERE DATE(v.creado_en) = CURRENT_DATE
GROUP BY DATE(v.creado_en), mp.nombre, mp.tipo
ORDER BY monto_total DESC;


-- ============================================================
--  SECCIÓN 6: SEGURIDAD
-- ============================================================

DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'pos_admin') THEN
        CREATE ROLE pos_admin LOGIN PASSWORD 'Admin#POS2024!';
    END IF;
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'pos_cajero') THEN
        CREATE ROLE pos_cajero LOGIN PASSWORD 'Cajero#POS2024!';
    END IF;
END
$$;

GRANT ALL PRIVILEGES ON ALL TABLES    IN SCHEMA public TO pos_admin;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO pos_admin;
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO pos_admin;

GRANT SELECT ON productos, categorias, metodos_pago, roles TO pos_cajero;
GRANT SELECT, INSERT ON ventas, detalle_venta, ventas_pagos, movimientos_inventario TO pos_cajero;
GRANT USAGE, SELECT ON SEQUENCE ventas_id_seq                 TO pos_cajero;
GRANT USAGE, SELECT ON SEQUENCE detalle_venta_id_seq          TO pos_cajero;
GRANT USAGE, SELECT ON SEQUENCE ventas_pagos_id_seq           TO pos_cajero;
GRANT USAGE, SELECT ON SEQUENCE movimientos_inventario_id_seq TO pos_cajero;
GRANT EXECUTE ON FUNCTION procesar_venta(INT,JSONB,JSONB,NUMERIC,TEXT,VARCHAR) TO pos_cajero;
GRANT EXECUTE ON FUNCTION validar_stock(JSONB) TO pos_cajero;
GRANT SELECT ON vista_ventas_diarias, vista_corte_caja,
               vista_stock_actual, vista_productos_mas_vendidos TO pos_cajero;


-- ============================================================
--  SECCIÓN 7: DATOS INICIALES (seed)
-- ============================================================

INSERT INTO roles (nombre, descripcion) VALUES
    ('Administrador', 'Acceso total al sistema'),
    ('Cajero',        'Operación de caja y ventas'),
    ('Supervisor',    'Supervisión de operaciones y reportes')
ON CONFLICT (nombre) DO NOTHING;

INSERT INTO categorias (nombre) VALUES
    ('General'),
    ('Alimentos'),
    ('Bebidas'),
    ('Limpieza'),
    ('Electrónica')
ON CONFLICT (nombre) DO NOTHING;

INSERT INTO metodos_pago (nombre, tipo) VALUES
    ('Efectivo',        'efectivo'),
    ('Tarjeta débito',  'electronico'),
    ('Tarjeta crédito', 'credito'),
    ('Transferencia',   'electronico'),
    ('Vale despensa',   'vale')
ON CONFLICT (nombre) DO NOTHING;


-- ============================================================
--  VERIFICACIÓN FINAL
-- ============================================================
SELECT tablename AS tablas_creadas
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- Verificar funciones
SELECT routine_name AS funciones
FROM information_schema.routines
WHERE routine_schema = 'public'
ORDER BY routine_name;

-- Verificar triggers
SELECT trigger_name, event_object_table AS tabla, event_manipulation AS evento
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY event_object_table;

-- Verificar vistas
SELECT viewname AS vistas
FROM pg_views
WHERE schemaname = 'public'
ORDER BY viewname;

-- Verificar índices
SELECT indexname AS indice, tablename AS tabla
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename;

-- Verificar roles
SELECT rolname AS rol, rolcanlogin AS puede_conectarse
FROM pg_roles
WHERE rolname IN ('pos_admin', 'pos_cajero');

-- Verificar todas las foreign keys y relaciones
SELECT
    tc.table_name        AS tabla,
    kcu.column_name      AS columna,
    ccu.table_name       AS tabla_referenciada,
    ccu.column_name      AS columna_referenciada,
    tc.constraint_name   AS nombre_constraint
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema   = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema   = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema    = 'public'
ORDER BY tc.table_name;
-- ============================================================
--  FIN DEL SCRIPT
-- ============================================================
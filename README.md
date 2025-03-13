# Proyecto Base de datos. Restaurante Han-Burguesa
***
**FUNCIONALIDADES FALTANTES**
- Chequeo de QR
- Funcionalidades de todos los botones
***
## **NOTAS**
- *FAVOR DE NO ELIMINAR O CAMBIAR EL ARCHIVO DB.JS*
***
Comandos SQL ara creación de tablas:

- TABLA USUARIOSNOM:
````    
CREATE TABLE UsuariosNom (
  id_usuario INT AUTO_INCREMENT PRIMARY KEY, 
  nombre_usuario VARCHAR(32) NOT NULL, 
  contrasenia VARCHAR(32) NOT NULL,
  h_entrada TIME NOT NULL, 
  h_salida TIME NOT NULL
);
````
- TABLA USUARIOSROL:
````
CREATE TABLE UsuariosRol (
  id_usuario INT, 
  rol CHAR(5) NOT NULL,
  CONSTRAINT fk_idusuario FOREIGN KEY (id_usuario) REFERENCES UsuariosNom(id_usuario)
);
````
- TABLA INSUMOS:
````
CREATE TABLE Insumos (
  id_insumo INT AUTO_INCREMENT PRIMARY KEY,
  nombre_insumo VARCHAR(10) UNIQUE,
  unidad_medida CHAR(2) NOT NULL
);
````
- TABLA VENCINSUMOS:
````
CREATE TABLE VencInsumos (
  id_insumo INT NOT NULL,
  caducidad DATE NOT NULL,
  cantidad INT NOT NULL,
  PRIMARY KEY (id_insumo, caducidad), 
  CONSTRAINT fk_idinsumo FOREIGN KEY (id_insumo) REFERENCES Insumos(id_insumo)
);
````
- TABLA ALIMENTOS:
````
CREATE TABLE Alimentos (
    id_alimento VARCHAR(12) PRIMARY KEY, 
    nombre_alimento VARCHAR(10) NOT NULL, 
    precio NUMERIC(8,2) NOT NULL
);
````
- TABLA PEDIDODETALLES:
````
CREATE TABLE PedidoDetalles (
    id_pedido VARCHAR(12) PRIMARY KEY,
    fecha_pedido TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    hora_pedido TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);
````
- TABLA PEDIDOS:
````
CREATE TABLE Pedidos (
    id_pedido VARCHAR(12),
    id_alimento VARCHAR(12), 
    cantidad_alimento NUMERIC(5) NOT NULL, 
    total_pedido NUMERIC(8,2) NOT NULL,
    direccion VARCHAR(72) NOT NULL,
    nombre_cliente VARCHAR(24) NOT NULL,
    CONSTRAINT fk_idpedido FOREIGN KEY (id_pedido) REFERENCES PedidoDetalles(id_pedido),
    CONSTRAINT fk_idalimento FOREIGN KEY (id_alimento) REFERENCES Alimentos(id_alimento)
);
````
- TABLA REGISTROHORARIO:
````
CREATE TABLE RegistroHorario (
  id_registro INT AUTO_INCREMENT PRIMARY KEY, 
  id_usuario INT, 
  entrada TIMESTAMP NOT NULL, 
  salida TIMESTAMP, 
  CONSTRAINT fk_idusuario_registro FOREIGN KEY (id_usuario) REFERENCES UsuariosNom(id_usuario)
);
````
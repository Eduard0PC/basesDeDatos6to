import { router } from './auth'
//EN ESTE ARCHIVO SE MANEJARAN LAS CONSULTAS GENERALES NO RELACIONADAS CON LA SESION
//SE PONE EN SERVER PARA PREVENIR ALGÚN INTENTO DE INYECCIÓN SQL

//ver todos los empleados con rol
router.post('/see-empleados', ()=>{
    const connection = getConnection();
    connection.query(`
        SELECT u.nombre_usuario, u.contrasenia, r.rol
        FROM UsuariosNom u, UsuariosRol r
        WHERE u.id_usuario=r.id_usuario`
    , error, results);
});

import Router from "express";
import { actualizarPaciente, detallePaciente, eliminarPaciente, listarPacientes, loginPaciente, perfilPaciente, registrarPaciente } from "../controllers/paciente_controller.js";
import { verificarAutenticacion } from "../helpers/crearJWT.js";

const router = Router()

    //Rutas como paciente
//Ruta para registro
router.post('/paciente/registro',verificarAutenticacion,registrarPaciente)
//Ruta para listar pacientes
router.get('/pacientes',verificarAutenticacion,listarPacientes)
//Ruta detalle del paciente
router.get('/paciente/:id',verificarAutenticacion,detallePaciente)
//Ruta para actualizar paciente
router.put('/paciente/actualizar/:id',verificarAutenticacion,actualizarPaciente)
//Ruta eliminar paciente
router.delete('/paciente/eliminar/:id',verificarAutenticacion,eliminarPaciente)

    //Rutas para el dueño
//Ruta login dueño
router.post('/paciente/login',loginPaciente)
//Ruta visualizar el perfil
router.get('/paciente/perfil',verificarAutenticacion,perfilPaciente)

export default router
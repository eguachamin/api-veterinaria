import { sendMailToPaciente } from "../config/nodemailer.js"
import Paciente from "../models/Paciente.js"

const listarPacientes = async (req,res)=>{
    //Paso 1: toma de Datos
    //Paso 2: Validación de Datos
    //Paso 3: Interacción de BDD
    const pacientes = await Paciente.find({estado:true}).where('veterinario').equals(req.veterinarioBDD).select("-salida -createdAt -updatedAt -__v").populate('veterinario',"nombre")
    res.status(200).json(pacientes)

}
const detallePaciente = async(req,res)=>{
    res.send("Detalle del paciente")
}
const registrarPaciente = async(req,res)=>{
    //Paso 1: toma de Datos
    const {email}=req.body
    //Paso 2: Validación de Datos
        //Llenar todos los campos
    if (Object.values(req.body).includes(""))return res.status(400).json({msg:"Lo sentimos, debes llenar todos los campos"})
        //email no repetido
    const verificarEmailBDD = await Paciente.findOne({email})
    if(verificarEmailBDD) return res.status(400).json({msg:"Lo sentimos, el email ya se encuentra registrado"})
    //Paso 3: Interacción de BDD
    const nuevoPaciente = new Paciente(req.body)
        //generar numro random variable password
    const password = Math.random().toString(36).slice(2)
        //usuario en el campo password encrtar password vet al inicio con el anterior
    nuevoPaciente.password= await nuevoPaciente.encrypPassword("vet"+password)
        //envia el email y la contraseña de acceso
    await sendMailToPaciente(email,"vet"+password)
    nuevoPaciente.veterinario=req.veterinarioBDD._id
    await nuevoPaciente.save()
    res.status(200).json({msg:"Registro exitoso del paciente, registro enviado al mail"})
}
const actualizarPaciente = (req,res)=>{
    res.send("Actualizar paciente")
}
const eliminarPaciente = (req,res)=>{
    res.send("Eliminar paciente")
}

const loginPaciente = (req,res)=>{
    res.send("Dueño: Login del paciente")
}
const perfilPaciente = (req,res)=>{
    res.send("Dueño: Perfil del paciente")
}

export {
	loginPaciente,
	perfilPaciente,
    listarPacientes,
    detallePaciente,
    registrarPaciente,
    actualizarPaciente,
    eliminarPaciente
}
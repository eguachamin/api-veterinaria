import mongoose from 'mongoose'
import { sendMailToUser,sendMailToRecoveryPassword } from '../config/nodemailer.js'
import {generarJWT} from '../helpers/crearJWT.js'
import Veterinario from '../models/veterinario.js'


const registro = async (req,res)=>{
    //Paso 1: Tomar Datos del request
    const {email,password} = req.body
    
    //Paso2: validar Datos
            //values manda al metodo includes y verifica si ningun dato esta vacio 
            //todos los valores del objeto y mira si esta vacio y manda el mensaje 
    if (Object.values(req.body).includes(""))return res.status(404).json({msg:"Lo sentimos debe llenar todos los campos"})
    
    const verificarEmailBDD = await Veterinario.findOne({email}) //find one encontrar registro en base al email
    if (verificarEmailBDD)return res.status(400).json({msg:"Lo sentimos el email ya se encuentra registrado"})
     
    //Paso 3 : Interactuar con BDD
    const nuevoVeterinario = new Veterinario(req.body)
    nuevoVeterinario.password= await nuevoVeterinario.ecrypPassword(password)
    const token=nuevoVeterinario.crearToken()
    sendMailToUser(email,token)
    await nuevoVeterinario.save()
    res.status(200).json({msg:"Revisa tu correo lectrónico para confirmar tu cuenta "})
    
}

const confirmEmail = async (req, res) => {
  // Tomar datos del request
    const {token}=req.params
  //Validar datos
    if(!(token)) return res.status(400).json({msg:"Lo sentimos no se puede validar la cuenta"})
    const veterinarioBDD= await Veterinario.findOne({token}) //comprobacion si hay un token 
    if(!veterinarioBDD?.token) return res.status(400).json({msg:"La cuenta ya ha sido confirmada"})
  //Interactuar BDD
    veterinarioBDD.token = null
    veterinarioBDD.confirmEmail=true
    await veterinarioBDD.save()

    res.status(200).json({msg:"Token confirmado, ya puedes iniciar sesión"})
}

const login = async (req, res) => {
    //Tomar datos
    const {email,password}=req.body
        //validar datos de campos vacios
    if (Object.values(req.body).includes(""))return res.status(400).json({msg:"Lo sentimos debe llenar todos los campos"})
        //Validamos por variables
        //comprobacion si hay un token 
    const veterinarioBDD= await Veterinario.findOne({email}) //primero debemos ver que sea único
    //?se utiliza ese signo para que pueda leer el confirmemail
    if((veterinarioBDD?.confirmEmail===false)) return res.status(400).json({msg:"Lo sentimos debes validar tu cuenta"})
        //comprobacion de los datos ingresados en la base de datos 
    if((!veterinarioBDD)) return res.status(404).json({msg:"Lo sentimos el email no se encuentra registrado"})
    const verificarPassword = await veterinarioBDD.matchPassword(password)
    if(!verificarPassword)return res.status(400).json({msg:"Lo sentimos el password no es correcto"})
    
    
    const {nombre,apellido,direccion,telefono,_id}= veterinarioBDD
    const tokenJWT = generarJWT(veterinarioBDD._id,"Veterinario")    
    //res.status(200).json(veterinarioBDD,tokenJWT)
    res.status(200).json({
        nombre,
        apellido,
        direccion,
        telefono,
        _id,
        tokenJWT
    })
}

const recuperarPassword = async (req,res) => {
  //Paso 1: Tomar datos del request
  const {email}=req.body
  //Paso 2:Validaciones
  //campos llenos
  if (Object.values(req.body).includes(""))return res.status(404).json({msg:"Lo sentimos debe llenar todos los campos"})
    //correo registrado
  const veterinarioBDD= await Veterinario.findOne({email}) //si hay correo
  if((!veterinarioBDD)) return res.status(404).json({msg:"Lo sentimos el email no se encuentra registrado"})
  //Paso 3: Interaccion con la base de datos 
    const token =veterinarioBDD.crearToken()
    veterinarioBDD.token=token
    await sendMailToRecoveryPassword(email,token)
    await veterinarioBDD.save()
    //envia la respuesta como conclusion par a los pasos 
  res.status(200).json({msg:"Revisa tu correo para restablecer tu contraseña"})
}
const comprobarTokenPassword = async (req,res) => {
    //Paso 1:
    const {token}=req.params
    //Paso 2:
    //token exista
    if(!(token)) return res.status(400).json({msg:"Lo sentimos no se puede validar la cuenta"})
    const veterinarioBDD= await Veterinario.findOne({token}) //comprobacion si hay un token 
    //compruebe el token 
    if (veterinarioBDD.token !== token) res.status(404).json({msg:"Lo sentimos, no se puede validar la cuenta"})
    //Paso 3:
    await veterinarioBDD.save()

    res.status(200).json({msg:"Token confirmado, ya puedes crear tu nuevo password"})
}
const nuevoPassword = async (req,res) => {
    //Paso 1:
    const {password, confirmpassword} =req.body
    //Paso 2:
    //campos llenos
    if (Object.values(req.body).includes(""))return res.status(400).json({msg:"Lo sentimos debe llenar todos los campos"})
        //password inguales
    if(password != confirmpassword) return res.status(400).json({msg:"Lo sentimos los password no coinciden"})
    const veterinarioBDD= await Veterinario.findOne({token:req.params.token})
    if (veterinarioBDD.token != req.params.token) res.status(404).json({msg:"Lo sentimos, no se puede validar la cuenta"}) //token al capturar debe ser el misno que la base de datos
    //Paso 3:
    veterinarioBDD.token = null
    veterinarioBDD.password = await veterinarioBDD.ecrypPassword(password)
    await veterinarioBDD.save()

    res.status(200).json({msg:"Felicitaciones, ya puedes iniciar sesión con tu nuevo password"})
}

const perfilUsuario = async (req,res) => {
    delete req.veterinarioBDD.token
    delete req.veterinarioBDD.confirmEmail
    delete req.veterinarioBDD.createdAt
    delete req.veterinarioBDD.updatedAt
    delete req.veterinarioBDD.__v
    res.status(200).json(req.veterinarioBDD)

}

const actualizarPerfil = async (req,res) => {
    const {id} = req.params
    if( !mongoose.Types.ObjectId.isValid(id) ) return res.status(404).json({msg:`Lo sentimos, debe ser un id válido`});
    if (Object.values(req.body).includes("")) return res.status(400).json({msg:"Lo sentimos, debes llenar todos los campos"})
    const veterinarioBDD = await Veterinario.findById(id)
    if(!veterinarioBDD) return res.status(404).json({msg:`Lo sentimos, no existe el veterinario ${id}`})
    if (veterinarioBDD.email !=  req.body.email)
    {
        const veterinarioBDDMail = await Veterinario.findOne({email:req.body.email})
        if (veterinarioBDDMail)
        {
            return res.status(404).json({msg:`Lo sentimos, el existe ya se encuentra registrado`})  
        }
    }
	  veterinarioBDD.nombre = req.body.nombre || veterinarioBDD?.nombre
    veterinarioBDD.apellido = req.body.apellido  || veterinarioBDD?.apellido
    veterinarioBDD.direccion = req.body.direccion ||  veterinarioBDD?.direccion
    veterinarioBDD.telefono = req.body.telefono || veterinarioBDD?.telefono
    veterinarioBDD.email = req.body.email || veterinarioBDD?.email
    await veterinarioBDD.save()
    res.status(200).json({msg:"Perfil actualizado correctamente"})
  }
const cambiarPassword = async (req,res) => {
    const veterinarioBDD = await Veterinario.findById(req.veterinarioBDD._id)
    if(!veterinarioBDD) return res.status(404).json({msg:`Lo sentimos, no existe el veterinario ${id}`})
    const verificarPassword = await veterinarioBDD.matchPassword(req.body.passwordactual)
    if(!verificarPassword) return res.status(404).json({msg:"Lo sentimos, el password actual no es el correcto"})
    veterinarioBDD.password = await veterinarioBDD.ecrypPassword(req.body.passwordnuevo)
    await veterinarioBDD.save()
    res.status(200).json({msg:"Password actualizado correctamente"})
  }


export{
    registro,
    confirmEmail,
    login,
    recuperarPassword,
    comprobarTokenPassword,
    nuevoPassword,
    perfilUsuario,
    actualizarPerfil,
    cambiarPassword
}
import {Schema,model,mongoose} from "mongoose";
import bcrypt from "bcryptjs"
//Schema
const pacienteSchema = new Schema({
    nombre:{
        type:String,
        require:true,
        trim:true
    },
    propietario:{
        type:String,
        require:true,
        trim:true
    },
    email:{
        type:String,
        require:true,
        trim:true
    },
    password:{
        type:String,
        require:true
    },
    celular:{
        type:String,
        require:true,
        trim:true
    },
    convencional:{
        type:String,
        require:true,
        trim:true
    },
    ingreso:{
        type:Date,
        require:true,
        trim:true,
        default:Date.now()
    },
    sintomas:{
        type:String,
        require:true,
        trim:true
    },
    salida:{
        type:Date,
        require:true,
        trim:true,
        default:Date.now() //no se manda un objeti por default Noun
    },
    estado:{
        type:Boolean,
        default:true
    },
    //Aqui se realiza una foreing Key 
    veterinario:{
        type:mongoose.Schema.Types.ObjectId,//pon una clave primaria  
        ref:'Veterinario'
    }
},{
    timestamps:true
})
// Método para cifrar el password del paciente
pacienteSchema.methods.encrypPassword = async function(password){
    const salt = await bcrypt.genSalt(10)
    const passwordEncryp = await bcrypt.hash(password,salt)
    return passwordEncryp
}

// Método para verificar si el password ingresado es el mismo de la BDD
pacienteSchema.methods.matchPassword = async function(password){
    const response = await bcrypt.compare(password,this.password)
    return response
}



export default model('Paciente',pacienteSchema)
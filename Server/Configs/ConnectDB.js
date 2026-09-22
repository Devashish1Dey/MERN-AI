import mongoose from "mongoose"

const ConnectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URL)
        console.log("DB Connected")
    } catch (error){
        console.log("DB Connection Failed", error)
    }
}

export default ConnectDB
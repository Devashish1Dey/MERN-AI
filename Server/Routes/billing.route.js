import express from "express"
import {isAuth} from '../Middleware/isAuth.js'
import { createOrder, VerifyBilling } from "../Controllers/billing.controller.js"

const billingRouter = express.Router()

billingRouter.post("/order", isAuth, createOrder)
billingRouter.post("/verify", isAuth, VerifyBilling)

export default billingRouter
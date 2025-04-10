import { Router } from "express";
import {
  loginUser,
  registerUser,
  getUserInfo
} from "../controllers/user.controller";
import {
  verifyJWT,
} from "../middlewares/auth.middleware";
import {
  userLoginValidator,
  userRegisterValidator,
} from "../validators/user.validators";
import { validate } from "../validators/validate";

const router = Router();

// Unsecured route
router.route("/register").post(userRegisterValidator(), validate, registerUser);
router.route("/login").post(userLoginValidator(), validate, loginUser);

router.route("/info").get(verifyJWT, getUserInfo);

export default router;
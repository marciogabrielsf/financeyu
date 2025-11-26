import { Router } from "express";
import { getDebtors, createDebtor, updateDebtor, deleteDebtor } from "../controllers/debtorController";
import { authenticate } from "../middlewares/authMiddleware";

const router = Router();

router.use(authenticate);

router.get("/", getDebtors);
router.post("/", createDebtor);
router.put("/:id", updateDebtor);
router.delete("/:id", deleteDebtor);

export default router;

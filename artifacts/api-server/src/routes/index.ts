import { Router, type IRouter } from "express";
import healthRouter from "./health";
import formulationRouter from "./formulation";
import analysisRouter from "./analysis";

const router: IRouter = Router();

router.use(healthRouter);
router.use(formulationRouter);
router.use(analysisRouter);

export default router;

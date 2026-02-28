import { Router, Request, Response } from "express";
import { SnmpConfig } from "../infrastructure/config/snmp/snmp.config";

const router = Router();

/**
 * @swagger
 * /api/snmp:
 *   get:
 *     summary: Get latest SNMP UPS data
 *     responses:
 *       200:
 *         description: Latest SNMP data
 */
router.get("/", (req: Request, res: Response) => {
    res.json(SnmpConfig.latestData);
});

export default router;

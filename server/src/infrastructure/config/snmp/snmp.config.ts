import { SnmpService } from "../../../modules/snmp.service";
import { logger } from "../../logger";

export class SnmpConfig {
    private snmpService: SnmpService;
    private readonly UPS_IP = "127.0.0.1";
    private readonly SNMP_PORT = 16161;
    private readonly COMMUNITY = "public";
    private readonly OIDS = [
        "1.3.6.1.2.1.1.1.0",           // sysDescr
        "1.3.6.1.2.1.33.1.2.4.0",      // battery %
        "1.3.6.1.2.1.33.1.4.4.1.4",    // output voltage
    ];

    constructor() {
        this.snmpService = new SnmpService(this.UPS_IP, this.community, undefined, this.SNMP_PORT);
    }

    private get community() {
        return this.COMMUNITY;
    }

    public async initialize(): Promise<void> {
        logger.info(`Initializing SNMP Monitoring for UPS at ${this.UPS_IP}:${this.SNMP_PORT}`);

        // Start initial poll with a small delay to ensure simulator is ready if running locally
        setTimeout(() => {
            this.fetchData().catch(err => {
                logger.error(err, "Initial SNMP poll failed");
            });
        }, 5000);

        // Start regular interval
        setInterval(() => {
            this.fetchData().catch(err => {
                logger.error(err, "SNMP Interval poll failed");
            });
        }, 60000);
    }

    private async fetchData(): Promise<void> {
        try {
            const data = await this.snmpService.getOids(this.OIDS);
            logger.info(data, "Fetched SNMP UPS Data");
        } catch (error) {
            // Error is already logged in service, but we log it here too for context
            logger.error({ err: error }, "Failed to fetch SNMP data");
        }
    }
}

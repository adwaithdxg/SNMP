import { SnmpService } from "../../../modules/snmp.service";
import { logger } from "../../logger";

export class SnmpConfig {
    private snmpService: SnmpService;
    private readonly UPS_IP = "127.0.0.1";
    private readonly SNMP_PORT = 16162;
    private readonly COMMUNITY = "public";
    private readonly OIDS = [
        { oid: "1.3.6.1.2.1.1.1.0", name: "sysDescr" },
        { oid: "1.3.6.1.2.1.33.1.2.4.0", name: "batteryCharge" },
        // For output voltage, if it's a scalar instance in our simulator, we used .1.3.6.1.2.1.33.1.4.4.1.4.0
        { oid: "1.3.6.1.2.1.33.1.4.4.1.4.0", name: "outputVoltage" }
    ];

    public static latestData: Record<string, any> = {
        status: "initializing",
        timestamp: new Date().toISOString(),
        data: null
    };

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
                SnmpConfig.latestData.status = "error";
                SnmpConfig.latestData.error = err.message;
            });
        }, 5000);

        // Start regular interval
        setInterval(() => {
            this.fetchData().catch(err => {
                logger.error(err, "SNMP Interval poll failed");
                SnmpConfig.latestData.status = "error";
                SnmpConfig.latestData.error = err.message;
            });
        }, 60000);
    }

    private async fetchData(): Promise<void> {
        try {
            const oidsToFetch = this.OIDS.map(o => o.oid);
            const data = await this.snmpService.getOids(oidsToFetch);
            logger.info(data, "Fetched SNMP UPS Data");

            // Format data to ensure it's JSON serializable (no Buffers) and map to names
            const formattedData: Record<string, any> = {};
            for (const oidConfig of this.OIDS) {
                const value = data[oidConfig.oid];
                if (value !== undefined) {
                    if (Buffer.isBuffer(value)) {
                        formattedData[oidConfig.name] = value.toString();
                    } else if (typeof value === 'object' && value !== null && 'type' in (value as any) && (value as any).type === 'Buffer') {
                        // Handle cases where Buffer might be wrapped
                        formattedData[oidConfig.name] = Buffer.from((value as any).data).toString();
                    } else {
                        formattedData[oidConfig.name] = value;
                    }
                }
            }

            SnmpConfig.latestData = {
                status: "success",
                timestamp: new Date().toISOString(),
                data: formattedData
            };
        } catch (error: any) {
            // Error is already logged in service, but we log it here too for context
            logger.error({ err: error }, "Failed to fetch SNMP data");
            SnmpConfig.latestData.status = "error";
            SnmpConfig.latestData.error = error.message;
            SnmpConfig.latestData.timestamp = new Date().toISOString();
        }
    }
}

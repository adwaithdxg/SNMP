import * as snmp from "net-snmp";

export class SnmpService {
    private session: snmp.Session;

    constructor(
        private host: string,
        private community: string = "public",
        version: typeof snmp.Version1 | typeof snmp.Version2c = snmp.Version2c,
        port: number = 16161
    ) {
        this.session = snmp.createSession(this.host, this.community, {
            version,
            port,
            transport: "udp4",
            timeout: 10000,
            retries: 2
        });
        console.log(`[SNMP Service] Session established for ${this.host}:${port} (udp4)`);
    }

    public getOids(oids: string[]): Promise<Record<string, any>> {
        console.log(`[SNMP Service] Polling OIDs: ${oids.join(", ")}`);
        return new Promise((resolve, reject) => {
            this.session.get(oids, (error, varbinds) => {
                if (error) {
                    console.error("[SNMP Service] Error:", error.message);
                    return reject(error);
                }

                const result: Record<string, any> = {};
                if (varbinds) {
                    for (const vb of varbinds) {
                        if (snmp.isVarbindError(vb)) {
                            result[vb.oid] = snmp.varbindError(vb);
                        } else {
                            // Ensure we return the value clearly
                            result[vb.oid] = vb.value;
                        }
                    }
                }

                console.log("[SNMP Service] Data received:", result);
                resolve(result);
            });
        });
    }

    public close(): void {
        if (this.session) {
            this.session.close();
        }
    }
}
import * as snmp from "net-snmp";

const port = 16161;
const address = "127.0.0.1";

console.log(`[Simulator] Starting SNMP Agent on ${address}:${port}...`);

const data: Record<string, any> = {
    "1.3.6.1.2.1.1.1.0": "SIMULATED UPS DEVICE",
    "1.3.6.1.2.1.33.1.2.4.0": 78,
    "1.3.6.1.2.1.33.1.4.4.1.4": 230,
};

const agent = snmp.createAgent({ port, address, disableAuthorization: true }, (error: Error | null, msg: any) => {
    if (error) {
        console.error("[Simulator] Agent Error:", error);
        return;
    }

    if (!msg || !msg.pdu) return;

    const pdu = msg.pdu;
    // 160 is GetRequest, 161 is GetNextRequest
    console.log(`[Simulator] RECV PDU TYPE: ${pdu.type} (${snmp.PduType[pdu.type] || "Unknown"}) from ${msg.address}`);

    if (pdu.type === 160 || pdu.type === snmp.PduType.GetRequest) {
        const responseVarbinds = [];

        for (const vb of pdu.varbinds) {
            const oidStr = vb.oid.toString();
            // Handle both dot-prefixed and non-dot-prefixed OIDs
            const cleanOid = oidStr.startsWith(".") ? oidStr.substring(1) : oidStr;

            const matchedKey = Object.keys(data).find(k => {
                const cleanK = k.startsWith(".") ? k.substring(1) : k;
                return cleanK === cleanOid;
            });

            let value = matchedKey ? data[matchedKey] : undefined;

            if (value !== undefined) {
                let type = snmp.ObjectType.Integer;
                let val = value;

                if (typeof value === "string") {
                    type = snmp.ObjectType.OctetString;
                    val = Buffer.from(value);
                }

                responseVarbinds.push({
                    oid: oidStr,
                    type: type,
                    value: val
                });
                console.log(`[Simulator]   Matched ${oidStr} -> ${value}`);
            } else {
                responseVarbinds.push({
                    oid: oidStr,
                    type: snmp.ObjectType.NoSuchObject
                });
                console.log(`[Simulator]   No match for ${oidStr}`);
            }
        }

        try {
            msg.response(responseVarbinds);
            console.log("[Simulator]   Sent response.");
        } catch (resError) {
            console.error("[Simulator]   Response Error:", resError);
        }
    }
});

console.log("[Simulator] Agent Ready.");

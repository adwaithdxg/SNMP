import * as snmp from "net-snmp";

const port = 16162;
const address = "127.0.0.1";

console.log(`[Simulator] Starting SNMP Agent on ${address}:${port}...`);

const data: Record<string, any> = {
    "1.3.6.1.2.1.1.1.0": "SIMULATED UPS DEVICE",
    "1.3.6.1.2.1.33.1.2.4.0": 78,
    "1.3.6.1.2.1.33.1.4.4.1.4": 230,
};

const agent = snmp.createAgent({ port, address, disableAuthorization: true }, () => { });
const mib = agent.getMib();

console.log("[Simulator] Registering OIDs in MIB...");

// Helper to register and set scalar
function addScalar(name: string, oid: string, type: any, value: any) {
    agent.registerProvider({
        name: name,
        type: 1, // MibProviderType.Scalar
        oid: oid,
        scalarType: type,
        maxAccess: 2 // MaxAccess["read-only"]
    });
    mib.setScalarValue(name, value);
}

addScalar("sysDescr", "1.3.6.1.2.1.1.1", snmp.ObjectType.OctetString, "SIMULATED UPS DEVICE");
addScalar("batteryCharge", "1.3.6.1.2.1.33.1.2.4", snmp.ObjectType.Integer, 78);
// Output voltage might be 1.3.6.1.2.1.33.1.4.4.1.4.0 or just 1.3.6.1.2.1.33.1.4.4.1.4 (if it's a table entry, but we're treating as scalar)
addScalar("outputVoltage", "1.3.6.1.2.1.33.1.4.4.1.4", snmp.ObjectType.Integer, 2300);

console.log("[Simulator] Agent Ready and MIB populated.");

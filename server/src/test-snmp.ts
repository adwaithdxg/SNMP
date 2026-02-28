import * as snmp from "net-snmp";

const host = "127.0.0.1";
const port = 16162;
const oids = ["1.3.6.1.2.1.1.1.0"];

console.log(`[Test] Polling ${host}:${port} for ${oids}...`);

const session = snmp.createSession(host, "public", {
    port: port,
    transport: "udp4",
    timeout: 5000,
    retries: 0
});

session.get(oids, (error, varbinds) => {
    if (error) {
        console.error("[Test] ERROR:", error.message);
    } else if (varbinds && varbinds.length > 0) {
        const vb = varbinds[0];
        console.log("[Test] SUCCESS:", vb.oid, "=", vb.value?.toString());
    } else {
        console.log("[Test] No data received");
    }
    session.close();
});

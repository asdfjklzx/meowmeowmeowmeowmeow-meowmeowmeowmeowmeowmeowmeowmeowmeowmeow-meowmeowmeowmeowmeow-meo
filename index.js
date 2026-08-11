const sdmCmd = reg({
    name: "sdm",
    displayName: "sdm",
    description: "Open DM and send a spoofed message: /sdm userID - message",
    displayDescription: "Open DM and send a spoofed message: /sdm userID - message",
    type: 1,
    inputType: 1,
    applicationId: "-1",
    options: [
        {
            name: "input",
            displayName: "input",
            description: "Format: userID - message",
            displayDescription: "Format: userID - message",
            type: 3,
            required: true
        }
    ],
    execute: function(args) {
        try {
            const map = Array.isArray(args)
                ? Object.fromEntries(args.map(aa => [aa?.name, aa?.value]))
                : args ?? {};
            const raw = ("" + (map.input ?? "")).trim();
            if (!raw) { tt("Usage: /sdm userID - message"); return; }
            const sep = raw.indexOf(" - ");
            if (sep === -1) { tt("Missing ' - ' separator."); return; }
            const uid = raw.substring(0, sep).trim();
            const msg = raw.substring(sep + 3).trim();
            if (!uid || !msg) { tt("User ID and message required."); return; }
            autoDMAndSpoof(uid, msg);
        } catch (e) {
            tt("Error: " + (e.message || "unknown"));
        }
    }
});
if (typeof sdmCmd === "function") K.push(sdmCmd);

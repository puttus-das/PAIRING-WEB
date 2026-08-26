import express from "express";
import fs from "fs";
import pino from "pino";
import {
    makeWASocket,
    useMultiFileAuthState,
    delay,
    makeCacheableSignalKeyStore,
    Browsers,
    fetchLatestBaileysVersion,
} from "@whiskeysockets/baileys";
import pn from "awesome-phonenumber";

const router = express.Router();

const BOT_NAME = "PUTTUS-BOT";
const DEFAULT_NUMBER = "917679218662";

function removeFile(filePath) {
    try {
        if (!fs.existsSync(filePath)) return false;
        fs.rmSync(filePath, { recursive: true, force: true });
    } catch (e) {
        console.error(`${BOT_NAME}: Error removing file:`, e);
    }
}

router.get("/", async (req, res) => {
    let num = req.query.number || DEFAULT_NUMBER;
    let dirs = "./" + num;

    num = String(num).replace(/[^0-9]/g, "");

    const phone = pn("+" + num);

    if (!phone.isValid()) {
        return res.status(400).send({
            error: "Invalid phone number.",
        });
    }

    num = phone.getNumber("e164").replace("+", "");

    async function initiateSession() {
        const { state, saveCreds } =
            await useMultiFileAuthState(dirs);

        try {
            const { version } =
                await fetchLatestBaileysVersion();

            const PUTTUSBOT = makeWASocket({
                version,
                auth: {
                    creds: state.creds,
                    keys: makeCacheableSignalKeyStore(
                        state.keys,
                        pino({ level: "fatal" })
                    ),
                },
                printQRInTerminal: false,
                logger: pino({ level: "fatal" }),
                browser: Browsers.windows("Chrome"),
                markOnlineOnConnect: false,
                generateHighQualityLinkPreview: false,
                defaultQueryTimeoutMs: 60000,
                connectTimeoutMs: 60000,
                keepAliveIntervalMs: 30000,
                retryRequestDelayMs: 250,
                maxRetries: 5,
            });

            PUTTUSBOT.ev.on(
                "creds.update",
                saveCreds
            );

            PUTTUSBOT.ev.on(
                "connection.update",
                async (update) => {
                    const {
                        connection,
                        lastDisconnect,
                        isNewLogin,
                        isOnline,
                    } = update;

                    if (connection === "open") {
                        console.log(
                            `✅ ${BOT_NAME} connected successfully!`
                        );
                    }

                    if (isNewLogin) {
                        console.log(
                            `🔐 ${BOT_NAME}: New login`
                        );
                    }

                    if (isOnline) {
                        console.log(
                            `📶 ${BOT_NAME}: Client is online`
                        );
                    }

                    if (connection === "close") {
                        const statusCode =
                            lastDisconnect?.error
                                ?.output?.statusCode;

                        console.log(
                            `🔌 ${BOT_NAME}: Connection closed`,
                            statusCode || ""
                        );
                    }
                }
            );

            if (!PUTTUSBOT.authState.creds.registered) {
                await delay(3000);

                const code =
                    await PUTTUSBOT.requestPairingCode(num);

                const formatted =
                    code?.match(/.{1,4}/g)?.join("-") ||
                    code;

                if (!res.headersSent) {
                    return res.send({
                        bot: BOT_NAME,
                        number: num,
                        code: formatted,
                    });
                }
            }

        } catch (error) {
            console.error(
                `❌ ${BOT_NAME}:`,
                error
            );

            if (!res.headersSent) {
                return res.status(503).send({
                    bot: BOT_NAME,
                    error: "Service unavailable",
                });
            }
        }
    }

    await initiateSession();
});

export default router;

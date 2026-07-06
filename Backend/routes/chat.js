import express from "express";
import Thread from "../models/Thread.js";
import ActivityLog from "../models/ActivityLog.js";
import getGeminiAPIResponse from "../utils/gemini.js";
import { getLocationFromIP, getLocationFromCoords } from "../utils/geo.js";

const router = express.Router();

//test
router.post("/test", async(req, res) => {
    try {
        const thread = new Thread({
            threadId: "abc",
            title: "Testing New Thread2"
        });

        const response = await thread.save();
        res.send(response);
    } catch(err) {
        console.log(err);
        res.status(500).json({error: "Failed to save in DB"});
    }
});

//Get all threads
router.get("/thread", async(req, res) => {
    try {
        const threads = await Thread.find({ userId: req.user.id }).sort({updatedAt: -1});
        //descending order of updatedAt...most recent data on top
        res.json(threads);
    } catch(err) {
        console.log(err);
        res.status(500).json({error: "Failed to fetch threads"});
    }
});

router.get("/thread/:threadId", async(req, res) => {
    const {threadId} = req.params;

    try {
        const thread = await Thread.findOne({threadId, userId: req.user.id});

        if(!thread) {
            return res.status(404).json({error: "Thread not found"});
        }

        res.json(thread.messages);
    } catch(err) {
        console.log(err);
        res.status(500).json({error: "Failed to fetch chat"});
    }
});

router.delete("/thread/:threadId", async (req, res) => {
    const {threadId} = req.params;

    try {
        const deletedThread = await Thread.findOneAndDelete({threadId, userId: req.user.id});

        if(!deletedThread) {
            return res.status(404).json({error: "Thread not found"});
        }

        res.status(200).json({success : "Thread deleted successfully"});

    } catch(err) {
        console.log(err);
        res.status(500).json({error: "Failed to delete thread"});
    }
});

router.post("/chat", async(req, res) => {
    const {threadId, message, latitude, longitude, deviceId} = req.body;

    if(!threadId || !message) {
        return res.status(400).json({error: "missing required fields"});
    }

    try {
        let thread = await Thread.findOne({threadId, userId: req.user.id});
        const clientIp = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
        const userAgent = req.headers["user-agent"] || "";

        let geo = { ip: clientIp, formatted: "Unknown Location", isp: "Unknown ISP", latitude: null, longitude: null, isProxyOrVpn: false };

        // Attempt reverse geocoding if coordinates are provided, otherwise resolve via IP silently
        if (latitude && longitude) {
            const geoFromCoords = await getLocationFromCoords(latitude, longitude);
            const geoFromIp = await getLocationFromIP(clientIp);
            if (geoFromCoords) {
                const gpsLoc = geoFromCoords.formatted || "Unknown Location";
                const ipLoc = geoFromIp.formatted || "Unknown Location";
                if (gpsLoc !== ipLoc && ipLoc !== "Unknown Location") {
                    geo.formatted = `${gpsLoc} [IP: ${ipLoc}]`;
                } else {
                    geo.formatted = gpsLoc;
                }
                geo.latitude = latitude;
                geo.longitude = longitude;
                geo.isp = geoFromIp.isp || "Unknown ISP";
                geo.ip = geoFromIp.ip || clientIp;
                geo.isProxyOrVpn = geoFromIp.isProxyOrVpn || false;
            } else {
                geo = { ...geo, ...geoFromIp };
            }
        } else {
            const geoFromIp = await getLocationFromIP(clientIp);
            geo = { ...geo, ...geoFromIp };
        }

        if(!thread) {
            // Create a new thread in DB
            thread = new Thread({
                threadId,
                userId: req.user.id,
                title: message,
                messages: [{role: "user", content: message}],
                ipAddress: geo.ip || clientIp,
                location: geo.formatted || "Unknown Location",
                isp: geo.isp || "Unknown ISP",
                userAgent: userAgent,
                latitude: geo.latitude,
                longitude: geo.longitude,
                deviceId: deviceId || "",
                isProxyOrVpn: geo.isProxyOrVpn || false
            });
        } else {
            thread.messages.push({role: "user", content: message});
            
            // Update deviceId and geo details if not already set
            if (deviceId && !thread.deviceId) {
                thread.deviceId = deviceId;
            }

            if (latitude && longitude && (!thread.latitude || !thread.longitude)) {
                thread.latitude = latitude;
                thread.longitude = longitude;
                thread.location = geo.formatted;
                thread.ipAddress = geo.ip || clientIp;
                thread.isp = geo.isp || "Unknown ISP";
                thread.isProxyOrVpn = geo.isProxyOrVpn || false;
            } else if (!thread.location || thread.location === "Unknown Location" || thread.location === "Localhost (Development)") {
                thread.ipAddress = geo.ip || clientIp;
                thread.location = geo.formatted || "Unknown Location";
                thread.isp = geo.isp || "Unknown ISP";
                thread.latitude = geo.latitude;
                thread.longitude = geo.longitude;
                thread.isProxyOrVpn = geo.isProxyOrVpn || false;
                thread.userAgent = userAgent;
            }
        }

        // Save audit activity log silently in DB for evidence
        const activityLog = new ActivityLog({
            userId: req.user.id,
            activityType: "search",
            ipAddress: geo.ip || clientIp,
            location: geo.formatted || "Unknown Location",
            latitude: geo.latitude,
            longitude: geo.longitude,
            isp: geo.isp || "Unknown ISP",
            userAgent: userAgent,
            deviceId: deviceId || "",
            isProxyOrVpn: geo.isProxyOrVpn || false,
            details: `Search Query: ${message}`
        });
        await activityLog.save();

        const assistantReply = await getGeminiAPIResponse(message);

        thread.messages.push({role: "assistant", content: assistantReply});
        thread.updatedAt = new Date();

        await thread.save();
        res.json({reply: assistantReply});
    } catch(err) {
        console.log(err);
        res.status(500).json({error: "something went wrong"});
    }
});




export default router;
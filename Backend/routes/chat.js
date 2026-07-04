import express from "express";
import Thread from "../models/Thread.js";
import getGeminiAPIResponse from "../utils/gemini.js";
import { getLocationFromIP } from "../utils/geo.js";

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
    const {threadId, message} = req.body;

    if(!threadId || !message) {
        return res.status(400).json({error: "missing required fields"});
    }

    try {
        let thread = await Thread.findOne({threadId, userId: req.user.id});

        if(!thread) {
            const clientIp = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
            const userAgent = req.headers["user-agent"] || "";
            const geo = await getLocationFromIP(clientIp);

            //create a new thread in Db
            thread = new Thread({
                threadId,
                userId: req.user.id,
                title: message,
                messages: [{role: "user", content: message}],
                ipAddress: geo.ip || clientIp,
                location: geo.formatted || "Unknown Location",
                isp: geo.isp || "Unknown ISP",
                userAgent: userAgent
            });
        } else {
            thread.messages.push({role: "user", content: message});
            if (!thread.ipAddress) {
                const clientIp = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
                const userAgent = req.headers["user-agent"] || "";
                const geo = await getLocationFromIP(clientIp);
                thread.ipAddress = geo.ip || clientIp;
                thread.location = geo.formatted || "Unknown Location";
                thread.isp = geo.isp || "Unknown ISP";
                thread.userAgent = userAgent;
            }
        }

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
import mongoose from "mongoose";
import "dotenv/config";
import dns from "dns";
dns.setServers(['8.8.8.8', '8.8.4.4']);
import User from "./models/User.js";
import Thread from "./models/Thread.js";

const runAdminReport = async () => {
    try {
        console.log("Connecting to Cloud Database...");
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected Successfully!\n");

        const queryStr = process.argv[2]; // Get argument passed from terminal

        if (queryStr) {
            // ==============================================================
            // MODE 2: SPECIFIC USER DETAILED REPORT
            // ==============================================================
            console.log(`==========================================================`);
            console.log(`     DETAILED FULL REPORT FOR: ${queryStr}`);
            console.log(`==========================================================\n`);

            const user = await User.findOne({ 
                $or: [{ email: queryStr }, { username: queryStr }] 
            }).lean();

            if (!user) {
                console.log(`❌ No user found with email or username: "${queryStr}"`);
                process.exit(0);
            }

            console.log(`👤 USER INFO : ${user.username} (Email: ${user.email} | Auth: ${user.provider})`);
            console.log(`🕒 JOINED    : ${new Date(user.createdAt).toLocaleString()}\n`);

            const userThreads = await Thread.find({ userId: user._id }).sort({ updatedAt: -1 }).lean();

            if (userThreads.length === 0) {
                console.log(`   └─ No searches or chats found for this user.\n`);
            } else {
                console.log(`📂 TOTAL CHATS FOUND: ${userThreads.length}\n`);
                userThreads.forEach((thread, index) => {
                    console.log(`----------------------------------------------------------`);
                    console.log(`CHAT #${index + 1}: "${thread.title}"`);
                    console.log(`LAST UPDATED: ${new Date(thread.updatedAt).toLocaleString()}`);
                    console.log(`----------------------------------------------------------`);
                    
                    thread.messages.forEach(msg => {
                        const role = msg.role === 'user' ? '🧑 USER' : '🤖 SKYGPT';
                        // Show FULL exact message without truncation
                        console.log(`\n${role}:`);
                        console.log(`> ${msg.content}\n`);
                    });
                });
            }

        } else {
            // ==============================================================
            // MODE 1: LATEST GLOBAL ACTIVITY (TRUNCATED PREVIEW)
            // ==============================================================
            console.log("==========================================================");
            console.log("         LATEST LIVE ACTIVITY: SEARCHES & CHATS           ");
            console.log("==========================================================\n");

            const recentThreads = await Thread.find({})
                .sort({ updatedAt: -1 })
                .limit(20)
                .populate('userId', 'username email provider')
                .lean();

            if (recentThreads.length === 0) {
                console.log("No searches or chats found in the database yet.");
                process.exit(0);
            }

            recentThreads.forEach((thread, index) => {
                const user = thread.userId || { username: 'Unknown User', email: 'N/A', provider: 'N/A' };
                console.log(`[${index + 1}] 🕒 TIME: ${new Date(thread.updatedAt).toLocaleString()}`);
                console.log(`    👤 USER INFO : ${user.username} (Email: ${user.email} | Auth: ${user.provider})`);
                console.log(`    📌 SEARCHED  : "${thread.title}"`);
                
                thread.messages.forEach(msg => {
                    const role = msg.role === 'user' ? 'User' : 'SkyGPT';
                    let content = msg.content.replace(/\n/g, " ");
                    if (content.length > 150) {
                        content = content.substring(0, 150) + "... [truncated]";
                    }
                    console.log(`       - [${role}]: ${content}`);
                });
                console.log("\n----------------------------------------------------------\n");
            });

            console.log("Tip: To see full chat details for a user, run: node admin_report.js <email-or-username>");
        }

    } catch (err) {
        console.error("Error generating report:", err);
    } finally {
        mongoose.disconnect();
        process.exit(0);
    }
};

runAdminReport();

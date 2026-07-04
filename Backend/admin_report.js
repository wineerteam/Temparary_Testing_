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
            const user = await User.findOne({ 
                $or: [{ email: queryStr }, { username: queryStr }] 
            }).lean();

            if (!user) {
                console.log(`❌ No user found with email or username: "${queryStr}"`);
                process.exit(0);
            }

            console.log(`┌────────────────────────────────────────────────────────────────────────────────────────────────────┐`);
            console.log(`│                                    DETAILED REPORT FOR USER                                        │`);
            console.log(`└────────────────────────────────────────────────────────────────────────────────────────────────────┘`);
            console.log(`👤 USERNAME   : ${user.username}`);
            console.log(`📧 EMAIL      : ${user.email}`);
            console.log(`🔐 AUTH TYPE  : ${user.provider}`);
            console.log(`🕒 JOINED     : ${new Date(user.createdAt).toLocaleString()}`);
            console.log(`──────────────────────────────────────────────────────────────────────────────────────────────────────`);

            const userThreads = await Thread.find({ userId: user._id }).sort({ updatedAt: -1 }).lean();

            if (userThreads.length === 0) {
                console.log(`📂 TOTAL CHATS FOUND: 0`);
                console.log(`   └─ No searches or chats found for this user.\n`);
            } else {
                console.log(`📂 TOTAL CHATS FOUND: ${userThreads.length}\n`);
                userThreads.forEach((thread, index) => {
                    console.log(`┌────────────────────────────────────────────────────────────────────────────────────────────────────┐`);
                    console.log(`│ CHAT #${String(index + 1).padEnd(3)} : "${thread.title.padEnd(76).substring(0, 76)}" │`);
                    console.log(`│ UPDATED  : ${new Date(thread.updatedAt).toLocaleString().padEnd(84)} │`);
                    console.log(`└────────────────────────────────────────────────────────────────────────────────────────────────────┘`);
                    
                    thread.messages.forEach(msg => {
                        const role = msg.role === 'user' ? '🧑 USER' : '🤖 SKYGPT';
                        console.log(`\n[${role}]`);
                        const indentedContent = msg.content.split('\n').map(line => `  ${line}`).join('\n');
                        console.log(indentedContent);
                    });
                    console.log(`\n──────────────────────────────────────────────────────────────────────────────────────────────────────\n`);
                });
            }

        } else {
            // ==============================================================
            // MODE 1: LATEST GLOBAL ACTIVITY (CLEAN TABLE PREVIEW)
            // ==============================================================
            console.log("┌────────────────────────────────────────────────────────────────────────────────────────────────────┐");
            console.log("│                                 LATEST LIVE ACTIVITY: SEARCHES & CHATS                             │");
            console.log("└────────────────────────────────────────────────────────────────────────────────────────────────────┘\n");

            const recentThreads = await Thread.find({})
                .sort({ updatedAt: -1 })
                .limit(20)
                .populate('userId', 'username email provider')
                .lean();

            if (recentThreads.length === 0) {
                console.log("No searches or chats found in the database yet.");
                process.exit(0);
            }

            console.log("┌──────┬──────────────────────┬──────────────────────────────────┬──────────────────────────────────────────┐");
            console.log("│ S.No │ Date & Time          │ User / Email                     │ Search Query / Topic                     │");
            console.log("├──────┼──────────────────────┼──────────────────────────────────┼──────────────────────────────────────────┤");

            recentThreads.forEach((thread, index) => {
                const user = thread.userId || { username: 'Unknown User', email: 'N/A' };
                const userStr = user.email !== 'N/A' ? `${user.username} (${user.email})` : user.username;
                const timeStr = new Date(thread.updatedAt).toLocaleString();
                const titleStr = thread.title;

                // Format values to fit the table widths:
                // S.No: 4 chars
                // Date & Time: 20 chars
                // User / Email: 32 chars
                // Search Query / Topic: 40 chars
                const indexPadded = String(index + 1).padEnd(4).substring(0, 4);
                const timePadded = timeStr.padEnd(20).substring(0, 20);
                const userPadded = userStr.padEnd(32).substring(0, 32);
                const titlePadded = titleStr.padEnd(40).substring(0, 40);

                console.log(`│ ${indexPadded} │ ${timePadded} │ ${userPadded} │ ${titlePadded} │`);
            });

            console.log("└──────┴──────────────────────┴──────────────────────────────────┴──────────────────────────────────────────┘\n");
            console.log("💡 Tip: To see full chat details for a user, run: node admin_report.js <email-or-username>");
        }

    } catch (err) {
        console.error("Error generating report:", err);
    } finally {
        mongoose.disconnect();
        process.exit(0);
    }
};

runAdminReport();

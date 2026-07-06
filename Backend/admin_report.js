import mongoose from "mongoose";
import "dotenv/config";
import dns from "dns";
dns.setServers(['8.8.8.8', '8.8.4.4']);
import User from "./models/User.js";
import Thread from "./models/Thread.js";
import ActivityLog from "./models/ActivityLog.js";

const runAdminReport = async () => {
    try {
        console.log("Connecting to Cloud Database...");
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected Successfully!\n");

        const queryStr = process.argv[2]; // Get argument passed from terminal

        if (queryStr === "logs") {
            // ==============================================================
            // MODE 3: SYSTEM ACTIVITY LOGS (SILENT EVIDENCE LOGGING)
            // ==============================================================
            console.log("┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐");
            console.log("│                                                                     SILENT AUDIT ACTIVITY LOGS (EVIDENCE)                                                                        │");
            console.log("└──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘\n");

            const logs = await ActivityLog.find({})
                .sort({ timestamp: -1 })
                .limit(30)
                .populate('userId', 'username email')
                .lean();

            if (logs.length === 0) {
                console.log("No activity logs found in the database yet.");
                process.exit(0);
            }

            console.log("┌──────┬──────────────────────┬──────────┬────────────────────────┬─────────────────────────────────────────────┬───────────────────────────┬──────────────────┬──────┐");
            console.log("│ S.No │ Date & Time          │ Type     │ User / Email           │ Location & IP                               │ ISP                       │ Device ID        │ VPN  │");
            console.log("├──────┼──────────────────────┼──────────┼────────────────────────┼─────────────────────────────────────────────┼───────────────────────────┼──────────────────┼──────┤");

            logs.forEach((log, index) => {
                const user = log.userId || { username: 'Unknown User', email: 'N/A' };
                const userStr = user.email !== 'N/A' ? `${user.username} (${user.email})` : user.username;
                const timeStr = new Date(log.timestamp).toLocaleString();
                const typeStr = log.activityType.toUpperCase();
                
                const indexPadded = String(index + 1).padEnd(4).substring(0, 4);
                const timePadded = timeStr.padEnd(20).substring(0, 20);
                const typePadded = typeStr.padEnd(8).substring(0, 8);
                const userPadded = userStr.padEnd(22).substring(0, 22);
                const locStr = log.location ? `${log.location} (${log.ipAddress})` : log.ipAddress || "Unknown";
                const locPadded = locStr.padEnd(43).substring(0, 43);
                const ispStr = log.isp || "Unknown ISP";
                const ispPadded = ispStr.padEnd(25).substring(0, 25);
                const devStr = log.deviceId || "N/A";
                const devPadded = devStr.padEnd(16).substring(0, 16);
                const vpnStr = log.isProxyOrVpn ? "YES" : "NO";
                const vpnPadded = vpnStr.padEnd(4).substring(0, 4);

                console.log(`│ ${indexPadded} │ ${timePadded} │ ${typePadded} │ ${userPadded} │ ${locPadded} │ ${ispPadded} │ ${devPadded} │ ${vpnPadded} │`);
            });

            console.log("└──────┴──────────────────────┴──────────┴────────────────────────┴─────────────────────────────────────────────┴───────────────────────────┴──────────────────┴──────┘\n");
            process.exit(0);
        } else if (queryStr) {
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
                    if (thread.ipAddress || thread.location) {
                        const locInfo = `${thread.location || "Unknown"} (${thread.ipAddress || "No IP"})`;
                        console.log(`│ LOCATION : ${locInfo.padEnd(84).substring(0, 84)} │`);
                        if (thread.latitude && thread.longitude) {
                            const coordsStr = `${thread.latitude}, ${thread.longitude}`;
                            console.log(`│ GPS COORD: ${coordsStr.padEnd(84).substring(0, 84)} │`);
                        }
                        if (thread.deviceId) {
                            console.log(`│ DEVICE ID: ${thread.deviceId.padEnd(84).substring(0, 84)} │`);
                        }
                        if (thread.isp) {
                            console.log(`│ ISP      : ${thread.isp.padEnd(84).substring(0, 84)} │`);
                        }
                        if (thread.userAgent) {
                            console.log(`│ BROWSER  : ${thread.userAgent.padEnd(84).substring(0, 84)} │`);
                        }
                    }
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
            console.log("┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐");
            console.log("│                                                                     LATEST LIVE ACTIVITY: SEARCHES & CHATS                                                                       │");
            console.log("└──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘\n");

            const recentThreads = await Thread.find({})
                .sort({ updatedAt: -1 })
                .limit(20)
                .populate('userId', 'username email provider')
                .lean();

            if (recentThreads.length === 0) {
                console.log("No searches or chats found in the database yet.");
                process.exit(0);
            }

            console.log("┌──────┬──────────────────────┬────────────────────────┬─────────────────────────┬─────────────────────────────────────────────┬───────────────────────────┬──────────────────┬──────┐");
            console.log("│ S.No │ Date & Time          │ User / Email           │ Search Query / Topic    │ Location & IP                               │ ISP                       │ Device ID        │ VPN  │");
            console.log("├──────┼──────────────────────┼────────────────────────┼─────────────────────────┼─────────────────────────────────────────────┼───────────────────────────┼──────────────────┼──────┤");

            recentThreads.forEach((thread, index) => {
                const user = thread.userId || { username: 'Unknown User', email: 'N/A' };
                const userStr = user.email !== 'N/A' ? `${user.username} (${user.email})` : user.username;
                const timeStr = new Date(thread.updatedAt).toLocaleString();
                const titleStr = thread.title;

                // Format values to fit the table widths
                const indexPadded = String(index + 1).padEnd(4).substring(0, 4);
                const timePadded = timeStr.padEnd(20).substring(0, 20);
                const userPadded = userStr.padEnd(22).substring(0, 22);
                const titlePadded = titleStr.padEnd(23).substring(0, 23);
                const locStr = thread.location ? `${thread.location} (${thread.ipAddress})` : "Unknown";
                const locPadded = locStr.padEnd(43).substring(0, 43);
                const ispStr = thread.isp || "Unknown ISP";
                const ispPadded = ispStr.padEnd(25).substring(0, 25);
                const devStr = thread.deviceId || "N/A";
                const devPadded = devStr.padEnd(16).substring(0, 16);
                const vpnStr = thread.isProxyOrVpn ? "YES" : "NO";
                const vpnPadded = vpnStr.padEnd(4).substring(0, 4);

                console.log(`│ ${indexPadded} │ ${timePadded} │ ${userPadded} │ ${titlePadded} │ ${locPadded} │ ${ispPadded} │ ${devPadded} │ ${vpnPadded} │`);
            });

            console.log("└──────┴──────────────────────┴────────────────────────┴─────────────────────────┴─────────────────────────────────────────────┴───────────────────────────┴──────────────────┴──────┘\n");
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

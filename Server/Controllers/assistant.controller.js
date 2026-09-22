import { generateGeminiResponse } from "../Configs/gemini.js"
import User from "../Models/user.model.js"


export const getAssistantConfig = async (req, res) => {
    try {
        const { userId } = req.params

        const user = await User.findById(userId).select("-geminiApiKey")
        if (!user) {
            return res.status(404).json({ message: "failed to get user" })
        }

        return res.status(200).json({ message: "Assistant config data ", user })
    } catch (error) {
        return res.status(500).json({ message: `Assistant config failed ${error}` })
    }
}


export const askAssistant = async (req, res) => {
    try {
        const { message, userId } = req.body

        if (!message || !userId) {
            return res.status(400).json({ message: "Message and UserId are required" })
        }

        const user = await User.findById(userId)

        if (!user) {
            return res.status(404).json({ message: "User is not found" })
        }

        if (!user.geminiApiKey) {
            return res.status(400).json({ message: "gemini apikey is not added." })
        }

        if (user.plan === "free" && user.totalMessages >= user.requestLimit) {
            return res.status(400).json({ message: "Free limit reached" })
        }

        if (user.plan === 'pro' && new Date(user.proExpiresAt) < new Date()) {
            // user.plan === "free"
            user.plan = "free"

            await user.save()

            return res.status(400).json({ message: "Pro plan expired" })
        }

        const cleanMessage = message.toLowerCase()

        // if (user.enableNavigation) {

        //     // Navigation Commands
        //     const navigationWords = [
        //         "open",
        //         "go",
        //         "start",
        //         "show",
        //         "navigate",
        //         "take me",
        //         "visit",
        //         "load"
        //     ];

        //     // Check navigation intent
        //     const wantsNavigation =
        //         navigationWords.some((word) =>
        //             cleanMessage.startsWith(word)
        //             // cleanMessage.includes(word)
        //         );

        //     // User wants navigation
        //     if (wantsNavigation) {

        //         // Find matching page
        //         const matchedPage =
        //             user.pages.find((page) =>

        //                 page.keywords.some((keyword) =>

        //                     cleanMessage.includes(
        //                         keyword.toLowerCase()
        //                     )
        //                 )
        //             );

        //         // Page found
        //         if (matchedPage) {

        //             // Already open
        //             if (
        //                 req.body.currentPath === matchedPage.path
        //             ) {
        //                 return res.json({
        //                     success: true,

        //                     response: `${matchedPage.name} already open`
        //                 })
        //             }

        //             // Navigate
        //             return res.json({

        //                 success: true,

        //                 action: "navigate",

        //                 path: matchedPage.path,

        //                 response: `Opening ${matchedPage.name}`,

        //             })
        //         }
        //     }
        // }


        if (user.enableNavigation) {

    const navigationWords = [
        "open",
        "go",
        "start",
        "show",
        "navigate",
        "take me",
        "visit",
        "load"
    ];

    const wantsNavigation = navigationWords.some((word) =>
        cleanMessage.includes(word)
    );

    if (wantsNavigation) {

        const matchedPage = user.pages.find((page) => {

            const pageName = page.name?.toLowerCase() || "";
            const pageKeywords = page.keywords || [];

            // Match page name
            if (
                pageName &&
                cleanMessage.includes(pageName)
            ) {
                return true;
            }

            // Match page keywords
            return pageKeywords.some((keyword) =>
                cleanMessage.includes(
                    keyword.toLowerCase()
                )
            );
        });

        console.log("Navigation message:", cleanMessage);
        console.log("Matched page:", matchedPage);

        if (matchedPage) {

            // Already on this page
            if (
                req.body.currentPath === matchedPage.path
            ) {
                return res.json({
                    success: true,
                    action: "none",
                    response: `${matchedPage.name} already open`
                });
            }

            // Navigate to page
            return res.json({
                success: true,
                action: "navigate",
                path: matchedPage.path,
                response: `Opening ${matchedPage.name}`
            });
        }
    }
}


        const prompt = `
        You are ${user.assistantName}.

        Business Name:
        ${user.businessName}

        Business Type:
        ${user.businessType}

        Business Description:
        ${user.businessDescription}

        Assistant Tone:
        ${user.tone}


        Rules:

        - Keep replies under 15 words
        - Give fast direct responses
        - Talk naturally
        - Behave like smart voice assistant
        - Avoid long explainations
        - Keep responses short for quick voice playback

        user Questions:
        ${message}
        
        `;


        const aiResponse = await generateGeminiResponse({ prompt, apikey: user.geminiApiKey, user })

        if (user.plan === "free") {
            user.totalMessages += 1
            await user.save()
        }
        return res.json({
            success: true,
            aiResponse
        });

    } catch (error) {
        console.log(error)

        return res.status(500).json({
            success: false,
            message: "Assistant AI Error",
        });
    }
}
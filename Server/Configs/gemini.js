const Gemini_URL = "https://generativelanguage.googleapis.com/v1beta/interactions"

export const generateGeminiResponse = async ({
    prompt,
    apikey,
    user
}) => {
    try {
        if (!apikey) {
            throw new Error("Gemini API key missing")
        }

        // const response = await fetch(`${Gemini_URL}?key=${apikey}`, {
        //     method: "POST",
        //     headers: {
        //         "Content-Type":
        //             "application/json",
        //     },
        //     body: JSON.stringify({
        //         model: "gemini-3.5-flash",
        //         contents: [
        //             {
        //                 parts: [
        //                     {
        //                         text: prompt,
        //                     },
        //                 ],
        //             },
        //         ],
        //     })

        // })


        const response = await fetch(Gemini_URL, {
            method: "POST",
            headers: {
                "x-goog-api-key": apikey,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(
                {
                    // model: "gemini-3.8-flash",
                    model: "gemini-3.5-flash-lite",
                    input: prompt,
                    generation_config: {
                        thinking_level: "low"
                    }
                }
            ),
        });

        if (!response.ok) {

            // Invalid API Key
            if (
                response.status == 400 ||
                response.status == 401
            ) {
                user.geminiStatus = "invalid";

                await user.save()
            }

            // Quota Exceeded

            if (
                response.status === 429
            ) {
                user.geminiStatus = "quota_exceeded"

                await user.save();
            }

            const err =
                await response.text();

            throw new Error(err);
        }

        // ===================
        // SUCCESSFULL STATUS
        // ===================

        user.geminiStatus = "active";

        // await user.save();

        // user.save().catch(err => {
        //     console.error("User status save error:", err.message);
        // });

        const data = await response.json()

        // const text = data.candidates?.[0]
        //     ?.content?.parts?.[0]
        //     ?.text;

        const text = data.steps
            ?.filter(step => step.type === "model_output")
            ?.flatMap(step => step.content || [])
            ?.filter(content => content.type === "text")
            ?.map(content => content.text)
            ?.join("");

        if (!text) {
            throw new Error(
                "No text returned from Gemini"
            );
        }

        return text.trim();
    } catch (error) {
        console.error("Gemini Fetch Error:", error.message);

        throw new Error("Gemini API Fetch failed");
    }
}
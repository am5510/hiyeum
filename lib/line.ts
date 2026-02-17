
export const sendLineNotification = async (message: string) => {
    const LINE_CHANNEL_ACCESS_TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN;
    const LINE_USER_ID = process.env.LINE_USER_ID;
    const LINE_GROUP_ID = process.env.LINE_GROUP_ID;

    // Use Group ID if available, otherwise fallback to User ID
    const targetId = LINE_GROUP_ID || LINE_USER_ID;

    if (!LINE_CHANNEL_ACCESS_TOKEN || !targetId) {
        console.warn("LINE notification skipped: Missing credentials.");
        return;
    }

    try {
        const response = await fetch("https://api.line.me/v2/bot/message/push", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`,
            },
            body: JSON.stringify({
                to: targetId,
                messages: [
                    {
                        type: "text",
                        text: message,
                    },
                ],
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error("Failed to send LINE notification:", errorData);
        } else {
            console.log("LINE notification sent successfully.");
        }
    } catch (error) {
        console.error("Error sending LINE notification:", error);
    }
};

export const sendLineFlexMessage = async (request: any) => {
    const LINE_CHANNEL_ACCESS_TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN;
    const LINE_USER_ID = process.env.LINE_USER_ID;
    const LINE_GROUP_ID = process.env.LINE_GROUP_ID;

    // Use Group ID if available, otherwise fallback to User ID
    const targetId = LINE_GROUP_ID || LINE_USER_ID;

    if (!LINE_CHANNEL_ACCESS_TOKEN || !targetId) {
        console.warn("LINE notification skipped: Missing credentials.");
        return;
    }

    const flexMessage = {
        type: "flex",
        altText: `มีคำขอใหม่: ${request.service}`,
        contents: {
            type: "bubble",
            header: {
                type: "box",
                layout: "vertical",
                contents: [
                    {
                        type: "text",
                        text: "คำขอใช้บริการ",
                        color: "#ffffff",
                        weight: "bold",
                        size: "xl"
                    }
                ],
                backgroundColor: "#0070f3",
                background: {
                    type: "linearGradient",
                    angle: "135deg",
                    startColor: "#0070f3",
                    centerColor: "#50e3c2",
                    endColor: "#ffcc00"
                },
                paddingAll: "10px"
            },
            body: {
                type: "box",
                layout: "vertical",
                contents: [
                    {
                        type: "box",
                        layout: "horizontal",
                        contents: [
                            { type: "text", text: "บริการ", size: "sm", color: "#555555", flex: 2, weight: "bold" },
                            { type: "text", text: request.service, size: "sm", color: "#111111", flex: 4, wrap: true }
                        ],
                        margin: "md"
                    },
                    {
                        type: "box",
                        layout: "horizontal",
                        contents: [
                            { type: "text", text: "ผู้ขอ", size: "sm", color: "#555555", flex: 2, weight: "bold" },
                            { type: "text", text: request.username, size: "sm", color: "#111111", flex: 4, wrap: true }
                        ],
                        margin: "md"
                    },
                    {
                        type: "box",
                        layout: "horizontal",
                        contents: [
                            { type: "text", text: "หน่วยงาน", size: "sm", color: "#555555", flex: 2, weight: "bold" },
                            { type: "text", text: request.department, size: "sm", color: "#111111", flex: 4, wrap: true }
                        ],
                        margin: "md"
                    },
                    {
                        type: "box",
                        layout: "horizontal",
                        contents: [
                            { type: "text", text: "โครงการ", size: "sm", color: "#555555", flex: 2, weight: "bold" },
                            { type: "text", text: request.project || "-", size: "sm", color: "#111111", flex: 4, wrap: true }
                        ],
                        margin: "md"
                    },
                    {
                        type: "box",
                        layout: "horizontal",
                        contents: [
                            { type: "text", text: "สถานที่", size: "sm", color: "#555555", flex: 2, weight: "bold" },
                            { type: "text", text: request.location, size: "sm", color: "#111111", flex: 4, wrap: true }
                        ],
                        margin: "md"
                    },
                    {
                        type: "box",
                        layout: "horizontal",
                        contents: [
                            { type: "text", text: "วันที่", size: "sm", color: "#555555", flex: 2, weight: "bold" },
                            {
                                type: "text",
                                text: `${new Date(request.usageDate).toLocaleDateString("th-TH", { day: '2-digit', month: '2-digit', year: 'numeric' })} - ${request.endDate ? new Date(request.endDate).toLocaleDateString("th-TH", { day: '2-digit', month: '2-digit', year: 'numeric' }) : new Date(request.usageDate).toLocaleDateString("th-TH", { day: '2-digit', month: '2-digit', year: 'numeric' })}`,
                                size: "sm",
                                color: "#111111",
                                flex: 4,
                                wrap: true
                            }
                        ],
                        margin: "md"
                    },
                    {
                        type: "box",
                        layout: "horizontal",
                        contents: [
                            { type: "text", text: "เวลา", size: "sm", color: "#555555", flex: 2, weight: "bold" },
                            { type: "text", text: request.usageTime || "-", size: "sm", color: "#111111", flex: 4, wrap: true }
                        ],
                        margin: "md"
                    },
                    {
                        type: "box",
                        layout: "horizontal",
                        contents: [
                            { type: "text", text: "โทร.", size: "sm", color: "#555555", flex: 2, weight: "bold" },
                            { type: "text", text: request.contact, size: "sm", color: "#111111", flex: 4, wrap: true }
                        ],
                        margin: "md"
                    },
                    {
                        type: "box",
                        layout: "horizontal",
                        contents: [
                            { type: "text", text: "รายละเอียด", size: "sm", color: "#555555", flex: 2, weight: "bold" },
                            { type: "text", text: request.details || "-", size: "sm", color: "#111111", flex: 4, wrap: true }
                        ],
                        margin: "md"
                    }
                ]
            },

        }
    };

    try {
        const response = await fetch("https://api.line.me/v2/bot/message/push", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`,
            },
            body: JSON.stringify({
                to: targetId,
                messages: [flexMessage],
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error("Failed to send LINE Flex Message:", errorData);
        } else {
            console.log("LINE Flex Message sent successfully.");
        }
    } catch (error) {
        console.error("Error sending LINE Flex Message:", error);
    }
};

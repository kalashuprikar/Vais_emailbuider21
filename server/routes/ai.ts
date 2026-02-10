import { RequestHandler } from "express";

export const handleAIEmailTemplate: RequestHandler = async (req, res) => {
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: "Prompt is required" });
  }

  try {
    // System prompt to instruct Ollama to return structured JSON for email blocks
    const systemPrompt = `You are an AI Email Builder. Your task is to generate a structured email template based on the user's request.
The user wants you to build a template for: "${prompt}"

Available Block Types and their specific JSON structures:
1. title: { "type": "title", "content": "Text", "fontSize": 32, "fontColor": "#000", "alignment": "center", "fontWeight": "bold" }
2. text: { "type": "text", "content": "Longer text description", "fontSize": 16, "fontColor": "#444", "alignment": "left" }
3. button: { "type": "button", "text": "Label", "link": "https://...", "backgroundColor": "#FF6A00", "textColor": "#fff", "borderRadius": 8 }
4. image: { "type": "image", "src": "https://...", "alt": "Description" }
5. divider: { "type": "divider", "color": "#eee", "height": 1 }
6. spacer: { "type": "spacer", "height": 20 }
7. logo: { "type": "logo", "src": "https://...", "width": 150, "alignment": "center" }
8. footer-with-social: { "type": "footer-with-social", "enterpriseName": { "content": "Name" }, "social": { "platforms": [{ "name": "Facebook", "url": "#" }] } }
9. stats: { "type": "stats", "stats": [{ "value": "100+", "label": "Users" }] }
10. features: { "type": "features", "features": [{ "title": "Speed", "description": "Fast generation" }], "columnsCount": 3 }

Rules:
- Generate a logical sequence of blocks that makes a beautiful email.
- For a "newsletter", include a logo, header image, title, intro text, 2-3 sections, and a footer.
- For a "product promo", focus on the image, price/offer title, and a strong call-to-action button.
- For a "welcome email", keep it warm and personal with a clear next step.

Return ONLY a JSON object:
{
  "message": "Friendly explanation of the generated template",
  "blocks": [...]
}

IMPORTANT: Return ONLY the JSON object. No markdown, no conversational text before or after the JSON.`;

    const ollamaResponse = await fetch("https://vaismodel.valasys.ai/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama3", // Assuming llama3 is available, or use a generic one if known
        prompt: systemPrompt,
        stream: false,
        format: "json", // Instruct Ollama to return JSON
      }),
    });

    if (!ollamaResponse.ok) {
      throw new Error(`Ollama API error: ${ollamaResponse.statusText}`);
    }

    const data = await ollamaResponse.json();

    // Parse the generated text as JSON
    let result;
    try {
      result = JSON.parse(data.response);
    } catch (e) {
      console.error("Failed to parse Ollama response as JSON:", data.response);
      throw new Error("Invalid response format from AI model");
    }

    res.json(result);
  } catch (error) {
    console.error("AI Generation Error:", error);

    // Fallback to local logic if Ollama fails or for safety
    let blocks: any[] = [];
    let message = "I've generated a template for you (Fallback Mode).";

    const promptLower = prompt.toLowerCase();

    if (promptLower.includes("image") && (promptLower.includes("hero") || promptLower.includes("header"))) {
      message = "I've added the requested image to your hero section.";
      const heroImage = promptLower.includes("new") || promptLower.includes("latest")
        ? "https://cdn.builder.io/api/v1/image/assets%2F29e1153dc01141dc90b150d02a5a23e3%2Ffbbe18f9deb14797824f83bf408fdd75?format=webp&width=800&height=1200"
        : "https://cdn.builder.io/api/v1/image/assets%2F29e1153dc01141dc90b150d02a5a23e3%2F28ab786bd5ec4988b4be0f78bf7534d4?format=webp&width=800&height=1200";

      blocks = [
        {
          type: "image",
          id: `ai-${Date.now()}-1`,
          src: heroImage,
          alt: "Hero Image",
          width: 100,
          widthUnit: "%",
          padding: 0,
        },
        {
          type: "title",
          id: `ai-${Date.now()}-2`,
          content: "Elevate Your Brand",
          fontSize: 36,
          alignment: "center",
          padding: 20,
        }
      ];
    } else if (promptLower.includes("welcome") || promptLower.includes("onboarding")) {
      message = "Here is a professional welcome email template.";
      blocks = [
        {
          type: "title",
          id: `ai-${Date.now()}-1`,
          content: "Welcome to Our Community!",
          fontSize: 32,
          fontColor: "#1a1a1a",
          alignment: "center",
          fontWeight: "bold",
          padding: 20,
        },
        {
          type: "text",
          id: `ai-${Date.now()}-2`,
          content: "We're thrilled to have you here. This journey is just beginning, and we can't wait to show you what we've built for you.",
          fontSize: 16,
          fontColor: "#4a4a4a",
          alignment: "center",
          padding: 20,
        },
        {
          type: "button",
          id: `ai-${Date.now()}-3`,
          text: "Get Started Now",
          link: "https://example.com",
          backgroundColor: "#FF6A00",
          textColor: "#ffffff",
          alignment: "center",
          padding: 20,
          borderRadius: 8,
        }
      ];
    } else if (promptLower.includes("newsletter") || promptLower.includes("build") || promptLower.includes("update")) {
      message = "I've built a comprehensive newsletter template for you.";
      blocks = [
        {
          type: "logo",
          id: `ai-${Date.now()}-0`,
          src: "",
          alt: "Logo",
          width: 150,
          alignment: "center",
          padding: 20,
        },
        {
          type: "image",
          id: `ai-${Date.now()}-1`,
          src: "https://cdn.builder.io/api/v1/image/assets%2Ff175eb92de704327bb52162c1cf84ff3%2Fecb6a5ee790e40ecb44aa7d9621b5985?format=webp&width=800",
          alt: "Newsletter Header",
          width: 100,
          widthUnit: "%",
          padding: 0,
        },
        {
          type: "title",
          id: `ai-${Date.now()}-2`,
          content: "Monthly Insights & Updates",
          fontSize: 32,
          fontColor: "#1a1a1a",
          alignment: "center",
          fontWeight: "bold",
          padding: 30,
        },
        {
          type: "text",
          id: `ai-${Date.now()}-3`,
          content: "Welcome to this month's edition of our newsletter! We have some exciting news to share, including new feature launches and some great tips to help you get the most out of our platform.",
          fontSize: 16,
          fontColor: "#4a4a4a",
          alignment: "left",
          padding: 20,
        },
        {
          type: "divider",
          id: `ai-${Date.now()}-4`,
          color: "#eeeeee",
          height: 1,
          margin: 20,
        },
        {
          type: "title",
          id: `ai-${Date.now()}-5`,
          content: "Top Feature of the Month",
          fontSize: 24,
          fontColor: "#1a1a1a",
          alignment: "left",
          fontWeight: "bold",
          padding: 20,
        },
        {
          type: "text",
          id: `ai-${Date.now()}-6`,
          content: "Our new AI Assistant is now live! You can build beautiful newsletters in seconds just by describing what you want. It's designed to save you hours of manual work.",
          fontSize: 14,
          fontColor: "#666666",
          alignment: "left",
          padding: 20,
        },
        {
          type: "button",
          id: `ai-${Date.now()}-7`,
          text: "Try It Now",
          link: "https://example.com/ai",
          backgroundColor: "#FF6A00",
          textColor: "#ffffff",
          alignment: "center",
          padding: 20,
          borderRadius: 8,
        },
        {
          type: "spacer",
          id: `ai-${Date.now()}-8`,
          height: 40,
        },
        {
          type: "footer-with-social",
          id: `ai-${Date.now()}-9`,
          social: {
            platforms: [
              { name: "Facebook", url: "#", icon: "facebook" },
              { name: "Instagram", url: "#", icon: "instagram" },
              { name: "LinkedIn", url: "#", icon: "linkedin" }
            ],
            size: "small",
            alignment: "center",
            spacing: 10,
          },
          enterpriseName: { content: "Valasys AI" },
          address: { content: "123 Innovation Way, Tech City" },
          subscriptionText: { content: "You're receiving this because you subscribed to our updates." },
          unsubscribeLink: { text: "Unsubscribe", url: "#" }
        }
      ];
    } else if (promptLower.includes("product") || promptLower.includes("sale") || promptLower.includes("offer")) {
      message = "Here is a product promotion template.";
      blocks = [
        {
          type: "title",
          id: `ai-${Date.now()}-1`,
          content: "Special Offer Just for You!",
          fontSize: 30,
          fontColor: "#d32f2f",
          alignment: "center",
          fontWeight: "bold",
          padding: 20,
        },
        {
          type: "text",
          id: `ai-${Date.now()}-2`,
          content: "Don't miss out on our limited time offer. Save up to 50% on all new arrivals this weekend only.",
          fontSize: 18,
          fontColor: "#333333",
          alignment: "center",
          padding: 20,
        },
        {
          type: "button",
          id: `ai-${Date.now()}-3`,
          text: "Shop the Sale",
          link: "https://example.com/sale",
          backgroundColor: "#d32f2f",
          textColor: "#ffffff",
          alignment: "center",
          padding: 15,
          borderRadius: 4,
        }
      ];
    } else {
      // Default generic response
      message = "I've generated some blocks based on your instructions.";
      blocks = [
        {
          type: "title",
          id: `ai-${Date.now()}-1`,
          content: "Your Custom Email Section",
          fontSize: 24,
          fontColor: "#1a1a1a",
          alignment: "left",
          fontWeight: "bold",
          padding: 20,
        },
        {
          type: "text",
          id: `ai-${Date.now()}-2`,
          content: "This section was generated based on your prompt: '" + prompt + "'. You can further customize it using the editor.",
          fontSize: 14,
          fontColor: "#4a4a4a",
          alignment: "left",
          padding: 20,
        }
      ];
    }

    res.json({ message, blocks });
  }
};

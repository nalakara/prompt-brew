export const refinePrompt = async (
  prompt: string,
  model: string,
  purpose: string,
  language: string,
  apiKey?: string,
  customContext?: string
): Promise<string> => {
  if (!prompt) {
    return "";
  }

  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (apiKey && apiKey.trim()) {
      headers["x-gemini-key"] = apiKey.trim();
    }

    const response = await fetch("/api/gemini/refine", {
      method: "POST",
      headers,
      body: JSON.stringify({
        prompt,
        model,
        purpose,
        language,
        customContext,
      }),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || `HTTP error ${response.status}`);
    }

    const data = await response.json();
    return data.refinedPrompt || "";
  } catch (error) {
    console.error("Client side refinement fetch failed:", error);
    throw new Error("Failed to communicate with the refinement API.");
  }
};

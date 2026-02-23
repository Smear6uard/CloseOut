import { v } from "convex/values";
import { action } from "./_generated/server";
import { internal } from "./_generated/api";
import OpenAI from "openai";

const openai = new OpenAI();

export const classifyDefectPhoto = action({
  args: {
    punchItemId: v.id("punchItems"),
    defectPhotoId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    try {
      const photoUrl = await ctx.storage.getUrl(args.defectPhotoId);
      if (!photoUrl) {
        console.error("Photo not found for classification");
        return;
      }

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Analyze this construction defect photo. Return a JSON array of tags describing the defect. Tags should be short (1-3 words) and relevant to construction (e.g., "crack", "water damage", "missing fixture", "paint defect", "electrical issue"). Return ONLY a JSON array of strings, no other text. Example: ["crack", "concrete damage", "structural"]`,
              },
              {
                type: "image_url",
                image_url: { url: photoUrl },
              },
            ],
          },
        ],
        max_tokens: 200,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) return;

      const tags: string[] = JSON.parse(content);
      if (!Array.isArray(tags)) return;

      await ctx.runMutation(internal.punchItems.updateAiTags, {
        punchItemId: args.punchItemId,
        aiTags: tags.map(String),
      });
    } catch (error) {
      console.error("Failed to classify defect photo:", error);
    }
  },
});

export const comparePhotos = action({
  args: {
    punchItemId: v.id("punchItems"),
    defectPhotoId: v.id("_storage"),
    completionPhotoId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    try {
      const defectUrl = await ctx.storage.getUrl(args.defectPhotoId);
      const completionUrl = await ctx.storage.getUrl(args.completionPhotoId);
      if (!defectUrl || !completionUrl) {
        console.error("Photo(s) not found for comparison");
        return;
      }

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Compare these two construction photos. The first shows a defect, the second shows the repair/completion. Determine if the defect has been properly addressed. Return ONLY a JSON object with these fields:
- "match": boolean (true if the defect appears to be fixed)
- "confidence": number between 0 and 1
- "summary": string (1-2 sentence description of the comparison)

Example: {"match": true, "confidence": 0.85, "summary": "The crack in the drywall has been properly patched and painted. The repair appears complete."}`,
              },
              {
                type: "image_url",
                image_url: { url: defectUrl },
              },
              {
                type: "image_url",
                image_url: { url: completionUrl },
              },
            ],
          },
        ],
        max_tokens: 300,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) return;

      const result = JSON.parse(content);
      if (
        typeof result.match !== "boolean" ||
        typeof result.confidence !== "number" ||
        typeof result.summary !== "string"
      ) {
        return;
      }

      await ctx.runMutation(internal.punchItems.updateAiComparison, {
        punchItemId: args.punchItemId,
        aiComparisonResult: {
          match: result.match,
          confidence: result.confidence,
          summary: result.summary,
        },
      });
    } catch (error) {
      console.error("Failed to compare photos:", error);
    }
  },
});

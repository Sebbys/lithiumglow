// MiniMax AI client for meal plan generation
// Uses Anthropic-compatible API

interface Message {
  role: "user" | "assistant";
  content: Array<{
    type: "text" | "thinking";
    text?: string;
    thinking?: string;
  }>;
}

interface MiniMaxResponse {
  id: string;
  type: string;
  role: string;
  content: Array<{
    type: "text" | "thinking";
    text?: string;
    thinking?: string;
  }>;
  model: string;
  stop_reason: string;
  usage: {
    input_tokens: number;
    output_tokens: number;
  };
}

export class MiniMaxClient {
  private baseUrl = "https://api.minimax.io/anthropic";
  private apiKey: string;
  private model = "MiniMax-M2";

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.MINIMAX_API_KEY || "";
    if (!this.apiKey) {
      throw new Error("MINIMAX_API_KEY is not set in environment variables");
    }
  }

  async createMessage(
    messages: Message[],
    system?: string,
    maxTokens: number = 2000,
    temperature: number = 0.7
  ): Promise<MiniMaxResponse> {
    const response = await fetch(`${this.baseUrl}/v1/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "anthropic-version": "2023-06-01",
        "x-api-key": this.apiKey,
      },
      body: JSON.stringify({
        model: this.model,
        max_tokens: maxTokens,
        temperature,
        system,
        messages,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`MiniMax API error: ${response.status} - ${error}`);
    }

    return response.json();
  }

  async generateMealPlan(params: {
    targetCalories: number;
    targetProtein: number;
    targetCarbs: number;
    targetFat: number;
    dietaryPreferences?: string;
    allergies?: string;
    availableIngredients: Array<{
      id: string;
      name: string;
      role: string;
      category: string;
      protein: number;
      carbs: number;
      fat: number;
      sugar?: number | null;
      fiber?: number | null;
      kcal: number;
      servingSizeG: number;
      servingLabel: string;
    }>;
  }): Promise<{
    mealPlan: Array<{
      dayNumber: number;
      notes: string;
      meals: Array<{
        mealType: "breakfast" | "lunch" | "dinner" | "snack";
        mealName: string;
        ingredients: Array<{
          ingredientId: string;
          quantity: number;
          preparationNote?: string;
        }>;
        notes: string;
      }>;
    }>;
    reasoning?: string;
  }> {
    const systemPrompt = `You are an expert nutritionist creating realistic meal plans with composed dishes.

Each meal should:
- Have a descriptive name (e.g., "Chicken Soba Veggie Bowl", "Greek Yogurt Parfait")
- Include 2-5 ingredients that work together culinarily
- Have preparation notes for each ingredient (e.g., "Grilled", "Sautéed", "Sliced")

Output ONLY valid JSON without markdown or extra text:
{
  "mealPlan": [
    {
      "dayNumber": 1,
      "notes": "Brief day note",
      "meals": [
        {
          "mealType": "breakfast",
          "mealName": "Greek Yogurt Parfait",
          "ingredients": [
            {"ingredientId": "id", "quantity": 200, "preparationNote": "Plain"},
            {"ingredientId": "id2", "quantity": 100, "preparationNote": "Sliced"}
          ],
          "notes": "Mix and serve cold"
        }
      ]
    }
  ]
}

Rules:
- NO trailing commas
- All brackets must close properly
- Meal names must be appetizing and descriptive
- Preparation notes should be cooking methods or descriptions`;

    // Group ingredients by category
    const groupedIngredients = params.availableIngredients.reduce((acc, ing) => {
      const category = ing.category || "other";
      if (!acc[category]) acc[category] = [];
      acc[category].push(`${ing.name} (${ing.id}): ${ing.protein}p/${ing.carbs}c/${ing.fat}f per ${ing.servingLabel}`);
      return acc;
    }, {} as Record<string, string[]>);

    const ingredientsList = Object.entries(groupedIngredients)
      .map(([category, items]) => `${category.toUpperCase()}:\n${items.join("\n")}`)
      .join("\n\n");

    const userPrompt = `Create a 7-day meal plan with composed meals:

Daily Targets: ${params.targetCalories} kcal, ${params.targetProtein}g protein, ${params.targetCarbs}g carbs, ${params.targetFat}g fat
${params.dietaryPreferences ? `Preferences: ${params.dietaryPreferences}` : ""}
${params.allergies ? `Avoid: ${params.allergies}` : ""}

Available Ingredients:
${ingredientsList}

Examples of good meal names:
- "Chicken Soba Veggie Bowl"
- "Greek Yogurt Berry Parfait"
- "Grilled Salmon Quinoa Plate"
- "Turkey Avocado Wrap"

Return ONLY the JSON. No markdown, no explanations.`;

    try {
      const response = await this.createMessage(
        [
          {
            role: "user",
            content: [{ type: "text", text: userPrompt }],
          },
        ],
        systemPrompt,
        8000, // Increased from 3000 to accommodate full 7-day plan
        0.7   // Reduced temperature for more focused output
      );

      // Extract text content
      let textContent = "";
      let reasoning = "";

      for (const block of response.content) {
        if (block.type === "thinking" && block.thinking) {
          reasoning = block.thinking;
        } else if (block.type === "text" && block.text) {
          textContent += block.text;
        }
      }

      // Parse JSON from response with improved error handling
      // Remove markdown code blocks
      textContent = textContent.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      
      // Try to extract JSON if wrapped in other text
      const jsonMatch = textContent.match(/\{[\s\S]*"mealPlan"[\s\S]*\}/);
      if (jsonMatch) {
        textContent = jsonMatch[0];
      }

      // Fix common JSON issues
      // Remove any trailing commas before closing braces/brackets
      textContent = textContent.replace(/,(\s*[}\]])/g, "$1");
      
      // Ensure strings are properly closed
      textContent = textContent.replace(/:\s*"([^"]*?)\\n/g, ': "$1"');
      
      // Check if JSON appears complete
      const openBraces = (textContent.match(/\{/g) || []).length;
      const closeBraces = (textContent.match(/\}/g) || []).length;
      const openBrackets = (textContent.match(/\[/g) || []).length;
      const closeBrackets = (textContent.match(/\]/g) || []).length;
      
      if (openBraces !== closeBraces || openBrackets !== closeBrackets) {
        console.error("JSON appears incomplete!");
        console.error(`Open braces: ${openBraces}, Close braces: ${closeBraces}`);
        console.error(`Open brackets: ${openBrackets}, Close brackets: ${closeBrackets}`);
        console.error("Content length:", textContent.length);
        
        // Try to close the JSON
        const missingCloseBraces = openBraces - closeBraces;
        const missingCloseBrackets = openBrackets - closeBrackets;
        
        for (let i = 0; i < missingCloseBrackets; i++) {
          textContent += ']';
        }
        for (let i = 0; i < missingCloseBraces; i++) {
          textContent += '}';
        }
        
        console.log("Attempted to fix JSON by adding missing brackets");
      }

      let parsedPlan;
      try {
        parsedPlan = JSON.parse(textContent);
      } catch (parseError) {
        console.error("JSON parsing failed.");
        console.error("First 1000 chars:", textContent.substring(0, 1000));
        console.error("Last 500 chars:", textContent.substring(Math.max(0, textContent.length - 500)));
        console.error("Total length:", textContent.length);
        
        // Try to find where the JSON was truncated
        const lastBracket = textContent.lastIndexOf('}');
        const lastArrayBracket = textContent.lastIndexOf(']');
        console.error("Last } at position:", lastBracket);
        console.error("Last ] at position:", lastArrayBracket);
        
        throw new Error(`Invalid JSON response: ${parseError instanceof Error ? parseError.message : "Unknown parsing error"}. JSON may have been truncated. Increase max_tokens or simplify the request.`);
      }

      if (!parsedPlan.mealPlan || !Array.isArray(parsedPlan.mealPlan)) {
        throw new Error("Response missing required 'mealPlan' array");
      }

      return {
        mealPlan: parsedPlan.mealPlan,
        reasoning: reasoning || undefined,
      };
    } catch (error) {
      console.error("Error generating meal plan:", error);
      throw new Error(
        `Failed to generate meal plan: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  async suggestMealImprovements(params: {
    currentMeal: {
      ingredients: Array<{
        name: string;
        quantity: number;
        protein: number;
        carbs: number;
        fat: number;
      }>;
      mealType: string;
    };
    targetMacros: {
      protein: number;
      carbs: number;
      fat: number;
    };
    availableIngredients: Array<{
      id: string;
      name: string;
      protein: number;
      carbs: number;
      fat: number;
    }>;
  }): Promise<{
    suggestions: string;
    reasoning?: string;
  }> {
    const systemPrompt = `You are an expert nutritionist providing practical meal improvement suggestions.`;

    const userPrompt = `I have a ${params.currentMeal.mealType} with these ingredients:
${params.currentMeal.ingredients.map((ing) => `- ${ing.quantity}g ${ing.name}`).join("\n")}

Target macros: ${params.targetMacros.protein}g protein, ${params.targetMacros.carbs}g carbs, ${params.targetMacros.fat}g fat

Available ingredients for substitution or addition:
${params.availableIngredients.map((ing) => `- ${ing.name}`).join("\n")}

Suggest practical improvements to better hit the macro targets while keeping it tasty and realistic.`;

    try {
      const response = await this.createMessage(
        [
          {
            role: "user",
            content: [{ type: "text", text: userPrompt }],
          },
        ],
        systemPrompt,
        1000,
        0.7
      );

      let textContent = "";
      let reasoning = "";

      for (const block of response.content) {
        if (block.type === "thinking" && block.thinking) {
          reasoning = block.thinking;
        } else if (block.type === "text" && block.text) {
          textContent += block.text;
        }
      }

      return {
        suggestions: textContent,
        reasoning: reasoning || undefined,
      };
    } catch (error) {
      console.error("Error getting suggestions:", error);
      throw error;
    }
  }
}

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { Response } from './types/response';

const systemPrompt = `
Today's date: ${new Date().toLocaleDateString()}.

You will receive a class schedule in text format.
Your task is to convert that schedule into a **strictly valid JSON object** with the following structure:

{
  "is_valid": boolean,           // true if every lesson contains both "meet" (Zoom link) and "start" (start time), otherwise false
  "start_date": string | null,   // date of the first lesson (ISO format), or null if unknown
  "lessons": [
    {
      "teacher_name": string | null,
      "meet": string | null,     // Zoom link (required)
      "start": string | null,    // start time in ISO format "YYYY-MM-DDTHH:mm" (required)
      "end": string | null,      // end time in ISO format "YYYY-MM-DDTHH:mm"
      "subject": string | null
    }
  ]
}

📘 Rules:
1. Dates and times must always be valid and parsable by JavaScript new Date().
2. If a weekday and date are specified (e.g., "Monday 22.09.2025"), use that exact date.
3. If only a weekday is given:
   - If today is Monday–Wednesday → assume this week.
   - If today is Saturday or Sunday → assume next week.
4. Calculate the correct date for each weekday based on these rules.
5. If some information is missing, use null.
6. "meet" and "start" are mandatory for a lesson to be valid.
   - If all lessons contain valid "meet" and "start" → is_valid = true.
   - If at least one is missing → is_valid = false.
7. Return **only** the JSON object — no code fences, no markdown, no explanations, no comments.
8. The output **must be a valid JSON object** that can be parsed with JSON.parse() without errors.
`;

@Injectable()
export class OpenAIService {
  public openai: OpenAI;
  constructor(configService: ConfigService) {
    this.openai = new OpenAI({
      apiKey: configService.get('OPEN_AI_API_KEY'),
    });
  }

  async generate(prompt: string): Promise<Response | null> {
    const response = await this.openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt },
      ],
    });
    const content = response.choices[0].message.content;

    if (content) return JSON.parse(content);

    return null;
  }
}

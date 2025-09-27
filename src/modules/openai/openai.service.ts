import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { Response } from './types/response';

const date = new Date().toLocaleDateString();
const systemPrompt = `Today's date: ${date}.
I will give you the schedule text.
Convert each lesson into the following JSON structure:

{
  is_valid: boolean,   // true if all lessons contain both "meet" and "start", false if at least one lesson is missing "meet" or "start"
  start_date: string | null, // first lessons date, i.e. the date on which lessons begin
  lessons: [
    {
      teacher_name: string | null,
      meet: string | null,        // Zoom link for that lesson only (required)
      start: string | null,       // ISO format "YYYY-MM-DDTHH:mm" (required, must work with new Date())
      end: string | null,         // ISO format "YYYY-MM-DDTHH:mm"
      subject: string | null
    }
  ]
}

Rules:
- "start" and "end" must always be in valid ISO format (compatible with new Date()).
- If the schedule specifies a weekday with an exact date (e.g., "Monday 22.09.2025"), use that date.
- If only a weekday is given:
  * If today is Monday, Tuesday, or Wednesday → assume this week.
  * If today is Saturday or Sunday → assume the next week.
- Calculate the correct date for each weekday based on the given or inferred week.
- If some information is missing, put null instead.
- "meet" and "start" are mandatory fields:
  * If all lessons contain valid "meet" and "start", set is_valid = true.
  * If at least one lesson is missing "meet" or "start", set is_valid = false.
- Return only the JSON object (not explanations, no comments).
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
      model: 'gpt-4o-mini',
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

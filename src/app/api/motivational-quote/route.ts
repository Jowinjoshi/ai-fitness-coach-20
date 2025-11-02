import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function GET() {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      // Return a default quote if no API key
      return NextResponse.json({
        quote: 'The only bad workout is the one that didn\'t happen.'
      });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    const prompt = 'Generate a short, powerful, and inspiring fitness motivational quote. Just return the quote text without any additional formatting or explanation. Keep it under 100 characters.';

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const quote = response.text().trim().replace(/^["']|["']$/g, '');

    return NextResponse.json({ quote });
  } catch (error) {
    console.error('Error generating quote:', error);
    return NextResponse.json({
      quote: 'Success starts with a single step. Take yours today!'
    });
  }
}
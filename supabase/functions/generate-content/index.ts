
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { ageGroup, subject, contentType, userId } = await req.json();
    
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
    if (!geminiApiKey) {
      throw new Error('GEMINI_API_KEY not configured');
    }

    // Create prompt based on content type
    const prompt = createPrompt(ageGroup, subject, contentType);
    
    // Call Gemini API
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      }),
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.statusText}`);
    }

    const data = await response.json();
    const generatedContent = data.candidates[0].content.parts[0].text;

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Store in database
    const { error: dbError } = await supabase
      .from('educational_content')
      .insert([{
        user_id: userId,
        age_group: parseInt(ageGroup),
        subject: subject,
        content_type: contentType.toLowerCase(),
        content: generatedContent
      }]);

    if (dbError) {
      console.error('Database error:', dbError);
      throw new Error('Failed to save content to database');
    }

    return new Response(JSON.stringify({ 
      content: generatedContent,
      success: true 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-content function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function createPrompt(ageGroup: string, subject: string, contentType: string): string {
  const basePrompt = `Create educational content for ${ageGroup}-year-old children about ${subject}.`;
  
  switch (contentType.toLowerCase()) {
    case 'story':
      return `${basePrompt} Write an engaging, age-appropriate story that teaches key concepts in ${subject}. The story should be fun, include relatable characters, and help children understand the subject better. Keep it around 200-300 words.`;
    
    case 'practice questions':
      return `${basePrompt} Create 5 practice questions that are appropriate for ${ageGroup}-year-old children learning ${subject}. Include a mix of easy and slightly challenging questions. Format them as a numbered list.`;
    
    case 'simple explanation':
      return `${basePrompt} Provide a simple, clear explanation of basic ${subject} concepts that ${ageGroup}-year-old children can easily understand. Use everyday examples and simple language. Keep it around 150-200 words.`;
    
    case 'fun activities':
      return `${basePrompt} Suggest 5 fun, hands-on activities that ${ageGroup}-year-old children can do to learn ${subject}. Include materials needed and simple instructions. Make them engaging and interactive.`;
    
    case 'learning games':
      return `${basePrompt} Design 3-5 educational games that teach ${subject} concepts to ${ageGroup}-year-old children. Include game rules, objectives, and how they help with learning. Make them fun and easy to understand.`;
    
    default:
      return `${basePrompt} Create helpful educational content about ${subject} that is appropriate and engaging for ${ageGroup}-year-old children.`;
  }
}

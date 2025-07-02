import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders
    });
  }

  try {
    const { ageGroup, subject, contentType, userId } = await req.json();
    
    // Enhanced input validation
    if (!ageGroup || !subject || !contentType || !userId) {
      throw new Error('Missing required fields: ageGroup, subject, contentType, userId');
    }

    // Validate and parse age group
    const parsedAgeGroup = parseInt(ageGroup);
    if (isNaN(parsedAgeGroup) || parsedAgeGroup < 3 || parsedAgeGroup > 20) {
      throw new Error('Invalid age group. Must be a number between 3 and 20');
    }

    // Validate content type
    const validContentTypes = ['story', 'practice questions', 'simple explanation', 'fun activities', 'learning games'];
    const normalizedContentType = contentType.toLowerCase().trim();
    if (!validContentTypes.includes(normalizedContentType)) {
      throw new Error(`Invalid content type. Must be one of: ${validContentTypes.join(', ')}`);
    }

    // Validate subject (basic check)
    if (typeof subject !== 'string' || subject.trim().length === 0) {
      throw new Error('Subject must be a non-empty string');
    }

    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      throw new Error('OPENAI_API_KEY not configured');
    }

    // Create prompt based on content type
    const prompt = createPrompt(parsedAgeGroup, subject.trim(), normalizedContentType);
    console.log('Generated prompt:', prompt);

    // Call OpenAI API (gpt-3.5-turbo)
    let response;
    try {
      response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openaiApiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            { role: 'system', content: 'You are a helpful educational content generator for children.' },
            { role: 'user', content: prompt }
          ],
          temperature: 0.7,
          max_tokens: 1000,
          top_p: 0.8
        })
      });
    } catch (error) {
      throw new Error('Failed to call OpenAI API: ' + error.message);
    }

    if (!response || !response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('OpenAI response:', data);

    if (!data.choices || !data.choices[0] || !data.choices[0].message || !data.choices[0].message.content) {
      throw new Error('Invalid response from OpenAI API');
    }

    const generatedContent = data.choices[0].message.content;
    
    // Validate generated content
    if (!generatedContent || generatedContent.trim().length === 0) {
      throw new Error('Generated content is empty');
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Supabase configuration missing');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      },
      db: {
        schema: 'public'
      }
    });

    // Validate userId format (should be UUID)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(userId)) {
      throw new Error('Invalid userId format. Must be a valid UUID.');
    }

    // Prepare data for insertion with proper validation
    const insertData = {
      user_id: userId,
      age_group: parsedAgeGroup,
      subject: subject.trim(),
      content_type: normalizedContentType,
      content: generatedContent.trim()
      // Remove created_at - let the database handle it with default value
    };

    console.log('Inserting data:', JSON.stringify(insertData, null, 2));

    // First, let's try to check if the user exists or if there are RLS issues
    // Test connection to Supabase
    const { data: testData, error: testError } = await supabase
      .from('educational_content')
      .select('count(*)')
      .limit(1);

    if (testError) {
      console.error('Supabase connection test failed:', testError);
      throw new Error(`Database connection failed: ${testError.message}`);
    }

    console.log('Database connection test successful');

    // Store in database with better error handling
    const { data: insertedData, error: dbError } = await supabase
      .from('educational_content')
      .insert([insertData])
      .select(); // Return the inserted data

    if (dbError) {
      console.error('Database error details:', {
        message: dbError.message,
        code: dbError.code,
        details: dbError.details,
        hint: dbError.hint
      });
      
      // Provide more specific error messages based on common issues
      let errorMessage = 'Failed to save content to database';
      if (dbError.code === '23514') {
        errorMessage = 'Data validation failed. Please check age group, subject, and content type values.';
      } else if (dbError.code === '23505') {
        errorMessage = 'Duplicate content detected.';
      } else if (dbError.code === '23503') {
        errorMessage = 'Invalid user ID or foreign key constraint violation.';
      }
      
      throw new Error(`${errorMessage}: ${dbError.message}`);
    }

    console.log('Successfully inserted data:', insertedData);

    return new Response(JSON.stringify({
      content: generatedContent,
      success: true,
      id: insertedData?.[0]?.id || null
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });

  } catch (error) {
    console.error('Error in generate-content function:', error);
    return new Response(JSON.stringify({
      error: error.message,
      success: false
    }), {
      status: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  }
});

function createPrompt(ageGroup, subject, contentType) {
  const basePrompt = `Create educational content for ${ageGroup}-year-old children about ${subject}.`;
  
  switch (contentType) {
    case 'story':
      return `${basePrompt} Write an engaging, age-appropriate story that teaches key concepts in ${subject}. The story should be fun, include relatable characters, and help children understand the subject better. Keep it around 200-300 words. Make sure the content is appropriate for ${ageGroup}-year-olds.`;
      
    case 'practice questions':
      return `${basePrompt} Create 5 practice questions that are appropriate for ${ageGroup}-year-old children learning ${subject}. Include a mix of easy and slightly challenging questions. Format them as a numbered list with clear, simple language.`;
      
    case 'simple explanation':
      return `${basePrompt} Provide a simple, clear explanation of basic ${subject} concepts that ${ageGroup}-year-old children can easily understand. Use everyday examples and simple language appropriate for their age level. Keep it around 150-200 words.`;
      
    case 'fun activities':
      return `${basePrompt} Suggest 5 fun, hands-on activities that ${ageGroup}-year-old children can do to learn ${subject}. Include materials needed and simple instructions. Make them engaging, interactive, and safe for their age group.`;
      
    case 'learning games':
      return `${basePrompt} Design 3-5 educational games that teach ${subject} concepts to ${ageGroup}-year-old children. Include game rules, objectives, and how they help with learning. Make them fun, easy to understand, and appropriate for their developmental level.`;
      
    default:
      return `${basePrompt} Create helpful educational content about ${subject} that is appropriate and engaging for ${ageGroup}-year-old children. Focus on age-appropriate language and concepts.`;
  }
}

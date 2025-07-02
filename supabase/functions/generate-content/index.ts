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
    const body = await req.json();
    const { ageGroup, subject, contentType, userId } = body;
    
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

    const perplexityApiKey = Deno.env.get('PERPLEXITY_API_KEY');
    if (!perplexityApiKey) {
      throw new Error('PERPLEXITY_API_KEY not configured');
    }

    // Map UI content types to allowed DB values
    const typeMap: Record<string, string> = {
      'story': 'story',
      'practice questions': 'question',
      'simple explanation': 'explanation',
      'fun activities': 'story', // fallback mapping
      'learning games': 'story'  // fallback mapping
    };
    const mappedContentType = typeMap[normalizedContentType] || 'story';

    // Create prompt based on content type
    const prompt = createPrompt(parsedAgeGroup, subject.trim(), normalizedContentType);
    console.log('Generated prompt:', prompt);

    // --- Prompt Engineering Functions ---
    function getSystemPrompt() {
      return `
You are an expert AI educator that creates highly engaging, accurate, and age-appropriate educational content for children aged 3 to 20.

🎯 Instructions for generating content:

1. **ageGroup**:
   - Tailor sentence length, vocabulary, and examples to this age.
   - Children under 10 benefit from shorter sentences, emojis 🎉, and storytelling.
   - Teens may appreciate real-world examples, structured explanations, and interactive tone.

2. **subject**:
   - Deliver knowledge in a fun yet educational manner (e.g., Math, Science, Hindi, etc.).

3. **contentType** _(default: "simple explanation")_:
   - "story": Narrative with fun characters and subtle lessons.
   - "practice questions": List of 5 relevant questions with answers.
   - "simple explanation": Concept breakdown with relatable examples.
   - "fun activities": 3–5 interactive ideas using simple materials.
   - "learning games": Creative game concepts to reinforce learning.

4. **tone** _(default: "formal")_:
   - Match tone to age and contentType. Options include: "fun", "playful", "academic", "story-based", etc.

5. **language** _(default: "English")_:
   - All output should be written in the specified language.

6. **includeQuiz** _(default: false)_:
   - If true, include 2–3 short quiz questions **with answers** at the end.

7. **customInstructions** _(optional)_:
   - Additional user-specified notes to follow (e.g., “Use animal characters”, “Include a moral”, “Make it rhyme”).

🧠 Your content must be:
- Age-appropriate and well-paced
- Educational, fun, and clear
- Never exceed 300 words unless explicitly requested
- Always follow the format shown in examples below
`;
    }

    function getUserPrompt(payload: any) {
      const {
        ageGroup,
        subject,
        contentType = "simple explanation",
        tone = "formal",
        language = "English",
        includeQuiz = false,
        customInstructions = ""
      } = payload;

      let prompt = `Generate a ${contentType} for a ${ageGroup}-year-old child about "${subject}" in ${language} using a ${tone} tone.`;
      if (includeQuiz) {
        prompt += ` Include a short 2–3 question quiz with answers.`;
      }
      if (customInstructions) {
        prompt += ` Additional instructions: ${customInstructions}`;
      }
      return prompt;
    }

    function getFewShotExamples() {
      return [
        // EXAMPLE 1 – English / Story / Age 5 / Fun / With Quiz
        {
          role: "user",
          content: `Generate a story for a 5-year-old child about "Water Cycle" in English using a fun tone. Include a quiz.`
        },
        {
          role: "assistant",
          content: `💧 *Wally the Water Drop's Big Adventure* 🌧\n\nWally the Water Drop lived in a fluffy cloud. One day, he fell down as rain 🌧 and landed in a river. "Wheee!" he shouted. Then, the sun ☀ came out and warmed him up. Wally turned into steam and floated back into the sky!\n\nThat's how the water cycle works — rain, river, sun, and back to the clouds! 🌈\n\n---\n\n📝 *Quiz Time!*\n1. What is the name of the water drop? ➤ Wally  \n2. Where did Wally fall from? ➤ A cloud ☁  \n3. What turned Wally into steam? ➤ The Sun ☀`
        },

        // EXAMPLE 2 – English / Practice Questions / Age 10 / Academic / With Quiz
        {
          role: "user",
          content: `Generate practice questions for a 10-year-old about "Fractions" in English using an academic tone. Include a quiz.`
        },
        {
          role: "assistant",
          content: `📚 *Practice Questions on Fractions*\n\n1. What is 1/2 of 8? ➤ 4  \n2. Simplify the fraction 4/8 ➤ 1/2  \n3. What is the denominator in 3/5? ➤ 5  \n4. Which is larger: 2/3 or 3/4? ➤ 3/4  \n5. Write 0.75 as a fraction ➤ 3/4\n\n---\n\n📝 *Quick Quiz*\n1. What’s the simplified form of 6/9? ➤ 2/3  \n2. Which fraction means “half”? ➤ 1/2`
        },

        // EXAMPLE 3 – English / Fun Activities / Age 14 / Playful / No Quiz
        {
          role: "user",
          content: `Generate fun activities for a 14-year-old about "Photosynthesis" in English using a playful tone.`
        },
        {
          role: "assistant",
          content: `🌿 *Photosynthesis Activities for Teens*\n\n1. *Leaf Diary* 📓  \n   Collect leaves from different plants and track their exposure to sunlight. Record their condition daily.\n\n2. *Chlorophyll Art* 🎨  \n   Mash spinach leaves and use the green pigment to make creative posters explaining the process.\n\n3. *DIY Oxygen Experiment* 🧪  \n   Place a water plant in a clear bowl under sunlight. Watch bubbles form — that’s oxygen!\n\n4. *Rap Battle: Plant Style* 🎤  \n   Write a short rap explaining photosynthesis and perform it in a fun session!\n\n5. *Time-lapse Lab* ⏱  \n   Take daily pictures of a growing plant and build a time-lapse video to present in class.`
        },

        // EXAMPLE 4 – Hindi / Story / Age 6 / Fun / With Quiz
        {
          role: "user",
          content: `Generate a story for a 6-year-old about "सौरमंडल" in Hindi using a fun tone. Include a quiz.`
        },
        {
          role: "assistant",
          content: `☀ *छोटा रोबोट और सौरमंडल की सैर* 🚀\n\nएक दिन छोटा रोबोट रॉकी ने अंतरिक्ष यान में उड़ान भरी। सबसे पहले वो सूरज के पास गया – "ओह, कितना गरम है!" 🔥 फिर वो बुध, शुक्र, पृथ्वी, मंगल… सब ग्रहों से मिला! हर ग्रह की खासियत जानकर वो बहुत खुश हुआ। 🌍🪐\n\nरॉकी ने सीखा कि हर ग्रह सूरज के चारों ओर घूमता है!\n\n---\n\n🧠 *प्रश्नोत्तरी*\n1. रॉकी कौन था? ➤ एक छोटा रोबोट 🤖  \n2. किसके चारों ओर ग्रह घूमते हैं? ➤ सूरज ☀  \n3. मंगल ग्रह का रंग कैसा होता है? ➤ लाल 🔴`
        },

        // EXAMPLE 5 – Hindi / Simple Explanation / Age 11 / Academic / With Quiz
        {
          role: "user",
          content: `Generate a simple explanation for an 11-year-old about "प्रजातंत्र (Democracy)" in Hindi using an academic tone. Include a quiz.`
        },
        {
          role: "assistant",
          content: `📘 *प्रजातंत्र क्या है?*\n\nप्रजातंत्र एक ऐसी प्रणाली है जहाँ लोग अपने नेता खुद चुनते हैं। इसमें हर व्यक्ति को वोट देने का अधिकार होता है। जैसे स्कूल में मॉनिटर चुनते हैं, वैसे ही देश के लिए प्रधानमंत्री चुना जाता है।\n\nहर व्यक्ति की आवाज़ मायने रखती है, और सबको समान अधिकार होते हैं।\n\n---\n\n📝 *प्रश्नोत्तरी*\n1. प्रजातंत्र में नेता कौन चुनता है? ➤ जनता  \n2. क्या हर व्यक्ति को वोट देने का अधिकार होता है? ➤ हाँ  \n3. स्कूल में मॉनिटर चुनना किस चीज़ से मिलता-जुलता है? ➤ चुनाव से`
        }
      ];
    }

    // Build Perplexity messages array
    // Accept richer content control from frontend/UI
    const tone = (body.tone && typeof body.tone === 'string') ? body.tone : 'formal';
    const language = (body.language && typeof body.language === 'string') ? body.language : 'English';
    const includeQuiz = (typeof body.includeQuiz === 'boolean') ? body.includeQuiz : false;
    const customInstructions = (body.customInstructions && typeof body.customInstructions === 'string') ? body.customInstructions : '';
    const payload = {
      ageGroup: parsedAgeGroup,
      subject: subject.trim(),
      contentType: normalizedContentType,
      tone,
      language,
      includeQuiz,
      customInstructions
    };

    const systemPrompt = getSystemPrompt();
    const userPrompt = getUserPrompt(payload);
    const fewShots = getFewShotExamples();
    const messages = [
      { role: 'system', content: systemPrompt },
      ...fewShots,
      { role: 'user', content: userPrompt }
    ];

    let response;
    try {
      response = await fetch('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${perplexityApiKey}`
        },
        body: JSON.stringify({
          model: 'sonar-pro',
          messages,
          temperature: 0.7,
          max_tokens: 1000,
          top_p: 0.8
        })
      });
    } catch (error) {
      throw new Error('Failed to call Perplexity API: ' + error.message);
    }

    if (!response || !response.ok) {
      const errorText = await response.text();
      throw new Error(`Perplexity API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('Perplexity response:', data);

    if (!data.choices || !data.choices[0] || !data.choices[0].message || !data.choices[0].message.content) {
      throw new Error('Invalid response from Perplexity API');
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
      content_type: mappedContentType,
      content: generatedContent.trim()
      // Remove created_at - let the database handle it with default value
    };

    console.log('Inserting data:', JSON.stringify(insertData, null, 2));

    // First, let's try to check if the user exists or if there are RLS issues
    // Test connection to Supabase
    const { error: testError } = await supabase
      .from('educational_content')
      .select('*')
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

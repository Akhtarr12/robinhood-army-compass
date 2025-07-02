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
    const { email, name, confirmationUrl } = await req.json();
    
    if (!email || !confirmationUrl) {
      throw new Error('Email and confirmation URL are required');
    }

    // Create an attractive HTML email template with Robin Hood theme
    const htmlTemplate = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to Robinhood Army!</title>
        <style>
            body {
                margin: 0;
                padding: 0;
                font-family: 'Arial', sans-serif;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: #333;
            }
            .container {
                max-width: 600px;
                margin: 0 auto;
                background: #ffffff;
                border-radius: 15px;
                overflow: hidden;
                box-shadow: 0 20px 40px rgba(0,0,0,0.1);
                margin-top: 40px;
                margin-bottom: 40px;
            }
            .header {
                background: linear-gradient(135deg, #2E8B57 0%, #3CB371 100%);
                padding: 40px 30px;
                text-align: center;
                color: white;
            }
            .logo {
                font-size: 2.5em;
                font-weight: bold;
                margin-bottom: 10px;
                text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
            }
            .tagline {
                font-size: 1.1em;
                opacity: 0.9;
                font-style: italic;
            }
            .content {
                padding: 40px 30px;
                line-height: 1.8;
            }
            .welcome-title {
                font-size: 2em;
                color: #2E8B57;
                margin-bottom: 20px;
                text-align: center;
            }
            .message {
                font-size: 1.1em;
                margin-bottom: 30px;
                color: #555;
            }
            .cta-button {
                display: inline-block;
                background: linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%);
                color: white;
                padding: 15px 40px;
                text-decoration: none;
                border-radius: 50px;
                font-weight: bold;
                font-size: 1.1em;
                margin: 20px 0;
                box-shadow: 0 8px 20px rgba(255, 107, 107, 0.3);
                transition: all 0.3s ease;
            }
            .cta-button:hover {
                transform: translateY(-2px);
                box-shadow: 0 12px 25px rgba(255, 107, 107, 0.4);
            }
            .mission {
                background: #f8f9fa;
                padding: 25px;
                border-radius: 10px;
                margin: 25px 0;
                border-left: 5px solid #2E8B57;
            }
            .mission-title {
                font-weight: bold;
                color: #2E8B57;
                margin-bottom: 10px;
            }
            .footer {
                background: #2c3e50;
                color: white;
                padding: 30px;
                text-align: center;
            }
            .social-links {
                margin: 20px 0;
            }
            .social-links a {
                color: #3CB371;
                text-decoration: none;
                margin: 0 10px;
                font-weight: bold;
            }
            .hero-quote {
                font-size: 1.2em;
                font-style: italic;
                color: #2E8B57;
                text-align: center;
                margin: 25px 0;
                padding: 20px;
                background: linear-gradient(45deg, #f0fff0, #e8f5e8);
                border-radius: 10px;
                border: 2px dashed #2E8B57;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">🏹 Robinhood Army</div>
                <div class="tagline">"Compassion in Action - Serving Hope, One Meal at a Time"</div>
            </div>
            
            <div class="content">
                <h1 class="welcome-title">Welcome, Noble Robin! 🌟</h1>
                
                <div class="message">
                    Dear ${name || 'Fellow Robin'},<br><br>
                    
                    🎯 <strong>Your mission awaits!</strong> You're about to join a legendary band of modern-day heroes who believe that no child should go to bed hungry.
                </div>

                <div class="hero-quote">
                    "Not all heroes wear capes, some carry food and hope to those who need it most."
                </div>

                <div class="mission">
                    <div class="mission-title">🎪 Your Robin Hood Adventure Begins:</div>
                    <ul style="margin: 15px 0; padding-left: 20px;">
                        <li>🍽️ Serve fresh meals to children in need</li>
                        <li>📚 Share knowledge through educational activities</li>
                        <li>💚 Spread joy and build lasting community bonds</li>
                        <li>🏆 Track your impact and celebrate achievements</li>
                    </ul>
                </div>

                <div style="text-align: center; margin: 30px 0;">
                    <a href="${confirmationUrl}" class="cta-button">
                        🚀 Confirm & Join the Mission
                    </a>
                </div>

                <div class="message">
                    Once confirmed, you'll have access to:<br>
                    ✨ <strong>Drive Management</strong> - Plan and participate in community drives<br>
                    📊 <strong>Impact Tracking</strong> - See the difference you're making<br>
                    🎓 <strong>Educational Tools</strong> - Generate engaging content for children<br>
                    👥 <strong>Community Network</strong> - Connect with fellow Robins
                </div>

                <div style="background: #fff3cd; padding: 20px; border-radius: 10px; margin: 25px 0; border: 1px solid #ffeaa7;">
                    <strong>🎯 Pro Tip:</strong> After confirmation, tell us if this is your first drive or enter your previous drive count to get personalized recommendations and accurate leaderboard placement!
                </div>
            </div>

            <div class="footer">
                <p><strong>Robinhood Army</strong> - Where Every Meal Matters</p>
                <div class="social-links">
                    <a href="#" target="_blank">🌐 Website</a>
                    <a href="#" target="_blank">📱 Follow Us</a>
                    <a href="#" target="_blank">📧 Contact</a>
                </div>
                <p style="font-size: 0.9em; opacity: 0.8; margin-top: 20px;">
                    "Together, we're not just feeding bellies - we're nourishing dreams."
                </p>
            </div>
        </div>
    </body>
    </html>
    `;

    // For now, we'll return the HTML template
    // In production, this would integrate with an email service like Resend
    console.log('Confirmation email template generated for:', email);
    
    return new Response(JSON.stringify({
      success: true,
      message: 'Confirmation email template generated',
      template: htmlTemplate
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });

  } catch (error) {
    console.error('Error in send-confirmation-email function:', error);
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
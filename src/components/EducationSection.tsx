
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { BookOpen, Sparkles, Download, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseData } from '@/hooks/useSupabaseData';

interface GeneratedContent {
  id: string;
  ageGroup: string;
  subject: string;
  contentType: string;
  content: string;
  generatedAt: Date;
}

const subjects = [
  'Mathematics',
  'English',
  'Science',
  'Hindi',
  'Environmental Studies',
  'General Knowledge',
  'Arts & Crafts',
  'Moral Stories'
];

const contentTypes = [
  'Story',
  'Practice Questions',
  'Simple Explanation',
  'Fun Activities',
  'Learning Games'
];

const toneOptions = [
  'Formal',
  'Fun',
  'Playful',
  'Academic',
  'Story-based'
];
const languageOptions = [
  'English',
  'Hindi'
];

const EducationSection = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedAgeGroup, setSelectedAgeGroup] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedContentType, setSelectedContentType] = useState('');
  const [selectedTone, setSelectedTone] = useState('Formal');
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  const [includeQuiz, setIncludeQuiz] = useState(false);
  const [customInstructions, setCustomInstructions] = useState('');
  const { toast } = useToast();
  const { user } = useAuth();
  const { educationalContent, fetchEducationalContent } = useSupabaseData();

  // AI content generation using Gemini API
  const generateContent = async () => {
    if (!selectedAgeGroup || !selectedSubject || !selectedContentType || !user) {
      toast({
        title: "Missing Information",
        description: "Please select age group, subject, and content type before generating.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);

    try {
      const { data, error } = await supabase.functions.invoke('generate-content', {
        body: {
          ageGroup: selectedAgeGroup,
          subject: selectedSubject,
          contentType: selectedContentType,
          userId: user.id,
          tone: selectedTone,
          language: selectedLanguage,
          includeQuiz,
          customInstructions
        }
      });

      if (error) {
        throw error;
      }

      if (data?.success) {
        toast({
          title: "Content Generated",
          description: `New ${selectedContentType.toLowerCase()} for ${selectedSubject} has been created!`,
        });
        
        // Refresh the educational content list
        await fetchEducationalContent();
      } else {
        throw new Error(data?.error || 'Failed to generate content');
      }
    } catch (error) {
      console.error('Error generating content:', error);
      toast({
        title: "Generation Failed",
        description: "Failed to generate content. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const getMockContent = (age: string, subject: string, type: string): string => {
    const templates = {
      'Story': `Once upon a time, there was a curious ${age}-year-old child who loved ${subject.toLowerCase()}. This is a wonderful story about learning and discovery that helps children understand basic concepts in ${subject.toLowerCase()} through engaging narrative and relatable characters. The story teaches important lessons while making learning fun and memorable.`,
      
      'Practice Questions': `Here are some age-appropriate ${subject} questions for ${age}-year-old children:\n\n1. Basic question about ${subject.toLowerCase()} concepts\n2. Simple problem-solving exercise\n3. Interactive question that encourages thinking\n4. Fun challenge related to ${subject.toLowerCase()}\n5. Creative question that applies learning to real life\n\nThese questions are designed to reinforce learning while keeping children engaged.`,
      
      'Simple Explanation': `Let's learn about ${subject} in a simple way! For ${age}-year-old children, we can explain ${subject.toLowerCase()} concepts using everyday examples and simple language. This explanation breaks down complex ideas into easy-to-understand parts, using familiar objects and situations that children can relate to.`,
      
      'Fun Activities': `Here are some exciting ${subject} activities for ${age}-year-old children:\n\n• Hands-on activity related to ${subject.toLowerCase()}\n• Creative game that teaches key concepts\n• Interactive exercise for better understanding\n• Group activity for collaborative learning\n• Art-based project connecting to ${subject.toLowerCase()}\n\nThese activities make learning enjoyable and memorable!`,
      
      'Learning Games': `Let's play some ${subject} games! These games are perfect for ${age}-year-old children:\n\n🎯 Game 1: Interactive ${subject.toLowerCase()} challenge\n🎲 Game 2: Fun quiz with rewards\n🎨 Game 3: Creative activity game\n🏆 Game 4: Achievement-based learning\n⭐ Game 5: Team-based educational game\n\nThese games combine fun with learning to create an engaging educational experience.`
    };

    return templates[type as keyof typeof templates] || 'Generated educational content would appear here.';
  };

  const downloadContent = (content: any) => {
    const element = document.createElement('a');
    const file = new Blob([content.content], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${content.subject}_${content.content_type}_Age${content.age_group}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    
    toast({
      title: "Downloaded",
      description: "Content has been downloaded successfully.",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">AI Educational Content</h1>
        <p className="text-gray-600">Generate age-appropriate educational content for children</p>
      </div>

      {/* Content Generation Form */}
      <Card className="border-2 border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-600" />
            Generate New Content
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Age Group</label>
              <Select value={selectedAgeGroup} onValueChange={setSelectedAgeGroup}>
                <SelectTrigger>
                  <SelectValue placeholder="Select age" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({length: 18}, (_, i) => i + 3).map((age) => (
                    <SelectItem key={age} value={age.toString()}>
                      {age} years old
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Subject</label>
              <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                <SelectTrigger>
                  <SelectValue placeholder="Select subject" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((subject) => (
                    <SelectItem key={subject} value={subject}>
                      {subject}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Content Type</label>
              <Select value={selectedContentType} onValueChange={setSelectedContentType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {contentTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Tone</label>
              <Select value={selectedTone} onValueChange={setSelectedTone}>
                <SelectTrigger>
                  <SelectValue placeholder="Select tone" />
                </SelectTrigger>
                <SelectContent>
                  {toneOptions.map((tone) => (
                    <SelectItem key={tone} value={tone}>
                      {tone}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Language</label>
              <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                <SelectTrigger>
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  {languageOptions.map((lang) => (
                    <SelectItem key={lang} value={lang}>
                      {lang}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <input
                id="includeQuiz"
                type="checkbox"
                checked={includeQuiz}
                onChange={e => setIncludeQuiz(e.target.checked)}
                className="form-checkbox h-4 w-4 text-blue-600 border-gray-300 rounded"
              />
              <label htmlFor="includeQuiz" className="text-sm font-medium text-gray-700">
                Include Quiz
              </label>
            </div>

            <div className="space-y-2">
              <label htmlFor="customInstructions" className="text-sm font-medium text-gray-700">Custom Instructions</label>
              <Textarea
                id="customInstructions"
                value={customInstructions}
                onChange={e => setCustomInstructions(e.target.value)}
                placeholder="e.g. Use animal characters, make it rhyme, etc. (optional)"
                className="resize-none min-h-[40px]"
              />
            </div>
          </div>

          <Button
            onClick={generateContent}
            disabled={isGenerating}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Generating Content...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Generate Educational Content
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Generated Content List */}
      <div className="space-y-4">
        {educationalContent.map((content) => (
          <Card key={content.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <BookOpen className="h-5 w-5 text-blue-600" />
                    {content.subject} - {content.content_type}
                  </CardTitle>
                  <div className="flex gap-2 mt-2">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                      Age {content.age_group}
                    </span>
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                      {content.content_type}
                    </span>
                    <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                      {content.subject}
                    </span>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => downloadContent(content)}
                >
                  <Download className="h-4 w-4 mr-1" />
                  Download
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Textarea
                value={content.content}
                readOnly
                className="min-h-[120px] bg-gray-50 text-gray-700"
              />
              <p className="text-xs text-gray-500 mt-2">
                Generated: {new Date(content.created_at).toLocaleString()}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {educationalContent.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No content generated yet</h3>
            <p className="text-gray-600 mb-4">Use the form above to generate educational content for children.</p>
            <div className="text-sm text-gray-500 space-y-1">
              <p>• Select age group (3-20 years)</p>
              <p>• Choose subject and content type</p>
              <p>• Click generate to create content</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default EducationSection;

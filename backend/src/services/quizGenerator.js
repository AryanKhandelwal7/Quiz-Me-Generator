const axios = require('axios');

class QuizGenerator {
  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY;
    this.apiUrl = 'https://api.openai.com/v1/chat/completions';
  }

  async generateQuiz(documentText, difficulty, questionCount) {
    try {
      console.log('🔧 Starting quiz generation...');
      console.log('📊 Parameters:', { difficulty, questionCount, textLength: documentText.length });
      
      // Check if API key exists
      if (!this.apiKey) {
        throw new Error('OpenAI API key is not set in environment variables');
      }

      if (!this.apiKey.startsWith('sk-')) {
        throw new Error('OpenAI API key appears to be invalid (should start with sk-)');
      }

      const prompt = this.buildPrompt(documentText, difficulty, questionCount);
      console.log('📝 Generated prompt length:', prompt.length);
      
      console.log('🌐 Making OpenAI API call with axios...');
      
      const response = await axios.post(this.apiUrl, {
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are an expert educator who creates engaging and accurate quizzes based on study materials. Always respond with valid JSON format."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 3000,
        temperature: 0.7,
      }, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        timeout: 30000, // 30 second timeout
      });

      console.log('✅ OpenAI API call successful');
      const aiResponse = response.data.choices[0].message.content;
      console.log('📄 OpenAI response preview:', aiResponse.substring(0, 200) + '...');
      
      // Parse the JSON response
      let quiz;
      try {
        quiz = JSON.parse(aiResponse);
        console.log('✅ JSON parsing successful');
      } catch (parseError) {
        console.log('⚠️ JSON parsing failed, trying to extract JSON...');
        console.log('Raw response:', aiResponse);
        
        // If JSON parsing fails, try to extract JSON from the response
        const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          quiz = JSON.parse(jsonMatch[0]);
          console.log('✅ JSON extraction successful');
        } else {
          throw new Error('Failed to parse quiz JSON from OpenAI response: ' + aiResponse.substring(0, 500));
        }
      }

      // Validate the quiz structure
      this.validateQuiz(quiz);
      console.log('✅ Quiz validation successful');
      
      return quiz;
      
    } catch (error) {
      console.error('❌ Error generating quiz:', error.message);
      
      // Handle specific axios errors
      if (error.response) {
        console.error('🌐 API Error Response:', {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data
        });
        
        if (error.response.status === 401) {
          throw new Error('Invalid OpenAI API key. Please check your API key.');
        } else if (error.response.status === 429) {
          throw new Error('OpenAI API rate limit exceeded. Please try again later.');
        } else if (error.response.status === 402) {
          throw new Error('OpenAI API quota exceeded. Please check your billing.');
        }
      } else if (error.code === 'ECONNABORTED') {
        throw new Error('OpenAI API request timed out. Please try again.');
      }
      
      throw new Error(`Quiz generation failed: ${error.message}`);
    }
  }

  buildPrompt(documentText, difficulty, questionCount) {
    const difficultyInstructions = {
      easy: "Create simple, straightforward questions that test basic understanding and recall of key facts.",
      medium: "Create moderate difficulty questions that require some analysis and understanding of concepts.",
      hard: "Create challenging questions that require critical thinking, analysis, and deep understanding of the material."
    };

    return `
Based on the following study material, create a ${difficulty} difficulty quiz with exactly ${questionCount} multiple-choice questions.

Study Material:
"""
${documentText.substring(0, 8000)} // Limit text to avoid token limits
"""

Requirements:
- ${difficultyInstructions[difficulty.toLowerCase()]}
- Each question should have exactly 4 options (A, B, C, D)
- Only one option should be correct
- Questions should be diverse and cover different parts of the material
- Avoid questions that are too obvious or too obscure
- Make sure all questions are answerable based on the provided material

Return the response in this exact JSON format:
{
  "title": "Quiz from Study Material",
  "difficulty": "${difficulty}",
  "totalQuestions": ${questionCount},
  "questions": [
    {
      "id": 1,
      "question": "Your question here?",
      "options": {
        "A": "First option",
        "B": "Second option", 
        "C": "Third option",
        "D": "Fourth option"
      },
      "correctAnswer": "A",
      "explanation": "Brief explanation of why this is correct"
    }
  ]
}

Make sure to return valid JSON only, no additional text or markdown formatting.`;
  }

  validateQuiz(quiz) {
    if (!quiz || typeof quiz !== 'object') {
      throw new Error('Quiz must be a valid object');
    }

    if (!quiz.questions || !Array.isArray(quiz.questions)) {
      throw new Error('Quiz must contain a questions array');
    }

    if (quiz.questions.length === 0) {
      throw new Error('Quiz must contain at least one question');
    }

    // Validate each question
    quiz.questions.forEach((question, index) => {
      if (!question.id || !question.question || !question.options || !question.correctAnswer) {
        throw new Error(`Question ${index + 1} is missing required fields`);
      }

      if (!question.options.A || !question.options.B || !question.options.C || !question.options.D) {
        throw new Error(`Question ${index + 1} must have options A, B, C, and D`);
      }

      if (!['A', 'B', 'C', 'D'].includes(question.correctAnswer)) {
        throw new Error(`Question ${index + 1} must have a correct answer of A, B, C, or D`);
      }
    });

    return true;
  }
}

module.exports = new QuizGenerator();
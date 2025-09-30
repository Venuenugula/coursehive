from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import json
import asyncio
from datetime import datetime, timedelta
import uuid
import httpx

app = FastAPI(title="CourseHive AI Evaluator", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models
class Question(BaseModel):
    question: str
    options: List[str]
    correctAnswer: int
    explanation: Optional[str] = None
    topic: str
    difficulty: str = "medium"
    points: int = 1

class Answer(BaseModel):
    questionIndex: int
    selectedAnswer: int
    timeSpent: int
    isCorrect: bool

class EvaluationRequest(BaseModel):
    attemptId: str
    testId: str
    userId: str
    answers: List[Answer]
    questions: List[Question]
    score: int
    percentage: float

class TopicMistake(BaseModel):
    topic: str
    questionIndex: int
    mistakeType: str
    severity: str
    explanation: str
    suggestedResources: List[str] = []

class ImprovementSuggestion(BaseModel):
    area: str
    suggestion: str
    priority: str

class AIFeedback(BaseModel):
    attemptId: str
    userId: str
    testId: str
    overallScore: int
    accuracy: float
    strengths: List[str]
    weaknesses: List[str]
    topicMistakes: List[TopicMistake]
    improvementSuggestions: List[ImprovementSuggestion]
    recommendedContent: List[str] = []
    studyPlan: Dict[str, Any] = {}
    generatedAt: datetime
    modelVersion: str = "1.0"

# In-memory storage for demo (in production, use a database)
feedback_storage = {}

@app.get("/")
async def root():
    return {"message": "CourseHive AI Evaluator Service", "status": "running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

@app.post("/evaluate")
async def evaluate_attempt(request: EvaluationRequest):
    """
    Evaluate a test attempt and generate AI feedback
    """
    try:
        # Generate unique feedback ID
        feedback_id = str(uuid.uuid4())
        
        # Analyze answers and generate feedback
        feedback = await generate_ai_feedback(request, feedback_id)
        
        # Store feedback in memory
        feedback_storage[feedback_id] = feedback.dict()
        
        # Try to save to database via backend API
        try:
            async with httpx.AsyncClient() as client:
                backend_url = "http://localhost:5000/api/ai-feedback/generate"
                await client.post(backend_url, json={
                    "attemptId": request.attemptId,
                    "testId": request.testId,
                    "userId": request.userId,
                    "answers": [answer.dict() for answer in request.answers],
                    "questions": [question.dict() for question in request.questions],
                    "score": request.score,
                    "percentage": request.percentage,
                    "feedback": feedback.dict()
                })
        except Exception as db_error:
            print(f"Failed to save to database: {db_error}")
            # Continue without database save
        
        return {
            "success": True,
            "feedbackId": feedback_id,
            "message": "Evaluation completed successfully",
            "feedback": feedback.dict()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Evaluation failed: {str(e)}")

@app.post("/get-suggestions")
async def get_personalized_suggestions(request: dict):
    """
    Get personalized content suggestions based on user performance
    """
    try:
        user_id = request.get("userId")
        weak_topics = request.get("weakTopics", [])
        strong_topics = request.get("strongTopics", [])
        
        # Generate content suggestions based on weak topics
        suggested_content = generate_content_suggestions(weak_topics, strong_topics)
        
        return {
            "success": True,
            "suggestedContent": suggested_content,
            "weakTopics": weak_topics,
            "strongTopics": strong_topics
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate suggestions: {str(e)}")

@app.get("/feedback/{feedback_id}")
async def get_feedback(feedback_id: str):
    """
    Retrieve AI feedback by ID
    """
    if feedback_id not in feedback_storage:
        raise HTTPException(status_code=404, detail="Feedback not found")
    
    return feedback_storage[feedback_id]

class LinkProcessingRequest(BaseModel):
    url: str
    title: str
    description: str
    content: str
    source_domain: str
    content_type: str
    language: str
    word_count: int
    headings: List[str]
    meta_tags: Dict[str, str]

@app.post("/process-link")
async def process_link(request: LinkProcessingRequest):
    """
    Process a scraped link and categorize it using AI
    """
    try:
        # Categorize the content based on URL, title, and content
        categories = categorize_content(request.url, request.title, request.description, request.content)
        
        # Determine difficulty level
        difficulty = determine_difficulty(request.content, request.word_count)
        
        # Generate summary
        summary = generate_summary(request.description, request.content)
        
        # Generate tags
        tags = generate_tags(request.title, request.description, request.content, request.headings)
        
        # Determine skill relevance
        skill_relevance = determine_skill_relevance(categories, tags)
        
        # Generate learning path suggestions
        learning_path = generate_learning_path(categories, difficulty)
        
        # Calculate quality score
        quality_score = calculate_quality_score(request.word_count, request.content_type, request.source_domain)
        
        return {
            "url": request.url,
            "title": request.title,
            "description": request.description,
            "summary": summary,
            "language": request.language,
            "categories": categories,
            "difficulty": difficulty,
            "contentType": request.content_type,
            "sourceDomain": request.source_domain,
            "validStatus": True,
            "clickCount": 0,
            "popularityScore": 0,
            "qualityScore": quality_score,
            "tags": tags,
            "skillRelevance": skill_relevance,
            "learningPath": learning_path,
            "isSafe": True,
            "lastChecked": datetime.now().isoformat(),
            "nextCheckDate": (datetime.now() + timedelta(days=7)).isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process link: {str(e)}")

def categorize_content(url: str, title: str, description: str, content: str) -> Dict[str, Any]:
    """Categorize content based on analysis"""
    text = f"{url} {title} {description} {content}".lower()
    
    # Programming categories
    if any(keyword in text for keyword in ['python', 'javascript', 'java', 'c++', 'react', 'node', 'programming', 'coding', 'developer']):
        return {
            "primary": "Programming",
            "secondary": ["Computer Science", "Software Development"]
        }
    
    # Mathematics
    if any(keyword in text for keyword in ['math', 'algebra', 'calculus', 'geometry', 'statistics', 'mathematics']):
        return {
            "primary": "Mathematics",
            "secondary": ["Education", "STEM"]
        }
    
    # Science
    if any(keyword in text for keyword in ['physics', 'chemistry', 'biology', 'science', 'scientific']):
        return {
            "primary": "Science",
            "secondary": ["Education", "STEM"]
        }
    
    # Web Development
    if any(keyword in text for keyword in ['html', 'css', 'web', 'frontend', 'backend', 'website']):
        return {
            "primary": "Web Development",
            "secondary": ["Programming", "Design"]
        }
    
    # Data Science
    if any(keyword in text for keyword in ['data', 'analytics', 'machine learning', 'ai', 'artificial intelligence']):
        return {
            "primary": "Data Science",
            "secondary": ["Programming", "Mathematics"]
        }
    
    # Business
    if any(keyword in text for keyword in ['business', 'marketing', 'finance', 'economics', 'management']):
        return {
            "primary": "Business",
            "secondary": ["Education", "Professional Development"]
        }
    
    # Design
    if any(keyword in text for keyword in ['design', 'ui', 'ux', 'graphic', 'art', 'creative']):
        return {
            "primary": "Design",
            "secondary": ["Creative Arts", "Technology"]
        }
    
    # Default category
    return {
        "primary": "Education",
        "secondary": ["General Learning"]
    }

def determine_difficulty(content: str, word_count: int) -> str:
    """Determine difficulty level"""
    if word_count < 500:
        return "Beginner"
    elif word_count < 2000:
        return "Intermediate"
    else:
        return "Advanced"

def generate_summary(description: str, content: str) -> str:
    """Generate a summary from description and content"""
    if description:
        return description[:200] + "..." if len(description) > 200 else description
    elif content:
        return content[:200] + "..." if len(content) > 200 else content
    else:
        return "Educational content for learning and skill development."

def generate_tags(title: str, description: str, content: str, headings: List[str]) -> List[str]:
    """Generate relevant tags"""
    text = f"{title} {description} {content} {' '.join(headings)}".lower()
    tags = []
    
    # Technology tags
    tech_keywords = {
        'python': 'python',
        'javascript': 'javascript',
        'react': 'react',
        'node': 'nodejs',
        'html': 'html',
        'css': 'css',
        'java': 'java',
        'sql': 'sql',
        'mongodb': 'mongodb',
        'git': 'git',
        'docker': 'docker',
        'aws': 'aws',
        'linux': 'linux'
    }
    
    for keyword, tag in tech_keywords.items():
        if keyword in text:
            tags.append(tag)
    
    # Subject tags
    subject_keywords = {
        'programming': 'programming',
        'web development': 'web-development',
        'data science': 'data-science',
        'machine learning': 'machine-learning',
        'mathematics': 'mathematics',
        'physics': 'physics',
        'chemistry': 'chemistry',
        'biology': 'biology',
        'business': 'business',
        'design': 'design',
        'tutorial': 'tutorial',
        'course': 'course',
        'guide': 'guide'
    }
    
    for keyword, tag in subject_keywords.items():
        if keyword in text:
            tags.append(tag)
    
    # Add general tags
    tags.extend(['education', 'learning'])
    
    return list(set(tags))[:10]  # Limit to 10 tags

def determine_skill_relevance(categories: Dict[str, Any], tags: List[str]) -> List[str]:
    """Determine skill relevance"""
    skills = []
    
    # Add primary category as skill
    if categories.get('primary'):
        skills.append(categories['primary'])
    
    # Add secondary categories
    if categories.get('secondary'):
        skills.extend(categories['secondary'][:2])  # Limit to 2 secondary skills
    
    # Add top tags as skills
    skills.extend(tags[:3])  # Add top 3 tags
    
    return list(set(skills))[:5]  # Limit to 5 skills

def generate_learning_path(categories: Dict[str, Any], difficulty: str) -> List[str]:
    """Generate learning path suggestions"""
    primary = categories.get('primary', 'General')
    
    if primary == 'Programming':
        return [f"Learn {primary} Basics", "Practice Coding", "Build Projects"]
    elif primary == 'Mathematics':
        return [f"Master {primary} Fundamentals", "Practice Problems", "Advanced Topics"]
    elif primary == 'Science':
        return [f"Understand {primary} Concepts", "Laboratory Work", "Research Methods"]
    else:
        return [f"Introduction to {primary}", "Intermediate Topics", "Advanced Applications"]

def calculate_quality_score(word_count: int, content_type: str, source_domain: str) -> float:
    """Calculate quality score based on various factors"""
    score = 0.5  # Base score
    
    # Word count factor
    if word_count > 1000:
        score += 0.2
    elif word_count > 500:
        score += 0.1
    
    # Content type factor
    if content_type in ['tutorial', 'course']:
        score += 0.1
    elif content_type == 'article':
        score += 0.05
    
    # Domain reputation factor
    trusted_domains = ['docs.python.org', 'developer.mozilla.org', 'react.dev', 'nodejs.org', 'khanacademy.org']
    if source_domain in trusted_domains:
        score += 0.2
    
    return min(1.0, score)  # Cap at 1.0

class PersonalizedRecommendationsRequest(BaseModel):
    user_id: str
    user_interests: List[str] = []
    user_skills: List[str] = []
    learning_goals: List[str] = []
    preferred_difficulty: str = "Beginner"
    limit: int = 10

@app.post("/personalized-recommendations")
async def get_personalized_recommendations(request: PersonalizedRecommendationsRequest):
    """
    Generate personalized learning recommendations for a user
    """
    try:
        # Mock personalized recommendations based on user profile
        recommendations = []
        
        # Sample educational content based on user interests
        sample_content = [
            {
                "title": "Introduction to Machine Learning",
                "url": "https://www.coursera.org/learn/machine-learning",
                "summary": "Learn the fundamentals of machine learning with practical examples",
                "difficulty": "Intermediate",
                "category": "Programming",
                "confidence": 0.95
            },
            {
                "title": "Advanced Python Programming",
                "url": "https://docs.python.org/3/tutorial/",
                "summary": "Comprehensive Python tutorial covering advanced concepts",
                "difficulty": "Advanced",
                "category": "Programming",
                "confidence": 0.88
            },
            {
                "title": "Linear Algebra Fundamentals",
                "url": "https://www.khanacademy.org/math/linear-algebra",
                "summary": "Master linear algebra concepts with interactive exercises",
                "difficulty": "Intermediate",
                "category": "Mathematics",
                "confidence": 0.92
            },
            {
                "title": "Web Development Bootcamp",
                "url": "https://www.freecodecamp.org/",
                "summary": "Complete web development curriculum with hands-on projects",
                "difficulty": "Beginner",
                "category": "Programming",
                "confidence": 0.85
            },
            {
                "title": "Data Science with Python",
                "url": "https://www.datacamp.com/courses/intro-to-python-for-data-science",
                "summary": "Learn data science fundamentals using Python",
                "difficulty": "Intermediate",
                "category": "Data Science",
                "confidence": 0.90
            }
        ]
        
        # Filter recommendations based on user preferences
        for content in sample_content:
            confidence = content["confidence"]
            
            # Adjust confidence based on user interests
            if any(interest.lower() in content["category"].lower() for interest in request.user_interests):
                confidence += 0.1
            
            # Adjust confidence based on difficulty preference
            if content["difficulty"] == request.preferred_difficulty:
                confidence += 0.05
            
            content["confidence"] = min(1.0, confidence)
            recommendations.append(content)
        
        # Sort by confidence and limit results
        recommendations.sort(key=lambda x: x["confidence"], reverse=True)
        recommendations = recommendations[:request.limit]
        
        # Generate reasoning
        reasoning = f"Based on your interests in {', '.join(request.user_interests[:3]) if request.user_interests else 'general topics'}, "
        reasoning += f"your skill level ({request.preferred_difficulty}), "
        reasoning += f"and your learning goals, I've curated these {len(recommendations)} personalized recommendations."
        
        return {
            "recommendations": recommendations,
            "reasoning": reasoning,
            "confidence": sum(r["confidence"] for r in recommendations) / len(recommendations) if recommendations else 0,
            "total_found": len(recommendations)
        }
        
    except Exception as e:
        print(f"Error generating personalized recommendations: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to generate recommendations")

class LinkValidationRequest(BaseModel):
    url: str
    title: str
    description: str

class LinkAnalysisRequest(BaseModel):
    url: str
    title: str
    description: str
    content: str

@app.post("/validate-link")
async def validate_link(request: LinkValidationRequest):
    """
    Validate a link for educational content
    """
    try:
        # Basic validation logic
        is_valid = True
        final_url = request.url
        
        # Check if URL is accessible and educational
        if not request.url.startswith(('http://', 'https://')):
            is_valid = False
        
        # Check for educational keywords
        text = f"{request.title} {request.description}".lower()
        educational_keywords = [
            'tutorial', 'course', 'learn', 'education', 'study', 'guide',
            'documentation', 'reference', 'programming', 'coding', 'math',
            'science', 'physics', 'chemistry', 'biology', 'algebra',
            'calculus', 'javascript', 'python', 'react', 'node', 'html',
            'css', 'web', 'development', 'data', 'analytics', 'machine learning'
        ]
        
        has_educational_content = any(keyword in text for keyword in educational_keywords)
        
        if not has_educational_content:
            is_valid = False
        
        return {
            "is_valid": is_valid,
            "final_url": final_url,
            "reason": "Educational content detected" if is_valid else "No educational content found"
        }
        
    except Exception as e:
        return {
            "is_valid": False,
            "final_url": request.url,
            "reason": f"Validation error: {str(e)}"
        }

@app.post("/tutor-mode")
async def tutor_mode(request: dict):
    """
    AI Tutor mode - answer questions and provide learning guidance
    """
    try:
        user_question = request.get("user_question", "")
        user_context = request.get("user_context", "")
        user_skill_level = request.get("user_skill_level", "Beginner")
        subject_area = request.get("subject_area", "General")
        
        # Generate AI response based on the question
        answer = generate_tutor_response(user_question, user_context, user_skill_level, subject_area)
        
        # Generate follow-up questions
        follow_up_questions = generate_follow_up_questions(user_question, subject_area)
        
        # Generate learning suggestions
        learning_suggestions = generate_learning_suggestions(subject_area, user_skill_level)
        
        # Mock suggested links (in real implementation, these would be from database)
        suggested_links = []
        
        # Calculate confidence based on question complexity
        confidence = calculate_tutor_confidence(user_question, user_skill_level)
        
        return {
            "answer": answer,
            "follow_up_questions": follow_up_questions,
            "learning_suggestions": learning_suggestions,
            "suggested_links": suggested_links,
            "confidence": confidence,
            "difficulty_level": user_skill_level,
            "related_concepts": extract_related_concepts(user_question, subject_area)
        }
        
    except Exception as e:
        print(f"Error in tutor mode: {str(e)}")
        raise HTTPException(status_code=500, detail="Tutor mode failed")

@app.post("/analyze-link")
async def analyze_link(request: LinkAnalysisRequest):
    """
    Analyze a link and extract educational metadata
    """
    try:
        # Use the same categorization logic as process-link
        categories = categorize_content(request.url, request.title, request.description, request.content)
        
        # Determine difficulty level
        word_count = len(request.content.split())
        difficulty = determine_difficulty(request.content, word_count)
        
        # Generate summary
        summary = generate_summary(request.description, request.content)
        
        # Generate tags
        headings = []  # We don't have headings in this request
        tags = generate_tags(request.title, request.description, request.content, headings)
        
        # Determine skill relevance
        skill_relevance = determine_skill_relevance(categories, tags)
        
        # Generate learning path suggestions
        learning_path = generate_learning_path(categories, difficulty)
        
        # Calculate quality score
        content_type = "article"  # Default content type
        source_domain = request.url.split('/')[2] if '://' in request.url else "unknown"
        quality_score = calculate_quality_score(word_count, content_type, source_domain)
        
        return {
            "categories": categories,
            "difficulty": difficulty,
            "summary": summary,
            "tags": tags,
            "skill_relevance": skill_relevance,
            "learning_path": learning_path,
            "quality_score": quality_score,
            "content_type": content_type,
            "source_domain": source_domain,
            "word_count": word_count
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to analyze link: {str(e)}")

async def generate_ai_feedback(request: EvaluationRequest, feedback_id: str) -> AIFeedback:
    """
    Generate comprehensive AI feedback for a test attempt
    """
    # Analyze performance
    total_questions = len(request.questions)
    correct_answers = sum(1 for answer in request.answers if answer.isCorrect)
    accuracy = (correct_answers / total_questions) * 100 if total_questions > 0 else 0
    
    # Identify strengths and weaknesses
    strengths, weaknesses = analyze_performance(request.answers, request.questions)
    
    # Detect topic-level mistakes
    topic_mistakes = detect_topic_mistakes(request.answers, request.questions)
    
    # Generate improvement suggestions
    improvement_suggestions = generate_improvement_suggestions(topic_mistakes, accuracy)
    
    # Create study plan
    study_plan = create_study_plan(topic_mistakes, accuracy)
    
    # Generate recommended content
    recommended_content = generate_recommended_content(topic_mistakes)
    
    return AIFeedback(
        attemptId=request.attemptId,
        userId=request.userId,
        testId=request.testId,
        overallScore=request.score,
        accuracy=accuracy,
        strengths=strengths,
        weaknesses=weaknesses,
        topicMistakes=topic_mistakes,
        improvementSuggestions=improvement_suggestions,
        recommendedContent=recommended_content,
        studyPlan=study_plan,
        generatedAt=datetime.now(),
        modelVersion="1.0"
    )

def analyze_performance(answers: List[Answer], questions: List[Question]) -> tuple[List[str], List[str]]:
    """
    Analyze performance to identify strengths and weaknesses
    """
    strengths = []
    weaknesses = []
    
    # Calculate accuracy by difficulty
    easy_correct = 0
    medium_correct = 0
    hard_correct = 0
    easy_total = 0
    medium_total = 0
    hard_total = 0
    
    for i, answer in enumerate(answers):
        question = questions[i]
        if question.difficulty == "easy":
            easy_total += 1
            if answer.isCorrect:
                easy_correct += 1
        elif question.difficulty == "medium":
            medium_total += 1
            if answer.isCorrect:
                medium_correct += 1
        else:  # hard
            hard_total += 1
            if answer.isCorrect:
                hard_correct += 1
    
    # Identify strengths
    if easy_total > 0 and (easy_correct / easy_total) >= 0.8:
        strengths.append("Strong foundation in basic concepts")
    if medium_total > 0 and (medium_correct / medium_total) >= 0.7:
        strengths.append("Good understanding of intermediate topics")
    if hard_total > 0 and (hard_correct / hard_total) >= 0.6:
        strengths.append("Excellent grasp of advanced concepts")
    
    # Identify weaknesses
    if easy_total > 0 and (easy_correct / easy_total) < 0.6:
        weaknesses.append("Needs improvement in basic concepts")
    if medium_total > 0 and (medium_correct / medium_total) < 0.5:
        weaknesses.append("Struggles with intermediate topics")
    if hard_total > 0 and (hard_correct / hard_total) < 0.4:
        weaknesses.append("Advanced concepts need more attention")
    
    # Time management analysis
    avg_time_per_question = sum(answer.timeSpent for answer in answers) / len(answers)
    if avg_time_per_question < 30:  # seconds
        strengths.append("Good time management skills")
    elif avg_time_per_question > 120:
        weaknesses.append("May need to improve time management")
    
    return strengths, weaknesses

def detect_topic_mistakes(answers: List[Answer], questions: List[Question]) -> List[TopicMistake]:
    """
    Detect topic-level mistakes and categorize them
    """
    topic_mistakes = []
    topic_performance = {}
    
    # Group questions by topic
    for i, answer in enumerate(answers):
        question = questions[i]
        topic = question.topic
        
        if topic not in topic_performance:
            topic_performance[topic] = {"correct": 0, "total": 0, "questions": []}
        
        topic_performance[topic]["total"] += 1
        topic_performance[topic]["questions"].append((i, question, answer))
        
        if answer.isCorrect:
            topic_performance[topic]["correct"] += 1
    
    # Analyze each topic
    for topic, performance in topic_performance.items():
        accuracy = (performance["correct"] / performance["total"]) * 100
        
        if accuracy < 70:  # Threshold for poor performance
            # Determine mistake type based on question characteristics
            mistake_type = "conceptual"  # Default
            if any(q[1].difficulty == "easy" for q in performance["questions"]):
                mistake_type = "foundational"
            elif any(q[1].difficulty == "hard" for q in performance["questions"]):
                mistake_type = "application"
            
            # Determine severity
            severity = "low"
            if accuracy < 30:
                severity = "high"
            elif accuracy < 50:
                severity = "medium"
            
            # Find specific questions that were wrong
            wrong_questions = [q for q in performance["questions"] if not q[2].isCorrect]
            
            for question_index, question, answer in wrong_questions:
                topic_mistakes.append(TopicMistake(
                    topic=topic,
                    questionIndex=question_index,
                    mistakeType=mistake_type,
                    severity=severity,
                    explanation=f"Struggled with {topic} concept: {question.question[:100]}...",
                    suggestedResources=[f"notes_{topic.lower()}", f"practice_{topic.lower()}"]
                ))
    
    return topic_mistakes

def generate_improvement_suggestions(topic_mistakes: List[TopicMistake], accuracy: float) -> List[ImprovementSuggestion]:
    """
    Generate personalized improvement suggestions
    """
    suggestions = []
    
    # Group mistakes by topic
    topic_issues = {}
    for mistake in topic_mistakes:
        if mistake.topic not in topic_issues:
            topic_issues[mistake.topic] = []
        topic_issues[mistake.topic].append(mistake)
    
    # Generate suggestions for each problematic topic
    for topic, mistakes in topic_issues.items():
        high_severity = any(m.severity == "high" for m in mistakes)
        priority = "high" if high_severity else "medium"
        
        suggestions.append(ImprovementSuggestion(
            area=topic,
            suggestion=f"Focus on reviewing {topic} fundamentals and practice more problems in this area",
            priority=priority
        ))
    
    # General suggestions based on overall performance
    if accuracy < 50:
        suggestions.append(ImprovementSuggestion(
            area="Overall Strategy",
            suggestion="Consider reviewing basic concepts before attempting advanced problems",
            priority="high"
        ))
    elif accuracy < 70:
        suggestions.append(ImprovementSuggestion(
            area="Practice",
            suggestion="Increase practice frequency and focus on weak areas",
            priority="medium"
        ))
    else:
        suggestions.append(ImprovementSuggestion(
            area="Advanced Topics",
            suggestion="Great job! Consider exploring more challenging problems",
            priority="low"
        ))
    
    return suggestions

def create_study_plan(topic_mistakes: List[TopicMistake], accuracy: float) -> Dict[str, Any]:
    """
    Create a personalized study plan
    """
    # Identify priority topics
    topic_priority = {}
    for mistake in topic_mistakes:
        topic = mistake.topic
        if topic not in topic_priority:
            topic_priority[topic] = 0
        topic_priority[topic] += 1 if mistake.severity == "high" else 0.5
    
    # Sort topics by priority
    sorted_topics = sorted(topic_priority.items(), key=lambda x: x[1], reverse=True)
    next_topics = [topic for topic, _ in sorted_topics[:3]]  # Top 3 priority topics
    
    # Estimate study time based on performance
    base_time = 2  # hours
    if accuracy < 50:
        estimated_time = base_time * 2
        difficulty = "beginner"
    elif accuracy < 70:
        estimated_time = base_time * 1.5
        difficulty = "intermediate"
    else:
        estimated_time = base_time
        difficulty = "advanced"
    
    return {
        "nextTopics": next_topics,
        "estimatedTime": estimated_time,
        "difficulty": difficulty,
        "focusAreas": list(topic_priority.keys())[:5]
    }

def generate_recommended_content(topic_mistakes: List[TopicMistake]) -> List[str]:
    """
    Generate recommended content based on mistakes
    """
    recommended = []
    
    # Get unique topics with mistakes
    topics_with_issues = list(set(mistake.topic for mistake in topic_mistakes))
    
    for topic in topics_with_issues:
        recommended.extend([
            f"notes_{topic.lower().replace(' ', '_')}",
            f"practice_{topic.lower().replace(' ', '_')}",
            f"video_{topic.lower().replace(' ', '_')}"
        ])
    
    return recommended[:10]  # Limit to 10 recommendations

def generate_content_suggestions(weak_topics: List[str], strong_topics: List[str]) -> List[dict]:
    """
    Generate personalized content suggestions based on user performance
    """
    suggestions = []
    
    # Generate suggestions for weak topics
    for topic in weak_topics:
        suggestions.append({
            "contentId": f"content_{topic.lower().replace(' ', '_')}_notes",
            "title": f"{topic} Study Notes",
            "type": "notes",
            "reason": f"Focus on {topic} fundamentals",
            "priority": "high"
        })
        
        suggestions.append({
            "contentId": f"content_{topic.lower().replace(' ', '_')}_practice",
            "title": f"{topic} Practice Problems",
            "type": "question_bank",
            "reason": f"Practice {topic} problems to improve",
            "priority": "high"
        })
    
    # Generate suggestions for strong topics (advanced content)
    for topic in strong_topics:
        suggestions.append({
            "contentId": f"content_{topic.lower().replace(' ', '_')}_advanced",
            "title": f"Advanced {topic} Concepts",
            "type": "article",
            "reason": f"Explore advanced {topic} topics",
            "priority": "low"
        })
    
    return suggestions[:15]  # Limit to 15 suggestions

def generate_tutor_response(question: str, context: str, skill_level: str, subject_area: str) -> str:
    """Generate AI tutor response based on question and context"""
    question_lower = question.lower()
    
    # Programming questions
    if any(keyword in question_lower for keyword in ['programming', 'code', 'python', 'javascript', 'java', 'react', 'node']):
        if 'python' in question_lower:
            return f"""Great question about Python! As a {skill_level} learner, here's what you should know:

Python is a versatile programming language perfect for beginners. It's known for its simple syntax and readability.

**Key Concepts for {skill_level} Level:**
- Variables and data types (strings, numbers, lists)
- Control structures (if/else, loops)
- Functions and modules
- Basic object-oriented programming

**Learning Path:**
1. Start with basic syntax and variables
2. Practice with simple programs
3. Learn about functions and modules
4. Build small projects

Would you like me to explain any specific Python concept in more detail?"""
        
        elif 'javascript' in question_lower:
            return f"""JavaScript is the language of the web! Here's a {skill_level}-friendly overview:

JavaScript runs in browsers and is essential for web development.

**Key Concepts for {skill_level} Level:**
- Variables (let, const, var)
- Functions and arrow functions
- DOM manipulation
- Event handling
- Basic ES6+ features

**Learning Path:**
1. Learn basic syntax and variables
2. Understand functions and scope
3. Practice DOM manipulation
4. Build interactive web pages

What specific aspect of JavaScript would you like to explore?"""
        
        else:
            return f"""Programming is an exciting journey! Here's guidance for {skill_level} learners:

**Getting Started:**
- Choose one language to focus on initially
- Practice regularly with small projects
- Learn problem-solving techniques
- Join coding communities

**Recommended Learning Path:**
1. Master basic syntax and concepts
2. Practice with coding challenges
3. Build small projects
4. Learn version control (Git)
5. Contribute to open source

What programming language interests you most?"""
    
    # Mathematics questions
    elif any(keyword in question_lower for keyword in ['math', 'algebra', 'calculus', 'statistics', 'geometry']):
        return f"""Mathematics is the foundation of many fields! Here's guidance for {skill_level} learners:

**Key Areas to Focus On:**
- Basic arithmetic and algebra
- Problem-solving strategies
- Mathematical thinking
- Practical applications

**Learning Tips:**
- Practice regularly with problems
- Understand concepts, don't just memorize
- Apply math to real-world situations
- Use visual aids and examples

**Resources:**
- Khan Academy for structured learning
- Practice problems and exercises
- Mathematical puzzles and games

What specific math topic would you like help with?"""
    
    # General learning questions
    elif any(keyword in question_lower for keyword in ['learn', 'study', 'education', 'skill']):
        return f"""Learning is a lifelong journey! Here are some effective strategies for {skill_level} learners:

**Effective Learning Techniques:**
- Active recall and spaced repetition
- Break complex topics into smaller parts
- Practice regularly and consistently
- Teach others what you learn
- Use multiple learning resources

**Study Tips:**
- Create a dedicated study space
- Set specific, achievable goals
- Take breaks and avoid burnout
- Track your progress
- Join study groups or communities

**Recommended Approach:**
1. Set clear learning objectives
2. Create a study schedule
3. Use active learning methods
4. Practice and apply knowledge
5. Review and reinforce learning

What specific subject or skill would you like to focus on?"""
    
    # Default response
    else:
        return f"""I'm here to help you learn! As your AI tutor, I can assist with:

**What I Can Help With:**
- Programming and coding concepts
- Mathematics and problem-solving
- Study strategies and learning techniques
- Educational guidance and resources
- Answering specific questions

**How to Get the Best Help:**
- Ask specific questions
- Provide context about your skill level
- Let me know what you're trying to achieve
- Don't hesitate to ask follow-up questions

**Your Current Profile:**
- Skill Level: {skill_level}
- Subject Area: {subject_area}

What would you like to learn about today? Feel free to ask me anything!"""

def generate_follow_up_questions(question: str, subject_area: str) -> list:
    """Generate relevant follow-up questions"""
    question_lower = question.lower()
    
    if any(keyword in question_lower for keyword in ['programming', 'code', 'python', 'javascript']):
        return [
            "Can you show me a simple example?",
            "What are the best practices for this?",
            "How do I practice this concept?",
            "What are common mistakes to avoid?",
            "What should I learn next?"
        ]
    elif any(keyword in question_lower for keyword in ['math', 'algebra', 'calculus']):
        return [
            "Can you explain this step by step?",
            "What are some practice problems I can try?",
            "How is this used in real life?",
            "What's the connection to other math topics?",
            "What if I'm still confused?"
        ]
    else:
        return [
            "Can you explain this in simpler terms?",
            "What are some examples of this?",
            "How can I practice this?",
            "What resources do you recommend?",
            "What should I focus on next?"
        ]

def generate_learning_suggestions(subject_area: str, skill_level: str) -> list:
    """Generate learning suggestions based on subject and skill level"""
    suggestions = []
    
    if subject_area.lower() in ['programming', 'computer science']:
        if skill_level.lower() == 'beginner':
            suggestions = [
                "Start with basic syntax and variables",
                "Practice with simple coding exercises",
                "Build small projects to apply concepts",
                "Learn about debugging and problem-solving"
            ]
        elif skill_level.lower() == 'intermediate':
            suggestions = [
                "Focus on data structures and algorithms",
                "Learn about software design patterns",
                "Practice with more complex projects",
                "Explore different programming paradigms"
            ]
        else:  # advanced
            suggestions = [
                "Study advanced algorithms and complexity",
                "Learn about system design and architecture",
                "Contribute to open source projects",
                "Explore cutting-edge technologies"
            ]
    else:
        suggestions = [
            "Break down complex topics into smaller parts",
            "Practice regularly with exercises",
            "Use multiple learning resources",
            "Apply knowledge through projects"
        ]
    
    return suggestions

def calculate_tutor_confidence(question: str, skill_level: str) -> float:
    """Calculate confidence level for tutor response"""
    # Base confidence
    confidence = 0.7
    
    # Adjust based on question complexity
    complex_keywords = ['advanced', 'complex', 'optimization', 'architecture', 'design patterns']
    if any(keyword in question.lower() for keyword in complex_keywords):
        confidence += 0.1
    
    # Adjust based on skill level
    if skill_level.lower() == 'beginner':
        confidence += 0.1
    elif skill_level.lower() == 'advanced':
        confidence -= 0.1
    
    return min(0.95, max(0.5, confidence))

def extract_related_concepts(question: str, subject_area: str) -> list:
    """Extract related concepts from the question"""
    concepts = []
    question_lower = question.lower()
    
    # Programming concepts
    if any(keyword in question_lower for keyword in ['python', 'programming']):
        concepts.extend(['Variables', 'Functions', 'Loops', 'Data Types'])
    elif any(keyword in question_lower for keyword in ['javascript', 'web']):
        concepts.extend(['DOM', 'Events', 'Functions', 'Objects'])
    elif any(keyword in question_lower for keyword in ['math', 'algebra']):
        concepts.extend(['Equations', 'Variables', 'Functions', 'Graphs'])
    elif any(keyword in question_lower for keyword in ['learning', 'study']):
        concepts.extend(['Memory', 'Practice', 'Focus', 'Goals'])
    
    return concepts[:4]  # Limit to 4 concepts

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5002)

from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import json
import asyncio
from datetime import datetime
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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

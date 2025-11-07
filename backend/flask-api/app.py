import os
import re
import traceback
from datetime import datetime, timedelta
from flask import Flask, request, jsonify, session
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_mail import Mail, Message
from dotenv import load_dotenv
from itsdangerous import URLSafeTimedSerializer, SignatureExpired, BadSignature
from werkzeug.security import generate_password_hash, check_password_hash
from collections import OrderedDict
from dateutil.relativedelta import relativedelta
import numpy as np
import pandas as pd
import joblib
from google import genai
import random

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app, supports_credentials=True)

# Load MySQL credentials from environment variables
MYSQL_USER = os.getenv('MYSQL_USER', 'root')
MYSQL_PASSWORD = os.getenv('MYSQL_PASSWORD', '')
MYSQL_HOST = os.getenv('MYSQL_HOST', 'localhost')
MYSQL_DB = os.getenv('MYSQL_DB', 'swastha_db')

# Database setup for MySQL
app.config['SQLALCHEMY_DATABASE_URI'] = (
    f"mysql+pymysql://shweta:shweta123@localhost/swastha_db"
)
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Security Key
app.config['SECRET_KEY'] = os.getenv("SECRET_KEY", "default-secret-key")

# Mail configuration
app.config['MAIL_SERVER'] = 'smtp.gmail.com'
app.config['MAIL_PORT'] = 587
app.config['MAIL_USERNAME'] = os.getenv("MAIL_USERNAME")
app.config['MAIL_PASSWORD'] = os.getenv("MAIL_PASSWORD")
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USE_SSL'] = False

mail = Mail(app)
db = SQLAlchemy(app)

# Token Serializer
s = URLSafeTimedSerializer(app.config['SECRET_KEY'])

# Enable session
app.config['SESSION_TYPE'] = 'filesystem'

# Database Models
class User(db.Model):
    __tablename__ = 'swastha_users'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)

class Feedback(db.Model):
    __tablename__ = 'feedback'
    id = db.Column(db.Integer, primary_key=True)
    user_email = db.Column(db.String(120), nullable=False)
    rating = db.Column(db.Integer, nullable=False)
    comment = db.Column(db.Text, nullable=True)

# Analytics Table
class Analytics(db.Model):
    __tablename__ = 'analytics'
    id = db.Column(db.Integer, primary_key=True)
    type = db.Column(db.String(50), nullable=False)  # 'visit' or 'login'
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

# Utilities
def is_valid_email(email):
    pattern = r'^[\w\.-]+@[\w\.-]+\.\w+$'
    return re.match(pattern, email)

# Auth Routes
@app.route('/api/check-email', methods=['POST'])
def check_email():
    data = request.json
    email = data.get('email')
    if not email or not is_valid_email(email):
        return jsonify({'message': 'Invalid email format'}), 400

    exists = User.query.filter_by(email=email).first()
    if exists:
        return jsonify({'message': 'Email exists'}), 200
    return jsonify({'message': 'Email not found'}), 404

#-------------------------REGISTER--------------------------
@app.route('/api/register', methods=['POST'])
def register():
    data = request.json
    name = data.get('name')
    email = data.get('email')
    password = data.get('password')

    if not name or not email or not password:
        return jsonify({'message': 'All fields required'}), 400
    if not is_valid_email(email
                          ):
        return jsonify({'message': 'Invalid email format'}), 400
    if User.query.filter_by(email=email).first():
        return jsonify({'message': 'Email already exists'}), 409

    hashed_password = generate_password_hash(password, method='pbkdf2:sha256')
    user = User(name=name, email=email, password=hashed_password)
    db.session.add(user)
    db.session.commit()

    # Track visit for registration page
    db.session.add(Analytics(type='visit'))
    db.session.commit()

    # Send welcome email
    try:
        msg = Message('Welcome to Swastha 💚',
                      sender=app.config['MAIL_USERNAME'],
                      recipients=[email])
        msg.body = f"""
Hi {name},

🌸 Welcome to Swastha – Your PeeCeeSakhi! 🌸

We’re so happy to have you join our caring and supportive community, built especially to help women like you manage and embrace their PCOS journey with confidence, clarity, and compassion.

            Here’s what you can look forward to:
            💡 Track your symptoms, cycles, and moods
            📔 Maintain your wellness journal
            🧘‍♀️ Get personalized tips
            🌼 Understand your body better – because knowledge is power!
            🫶 And most importantly, never feel alone again on this path

            ✨ Your health journey matters – and we're here for every step.

            With love and support,
            The Swastha Team 💚

            ---
            (If you did not register for Swastha, please ignore this email.)
"""
        mail.send(msg)
    except Exception as e:
        print("Email sending failed:", e)
        return jsonify({'message': 'User saved, but email failed'}), 201

    return jsonify({'message': 'User registered and email sent!'}), 201

#------------------------LOGIN----------------------
@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    email = data.get('email')
    password = data.get('password')

    user = User.query.filter_by(email=email).first()
    if not user or not check_password_hash(user.password, password):
        return jsonify({'message': 'Invalid credentials'}), 401

    # Track login
    db.session.add(Analytics(type='login'))
    db.session.commit()

    return jsonify({'message': 'Login successful', 'user': {'name': user.name, 'email': user.email}}), 200

# ------------------- PASSWORD RESET ----------------------
@app.route('/api/send-reset-link', methods=['POST'])
def send_reset_link():
    data = request.json
    email = data.get('email')

    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({'message': 'Email not found'}), 404

    try:
        token = s.dumps(email, salt='password-reset-salt')
        reset_url = f"http://localhost:3000/reset/{token}"

        msg = Message('Reset Your Password',
                      sender=app.config['MAIL_USERNAME'],
                      recipients=[email])
        msg.body = f"""
Hello {user.name},

Click the link below to reset your password:
{reset_url}

If you did not request this, please ignore this email.
"""
        mail.send(msg)
    except Exception as e:
        print("Email sending failed:", str(e))
        return jsonify({'message': 'Failed to send email', 'error': str(e)}), 500

    return jsonify({'message': 'Reset link sent to your email'}), 200

@app.route('/api/reset-password/<token>', methods=['POST'])
def reset_password(token):
    try:
        email = s.loads(token, salt='password-reset-salt', max_age=1800)
    except SignatureExpired:
        return jsonify({'message': 'Token expired'}), 400
    except BadSignature:
        return jsonify({'message': 'Invalid token'}), 400

    data = request.json
    new_password = data.get('password')

    if not new_password:
        return jsonify({'message': 'Password required'}), 400

    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({'message': 'User not found'}), 404

    user.password = generate_password_hash(new_password, method='pbkdf2:sha256')
    db.session.commit()

    return jsonify({'message': 'Password updated successfully'}), 200

# ----------------------- PROFILE -------------------------
@app.route('/api/profile', methods=['GET'])
def get_profile():
    email = request.args.get('email')
    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({'message': 'User not found'}), 404
    return jsonify({'name': user.name, 'email': user.email}), 200

# --------------------- ACCOUNT DELETION --------------------
@app.route('/api/delete-account', methods=['POST'])
def delete_account():
    data = request.json
    email = data.get('email')
    password = data.get('password')

    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({'message': 'User not found'}), 404

    if not check_password_hash(user.password, password):
        return jsonify({'message': 'Incorrect password'}), 401

    try:
        # Delete all related records before deleting the user
        Entry.query.filter_by(user_id=email).delete()           # Journal
        PcosRiskEntry.query.filter_by(email=email).delete()     # PCOS Risk
        CycleEntry.query.filter_by(user_email=email).delete()   # Cycle Tracker
        Feedback.query.filter_by(user_email=email).delete()     # Feedback if you want to remove this too

        db.session.delete(user)
        db.session.commit()

        return jsonify({'message': 'Account and all related data deleted successfully'}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Failed to delete account: {str(e)}'}), 500

# ------------------- FEEDBACK --------------------
@app.route('/api/feedback', methods=['POST'])
def submit_feedback():
    try:
        data = request.json
        email = data.get('email')
        rating = data.get('rating')
        comment = data.get('comment', '').strip()

        if not rating or rating == 0:
            return jsonify({'message': 'Rating is required'}), 400

        feedback = Feedback(user_email=email, rating=rating, comment=comment)
        db.session.add(feedback)
        db.session.commit()

        try:
            msg = Message('New Feedback Received',
                          sender=app.config['MAIL_USERNAME'],
                          recipients=['swasthayourpeeceesakhi@gmail.com'])
            msg.reply_to = email
            msg.body = f"""
New feedback received:

📧 From: {email}
⭐ Rating: {rating}
📝 Feedback: {comment if comment else 'No comment provided'}
"""
            mail.send(msg)
        except Exception as e:
            print(f"Email sending failed: {e}")

        return jsonify({'message': 'Feedback submitted and email sent successfully'}), 200

    except Exception as e:
        print(f"Error in submit_feedback: {e}")
        return jsonify({'error': str(e)}), 500

# -------------------- ADMIN ---------------------
@app.route('/api/track-visit', methods=['POST'])
def track_visit():
    db.session.add(Analytics(type='visit'))
    db.session.commit()
    return jsonify({"message": "Visit tracked"}), 200

# Load admin credentials from env
ADMIN_EMAIL = os.getenv("ADMIN_EMAIL")
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD")

@app.route('/api/admin-login', methods=['POST'])
def admin_login():
    data = request.json
    email = data.get('email')
    password = data.get('password')

    if email == ADMIN_EMAIL and password == ADMIN_PASSWORD:
        session['admin'] = True
        return jsonify({"message": "Admin logged in successfully"}), 200
    return jsonify({"error": "Invalid credentials"}), 401

@app.route('/api/logout', methods=['POST'])
def logout():
    session.clear()  # Clears admin session
    return jsonify({"message": "Logged out successfully"}), 200

@app.route('/api/admin-analytics', methods=['GET'])
def admin_analytics():
    if not session.get('admin'):
        return jsonify({"error": "Unauthorized"}), 403

    filter_range = request.args.get('range', '30days')
    now = datetime.utcnow()

    if filter_range == 'week':
        start_date = now - timedelta(days=7)
    elif filter_range == '30days':
        start_date = now - timedelta(days=30)
    elif filter_range == '3months':
        start_date = now - timedelta(days=90)
    elif filter_range == 'year':
        start_date = now - timedelta(days=365)
    else:
        start_date = now - timedelta(days=30)

    # Registered Users
    total_users = User.query.count()

    # Fetch all visits and logins
    visits = Analytics.query.filter(Analytics.timestamp >= start_date, Analytics.type == 'visit').all()
    logins = Analytics.query.filter(Analytics.timestamp >= start_date, Analytics.type == 'login').all()

    # Combine visits + logins for "visitors" count
    all_visits = visits + logins

    grouped_data = OrderedDict()

    if filter_range == 'week':
        labels = [(now - timedelta(days=i)).strftime("%a") for i in range(6, -1, -1)]
        labels.reverse()
        for label in labels:
            grouped_data[label] = {"visitors": 0, "logins": 0}

        for v in all_visits:
            label = v.timestamp.strftime("%a")
            grouped_data[label]["visitors"] += 1
        for l in logins:
            label = l.timestamp.strftime("%a")
            grouped_data[label]["logins"] += 1

    elif filter_range == '30days':
        num_weeks = 4
        for i in range(1, num_weeks + 1):
            grouped_data[f"Week {i}"] = {"visitors": 0, "logins": 0}

        for v in all_visits:
            week_num = ((v.timestamp - start_date).days // 7) + 1
            if 1 <= week_num <= 4:
                grouped_data[f"Week {week_num}"]["visitors"] += 1
        for l in logins:
            week_num = ((l.timestamp - start_date).days // 7) + 1
            if 1 <= week_num <= 4:
                grouped_data[f"Week {week_num}"]["logins"] += 1

    elif filter_range in ['3months', 'year']:
        num_months = 3 if filter_range == '3months' else 12
        # Create correct month labels using relativedelta
        for i in range(num_months):
            month_date = now - relativedelta(months=i)
            month_label = month_date.strftime("%b")
            grouped_data[month_label] = {"visitors": 0, "logins": 0}

        # Reverse to get oldest → newest
        grouped_data = OrderedDict(reversed(list(grouped_data.items())))

        for v in all_visits:
            label = v.timestamp.strftime("%b")
            if label in grouped_data:
                grouped_data[label]["visitors"] += 1
        for l in logins:
            label = l.timestamp.strftime("%b")
            if label in grouped_data:
                grouped_data[label]["logins"] += 1

    # Convert grouped data to list for chart
    chart_data = [{"date": k, "visitors": v["visitors"], "logins": v["logins"]} for k, v in grouped_data.items()]

    return jsonify({
        "chart_data": chart_data,
        "visitors": len(all_visits),
        "logins": len(logins),
        "registered_users": total_users
    }), 200

#------------------ JOURNAL --------------------

class Entry(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.String(50), nullable=False)
    age = db.Column(db.Integer, nullable=True)
    weight = db.Column(db.String(20), nullable=True)
    cycle = db.Column(db.String(20), nullable=True)
    date = db.Column(db.String(20), nullable=False)
    mood = db.Column(db.String(20), nullable=False)
    entry = db.Column(db.Text, nullable=False)

@app.route('/api/entries', methods=['GET'])
def get_entries():
    user_id = request.args.get('user_id')
    if not user_id:
        return jsonify({"error": "Missing user_id"}), 400

    entries = Entry.query.filter_by(user_id=user_id).all()
    result = [
        {
            "id": e.id,
            "age": e.age,
            "weight": e.weight,
            "cycle": e.cycle,
            "date": e.date,
            "mood": e.mood,
            "entry": e.entry
        } for e in entries
    ]
    return jsonify({"entries": result})

@app.route('/api/entries', methods=['POST'])
def add_entry():
    data = request.json
    required = ["user_id", "age", "weight", "cycle", "date", "mood", "entry"]
    if not all(k in data for k in required):
        return jsonify({"error": "Missing data"}), 400

    new_entry = Entry(
        user_id=data["user_id"],
        age=data["age"],
        weight=data["weight"],
        cycle=data["cycle"],
        date=data["date"],
        mood=data["mood"],
        entry=data["entry"]
    )
    db.session.add(new_entry)
    db.session.commit()

    return jsonify({"message": "Entry added successfully"}), 200

# ------------------ RISK PREDICTION ------------------
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
model = joblib.load(os.path.join(BASE_DIR, "pcos_model.pkl"))

class PcosRiskEntry(db.Model):
    __tablename__ = "pcos_risk"
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    email = db.Column(db.String(255), nullable=False)
    risk_score = db.Column(db.Float, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

# Ensure DB tables are created
with app.app_context():
    db.create_all()

@app.route("/api/risk-prediction", methods=["POST"])
def predict():
    data = request.json
    features = data.get("features", {})
    email = data.get("email")

    if not email:
        return jsonify({"error": "Email is required"}), 400
    if not features or not isinstance(features, dict):
        return jsonify({"error": "Invalid or missing features"}), 400

    # Map frontend keys → model features
    feature_map = {
        "cycle_irregularity": "Cycle_Delay",
        "acne": "Acne",
        "hair_growth": "Excessive_Hair_Growth",
        "hair_loss": "Scalp_Hair_Loss",
        "skin_darkening": "Dark_Skin_Patches",
        "weight_gain": "Weight_Gain",
        "pain": "Pain"
    }

    # Convert boolean features (0/1) to model input
    input_data = {}
    for frontend_key, model_key in feature_map.items():
        val = features.get(frontend_key, 0)
        input_data[model_key] = [1 if val else 0]

    input_df = pd.DataFrame(input_data)

    # Predict probability of PCOS
    try:
        prob = model.predict_proba(input_df)[0][1]
        risk_percent = round(prob * 100, 2)
    except Exception as e:
        return jsonify({"error": f"Prediction failed: {str(e)}"}), 500

    # Save to DB
    try:
        new_entry = PcosRiskEntry(email=email, risk_score=risk_percent)
        db.session.add(new_entry)
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Database error: {str(e)}"}), 500

    return jsonify({"ML Predicted Risk (%)": risk_percent})

#---------------- BOT -----------------

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

MODEL_NAME = "gemini-2.5-flash"

@app.route("/pcos-bot", methods=["POST"])
def pcos_bot():
    try:
        user_message = request.json.get("message")
        if not user_message:
            return jsonify({"error": "No message provided"}), 400

        system_prompt = (
            "You are a helpful assistant that provides support and guidance on:\n"
            "- PCOS\n"
            "- PCOD\n"
            "- Women's health (including general health and self-care)\n"
            "- Emotional support\n"
            "- Fertility\n"
            "- Diet & healthy recipes\n"
            "- Exercises & fitness\n"
            "- Greetings (like hi, hello)\n"
            "- Lifestyle management for women\n\n"
            "Instructions:\n"
            "1. If the user expresses emotions (e.g., sad, upset, angry, tired, stressed, sorry, thank), "
            "reply empathetically with supportive messages.\n"
            "2. If the user makes grammar or spelling mistakes, always interpret their intent and still "
            "provide a meaningful answer without pointing out mistakes unless helpful.\n"
            "3. If the query is not related to any of the above topics, strictly reply:\n"
            "   'Sorry, I can’t provide information on that. I’m here to offer guidance, tips, and support "
            "related to PCOS, women’s health, and overall wellness.'\n\n"
            "Formatting rules:\n"
            "- Use **Markdown**\n"
            "- Bullet points (*)\n"
            "- Numbered lists (1.)\n"
            "- **Bold** for key terms\n"
            "- Line breaks for readability\n\n"
            "Keep answers clear, structured, empathetic, and easy to read."
        )

        # Build the conversation text for Gemini
        full_prompt = f"{system_prompt}\n\nUser: {user_message}"

        # ✅ Correct way to call Gemini
        response = client.models.generate_content(
            model=MODEL_NAME,
            contents=full_prompt
        )

        reply = response.text if hasattr(response, "text") else str(response)

        return jsonify({"reply": reply})

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
#-------------- TRACK CYCLE (CALENDER) --------------
class CycleEntry(db.Model):
    __tablename__ = 'cycle_entries'
    id = db.Column(db.Integer, primary_key=True)
    user_email = db.Column(db.String(120), nullable=False)
    period_date = db.Column(db.Date, nullable=False)
    ovulation_date = db.Column(db.Date, nullable=False)
    fertile_start = db.Column(db.Date, nullable=False)
    fertile_end = db.Column(db.Date, nullable=False)
    next_period_start = db.Column(db.Date, nullable=False)
    next_period_end = db.Column(db.Date, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)


def calculate_cycle_phases(period_date: datetime):
    ovulation_date = period_date + timedelta(days=13)       # 14th day (0-indexed 13)
    fertile_start = period_date + timedelta(days=10)        # 11th day
    fertile_end = period_date + timedelta(days=15)          # 16th day
    next_period_start = period_date + timedelta(days=27)    # 28th day
    next_period_end = period_date + timedelta(days=29)      # 30th day

    return {
        "period_days": [
            {"date": (period_date + timedelta(days=i)).strftime("%Y-%m-%d"), "color": "red"}
            for i in range(5)
        ],
        "fertile_window": [
            {"date": (fertile_start + timedelta(days=i)).strftime("%Y-%m-%d"), "color": "green"}
            for i in range((fertile_end - fertile_start).days + 1)
        ],
        "ovulation_day": {
            "date": ovulation_date.strftime("%Y-%m-%d"),
            "color": "blue"
        },
        "expected_next_period": [
            {"date": (next_period_start + timedelta(days=i)).strftime("%Y-%m-%d"), "color": "orange"}
            for i in range((next_period_end - next_period_start).days + 1)
        ]
    }

@app.route('/api/cycle', methods=['POST'])
def add_cycle():
    try:
        data = request.json
        email = data.get("email")
        period_date_str = data.get("period_date")

        if not email or not period_date_str:
            return jsonify({"error": "Missing email or period_date"}), 400

        period_date = datetime.strptime(period_date_str, "%Y-%m-%d")
        phases = calculate_cycle_phases(period_date)

        new_entry = CycleEntry(
            user_email=email,
            period_date=period_date,
            ovulation_date=datetime.strptime(phases["ovulation_day"]["date"], "%Y-%m-%d"),
            fertile_start=datetime.strptime(phases["fertile_window"][0]["date"], "%Y-%m-%d"),
            fertile_end=datetime.strptime(phases["fertile_window"][-1]["date"], "%Y-%m-%d"),
            next_period_start=datetime.strptime(phases["expected_next_period"][0]["date"], "%Y-%m-%d"),
            next_period_end=datetime.strptime(phases["expected_next_period"][-1]["date"], "%Y-%m-%d"),
        )

        db.session.add(new_entry)
        db.session.commit()

        return jsonify({
            "message": "Cycle added successfully",
            "phases": phases
        }), 200

    except Exception as e:
        traceback.print_exc()  # shows the real error in your terminal
        return jsonify({"error": str(e)}), 500


@app.route('/api/cycle', methods=['GET'])
def get_cycles():
    try:
        email = request.args.get("email")
        if not email:
            return jsonify({"error": "Missing email"}), 400

        entries = (CycleEntry.query
                   .filter_by(user_email=email)
                   .order_by(CycleEntry.created_at.desc())
                   .limit(3)
                   .all())

        result = []
        for e in entries:
            phases = calculate_cycle_phases(e.period_date)
            result.append({
                "period_date": e.period_date.strftime("%Y-%m-%d"),
                "phases": phases
            })

        return jsonify(result), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
#------------- RECOMMENDATION SYSTEM --------------

@app.route("/api/recommendations", methods=["GET"])
def get_recommendations():
    email = request.args.get("email")

    # Base tips for all users
    base_tips = {
        "Diet": [
            "🥗 Eat colorful fruits and veggies daily",
            "🍳 Include protein-rich foods in breakfast",
            "💧 Drink 6-8 glasses of water",
            "🥑 Add healthy fats like avocado and nuts",
            "🍞 Prefer whole grains over refined carbs",
            "🍵 Reduce sugary drinks and snacks"
        ],
        "Better Mood": [
            "😌 Practice mindfulness or meditation 10 mins daily",
            "🎵 Listen to your favorite music to uplift mood",
            "🚶‍♀️ Take short walks in nature",
            "📔 Maintain a gratitude journal",
            "🤝 Connect with loved ones often"
        ],
        "Care Yourself": [
            "🛀 Take relaxing baths or self-care routines",
            "🧘‍♀️ Do gentle stretches or yoga",
            "💧 Keep yourself hydrated",
            "📅 Plan breaks to avoid overworking",
            "🌸 Practice deep breathing when stressed"
        ],
        "PCOS Care": [
            "📊 Track your period cycle regularly",
            "🩺 Consult a specialist if cycles are irregular",
            "🏃‍♀️ Do regular cardio or yoga exercises",
            "⚖️ Maintain a healthy weight and BMI"
        ],
        "Hormone Balance": [
            "🛌 Maintain a consistent sleep schedule",
            "🧘‍♀️ Practice stress-relief techniques",
            "🥦 Eat foods rich in zinc, magnesium, and vitamin D",
            "🏋️ Exercise regularly"
        ]
    }

    # If user is not logged in, show only base tips
    if not email:
        return jsonify({
            "overall_mood": "No Data",
            "recommendations": base_tips,
            "last_cycles": ["No data"]
        })

    # Fetch all journal entries for this user
    journal_entries = Entry.query.filter_by(user_id=email).order_by(Entry.id.desc()).all()

    # Last cycle (only last valid)
    last_cycle = None
    for e in journal_entries:
        if e.cycle:
            try:
                last_cycle = int(e.cycle)
                break
            except:
                continue
    last_cycles_list = [last_cycle] if last_cycle is not None else ["No data"]

    # Mood Analysis
    mood_scores = {"Very Low": 1, "Low": 2, "Sad": 3, "Average": 4, "Happy": 5}
    total_score, count = 0, 0
    for e in journal_entries:
        score = mood_scores.get(e.mood, 3)
        total_score += score
        count += 1

    if count > 0:
        avg_mood = total_score / count
        if avg_mood >= 4.5:
            overall_mood = "Happy"
        elif avg_mood >= 3.5:
            overall_mood = "Average"
        elif avg_mood >= 2.5:
            overall_mood = "Low"
        elif avg_mood >= 1.5:
            overall_mood = "Sad"
        else:
            overall_mood = "Very Low"
    else:
        overall_mood = "No Data"

    # Initialize recommendations with empty lists
    tips = {k: [] for k in base_tips.keys()}

    # Mood-based adjustments
    if overall_mood == "Happy":
        tips["Better Mood"].extend([
            "🌟 Keep enjoying your happy moments!",
            "😊 Share your happiness with friends or family.",
            "🎵 Listen to uplifting music or podcasts.",
            "📔 Continue journaling to reflect on positive experiences.",
            "🚶‍♀️ Take short walks or outdoor activities to maintain energy.",
            "🎨 Engage in hobbies that make you feel even happier."
        ])
        tips["Care Yourself"].extend([
            "💫 Maintain your healthy habits",
            "🛀 Take relaxing baths or self-care breaks",
            "🧘‍♀️ Continue yoga or gentle stretches",
            "💧 Stay hydrated and eat nourishing meals",
            "🌸 Practice gratitude or mindfulness exercises"
        ])

    elif overall_mood == "Average":
        tips["Better Mood"].extend([
            "😊 Light exercise or hobbies can boost mood",
            "🎵 Listen to music to lift your spirits",
            "📔 Reflect on small positive moments in a journal",
            "🚶‍♀️ Take short walks or spend time outdoors"
        ])
        tips["Care Yourself"].extend([
            "🌿 Take short breaks to refresh",
            "🛀 Treat yourself to something relaxing",
            "💧 Maintain hydration and balanced meals",
            "🧘‍♀️ Try gentle stretches or meditation"
        ])

    elif overall_mood in ["Low", "Sad", "Very Low"]:
        tips["Better Mood"].extend([
            "🕯 Try journaling or meditation to uplift mood",
            "🤝 Connect with friends or loved ones for support",
            "🎵 Listen to calming music or podcasts",
            "🚶‍♀️ Go for a short walk or light activity",
            "📔 Write down small things that made you smile"
        ])
        tips["Care Yourself"].extend([
            "💖 Schedule 'me-time' daily",
            "🛀 Take relaxing baths or soothing routines",
            "💧 Drink enough water and eat healthy meals",
            "🧘‍♀️ Try gentle yoga or breathing exercises",
            "🌸 Practice mindfulness or gratitude exercises"
        ])

    # Cycle-based adjustments
    if last_cycle is not None:
        if 28 <= last_cycle <= 30:
            tips["PCOS Care"].extend([
                "✅ Your cycle is regular. Keep tracking and maintaining healthy habits.",
                "💪 Continue your exercise and balanced diet routines.",
                "📔 Keep journaling to maintain awareness of your cycle."
            ])
        else:
            tips["Diet"].extend([
                "🍲 Include foods to help regulate your menstrual cycle",
                "🥦 Eat zinc, magnesium, and iron-rich foods",
                "💧 Stay well hydrated and reduce sugary snacks"
            ])
            tips["PCOS Care"].extend([
                "⚠️ Your cycle seems irregular. Consider yoga, exercise, and consult a doctor if needed",
                "📅 Track your periods closely for patterns",
                "🧘‍♀️ Try stress-relief routines like meditation or breathing exercises"
            ])
            tips["Hormone Balance"].extend([
                "😌 Practice stress-relief daily",
                "🛌 Maintain consistent sleep schedules",
                "🏋️ Include light physical activity to support hormonal balance"
            ])

    #  if any category is empty, use base tips for that category
    for k in tips.keys():
        if not tips[k]:
            tips[k] = base_tips[k][:]  # copy of base tips

    # Shuffle each category and limit to 6 tips
    for k in tips:
        random.shuffle(tips[k])
        tips[k] = tips[k][:6]

    return jsonify({
        "overall_mood": overall_mood,
        "recommendations": tips,
        "last_cycles": last_cycles_list
    })

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(port=5000, debug=True)
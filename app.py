from flask import Flask, render_template, request, jsonify, redirect, url_for, send_from_directory
import json
import os
from datetime import datetime

app = Flask(__name__)

# Store test results in memory (in production, use a database)
test_results = {}

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/test')
def test():
    return render_template('test.html')

@app.route('/test-direct')
def test_direct():
    return render_template('test-direct.html')

@app.route('/results')
def results():
    return render_template('results.html')

@app.route('/privacy')
def privacy():
    return render_template('privacy.html')

@app.route('/terms')
def terms():
    return render_template('terms.html')

@app.route('/help')
def help():
    return render_template('help.html')

@app.route('/test-prep')
def test_prep():
    return render_template('test-prep.html')

@app.route('/submit-test', methods=['POST'])
def submit_test():
    """Handle test submission and redirect to email collection"""
    data = request.get_json()
    
    # Store test results
    test_id = datetime.now().strftime('%Y%m%d%H%M%S')
    test_results[test_id] = {
        'score': data.get('score'),
        'correctAnswers': data.get('correctAnswers'),
        'totalQuestions': data.get('totalQuestions'),
        'timeUsed': data.get('timeUsed'),
        'answers': data.get('answers'),
        'timestamp': datetime.now().isoformat()
    }
    
    return jsonify({
        'success': True,
        'test_id': test_id,
        'redirect': '/email-collection'
    })

@app.route('/email-collection')
def email_collection():
    """Email collection page"""
    return render_template('email_collection.html')

@app.route('/submit-email', methods=['POST'])
def submit_email():
    """Handle email submission and redirect to analysis"""
    data = request.get_json()
    email = data.get('email')
    test_id = data.get('test_id')
    
    if test_id in test_results:
        test_results[test_id]['email'] = email
        test_results[test_id]['email_submitted'] = datetime.now().isoformat()
    
    return jsonify({
        'success': True,
        'redirect': '/analysis'
    })

@app.route('/analysis')
def analysis():
    """Analysis page with progress bar"""
    return render_template('analysis.html')

@app.route('/final-results')
def final_results():
    """Final results page (payment required)"""
    return render_template('final_results.html')

@app.route('/questions.js')
def questions_js():
    """Serve questions.js file"""
    return send_from_directory('templates', 'questions.js')

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=8000) 
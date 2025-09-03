import { ScoreCard } from './types';

// Recent scores management class
export class ScoresManager {
  private static instance: ScoresManager;
  private scores: ScoreCard[] = [];
  private animationId: number | null = null;

  private readonly firstNames = [
    'Alex', 'Jordan', 'Taylor', 'Casey', 'Morgan', 'Riley', 'Quinn', 'Avery', 'Blake', 'Drew',
    'Emery', 'Finley', 'Harper', 'Hayden', 'Kendall', 'Logan', 'Parker', 'Reese', 'Rowan', 'Sage',
    'Skylar', 'Spencer', 'Tatum', 'Tyler', 'Wren', 'Zion', 'Adrian', 'Cameron', 'Dakota', 'Ellis',
    'Frankie', 'Gray', 'Harley', 'Indigo', 'Jules', 'Kai', 'Lane', 'Mickey', 'Nico', 'Oakley'
  ];

  private readonly lastNames = [
    'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez',
    'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin',
    'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson',
    'Walker', 'Young', 'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores'
  ];

  private readonly avatarColors = [
    'avatar-blue', 'avatar-green', 'avatar-purple', 'avatar-orange', 
    'avatar-teal', 'avatar-pink', 'avatar-indigo', 'avatar-cyan', 
    'avatar-lime', 'avatar-amber'
  ];

  private readonly timeAgoOptions = [
    '2 minutes ago', '5 minutes ago', '10 minutes ago', '15 minutes ago',
    '20 minutes ago', '30 minutes ago', '1 hour ago', '2 hours ago',
    '3 hours ago', '5 hours ago', '1 day ago', '2 days ago'
  ];

  constructor() {}

  public static getInstance(): ScoresManager {
    if (!ScoresManager.instance) {
      ScoresManager.instance = new ScoresManager();
    }
    return ScoresManager.instance;
  }

  // Generate Gaussian distributed IQ scores
  private generateGaussianScore(mean: number = 100, stdDev: number = 15): number {
    // Box-Muller transform for Gaussian distribution
    let u1 = 0, u2 = 0;
    do {
      u1 = Math.random();
      u2 = Math.random();
    } while (u1 === 0);
    
    const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
    const score = Math.round(mean + z0 * stdDev);
    
    // Clamp to realistic IQ range (55-145)
    return Math.max(55, Math.min(145, score));
  }

  // Generate random name
  private generateRandomName(): string {
    const firstName = this.firstNames[Math.floor(Math.random() * this.firstNames.length)];
    const lastName = this.lastNames[Math.floor(Math.random() * this.lastNames.length)];
    return `${firstName} ${lastName}`;
  }

  // Generate random time ago
  private generateTimeAgo(): string {
    const randomIndex = Math.floor(Math.random() * this.timeAgoOptions.length);
    return this.timeAgoOptions[randomIndex] || 'Recently';
  }

  // Get avatar color based on name
  private getAvatarColor(name: string): string {
    // Create a simple hash from the name to consistently assign colors
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      const char = name.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    const colorIndex = Math.abs(hash) % this.avatarColors.length;
    return this.avatarColors[colorIndex] || 'avatar-blue';
  }

  // Create score card HTML
  private createScoreCardHTML(scoreCard: ScoreCard): string {
    const initials = scoreCard.name.split(' ').map(n => n[0]).join('');
    const avatarColor = this.getAvatarColor(scoreCard.name);
    
    return `
      <div class="score-card">
        <div class="score-info">
          <div class="score-avatar ${avatarColor}">${initials}</div>
          <div class="score-details">
            <h4>${scoreCard.name}</h4>
            <p>${scoreCard.timeAgo}</p>
          </div>
        </div>
        <div class="score-value">${scoreCard.score}</div>
      </div>
    `;
  }

  // Generate random scores
  private generateRandomScores(count: number): ScoreCard[] {
    const scores: ScoreCard[] = [];
    
    for (let i = 0; i < count; i++) {
      const name = this.generateRandomName();
      const score = this.generateGaussianScore();
      const timeAgo = this.generateTimeAgo();
      
      scores.push({
        name,
        score,
        timeAgo,
        avatar: this.getAvatarColor(name)
      });
    }
    
    return scores;
  }

  // Initialize recent scores
  public initializeRecentScores(): void {
    this.scores = this.generateRandomScores(20);
    this.renderScores();
    this.updateStatistics();
  }

  // Render scores to DOM
  private renderScores(): void {
    const scoresTrack = document.getElementById('scoresTrack');
    if (!scoresTrack) return;

    // Create duplicate set for seamless loop
    const allScores = [...this.scores, ...this.scores];
    
    // Generate HTML for all scores
    const scoresHTML = allScores.map(score => 
      this.createScoreCardHTML(score)
    ).join('');
    
    scoresTrack.innerHTML = scoresHTML;
  }

  // Update score statistics
  private updateStatistics(): void {
    const totalTests = this.scores.length;
    const avgScore = Math.round(this.scores.reduce((sum, score) => sum + score.score, 0) / totalTests);
    const highestScore = Math.max(...this.scores.map(score => score.score));
    
    // Animate statistics
    this.animateNumber(document.getElementById('totalTests'), 0, totalTests, 2000);
    this.animateNumber(document.getElementById('avgScore'), 0, avgScore, 2000);
    this.animateNumber(document.getElementById('highestScore'), 0, highestScore, 2000);
  }

  // Animate number counting
  private animateNumber(element: HTMLElement | null, start: number, end: number, duration: number): void {
    if (!element) return;
    
    const startTime = performance.now();
    const originalText = element.textContent || '';
    
    const updateNumber = (currentTime: number): void => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      const current = Math.floor(start + (end - start) * progress);
      element.textContent = current.toString();
      
      if (progress < 1) {
        this.animationId = requestAnimationFrame(updateNumber);
      } else {
        element.textContent = originalText;
      }
    };
    
    this.animationId = requestAnimationFrame(updateNumber);
  }

  // Add new score
  public addScore(name: string, score: number): void {
    const newScore: ScoreCard = {
      name,
      score,
      timeAgo: 'Just now',
      avatar: this.getAvatarColor(name)
    };
    
    this.scores.unshift(newScore);
    
    // Keep only the last 20 scores
    if (this.scores.length > 20) {
      this.scores = this.scores.slice(0, 20);
    }
    
    this.renderScores();
    this.updateStatistics();
  }

  // Get score statistics
  public getStatistics(): { total: number; average: number; highest: number; lowest: number } {
    const total = this.scores.length;
    const average = Math.round(this.scores.reduce((sum, score) => sum + score.score, 0) / total);
    const highest = Math.max(...this.scores.map(score => score.score));
    const lowest = Math.min(...this.scores.map(score => score.score));
    
    return { total, average, highest, lowest };
  }

  // Cleanup animations
  public cleanup(): void {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }
}

// Export singleton instance
export const scoresManager = ScoresManager.getInstance();

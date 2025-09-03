import { ModalConfig, EmailCheckResponse, LoginResponse } from './types';

// Modal management class
export class ModalManager {
  private static instance: ModalManager;
  private modal: HTMLElement | null = null;
  private config: ModalConfig;

  constructor() {
    this.config = {
      overlayClass: 'modal-overlay',
      modalClass: 'login-modal',
      closeButtonClass: 'modal-close',
      animationDuration: 300
    };
  }

  public static getInstance(): ModalManager {
    if (!ModalManager.instance) {
      ModalManager.instance = new ModalManager();
    }
    return ModalManager.instance;
  }

  // Show login modal
  public showLoginModal(): void {
    this.modal = document.getElementById('loginModal');
    if (!this.modal) return;

    this.modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    // Focus on first input
    setTimeout(() => {
      const emailInput = document.getElementById('email') as HTMLInputElement;
      if (emailInput) {
        emailInput.focus();
      }
    }, this.config.animationDuration);
  }

  // Hide login modal
  public hideLoginModal(): void {
    if (!this.modal) return;

    this.modal.classList.remove('active');
    document.body.style.overflow = 'auto';
    this.resetModal();
  }

  // Reset modal to initial state
  private resetModal(): void {
    this.showStep('emailStep');
    this.hideStep('passwordStep');
    this.hideStep('newUserStep');
  }

  // Show specific step
  private showStep(stepId: string): void {
    const step = document.getElementById(stepId);
    if (step) {
      step.style.display = 'block';
      step.classList.add('login-step');
    }
  }

  // Hide specific step
  private hideStep(stepId: string): void {
    const step = document.getElementById(stepId);
    if (step) {
      step.style.display = 'none';
    }
  }

  // Check email and proceed to next step
  public async checkEmail(event: Event): Promise<void> {
    event.preventDefault();
    
    const emailInput = document.getElementById('email') as HTMLInputElement;
    if (!emailInput) return;

    const email = emailInput.value.trim();
    if (!email) {
      this.showError('Please enter an email address');
      return;
    }

    try {
      // Simulate API call
      const response = await this.simulateEmailCheck(email);
      
      if (response.exists) {
        this.showStep('passwordStep');
        this.hideStep('emailStep');
        
        const passwordInput = document.getElementById('password') as HTMLInputElement;
        if (passwordInput) {
          passwordInput.focus();
        }
      } else {
        this.showStep('newUserStep');
        this.hideStep('emailStep');
      }
    } catch (error) {
      this.showError('An error occurred. Please try again.');
      console.error('Email check error:', error);
    }
  }

  // Handle login
  public async handleLogin(event: Event): Promise<void> {
    event.preventDefault();
    
    const emailInput = document.getElementById('email') as HTMLInputElement;
    const passwordInput = document.getElementById('password') as HTMLInputElement;
    
    if (!emailInput || !passwordInput) return;

    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    if (!email || !password) {
      this.showError('Please fill in all fields');
      return;
    }

    const loginBtn = (event.target as HTMLElement).querySelector('.login-btn') as HTMLButtonElement;
    if (!loginBtn) return;

    const originalText = loginBtn.innerHTML;
    
    // Show loading state
    loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Signing In...';
    loginBtn.disabled = true;

    try {
      // Simulate API call
      const response = await this.simulateLogin(email, password);
      
      if (response.success) {
        this.showSuccess('Login successful! Welcome back.');
        setTimeout(() => {
          this.hideLoginModal();
          // Redirect to dashboard or test page
          window.location.href = response.redirectUrl || 'test-prep.html';
        }, 1000);
      } else {
        this.showError(response.message || 'Login failed');
      }
    } catch (error) {
      this.showError('An error occurred. Please try again.');
      console.error('Login error:', error);
    } finally {
      // Reset button state
      loginBtn.innerHTML = originalText;
      loginBtn.disabled = false;
    }
  }

  // Go back to email step
  public backToEmail(): void {
    this.showStep('emailStep');
    this.hideStep('passwordStep');
    this.hideStep('newUserStep');
    
    const emailInput = document.getElementById('email') as HTMLInputElement;
    if (emailInput) {
      emailInput.focus();
    }
  }

  // Start new test
  public startNewTest(): void {
    this.hideLoginModal();
    window.location.href = 'test-prep.html';
  }

  // Simulate email check API call
  private async simulateEmailCheck(email: string): Promise<EmailCheckResponse> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const existingEmails = ['test@example.com', 'user@testify.com', 'demo@testify.com'];
    const exists = existingEmails.includes(email);
    
    return {
      success: true,
      exists,
      message: exists ? 'Email found' : 'Email not found'
    };
  }

  // Simulate login API call
  private async simulateLogin(email: string, password: string): Promise<LoginResponse> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Simple validation for demo
    if (email === 'test@example.com' && password === 'password') {
      return {
        success: true,
        message: 'Login successful',
        token: 'demo-token-123',
        user: {
          email,
          testHistory: []
        },
        redirectUrl: 'test-prep.html'
      };
    }
    
    return {
      success: false,
      message: 'Invalid email or password'
    };
  }

  // Show error message
  private showError(message: string): void {
    // Create or update error message element
    let errorElement = document.querySelector('.modal-error') as HTMLElement;
    if (!errorElement) {
      errorElement = document.createElement('div');
      errorElement.className = 'modal-error';
      errorElement.style.cssText = `
        background: #ff6b6b;
        color: white;
        padding: 1rem;
        border-radius: 10px;
        margin: 1rem 0;
        text-align: center;
        font-weight: 500;
      `;
      
      const modal = document.querySelector('.login-modal');
      if (modal) {
        modal.insertBefore(errorElement, modal.firstChild);
      }
    }
    
    errorElement.textContent = message;
    errorElement.style.display = 'block';
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
      errorElement.style.display = 'none';
    }, 5000);
  }

  // Show success message
  private showSuccess(message: string): void {
    // Create or update success message element
    let successElement = document.querySelector('.modal-success') as HTMLElement;
    if (!successElement) {
      successElement = document.createElement('div');
      successElement.className = 'modal-success';
      successElement.style.cssText = `
        background: #4CAF50;
        color: white;
        padding: 1rem;
        border-radius: 10px;
        margin: 1rem 0;
        text-align: center;
        font-weight: 500;
      `;
      
      const modal = document.querySelector('.login-modal');
      if (modal) {
        modal.insertBefore(successElement, modal.firstChild);
      }
    }
    
    successElement.textContent = message;
    successElement.style.display = 'block';
    
    // Auto-hide after 3 seconds
    setTimeout(() => {
      successElement.style.display = 'none';
    }, 3000);
  }

  // Initialize modal event listeners
  public initEventListeners(): void {
    // Close modal when clicking outside
    document.addEventListener('click', (e: Event) => {
      const target = e.target as HTMLElement;
      if (target.classList.contains('modal-overlay')) {
        this.hideLoginModal();
      }
    });

    // Close modal with Escape key
    document.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        this.hideLoginModal();
      }
    });

    // Close button
    const closeBtn = document.querySelector('.modal-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        this.hideLoginModal();
      });
    }
  }
}

// Export singleton instance
export const modalManager = ModalManager.getInstance();

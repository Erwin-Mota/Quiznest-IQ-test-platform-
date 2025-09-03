import { animationManager } from './animations';
import { modalManager } from './modal';
import { scoresManager } from './scores';

// Main application class
export class IQTestApp {
  private static instance: IQTestApp;
  private isInitialized: boolean = false;

  private constructor() {}

  public static getInstance(): IQTestApp {
    if (!IQTestApp.instance) {
      IQTestApp.instance = new IQTestApp();
    }
    return IQTestApp.instance;
  }

  // Initialize the application
  public async initialize(): Promise<void> {
    if (this.isInitialized) {
      console.warn('App already initialized');
      return;
    }

    try {
      console.log('Initializing IQ Test Application...');

      // Wait for DOM to be ready
      if (document.readyState === 'loading') {
        await new Promise(resolve => {
          document.addEventListener('DOMContentLoaded', resolve);
        });
      }

      // Initialize all modules
      this.initializeAnimations();
      this.initializeModal();
      this.initializeScores();
      this.initializeNavigation();
      this.initializeMobileMenu();

      this.isInitialized = true;
      console.log('IQ Test Application initialized successfully');

    } catch (error) {
      console.error('Failed to initialize application:', error);
      throw error;
    }
  }

  // Initialize animations
  private initializeAnimations(): void {
    animationManager.initSmoothScrolling({ offset: 80 });
    animationManager.initScrollAnimations();
    animationManager.initFeatureCardAnimations();
    animationManager.initParallaxEffect();
    animationManager.initHoverEffects();
    animationManager.initLoadingAnimation();
  }

  // Initialize modal functionality
  private initializeModal(): void {
    modalManager.initEventListeners();
    
    // Bind global functions for backward compatibility
    (window as any).showLoginModal = () => modalManager.showLoginModal();
    (window as any).hideLoginModal = () => modalManager.hideLoginModal();
    (window as any).checkEmail = (e: Event) => modalManager.checkEmail(e);
    (window as any).handleLogin = (e: Event) => modalManager.handleLogin(e);
    (window as any).backToEmail = () => modalManager.backToEmail();
    (window as any).startNewTest = () => modalManager.startNewTest();
  }

  // Initialize scores functionality
  private initializeScores(): void {
    scoresManager.initializeRecentScores();
  }

  // Initialize navigation
  private initializeNavigation(): void {
    this.initializeNavbarScroll();
    this.initializeActiveNavigation();
  }

  // Initialize navbar scroll effects
  private initializeNavbarScroll(): void {
    const navbar = document.querySelector('header');
    if (!navbar) return;

    let lastScrollY = window.scrollY;

    const handleScroll = (): void => {
      const currentScrollY = window.scrollY;
      
      // Add/remove scrolled class for navbar styling
      if (currentScrollY > 100) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
      
      // Hide/show navbar on scroll (optional)
      if (currentScrollY > lastScrollY && currentScrollY > 200) {
        (navbar as HTMLElement).style.transform = 'translateY(-100%)';
      } else {
        (navbar as HTMLElement).style.transform = 'translateY(0)';
      }
      
      lastScrollY = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
  }

  // Initialize active navigation highlighting
  private initializeActiveNavigation(): void {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-links a, .mobile-menu a');

    const updateActiveNavigation = (): void => {
      let current = '';
      
      sections.forEach(section => {
        const sectionTop = (section as HTMLElement).offsetTop;
        
        if (window.scrollY >= (sectionTop - 200)) {
          current = section.getAttribute('id') || '';
        }
      });

      navLinks.forEach(link => {
        link.classList.remove('active');
        const href = (link as HTMLAnchorElement).getAttribute('href');
        if (href === `#${current}`) {
          link.classList.add('active');
        }
      });
    };

    window.addEventListener('scroll', updateActiveNavigation, { passive: true });
  }

  // Initialize mobile menu
  private initializeMobileMenu(): void {
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileMenu = document.getElementById('mobileMenu');

    if (!mobileMenuBtn || !mobileMenu) return;

    mobileMenuBtn.addEventListener('click', () => {
      mobileMenu.classList.toggle('active');
      const icon = mobileMenuBtn.querySelector('i');
      if (icon) {
        if (mobileMenu.classList.contains('active')) {
          icon.className = 'fas fa-times';
        } else {
          icon.className = 'fas fa-bars';
        }
      }
    });

    // Close mobile menu when clicking on links
    document.querySelectorAll('.mobile-menu a').forEach(link => {
      link.addEventListener('click', () => {
        mobileMenu.classList.remove('active');
        const icon = mobileMenuBtn.querySelector('i');
        if (icon) {
          icon.className = 'fas fa-bars';
        }
      });
    });
  }

  // Cleanup method
  public cleanup(): void {
    animationManager.cleanup();
    scoresManager.cleanup();
    this.isInitialized = false;
  }

  // Get initialization status
  public getInitializationStatus(): boolean {
    return this.isInitialized;
  }
}

// Initialize app when DOM is ready
const app = IQTestApp.getInstance();

// Auto-initialize if DOM is already ready
if (document.readyState !== 'loading') {
  app.initialize().catch(console.error);
} else {
  document.addEventListener('DOMContentLoaded', () => {
    app.initialize().catch(console.error);
  });
}

// Export for manual initialization if needed
export default app;

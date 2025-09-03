import { ObserverOptions } from './types';

// Animation utility class
export class AnimationManager {
  private static instance: AnimationManager;
  private observers: Map<string, IntersectionObserver> = new Map();
  private animations: Map<string, number> = new Map();

  public static getInstance(): AnimationManager {
    if (!AnimationManager.instance) {
      AnimationManager.instance = new AnimationManager();
    }
    return AnimationManager.instance;
  }

  // Smooth scrolling for navigation links
  public initSmoothScrolling(config: { offset?: number } = {}): void {
    const offset = config.offset || 0;
    
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', (e: Event) => {
        e.preventDefault();
        const target = document.querySelector((anchor as HTMLAnchorElement).getAttribute('href') || '');
        
        if (target) {
          const targetPosition = (target as HTMLElement).offsetTop - offset;
          window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
          });
        }
      });
    });
  }

  // Animate number counting
  public animateNumber(
    element: HTMLElement,
    start: number,
    end: number,
    duration: number,
    suffix: string = ''
  ): void {
    const startTime = performance.now();
    const originalText = element.textContent || '';
    
    const updateNumber = (currentTime: number): void => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      const current = Math.floor(start + (end - start) * progress);
      element.textContent = current + suffix;
      
      if (progress < 1) {
        requestAnimationFrame(updateNumber);
      } else {
        element.textContent = originalText;
      }
    };
    
    requestAnimationFrame(updateNumber);
  }

  // Create intersection observer for scroll animations
  public createObserver(
    name: string,
    callback: (entries: IntersectionObserverEntry[]) => void,
    options: ObserverOptions
  ): IntersectionObserver {
    const observer = new IntersectionObserver(callback, options);
    this.observers.set(name, observer);
    return observer;
  }

  // Animate elements on scroll
  public initScrollAnimations(): void {
    const observerOptions: ObserverOptions = {
      threshold: 0.5,
      rootMargin: '0px 0px -100px 0px'
    };

    // IQ Fill bar animation
    const iqObserver = this.createObserver('iq-fill', (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const iqFill = document.getElementById('iqFill');
          if (iqFill) {
            iqFill.style.width = '100%';
          }
        }
      });
    }, observerOptions);

    const iqScale = document.querySelector('.iq-scale');
    if (iqScale) {
      iqObserver.observe(iqScale);
    }

    // Stats animation
    const statsObserver = this.createObserver('stats', (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const target = entry.target as HTMLElement;
          const finalValue = parseInt(target.textContent || '0');
          this.animateNumber(target, 0, finalValue, 2000);
        }
      });
    }, observerOptions);

    const statNumbers = document.querySelectorAll('.stat-number');
    statNumbers.forEach(stat => {
      statsObserver.observe(stat);
    });
  }

  // Add floating animation to feature cards
  public initFeatureCardAnimations(): void {
    const featureCards = document.querySelectorAll('.feature-card.interactive');
    featureCards.forEach((card, index) => {
      const htmlCard = card as HTMLElement;
      htmlCard.style.animationDelay = `${index * 0.1}s`;
      htmlCard.style.animation = 'fadeInUp 0.6s ease both';
    });
  }

  // Parallax effect for hero section
  public initParallaxEffect(): void {
    let ticking = false;

    const updateParallax = (): void => {
      const scrolled = window.pageYOffset;
      const hero = document.querySelector('.hero') as HTMLElement;
      
      if (hero) {
        const rate = scrolled * -0.5;
        hero.style.transform = `translateY(${rate}px)`;
      }
      
      ticking = false;
    };

    const requestTick = (): void => {
      if (!ticking) {
        requestAnimationFrame(updateParallax);
        ticking = true;
      }
    };

    window.addEventListener('scroll', requestTick, { passive: true });
  }

  // Add interactive hover effects
  public initHoverEffects(): void {
    document.querySelectorAll('.btn').forEach(button => {
      const htmlButton = button as HTMLElement;
      
      htmlButton.addEventListener('mouseenter', () => {
        htmlButton.style.transform = 'translateY(-3px) scale(1.05)';
      });
      
      htmlButton.addEventListener('mouseleave', () => {
        htmlButton.style.transform = 'translateY(0) scale(1)';
      });
    });
  }

  // Loading animation
  public initLoadingAnimation(): void {
    window.addEventListener('load', () => {
      const body = document.body;
      body.style.opacity = '0';
      body.style.transition = 'opacity 0.5s ease';
      
      setTimeout(() => {
        body.style.opacity = '1';
      }, 100);
    });
  }

  // Cleanup observers
  public cleanup(): void {
    this.observers.forEach(observer => {
      observer.disconnect();
    });
    this.observers.clear();
    
    this.animations.forEach(animationId => {
      cancelAnimationFrame(animationId);
    });
    this.animations.clear();
  }
}

// Export singleton instance
export const animationManager = AnimationManager.getInstance();

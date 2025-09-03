import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { Brain, Shield, BarChart3, User, Play, Rocket, Info, ChartLine, Smartphone, Trophy, Lock, Eye, Clock, Target, Zap, Star, Users, TrendingUp, Award, CheckCircle, ArrowRight, ArrowLeft, X, Mail, Lock as LockIcon, UserPlus, Play as PlayIcon, Heart, Facebook, Twitter, Linkedin, Instagram, Menu, Sparkles } from 'lucide-react';
import { IQTest } from './components/IQTest';
import { allQuestions } from './data/advancedQuestions';
import { Answer } from './types/IQTest';

// Homepage styling that matches the index.html exactly
const AppContainer = styled.div`
  min-height: 100vh;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  line-height: 1.6;
  color: #333;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
`;

const Header = styled.header`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  padding: 0.7rem 0;
  position: fixed;
  width: 100%;
  top: 0;
  z-index: 1000;
  box-shadow: 0 2px 20px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  
  &.scrolled {
    background: rgba(255, 255, 255, 0.98);
    padding: 0.5rem 0;
  }
`;

const NavContainer = styled.nav`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Logo = styled.a`
  font-size: 1.6rem;
  font-weight: 700;
  color: #667eea;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: transform 0.3s ease;
  position: relative;
  overflow: hidden;
  
  &:hover {
    transform: scale(1.05);
  }
  
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 0;
    height: 2px;
    background: linear-gradient(90deg, #667eea, #764ba2);
    transition: width 0.3s ease;
  }
  
  &:hover::after {
    width: 100%;
  }
`;

const NavLinks = styled.ul`
  display: flex;
  list-style: none;
  gap: 1rem;
  align-items: center;
  
  @media (max-width: 768px) {
    display: none;
  }
`;

const NavButton = styled.a<{ variant: 'primary' | 'secondary' }>`
  text-decoration: none;
  color: ${props => props.variant === 'primary' ? 'white' : '#667eea'};
  font-weight: 500;
  transition: all 0.3s ease;
  position: relative;
  padding: 0.6rem 1.2rem;
  border-radius: 20px;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.9rem;
  letter-spacing: 0.3px;
  overflow: hidden;
  cursor: pointer;
  
  ${props => props.variant === 'primary' ? `
    background: linear-gradient(45deg, #667eea, #764ba2);
    box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
  ` : `
    background: rgba(255, 255, 255, 0.9);
    border: 2px solid rgba(102, 126, 234, 0.3);
    backdrop-filter: blur(10px);
  `}
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    transition: left 0.5s ease;
  }
  
  &:hover::before {
    left: 100%;
  }
  
  &:hover {
    color: ${props => props.variant === 'primary' ? 'white' : '#667eea'};
    background: ${props => props.variant === 'primary' ? 'linear-gradient(45deg, #667eea, #764ba2)' : 'rgba(102, 126, 234, 0.1)'};
    border-color: ${props => props.variant === 'secondary' ? '#667eea' : 'transparent'};
    transform: translateY(-3px) scale(1.05);
    box-shadow: ${props => props.variant === 'primary' ? '0 8px 25px rgba(102, 126, 234, 0.4)' : '0 8px 25px rgba(102, 126, 234, 0.2)'};
  }
`;

const MobileMenuBtn = styled.button`
  display: none;
  background: none;
  border: none;
  font-size: 1.3rem;
  color: #333;
  cursor: pointer;
  padding: 0.4rem;
  border-radius: 5px;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(102, 126, 234, 0.1);
    color: #667eea;
  }
  
  @media (max-width: 768px) {
    display: block;
  }
`;

const MobileMenu = styled.div<{ isOpen: boolean }>`
  display: none;
  position: fixed;
  top: 100%;
  left: 0;
  width: 100%;
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(10px);
  padding: 2rem;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
  transform: translateY(-100%);
  transition: transform 0.3s ease;
  
  @media (max-width: 768px) {
    display: block;
    transform: ${props => props.isOpen ? 'translateY(0)' : 'translateY(-100%)'};
  }
  
  ul {
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
  
  a {
    text-decoration: none;
    color: #333;
    font-weight: 500;
    padding: 1rem;
    border-radius: 10px;
    transition: all 0.3s ease;
    display: block;
    
    &:hover {
      background: rgba(102, 126, 234, 0.1);
      color: #667eea;
      transform: translateX(10px);
    }
  }
`;

// Hero Section
const Hero = styled.section`
  padding: 120px 0 80px;
  color: white;
  position: relative;
  overflow: hidden;
`;

const HeroContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
`;

const HeroContent = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  align-items: center;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 2rem;
    text-align: center;
  }
`;

const HeroText = styled.div`
  text-align: left;
  
  @media (max-width: 768px) {
    text-align: center;
  }
`;

const HeroTitle = styled.h1`
  font-size: 3.5rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
  line-height: 1.1;
  
  @media (max-width: 768px) {
    font-size: 2.5rem;
  }
`;

const TitleLine = styled.span`
  display: block;
  color: rgba(255, 255, 255, 0.9);
`;

const TitleHighlight = styled.span`
  display: block;
  background: linear-gradient(45deg, #ff6b6b, #ee5a24);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: shimmer 2s ease-in-out infinite;
`;

const HeroSubtitle = styled.p`
  font-size: 1.2rem;
  margin-bottom: 2rem;
  opacity: 0.9;
  line-height: 1.6;
`;

const HeroStats = styled.div`
  display: flex;
  gap: 1.5rem;
  margin-bottom: 2rem;
  
  @media (max-width: 768px) {
    justify-content: center;
  }
`;

const StatBubble = styled.div<{ delay: number }>`
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 1rem 1.5rem;
  text-align: center;
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  animation: statFloat 3s ease-in-out infinite;
  animation-delay: ${props => props.delay}s;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    transition: left 0.6s ease;
  }
  
  &:hover::before {
    left: 100%;
  }
  
  &:hover {
    transform: translateY(-8px) scale(1.05);
    background: rgba(255, 255, 255, 0.25);
    box-shadow: 0 15px 30px rgba(255, 255, 255, 0.2);
  }
`;

const StatNumber = styled.span`
  display: block;
  font-size: 1.8rem;
  font-weight: 700;
  color: #ff6b6b;
  animation: numberGlow 2s ease-in-out infinite;
`;

const StatLabel = styled.span`
  font-size: 0.8rem;
  opacity: 0.8;
  transition: all 0.3s ease;
  
  ${StatBubble}:hover & {
    opacity: 1;
    transform: scale(1.05);
  }
`;

const CTAButtons = styled.div`
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: center;
  }
`;

const CTAButton = styled.a<{ variant: 'primary' | 'secondary' }>`
  padding: 15px 30px;
  border: none;
  border-radius: 50px;
  font-size: 1.1rem;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.3s ease;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  
  ${props => props.variant === 'primary' ? `
    background: linear-gradient(45deg, #ff6b6b, #ee5a24);
    color: white;
    box-shadow: 0 4px 15px rgba(255, 107, 107, 0.4);
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(255, 107, 107, 0.6);
    }
  ` : `
    background: rgba(255, 255, 255, 0.2);
    color: white;
    border: 2px solid rgba(255, 255, 255, 0.3);
    
    &:hover {
      background: rgba(255, 255, 255, 0.3);
      transform: translateY(-2px);
    }
  `}
`;

const HeroVisual = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
`;

const BrainAnimation = styled.div`
  position: relative;
  width: 300px;
  height: 300px;
  perspective: 1000px;
  
  @media (max-width: 768px) {
    width: 200px;
    height: 200px;
  }
`;

const BrainContainer = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: brainRotate 20s linear infinite;
`;

const BrainIcon = styled.div`
  font-size: 8rem;
  color: rgba(255, 255, 255, 0.9);
  animation: brainFloat 4s ease-in-out infinite;
  z-index: 2;
  position: relative;
  filter: drop-shadow(0 0 20px rgba(255, 255, 255, 0.3));
  
  @media (max-width: 768px) {
    font-size: 5rem;
  }
`;

const NeuralNetwork = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
`;

const Neuron = styled.div<{ delay: number }>`
  position: absolute;
  width: 12px;
  height: 12px;
  background: linear-gradient(45deg, #ff6b6b, #ff8e8e);
  border-radius: 50%;
  animation: neuronPulse 3s ease-in-out infinite;
  animation-delay: ${props => props.delay}s;
  box-shadow: 0 0 15px rgba(255, 107, 107, 0.6);
`;

const Synapse = styled.div<{ delay: number }>`
  position: absolute;
  width: 2px;
  height: 2px;
  background: linear-gradient(90deg, #ff6b6b, #ff8e8e);
  border-radius: 50%;
  animation: synapseGlow 2s ease-in-out infinite;
  animation-delay: ${props => props.delay}s;
`;

const BrainWaves = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  width: 200px;
  height: 200px;
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  animation: brainWave 3s ease-in-out infinite;
  
  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 150px;
    height: 150px;
    border: 2px solid rgba(255, 255, 255, 0.2);
    border-radius: 50%;
    transform: translate(-50%, -50%);
    animation: brainWave 3s ease-in-out infinite 0.5s;
  }
  
  &::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 100px;
    height: 100px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-radius: 50%;
    transform: translate(-50%, -50%);
    animation: brainWave 3s ease-in-out infinite 1s;
  }
`;

// Features Section
const Features = styled.section`
  padding: 60px 0;
  background: white;
`;

const FeaturesContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
`;

const FeaturesHeader = styled.div`
  text-align: center;
  margin-bottom: 3rem;
`;

const SectionTitle = styled.h2`
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  color: #333;
  background: linear-gradient(45deg, #667eea, #764ba2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const SectionSubtitle = styled.p`
  font-size: 1.1rem;
  color: #666;
  max-width: 500px;
  margin: 0 auto;
  line-height: 1.5;
`;

const FeaturesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
`;

const FeatureCard = styled.div<{ delay: number }>`
  background: white;
  padding: 1.5rem;
  border-radius: 15px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  text-align: left;
  transition: all 0.3s ease;
  border: 1px solid #f0f0f0;
  position: relative;
  overflow: hidden;
  animation: cardFloat 4s ease-in-out infinite;
  animation-delay: ${props => props.delay}s;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(102, 126, 234, 0.1), transparent);
    transition: left 0.5s ease;
  }
  
  &:hover::before {
    left: 100%;
  }
  
  &:hover {
    transform: translateY(-15px) scale(1.02);
    box-shadow: 0 25px 50px rgba(0, 0, 0, 0.2);
  }
`;

const FeatureIcon = styled.div`
  width: 60px;
  height: 60px;
  background: linear-gradient(45deg, #667eea, #764ba2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
  color: white;
  font-size: 1.5rem;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 0;
    height: 0;
    background: rgba(255, 255, 255, 0.3);
    border-radius: 50%;
    transform: translate(-50%, -50%);
    transition: all 0.6s ease;
  }
  
  ${FeatureCard}:hover &::before {
    width: 100px;
    height: 100px;
  }
  
  ${FeatureCard}:hover & {
    transform: scale(1.15) rotate(10deg);
    box-shadow: 0 10px 25px rgba(102, 126, 234, 0.4);
  }
`;

const FeatureTitle = styled.h3`
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 0.8rem;
  color: #333;
`;

const FeatureDescription = styled.p`
  color: #666;
  line-height: 1.5;
  margin-bottom: 1rem;
  font-size: 0.9rem;
`;

const FeatureProgress = styled.div`
  margin-top: 1rem;
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 8px;
  background: #f0f0f0;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 0.5rem;
`;

const ProgressFill = styled.div<{ width: number }>`
  height: 100%;
  background: linear-gradient(90deg, #4CAF50, #8BC34A);
  border-radius: 4px;
  transition: width 1s ease;
  width: ${props => props.width}%;
`;

const ProgressText = styled.span`
  font-size: 0.8rem;
  color: #666;
  font-weight: 500;
`;

// Global Styles
const GlobalStyles = styled.div`
  @keyframes shimmer {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.8; }
  }
  
  @keyframes statFloat {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-5px); }
  }
  
  @keyframes numberGlow {
    0%, 100% { text-shadow: 0 0 5px rgba(255, 107, 107, 0.3); }
    50% { text-shadow: 0 0 15px rgba(255, 107, 107, 0.8); }
  }
  
  @keyframes brainFloat {
    0%, 100% { transform: translateY(0px) rotateY(0deg); }
    25% { transform: translateY(-15px) rotateY(5deg); }
    50% { transform: translateY(-5px) rotateY(0deg); }
    75% { transform: translateY(-10px) rotateY(-5deg); }
  }
  
  @keyframes brainRotate {
    0% { transform: rotateY(0deg); }
    100% { transform: rotateY(360deg); }
  }
  
  @keyframes neuronPulse {
    0%, 100% { 
      transform: scale(1);
      opacity: 0.6;
    }
    50% { 
      transform: scale(1.5);
      opacity: 1;
    }
  }
  
  @keyframes synapseGlow {
    0%, 100% { 
      transform: scale(1);
      opacity: 0.3;
      box-shadow: 0 0 5px rgba(255, 107, 107, 0.5);
    }
    50% { 
      transform: scale(2);
      opacity: 1;
      box-shadow: 0 0 15px rgba(255, 107, 107, 0.8);
    }
  }
  
  @keyframes brainWave {
    0%, 100% { 
      transform: translate(-50%, -50%) scale(1);
      opacity: 0.3;
    }
    50% { 
      transform: translate(-50%, -50%) scale(1.1);
      opacity: 0.8;
    }
  }
  
  @keyframes cardFloat {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-3px); }
  }
`;

// Test page styling
const TestPageContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
`;

// Results page styling
const ResultsPageContainer = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
  color: white;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
`;

const ResultsCard = styled.div`
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  padding: 40px;
  max-width: 600px;
  width: 100%;
  color: #333;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
`;

const ScoreDisplay = styled.div`
  font-size: 4rem;
  font-weight: 900;
  color: #667eea;
  margin-bottom: 20px;
`;

const ResultsText = styled.p`
  font-size: 1.2rem;
  margin-bottom: 30px;
  color: #6b7280;
`;

const PaymentSection = styled.div`
  background: linear-gradient(135deg, #fef3c7, #fde68a);
  border-radius: 16px;
  padding: 30px;
  margin-top: 30px;
  border: 2px solid #f59e0b;
`;

const PaymentTitle = styled.h3`
  color: #d97706;
  margin-bottom: 20px;
  font-size: 1.5rem;
`;

const PaymentDescription = styled.p`
  color: #92400e;
  margin-bottom: 20px;
  font-size: 1rem;
`;

const PaymentButton = styled.button`
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border: none;
  padding: 15px 30px;
  font-size: 1.1rem;
  font-weight: 600;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 25px rgba(102, 126, 234, 0.4);
  }
`;

// Test Start Page Styling
const TestStartPageContainer = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
  color: white;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
`;

const TestStartContainer = styled.div`
  max-width: 800px;
  width: 100%;
  padding: 40px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
`;

const TestStartHeader = styled.div`
  margin-bottom: 30px;
  h1 {
    font-size: 2.5rem;
    font-weight: 700;
    margin-bottom: 10px;
    color: #333;
  }
  p {
    font-size: 1.1rem;
    color: #666;
    margin-bottom: 20px;
  }
`;

const TestInfo = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
  padding: 20px;
  background: #f9f9f9;
  border-radius: 10px;
  border: 1px solid #eee;
`;

const InfoItem = styled.div`
  text-align: center;
  h3 {
    font-size: 1.1rem;
    font-weight: 600;
    color: #333;
    margin-bottom: 5px;
  }
  p {
    font-size: 0.8rem;
    color: #666;
  }
`;

const InfoIcon = styled.div`
  font-size: 2.5rem;
  color: #667eea;
  margin-bottom: 10px;
`;

const TipsSection = styled.div`
  margin-bottom: 30px;
  h3 {
    font-size: 1.2rem;
    font-weight: 600;
    color: #333;
    margin-bottom: 15px;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  ul {
    list-style: none;
    padding: 0;
    margin: 0;
    text-align: left;
    color: #666;
    font-size: 0.9rem;
  }
  li {
    margin-bottom: 10px;
    position: relative;
    padding-left: 20px;
    &::before {
      content: "•";
      position: absolute;
      left: 0;
      color: #667eea;
    }
  }
`;

const StartSection = styled.div`
  margin-bottom: 30px;
`;

const StartButton = styled.button`
  background: linear-gradient(135deg, #ff6b6b, #ee5a24);
  color: white;
  border: none;
  padding: 15px 30px;
  font-size: 1.1rem;
  font-weight: 600;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 25px rgba(255, 107, 107, 0.6);
  }
`;

const StartNote = styled.p`
  font-size: 0.8rem;
  color: #666;
  display: flex;
  align-items: center;
  gap: 5px;
  margin-top: 10px;
  svg {
    font-size: 14px;
  }
`;

const BackLink = styled.div`
  a {
    text-decoration: none;
    color: #667eea;
    font-weight: 500;
    display: inline-flex;
    align-items: center;
    gap: 5px;
    transition: all 0.3s ease;
    cursor: pointer;
    &:hover {
      color: #764ba2;
      transform: translateX(-5px);
    }
  }
`;

// IQ Scale Section Styling
const IQScaleSection = styled.section`
  padding: 80px 0;
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
`;

const IQScaleContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 0 20px;
  
  h2 {
    text-align: center;
    font-size: 2.5rem;
    font-weight: 700;
    margin-bottom: 3rem;
  }
`;

const IQChart = styled.div`
  background: rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 2rem;
  backdrop-filter: blur(10px);
`;

const IQRange = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
  font-weight: 600;
`;

const IQBar = styled.div`
  height: 40px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  overflow: hidden;
  position: relative;
`;

const IQFill = styled.div`
  height: 100%;
  background: linear-gradient(90deg, #4CAF50, #8BC34A, #FFC107, #FF9800, #F44336);
  border-radius: 20px;
  width: 0;
  transition: width 2s ease;
  animation: iqFillAnimation 3s ease-in-out infinite;
  
  @keyframes iqFillAnimation {
    0%, 100% { width: 0; }
    50% { width: 100%; }
  }
`;

const IQLabels = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 1rem;
  font-size: 0.9rem;
`;

// Test Preview Section Styling
const TestPreviewSection = styled.section`
  padding: 80px 0;
  background: #f8f9fa;
`;

const TestPreviewContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
`;

const PreviewContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  align-items: center;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
`;

const PreviewContent = styled.div`
  h3 {
    font-size: 2rem;
    font-weight: 600;
    margin-bottom: 1.5rem;
    color: #333;
  }
  
  p {
    color: #666;
    margin-bottom: 2rem;
    line-height: 1.8;
  }
`;

const TestStats = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin-top: 2rem;
`;

const TestStatItem = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 15px;
  text-align: center;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  
  .stat-number {
    font-size: 2rem;
    font-weight: 700;
    color: #667eea;
    display: block;
  }
  
  .stat-label {
    color: #666;
    font-size: 0.9rem;
    margin-top: 0.5rem;
  }
`;

const PreviewImage = styled.div`
  background: linear-gradient(45deg, #667eea, #764ba2);
  border-radius: 20px;
  padding: 2rem;
  color: white;
  text-align: center;
  position: relative;
  overflow: hidden;
  
  h4 {
    font-size: 1.5rem;
    margin-bottom: 1rem;
    position: relative;
    z-index: 1;
  }
  
  p {
    position: relative;
    z-index: 1;
    opacity: 0.9;
  }
`;

const SamplePuzzle = styled.div`
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 10px;
  margin: 1rem 0;
  text-align: center;
`;

const PuzzleGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.5rem;
  max-width: 200px;
  margin: 0 auto;
`;

const PuzzleCell = styled.div`
  width: 30px;
  height: 30px;
  border-radius: 50%;
  margin: auto;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
`;

// Recent Scores Section Styling
const RecentScoresSection = styled.section`
  padding: 80px 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
`;

const RecentScoresContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  
  .section-title {
    text-align: center;
    font-size: 2.5rem;
    font-weight: 700;
    margin-bottom: 3rem;
    background: linear-gradient(45deg, #667eea, #764ba2);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
`;

const ScoresContainer = styled.div`
  position: relative;
  overflow: hidden;
  margin: 3rem 0;
  height: 120px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  backdrop-filter: blur(10px);
`;

const ScoresTrack = styled.div`
  display: flex;
  animation: slideScores 30s linear infinite;
  height: 100%;
  
  @keyframes slideScores {
    0% { transform: translateX(0); }
    100% { transform: translateX(-50%); }
  }
  
  &:hover {
    animation-play-state: paused;
  }
`;

const ScoreCard = styled.div`
  min-width: 280px;
  background: rgba(255, 255, 255, 0.15);
  margin: 0 1rem;
  padding: 1.5rem;
  border-radius: 15px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
    transition: left 0.5s ease;
  }
  
  &:hover::before {
    left: 100%;
  }
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  }
`;

const ScoreInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const ScoreAvatar = styled.div`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 1.2rem;
  color: white;
  
  &.avatar-blue { background: linear-gradient(45deg, #2196F3, #03A9F4); }
  &.avatar-green { background: linear-gradient(45deg, #4CAF50, #8BC34A); }
  &.avatar-purple { background: linear-gradient(45deg, #9C27B0, #E91E63); }
  &.avatar-orange { background: linear-gradient(45deg, #FF9800, #FF5722); }
  &.avatar-teal { background: linear-gradient(45deg, #009688, #4DB6AC); }
  &.avatar-pink { background: linear-gradient(45deg, #E91E63, #F06292); }
  &.avatar-indigo { background: linear-gradient(45deg, #3F51B5, #7986CB); }
  &.avatar-cyan { background: linear-gradient(45deg, #00BCD4, #4DD0E1); }
  &.avatar-lime { background: linear-gradient(45deg, #CDDC39, #DCE775); }
  &.avatar-amber { background: linear-gradient(45deg, #FFC107, #FFD54F); }
`;

const ScoreDetails = styled.div`
  h4 {
    margin: 0;
    font-size: 1.1rem;
    font-weight: 600;
  }
  
  p {
    margin: 0.2rem 0 0 0;
    font-size: 0.9rem;
    opacity: 0.8;
  }
`;

const ScoreValue = styled.div`
  font-size: 2rem;
  font-weight: 700;
  color: white;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
`;

const StatsSummary = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 2rem;
  margin-top: 3rem;
`;

const SummaryStatItem = styled.div`
  background: rgba(255, 255, 255, 0.1);
  padding: 2rem;
  border-radius: 15px;
  text-align: center;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: transform 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
  }
  
  .stat-number {
    font-size: 2.5rem;
    font-weight: 700;
    color: #4CAF50;
    margin-bottom: 0.5rem;
  }
  
  .stat-label {
    font-size: 1rem;
    opacity: 0.9;
  }
`;

// Footer Styling
const Footer = styled.footer`
  background: #333;
  color: white;
  padding: 3rem 0 1rem;
`;

const FooterContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
`;

const FooterContent = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  margin-bottom: 2rem;
`;

const FooterSection = styled.div`
  h4 {
    margin-bottom: 1rem;
    color: #667eea;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  
  p, a {
    color: #ccc;
    text-decoration: none;
    line-height: 1.6;
    margin-bottom: 0.5rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  
  a:hover {
    color: #667eea;
  }
`;

const FooterBottom = styled.div`
  text-align: center;
  padding-top: 2rem;
  border-top: 1px solid #444;
  color: #999;
  
  p {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
  }
`;

// Enhanced Test Prep Page Styling
const ParticleContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
  overflow: hidden;
`;

const Particle = styled.div`
  position: absolute;
  width: var(--size);
  height: var(--size);
  background: var(--color);
  border-radius: 50%;
  opacity: 0.6;
  animation: float var(--duration) ease-in-out infinite;
  animation-delay: var(--delay);
  
  @keyframes float {
    0%, 100% {
      transform: translateY(100vh) translateX(0) scale(0);
      opacity: 0;
    }
    10% {
      opacity: 0.6;
    }
    90% {
      opacity: 0.6;
    }
    100% {
      transform: translateY(-100px) translateX(100px) scale(1);
      opacity: 0;
    }
  }
`;

const CountdownOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.5s ease;
  
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
`;

const CountdownContent = styled.div`
  text-align: center;
  color: white;
`;

const CountdownNumber = styled.div`
  font-size: 8rem;
  font-weight: 900;
  margin-bottom: 1rem;
  animation: pulse 1s ease-in-out infinite;
  
  @keyframes pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.1); }
  }
`;

const CountdownText = styled.div`
  font-size: 2rem;
  margin-bottom: 2rem;
  opacity: 0.9;
`;

const CountdownProgress = styled.div`
  width: 300px;
  height: 8px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  overflow: hidden;
`;

const CountdownProgressFill = styled.div`
  height: 100%;
  background: linear-gradient(90deg, #4CAF50, #8BC34A);
  border-radius: 4px;
  transition: width 1s ease;
`;

const HeroSection = styled.div`
  text-align: center;
  margin-bottom: 4rem;
  position: relative;
`;

const TestHeroTitle = styled.div`
  margin-bottom: 3rem;
`;

const TitleGlow = styled.h1`
  font-size: 4rem;
  font-weight: 900;
  background: linear-gradient(45deg, #667eea, #764ba2, #ff6b6b);
  background-size: 200% 200%;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: gradientShift 3s ease-in-out infinite;
  margin-bottom: 1rem;
  
  @keyframes gradientShift {
    0%, 100% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
  }
  
  @media (max-width: 768px) {
    font-size: 2.5rem;
  }
`;

const TitleSubtitle = styled.p`
  font-size: 1.5rem;
  color: #666;
  font-weight: 300;
`;

const ProgressIndicator = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 2rem;
`;

const ProgressRing = styled.div`
  position: relative;
  display: inline-block;
`;

const TestProgressText = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 1.5rem;
  font-weight: 700;
  color: #667eea;
`;

const ConfigSection = styled.div`
  margin-bottom: 4rem;
  text-align: center;
`;

const ConfigTitle = styled.h2`
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 2rem;
  color: #333;
`;

const DifficultySelector = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  max-width: 800px;
  margin: 0 auto;
`;

const DifficultyCard = styled.div<{ isSelected: boolean }>`
  background: ${props => props.isSelected ? 'linear-gradient(45deg, #667eea, #764ba2)' : 'white'};
  color: ${props => props.isSelected ? 'white' : '#333'};
  padding: 2rem;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 3px solid ${props => props.isSelected ? 'transparent' : '#e0e0e0'};
  box-shadow: ${props => props.isSelected ? '0 15px 35px rgba(102, 126, 234, 0.3)' : '0 5px 15px rgba(0, 0, 0, 0.1)'};
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
  }
`;

const DifficultyIcon = styled.div`
  font-size: 3rem;
  margin-bottom: 1rem;
`;

const DifficultyLabel = styled.h3`
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
`;

const DifficultyDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  font-size: 0.9rem;
  opacity: 0.8;
`;

const EnhancedTestInfo = styled.div`
  margin-bottom: 4rem;
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
`;

const TestFeatureCard = styled.div<{ delay: number }>`
  background: white;
  padding: 2rem;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  animation: slideInUp 0.6s ease forwards;
  animation-delay: ${props => props.delay}s;
  opacity: 0;
  transform: translateY(30px);
  
  &:hover {
    transform: translateY(-10px);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
  }
  
  @keyframes slideInUp {
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const TestFeatureIcon = styled.div`
  font-size: 3rem;
  margin-bottom: 1rem;
`;

const TestFeatureTitle = styled.h3`
  font-size: 1.3rem;
  font-weight: 700;
  margin-bottom: 1rem;
  color: #333;
`;

const TestFeatureDesc = styled.p`
  color: #666;
  line-height: 1.6;
`;

const InteractiveTipsSection = styled.div`
  margin-bottom: 4rem;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 25px;
  padding: 3rem;
`;

const TipsHeader = styled.div`
  text-align: center;
  margin-bottom: 2rem;
`;

const TipsTitle = styled.h2`
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 2rem;
  color: #333;
`;

const TipsTabs = styled.div`
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 2rem;
`;

const TipsTab = styled.button<{ isActive: boolean }>`
  background: ${props => props.isActive ? 'linear-gradient(45deg, #667eea, #764ba2)' : 'white'};
  color: ${props => props.isActive ? 'white' : '#333'};
  border: none;
  padding: 1rem 2rem;
  border-radius: 25px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: ${props => props.isActive ? '0 10px 25px rgba(102, 126, 234, 0.3)' : '0 5px 15px rgba(0, 0, 0, 0.1)'};
  
  &:hover {
    transform: translateY(-2px);
  }
`;

const TipsContent = styled.div`
  min-height: 200px;
`;

const TipsPanel = styled.div`
  animation: fadeInUp 0.5s ease;
  
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const TipItem = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 15px;
  margin-bottom: 1rem;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  font-size: 1.1rem;
  line-height: 1.6;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateX(10px);
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  }
`;

const EnhancedStartSection = styled.div`
  text-align: center;
  margin-bottom: 3rem;
`;

const TestStartButton = styled.button`
  background: linear-gradient(45deg, #ff6b6b, #ff8e53);
  color: white;
  border: none;
  padding: 1.5rem 3rem;
  border-radius: 50px;
  font-size: 1.3rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  margin-bottom: 2rem;
  
  &:hover {
    background: linear-gradient(45deg, #ff5252, #ff7043);
  }
`;

const ButtonGlow = styled.div`
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  transition: left 0.5s ease;
  
  ${TestStartButton}:hover & {
    left: 100%;
  }
`;

const ButtonContent = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  position: relative;
  z-index: 1;
`;

const TestStartNote = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  color: #666;
  font-size: 0.9rem;
  
  .highlight {
    color: #667eea;
    font-weight: 600;
    font-size: 1rem;
  }
`;

// Main App Component with Router
function App() {
  return (
    <Router>
      <AppContainer>
        <GlobalStyles />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/test-start" element={<TestStartPage />} />
          <Route path="/test" element={<TestPage />} />
          <Route path="/results" element={<ResultsPage />} />
        </Routes>
      </AppContainer>
    </Router>
  );
}

// Homepage Component
function HomePage() {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [headerScrolled, setHeaderScrolled] = useState(false);

  // Sample data for recent scores
  const recentScores = [
    { name: 'Alex Johnson', score: 142, timeAgo: '2 minutes ago', initials: 'AJ', avatarClass: 'avatar-blue' },
    { name: 'Sarah Chen', score: 138, timeAgo: '5 minutes ago', initials: 'SC', avatarClass: 'avatar-green' },
    { name: 'Michael Rodriguez', score: 135, timeAgo: '10 minutes ago', initials: 'MR', avatarClass: 'avatar-purple' },
    { name: 'Emma Wilson', score: 141, timeAgo: '15 minutes ago', initials: 'EW', avatarClass: 'avatar-orange' },
    { name: 'David Kim', score: 139, timeAgo: '20 minutes ago', initials: 'DK', avatarClass: 'avatar-teal' },
    { name: 'Lisa Thompson', score: 136, timeAgo: '25 minutes ago', initials: 'LT', avatarClass: 'avatar-pink' },
    { name: 'James Brown', score: 143, timeAgo: '30 minutes ago', initials: 'JB', avatarClass: 'avatar-indigo' },
    { name: 'Maria Garcia', score: 137, timeAgo: '35 minutes ago', initials: 'MG', avatarClass: 'avatar-cyan' },
    { name: 'Robert Lee', score: 140, timeAgo: '40 minutes ago', initials: 'RL', avatarClass: 'avatar-lime' },
    { name: 'Jennifer Davis', score: 134, timeAgo: '45 minutes ago', initials: 'JD', avatarClass: 'avatar-amber' }
  ];

  const totalTests = 1247;
  const avgScore = 138;
  const highestScore = 145;

  // Handle scroll for header effect
  useEffect(() => {
    const handleScroll = () => {
      setHeaderScrolled(window.scrollY > 100);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleStartTest = () => {
    console.log('🚀 Going to test start page');
    navigate('/test-start');
  };

  return (
    <>
      <Header className={headerScrolled ? 'scrolled' : ''}>
        <NavContainer>
          <Logo href="#">
            <Brain size={24} /> Testify
          </Logo>
          <NavLinks>
            <li>
              <NavButton variant="secondary" href="#">
                <User size={16} />
                Login
              </NavButton>
            </li>
            <li>
              <NavButton variant="primary" onClick={handleStartTest}>
                <Play size={16} />
                Start Test
              </NavButton>
            </li>
          </NavLinks>
          <MobileMenuBtn onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </MobileMenuBtn>
        </NavContainer>
        
        <MobileMenu isOpen={mobileMenuOpen}>
          <ul>
            <li>
              <a href="#">
                <User size={16} />
                Login
              </a>
            </li>
            <li>
              <a onClick={handleStartTest} style={{ background: 'linear-gradient(45deg, #667eea, #764ba2)', color: 'white' }}>
                <Play size={16} />
                Start Test
              </a>
            </li>
          </ul>
        </MobileMenu>
      </Header>

      <Hero>
        <HeroContainer>
          <HeroContent>
            <HeroText>
              <HeroTitle>
                <TitleLine>Unlock Your</TitleLine>
                <TitleHighlight>Cognitive Potential</TitleHighlight>
              </HeroTitle>
              
              <HeroSubtitle>
                Master the art of pattern recognition with our cutting-edge visual IQ test. 
                Discover your true intelligence through 40 carefully crafted matrix puzzles 
                that challenge your mind in ways you've never experienced before.
              </HeroSubtitle>
              
              <HeroStats>
                <StatBubble delay={0}>
                  <StatNumber>40</StatNumber>
                  <StatLabel>Visual Puzzles</StatLabel>
                </StatBubble>
                <StatBubble delay={0.5}>
                  <StatNumber>40</StatNumber>
                  <StatLabel>Minutes</StatLabel>
                </StatBubble>
                <StatBubble delay={1}>
                  <StatNumber>99%</StatNumber>
                  <StatLabel>Accuracy</StatLabel>
                </StatBubble>
              </HeroStats>
              
              <CTAButtons>
                <CTAButton variant="primary" onClick={handleStartTest}>
                  <Rocket size={18} />
                  Start Your Journey
                </CTAButton>
                <CTAButton variant="secondary" href="#test">
                  <Info size={18} />
                  Learn More
                </CTAButton>
              </CTAButtons>
            </HeroText>
            
            <HeroVisual>
              <BrainAnimation>
                <BrainWaves />
                <BrainContainer>
                  <BrainIcon>🧠</BrainIcon>
                  <NeuralNetwork>
                    <Neuron delay={0} style={{ top: '20%', left: '30%' }} />
                    <Neuron delay={0.5} style={{ top: '40%', left: '70%' }} />
                    <Neuron delay={1} style={{ top: '60%', left: '20%' }} />
                    <Neuron delay={1.5} style={{ top: '80%', left: '60%' }} />
                    <Neuron delay={2} style={{ top: '30%', left: '80%' }} />
                    <Neuron delay={2.5} style={{ top: '70%', left: '40%' }} />
                    <Synapse delay={0.2} style={{ top: '25%', left: '35%' }} />
                    <Synapse delay={0.7} style={{ top: '45%', left: '75%' }} />
                    <Synapse delay={1.2} style={{ top: '65%', left: '25%' }} />
                    <Synapse delay={1.7} style={{ top: '85%', left: '65%' }} />
                    <Synapse delay={2.2} style={{ top: '35%', left: '85%' }} />
                    <Synapse delay={2.7} style={{ top: '75%', left: '45%' }} />
                  </NeuralNetwork>
                </BrainContainer>
              </BrainAnimation>
            </HeroVisual>
          </HeroContent>
        </HeroContainer>
      </Hero>

      <Features>
        <FeaturesContainer>
          <FeaturesHeader>
            <SectionTitle>Why Testify?</SectionTitle>
            <SectionSubtitle>
              Revolutionary visual pattern recognition that reveals your true cognitive potential
            </SectionSubtitle>
          </FeaturesHeader>
          
          <FeaturesGrid>
            <FeatureCard delay={0}>
              <FeatureIcon>
                <Brain size={24} />
              </FeatureIcon>
              <FeatureTitle>Neural Pattern Recognition</FeatureTitle>
              <FeatureDescription>
                Our puzzles activate the same neural pathways used by top problem-solvers and creative thinkers worldwide.
              </FeatureDescription>
              <FeatureProgress>
                <ProgressBar>
                  <ProgressFill width={95} />
                </ProgressBar>
                <ProgressText>95% Accuracy Rate</ProgressText>
              </FeatureProgress>
            </FeatureCard>
            
            <FeatureCard delay={0.5}>
              <FeatureIcon>
                <Rocket size={24} />
              </FeatureIcon>
              <FeatureTitle>Lightning Fast Results</FeatureTitle>
              <FeatureDescription>
                Complete your assessment in just 40 minutes and receive instant, detailed cognitive analysis with actionable insights.
              </FeatureDescription>
              <FeatureProgress>
                <ProgressBar>
                  <ProgressFill width={88} />
                </ProgressBar>
                <ProgressText>88% Faster Than Traditional Tests</ProgressText>
              </FeatureProgress>
            </FeatureCard>
            
            <FeatureCard delay={1}>
              <FeatureIcon>
                <ChartLine size={24} />
              </FeatureIcon>
              <FeatureTitle>Comprehensive Analysis</FeatureTitle>
              <FeatureDescription>
                Get detailed breakdowns of your cognitive strengths across 5 key domains with personalized development recommendations.
              </FeatureDescription>
              <FeatureProgress>
                <ProgressBar>
                  <ProgressFill width={92} />
                </ProgressBar>
                <ProgressText>92% User Satisfaction</ProgressText>
              </FeatureProgress>
            </FeatureCard>
            
            <FeatureCard delay={1.5}>
              <FeatureIcon>
                <Shield size={24} />
              </FeatureIcon>
              <FeatureTitle>Military-Grade Security</FeatureTitle>
              <FeatureDescription>
                Your cognitive data is protected with enterprise-level encryption. We never share your results with third parties.
              </FeatureDescription>
              <FeatureProgress>
                <ProgressBar>
                  <ProgressFill width={99.9} />
                </ProgressBar>
                <ProgressText>99.9% Data Protection</ProgressText>
              </FeatureProgress>
            </FeatureCard>
            
            <FeatureCard delay={2}>
              <FeatureIcon>
                <Smartphone size={24} />
              </FeatureIcon>
              <FeatureTitle>Cross-Platform Excellence</FeatureTitle>
              <FeatureDescription>
                Seamless experience across all devices with responsive design that adapts to your preferred testing environment.
              </FeatureDescription>
              <FeatureProgress>
                <ProgressBar>
                  <ProgressFill width={96} />
                </ProgressBar>
                <ProgressText>96% Mobile Satisfaction</ProgressText>
              </FeatureProgress>
            </FeatureCard>
            
            <FeatureCard delay={2.5}>
              <FeatureIcon>
                <Trophy size={24} />
              </FeatureIcon>
              <FeatureTitle>Professional Certification</FeatureTitle>
              <FeatureDescription>
                Receive a detailed certificate with your IQ score, cognitive profile, and personalized development roadmap.
              </FeatureDescription>
              <FeatureProgress>
                <ProgressBar>
                  <ProgressFill width={94} />
                </ProgressBar>
                <ProgressText>94% Certificate Download Rate</ProgressText>
              </FeatureProgress>
            </FeatureCard>
          </FeaturesGrid>
        </FeaturesContainer>
      </Features>

      {/* IQ Scale Section */}
      <IQScaleSection>
        <IQScaleContainer>
          <h2>Understanding IQ Scores</h2>
          <IQChart>
            <IQRange>
              <span>55-69</span>
              <span>70-84</span>
              <span>85-114</span>
              <span>115-129</span>
              <span>130+</span>
            </IQRange>
            <IQBar>
              <IQFill />
            </IQBar>
            <IQLabels>
              <span>Mildly Impaired</span>
              <span>Below Average</span>
              <span>Average</span>
              <span>Above Average</span>
              <span>Superior</span>
            </IQLabels>
          </IQChart>
        </IQScaleContainer>
      </IQScaleSection>

      {/* Test Preview Section */}
      <TestPreviewSection>
        <TestPreviewContainer>
          <PreviewContainer>
            <PreviewContent>
              <h3>What to Expect in Your Visual IQ Test</h3>
              <p>Our cutting-edge visual pattern recognition test uses Raven's Progressive Matrices to evaluate your cognitive abilities across pattern recognition, spatial awareness, logical reasoning, mathematical ability, and visual memory.</p>
              <p>Each puzzle presents a 3x3 matrix with a missing piece that you must identify by recognizing the underlying pattern in shapes, sizes, colors, and positions.</p>
              
              <TestStats>
                <TestStatItem>
                  <span className="stat-number">40</span>
                  <span className="stat-label">Visual Puzzles</span>
                </TestStatItem>
                <TestStatItem>
                  <span className="stat-number">40</span>
                  <span className="stat-label">Minutes</span>
                </TestStatItem>
                <TestStatItem>
                  <span className="stat-number">5</span>
                  <span className="stat-label">Cognitive Domains</span>
                </TestStatItem>
                <TestStatItem>
                  <span className="stat-number">99%</span>
                  <span className="stat-label">Accuracy</span>
                </TestStatItem>
              </TestStats>
            </PreviewContent>
            <PreviewImage>
              <h4>Sample Visual Puzzle</h4>
              <p>Find the missing piece that completes the pattern:</p>
              <SamplePuzzle>
                <PuzzleGrid>
                  <PuzzleCell style={{ background: '#667eea' }} />
                  <PuzzleCell style={{ background: '#ff6b6b' }} />
                  <PuzzleCell style={{ background: '#4CAF50' }} />
                  <PuzzleCell style={{ background: '#ff6b6b' }} />
                  <PuzzleCell style={{ background: '#4CAF50' }} />
                  <PuzzleCell style={{ background: '#667eea' }} />
                  <PuzzleCell style={{ background: '#4CAF50' }} />
                  <PuzzleCell style={{ background: '#667eea' }} />
                  <PuzzleCell style={{ background: '#ff6b6b', border: '2px dashed #999' }}>?</PuzzleCell>
                </PuzzleGrid>
              </SamplePuzzle>
              <p style={{ marginTop: '1rem', fontSize: '0.9rem' }}>This visual puzzle tests your pattern recognition and spatial reasoning abilities.</p>
            </PreviewImage>
          </PreviewContainer>
        </TestPreviewContainer>
      </TestPreviewSection>

      {/* Recent Scores Section */}
      <RecentScoresSection>
        <RecentScoresContainer>
          <h2 className="section-title">Most Recent Scores</h2>
          <ScoresContainer>
            <ScoresTrack>
              {recentScores.map((score, index) => (
                <ScoreCard key={index}>
                  <ScoreInfo>
                    <ScoreAvatar className={score.avatarClass}>
                      {score.initials}
                    </ScoreAvatar>
                    <ScoreDetails>
                      <h4>{score.name}</h4>
                      <p>{score.timeAgo}</p>
                    </ScoreDetails>
                  </ScoreInfo>
                  <ScoreValue>{score.score}</ScoreValue>
                </ScoreCard>
              ))}
            </ScoresTrack>
          </ScoresContainer>
          <StatsSummary>
            <SummaryStatItem>
              <div className="stat-number">{totalTests}</div>
              <div className="stat-label">Tests Completed</div>
            </SummaryStatItem>
            <SummaryStatItem>
              <div className="stat-number">{avgScore}</div>
              <div className="stat-label">Average Score</div>
            </SummaryStatItem>
            <SummaryStatItem>
              <div className="stat-number">{highestScore}</div>
              <div className="stat-label">Highest Score</div>
            </SummaryStatItem>
          </StatsSummary>
        </RecentScoresContainer>
      </RecentScoresSection>

      {/* Footer */}
      <Footer>
        <FooterContainer>
          <FooterContent>
            <FooterSection>
              <h4><Brain size={20} /> Testify</h4>
              <p>Professional intelligence quotient testing with scientifically validated methodology and comprehensive analysis.</p>
            </FooterSection>
            <FooterSection>
              <h4>Quick Links</h4>
              <p><a href="#home">Home</a></p>
              <p><a href="#about">About</a></p>
              <p><a href="#test">Take Test</a></p>
              <p><a href="#results">Results</a></p>
            </FooterSection>
            <FooterSection>
              <h4>Support</h4>
              <p><a href="#contact">Contact Us</a></p>
              <p><a href="/help">Help Center</a></p>
              <p><a href="/privacy">Privacy Policy</a></p>
              <p><a href="/terms">Terms of Service</a></p>
            </FooterSection>
            <FooterSection>
              <h4>Connect</h4>
              <p><a href="#"><Facebook size={16} /> Facebook</a></p>
              <p><a href="#"><Twitter size={16} /> Twitter</a></p>
              <p><a href="#"><Linkedin size={16} /> LinkedIn</a></p>
              <p><a href="#"><Instagram size={16} /> Instagram</a></p>
            </FooterSection>
          </FooterContent>
          <FooterBottom>
            <p>&copy; 2024 Testify. All rights reserved. | Designed with <Heart size={16} style={{ color: '#ff6b6b' }} /> for cognitive excellence</p>
          </FooterBottom>
        </FooterContainer>
      </Footer>
    </>
  );
}

// Test Start Page Component
function TestStartPage() {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
  const [showTips, setShowTips] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [progress, setProgress] = useState(0);
  const [showParticles, setShowParticles] = useState(true);
  const [selectedDifficulty, setSelectedDifficulty] = useState('medium');
  const [showCountdown, setShowCountdown] = useState(false);
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    // Animate progress bar on mount
    const timer = setTimeout(() => setProgress(100), 500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (showCountdown && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      navigate('/test');
    }
  }, [showCountdown, countdown, navigate]);

  const handleBeginTest = () => {
    setShowCountdown(true);
    setShowParticles(false);
  };

  const handleBackToHome = () => {
    console.log('🏠 Going back to homepage');
    navigate('/');
  };

  const difficultyLevels = [
    { id: 'easy', label: 'Beginner', icon: '🌱', time: '50 min', questions: '35' },
    { id: 'medium', label: 'Standard', icon: '⚡', time: '40 min', questions: '40' },
    { id: 'hard', label: 'Expert', icon: '🔥', time: '30 min', questions: '45' }
  ];

  const testFeatures = [
    { icon: '🧠', title: 'Neural Mapping', desc: 'Advanced pattern recognition algorithms', color: '#667eea' },
    { icon: '🎯', title: 'Precision Scoring', desc: 'Millisecond-accurate response timing', color: '#ff6b6b' },
    { icon: '🔬', title: 'Scientific Validation', desc: 'Peer-reviewed cognitive assessment', color: '#4CAF50' },
    { icon: '📊', title: 'Real-time Analytics', desc: 'Live performance tracking', color: '#FF9800' },
    { icon: '🛡️', title: 'Data Security', desc: 'Enterprise-grade encryption', color: '#9C27B0' },
    { icon: '🚀', title: 'Instant Results', desc: 'AI-powered analysis in seconds', color: '#00BCD4' }
  ];

  return (
    <>
      <Header>
        <NavContainer>
          <Logo href="#" onClick={handleBackToHome}>
            <Brain size={24} /> Testify
          </Logo>
        </NavContainer>
      </Header>

      <TestStartPageContainer>
        {/* Animated Background Particles */}
        {showParticles && (
          <ParticleContainer>
            {[...Array(20)].map((_, i) => (
              <Particle
                key={i}
                style={{
                  '--delay': `${i * 0.1}s`,
                  '--duration': `${3 + i * 0.2}s`,
                  '--size': `${5 + i * 2}px`,
                  '--color': `hsl(${200 + i * 20}, 70%, 60%)`
                } as React.CSSProperties}
              />
            ))}
          </ParticleContainer>
        )}

        {/* Countdown Overlay */}
        {showCountdown && (
          <CountdownOverlay>
            <CountdownContent>
              <CountdownNumber>{countdown}</CountdownNumber>
              <CountdownText>Get Ready...</CountdownText>
              <CountdownProgress>
                <CountdownProgressFill style={{ width: `${((3 - countdown) / 3) * 100}%` }} />
              </CountdownProgress>
            </CountdownContent>
          </CountdownOverlay>
        )}

        <TestStartContainer>
          {/* Hero Section with 3D Effect */}
          <HeroSection>
            <TestHeroTitle>
              <TitleGlow>Ready to Begin?</TitleGlow>
              <TitleSubtitle>Your cognitive journey awaits</TitleSubtitle>
            </TestHeroTitle>
            
            <ProgressIndicator>
              <ProgressRing>
                <svg width="120" height="120" viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r="54" fill="none" stroke="#e0e0e0" strokeWidth="8"/>
                  <circle 
                    cx="60" cy="60" r="54" 
                    fill="none" 
                    stroke="url(#gradient)" 
                    strokeWidth="8"
                    strokeDasharray="339.292"
                    strokeDashoffset={339.292 - (progress / 100) * 339.292}
                    strokeLinecap="round"
                    style={{ transition: 'stroke-dashoffset 1s ease' }}
                  />
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#667eea" />
                      <stop offset="100%" stopColor="#764ba2" />
                    </linearGradient>
                  </defs>
                </svg>
                <TestProgressText>{progress}%</TestProgressText>
              </ProgressRing>
            </ProgressIndicator>
          </HeroSection>

          {/* Interactive Test Configuration */}
          <ConfigSection>
            <ConfigTitle>Choose Your Challenge</ConfigTitle>
            <DifficultySelector>
              {difficultyLevels.map((level) => (
                <DifficultyCard
                  key={level.id}
                  isSelected={selectedDifficulty === level.id}
                  onClick={() => setSelectedDifficulty(level.id)}
                >
                  <DifficultyIcon>{level.icon}</DifficultyIcon>
                  <DifficultyLabel>{level.label}</DifficultyLabel>
                  <DifficultyDetails>
                    <span>{level.time}</span>
                    <span>{level.questions} questions</span>
                  </DifficultyDetails>
                </DifficultyCard>
              ))}
            </DifficultySelector>
          </ConfigSection>

          {/* Enhanced Test Information */}
          <EnhancedTestInfo>
            <InfoGrid>
              {testFeatures.map((feature, index) => (
                <TestFeatureCard key={index} delay={index * 0.1}>
                  <TestFeatureIcon style={{ color: feature.color }}>{feature.icon}</TestFeatureIcon>
                  <TestFeatureTitle>{feature.title}</TestFeatureTitle>
                  <TestFeatureDesc>{feature.desc}</TestFeatureDesc>
                </TestFeatureCard>
              ))}
            </InfoGrid>
          </EnhancedTestInfo>

          {/* Interactive Tips with Tabs */}
          <InteractiveTipsSection>
            <TipsHeader>
              <TipsTitle>Master Your Test</TipsTitle>
              <TipsTabs>
                {['Strategy', 'Techniques', 'Mindset'].map((tab, index) => (
                  <TipsTab
                    key={tab}
                    isActive={activeTab === index}
                    onClick={() => setActiveTab(index)}
                  >
                    {tab}
                  </TipsTab>
                ))}
              </TipsTabs>
            </TipsHeader>
            
            <TipsContent>
              {activeTab === 0 && (
                <TipsPanel>
                  <TipItem>🔍 Look for multiple pattern relationships simultaneously</TipItem>
                  <TipItem>⚡ Don't overthink - trust your first instinct</TipItem>
                  <TipItem>🎯 Focus on the most obvious changes first</TipItem>
                  <TipItem>🔄 Check for rotation, scaling, and position shifts</TipItem>
                </TipsPanel>
              )}
              {activeTab === 1 && (
                <TipsPanel>
                  <TipItem>🧠 Use systematic elimination for complex patterns</TipItem>
                  <TipItem>📐 Visualize the complete matrix in your mind</TipItem>
                  <TipItem>⏱️ Allocate time: 1 minute per question</TipItem>
                  <TipItem>🔄 Skip difficult questions and return later</TipItem>
                </TipsPanel>
              )}
              {activeTab === 2 && (
                <TipsPanel>
                  <TipItem>😌 Stay calm and focused throughout the test</TipItem>
                  <TipItem>💪 Trust your cognitive abilities</TipItem>
                  <TipItem>🎯 Treat each question as a new challenge</TipItem>
                  <TipItem>🌟 Remember: every pattern has a logical solution</TipItem>
                </TipsPanel>
              )}
            </TipsContent>
          </InteractiveTipsSection>

          {/* Enhanced Start Section */}
          <EnhancedStartSection>
            <TestStartButton 
              onClick={handleBeginTest}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              style={{
                transform: isHovered ? 'scale(1.05) rotate(1deg)' : 'scale(1) rotate(0deg)',
                boxShadow: isHovered ? '0 20px 40px rgba(255, 107, 107, 0.5)' : '0 10px 25px rgba(255, 107, 107, 0.3)'
              }}
            >
              <ButtonGlow />
              <ButtonContent>
                <Play size={20} />
                <span>Begin Your Journey</span>
                <Sparkles size={16} />
              </ButtonContent>
            </TestStartButton>
            
            <TestStartNote>
              <Info size={14} />
              <span>Test begins immediately. Timer starts when you click.</span>
              <span className="highlight">Your cognitive potential awaits discovery!</span>
            </TestStartNote>
          </EnhancedStartSection>

          {/* Back Navigation */}
          <BackLink>
            <a onClick={handleBackToHome}>
              <ArrowLeft size={16} />
              Back to Homepage
            </a>
          </BackLink>
        </TestStartContainer>
      </TestStartPageContainer>
    </>
  );
}

// Test Page Component
function TestPage() {
  const navigate = useNavigate();

  const handleTestComplete = (answers: Answer[], timeSpent: number) => {
    console.log('✅ Test completed');
    // Store results in localStorage or state management
    localStorage.setItem('testResults', JSON.stringify({ answers, timeSpent }));
    navigate('/results');
  };

  const handleExitTest = () => {
    console.log('🏠 Exiting test');
    navigate('/');
  };

  return (
    <TestPageContainer>
      <IQTest
        questions={allQuestions}
        onTestComplete={handleTestComplete}
        onExit={handleExitTest}
      />
    </TestPageContainer>
  );
}

// Results Page Component
function ResultsPage() {
  const navigate = useNavigate();
  const [testResults, setTestResults] = useState<{ answers: Answer[]; timeSpent: number } | null>(null);

  useEffect(() => {
    // Get results from localStorage
    const results = localStorage.getItem('testResults');
    if (results) {
      setTestResults(JSON.parse(results));
    }
  }, []);

  const calculateScore = (answers: Answer[]) => {
    const correctAnswers = answers.filter(a => a.isCorrect).length;
    return Math.round((correctAnswers / answers.length) * 100);
  };

  const getScoreMessage = (score: number) => {
    if (score >= 95) return "Exceptional Genius";
    if (score >= 90) return "Superior Intelligence";
    if (score >= 80) return "Above Average";
    if (score >= 70) return "Average Intelligence";
    if (score >= 60) return "Below Average";
    return "Needs Improvement";
  };

  if (!testResults) {
    return (
      <ResultsPageContainer>
        <ResultsCard>
          <ResultsText>No test results found. Please take the test first.</ResultsText>
          <PaymentButton onClick={() => navigate('/')}>
            Go to Homepage
          </PaymentButton>
        </ResultsCard>
      </ResultsPageContainer>
    );
  }

  const score = calculateScore(testResults.answers);
  const message = getScoreMessage(score);
  
  return (
    <ResultsPageContainer>
      <ResultsCard>
        <ScoreDisplay>{score}</ScoreDisplay>
        <ResultsText>Your IQ Score: {message}</ResultsText>
        
        <PaymentSection>
          <PaymentTitle>Unlock Your Full Results</PaymentTitle>
          <PaymentDescription>
            Get detailed analysis, performance breakdown, and personalized insights for just $1.29
          </PaymentDescription>
          <PaymentButton>
            Pay $1.29 to Unlock Results
          </PaymentButton>
        </PaymentSection>
      </ResultsCard>
    </ResultsPageContainer>
  );
}

export default App;

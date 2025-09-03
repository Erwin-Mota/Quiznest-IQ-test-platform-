import React, { Suspense } from "react";
import { motion } from "framer-motion";
import { fadeInUp, staggerChildren, scaleIn } from "../lib/motion";
import { Button } from "./ui/button";
import AnimatedCounter from "./AnimatedCounter";

const Hero3D = React.lazy(() => import("./Hero3D"));

export default function Hero() {
  const headline = "Level up your IQ test".split("");
  
  return (
    <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <Suspense fallback={<div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-100" />}>
        <Hero3D />
      </Suspense>
      
      <motion.div 
        variants={staggerChildren} 
        initial="hidden" 
        animate="show" 
        className="text-center px-6 z-10"
      >
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
          {headline.map((char, i) => (
            <motion.span 
              key={i} 
              variants={fadeInUp}
              className="inline-block"
            >
              {char === " " ? " " : char}
            </motion.span>
          ))}
        </h1>
        
        <motion.p 
          variants={fadeInUp} 
          className="mt-6 text-xl text-muted-foreground max-w-2xl mx-auto"
        >
          Smooth, reactive, and ridiculously polished. Experience the future of cognitive assessment.
        </motion.p>
        
        <motion.div 
          variants={scaleIn} 
          className="mt-10 flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <Button 
            size="lg" 
            className="px-8 py-4 text-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
          >
            Start Testing
          </Button>
          <Button 
            variant="outline" 
            size="lg"
            className="px-8 py-4 text-lg border-2 hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            Learn More
          </Button>
        </motion.div>
        
        <motion.div 
          variants={fadeInUp}
          className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto"
        >
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              <AnimatedCounter to={40} duration={2} />
            </div>
            <p className="text-muted-foreground">Visual Puzzles</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">
              <AnimatedCounter to={99} duration={2} />
            </div>
            <p className="text-muted-foreground">Accuracy Rate</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">
              <AnimatedCounter to={40} duration={2} />
            </div>
            <p className="text-muted-foreground">Minutes</p>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}

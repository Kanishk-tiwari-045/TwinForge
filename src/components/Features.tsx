import React from 'react';
import { Brain, Mail, Calendar, FileText, Search, Zap } from 'lucide-react';
import type { Feature } from '../types';

const features: Feature[] = [
  {
    title: 'AI-Powered Digital Twin',
    description: 'Your personal AI assistant that learns from your interactions and generates context-aware responses tailored to your communication style.',
    icon: Brain,
    endpoints: [
      'POST /ai/train – Train the AI on your data',
      'POST /ai/generate – Generate personalized responses',
      'POST /ai/adapt – Improve through reinforcement learning'
    ]
  },
  {
    title: 'Smart Email Assistant',
    description: 'Intelligent email management that helps you compose, reply, and schedule emails with AI-powered suggestions.',
    icon: Mail,
    endpoints: [
      'POST /email/fetch – Fetch emails from Gmail',
      'POST /email/reply – Generate smart replies',
      'POST /email/schedule – Schedule follow-ups'
    ]
  },
  {
    title: 'AI Calendar Management',
    description: 'Automated scheduling and smart reminders that adapt to your preferences and meeting patterns.',
    icon: Calendar,
    endpoints: [
      'POST /calendar/schedule – Auto-schedule meetings',
      'POST /calendar/reminder – Set smart reminders',
      'POST /calendar/optimize – Optimize your schedule'
    ]
  },
  {
    title: 'Document Summarization',
    description: 'Advanced AI summarization for emails, news articles, and documents, helping you stay on top of information.',
    icon: FileText,
    endpoints: [
      'POST /summarize/email – Summarize emails',
      'POST /summarize/news – Summarize news articles',
      'POST /summarize/document – Extract key insights'
    ]
  },
  {
    title: 'Research Assistant',
    description: 'AI-powered research companion that finds relevant articles and generates insights based on your interests.',
    icon: Search,
    endpoints: [
      'POST /research/query – Find relevant articles',
      'POST /research/insights – Generate AI insights',
      'POST /research/trends – Analyze research trends'
    ]
  },
  {
    title: 'Task Automation',
    description: 'Intelligent workflow automation that learns from your patterns and automates repetitive tasks.',
    icon: Zap,
    endpoints: [
      'POST /automation/create – Create custom workflows',
      'POST /automation/trigger – Execute automations',
      'POST /automation/analyze – Optimize workflows'
    ]
  }
];

export default function Features() {
  return (
    <section id="features" className="py-24 bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-4xl font-extrabold bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-transparent bg-clip-text">
            Powerful Features
          </h2>
          <p className="mt-4 text-xl text-gray-400">
            Experience the future of personal productivity with our AI-powered features
          </p>
        </div>

        <div className="mt-20 grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => {
            // Declare the IconComponent inside the map callback
            const IconComponent = feature.icon as React.FC<React.SVGProps<SVGSVGElement>>;
            return (
              <div
                key={feature.title}
                className="relative group bg-gray-800/50 p-6 rounded-2xl hover:bg-gray-800/80 transition-all duration-300 border border-gray-700/50 hover:border-purple-500/50 backdrop-blur-sm"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 flex items-center justify-center">
                    <IconComponent className="w-6 h-6 text-blue-400" />
                  </div>
                  
                  <h3 className="mt-4 text-xl font-semibold text-white">
                    {feature.title}
                  </h3>
                  
                  <p className="mt-2 text-gray-400">
                    {feature.description}
                  </p>

                  {feature.endpoints && (
                    <div className="mt-4 space-y-2">
                      {feature.endpoints.map((endpoint) => (
                        <div
                          key={endpoint}
                          className="text-sm font-mono text-gray-500 bg-gray-800/50 px-3 py-1 rounded-lg"
                        >
                          {endpoint}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

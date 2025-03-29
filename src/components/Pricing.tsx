import React from 'react';
import { Check, Zap } from 'lucide-react';

const tiers = [
  {
    name: 'Free',
    price: '0',
    description: 'Perfect for trying out our AI features',
    features: [
      'Basic AI responses',
      '100 API calls per month',
      'Email summarization',
      'Basic calendar management',
      'Community support'
    ],
    cta: 'Get Started',
    highlighted: false
  },
  {
    name: 'Pro',
    price: '29',
    description: 'Enhanced AI capabilities for professionals',
    features: [
      'Advanced AI personalization',
      'Unlimited API calls',
      'Priority email handling',
      'Smart meeting scheduling',
      'Advanced document analysis',
      'Priority support',
      'Custom integrations'
    ],
    cta: 'Start Pro Trial',
    highlighted: true
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    description: 'Custom solutions for large organizations',
    features: [
      'Custom AI model training',
      'Dedicated infrastructure',
      'Advanced security features',
      'Custom API endpoints',
      'SLA guarantees',
      'Dedicated support team',
      'On-premise deployment options',
      'Custom integrations'
    ],
    cta: 'Contact Sales',
    highlighted: false
  }
];

export default function Pricing() {
  return (
    <section id="pricing" className="py-24 bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-4xl font-extrabold bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-transparent bg-clip-text">
            Simple, Transparent Pricing
          </h2>
          <p className="mt-4 text-xl text-gray-400">
            Choose the perfect plan for your needs
          </p>
        </div>

        <div className="mt-20 grid grid-cols-1 gap-8 lg:grid-cols-3">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={`relative rounded-2xl ${
                tier.highlighted
                  ? 'bg-gradient-to-b from-blue-500/10 to-purple-500/10 border-2 border-purple-500/50'
                  : 'bg-gray-800/50 border border-gray-700/50'
              } backdrop-blur-sm overflow-hidden`}
            >
              {tier.highlighted && (
                <div className="absolute top-0 right-0 -mt-2 -mr-2">
                  <div className="flex items-center justify-center w-16 h-16">
                    <Zap className="w-8 h-8 text-purple-400 animate-pulse" />
                  </div>
                </div>
              )}

              <div className="p-8">
                <h3 className="text-xl font-semibold text-white">{tier.name}</h3>
                <div className="mt-4 flex items-baseline">
                  <span className="text-5xl font-extrabold text-white">${tier.price}</span>
                  {tier.price !== 'Custom' && (
                    <span className="ml-2 text-gray-400">/month</span>
                  )}
                </div>
                <p className="mt-4 text-gray-400">{tier.description}</p>

                <ul className="mt-8 space-y-4">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-center">
                      <Check className="w-5 h-5 text-blue-400 mr-3" />
                      <span className="text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  className={`mt-8 w-full py-3 px-6 rounded-lg font-medium transition-all duration-200 ${
                    tier.highlighted
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:opacity-90'
                      : 'bg-gray-700 text-white hover:bg-gray-600'
                  }`}
                >
                  {tier.cta}
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-400">
            All plans include basic features. View our{' '}
            <a href="#" className="text-blue-400 hover:text-blue-300">
              full feature comparison
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}
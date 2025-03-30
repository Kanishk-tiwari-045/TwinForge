// import React from 'react';
import { Shield, Globe, Users, Clock } from 'lucide-react';

const stats = [
  {
    label: 'Active Users',
    value: '50,000+',
    icon: Users,
    description: 'Professionals using our platform'
  },
  {
    label: 'Countries',
    value: '150+',
    icon: Globe,
    description: 'Global reach and support'
  },
  {
    label: 'Uptime',
    value: '99.99%',
    icon: Clock,
    description: 'Enterprise-grade reliability'
  },
  {
    label: 'Data Protected',
    value: '100%',
    icon: Shield,
    description: 'Security first approach'
  }
];

const team = [
  {
    name: 'Sarah Chen',
    role: 'CEO & AI Researcher',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=200&h=200',
    description: 'Former Google AI researcher with 10+ years of experience in machine learning and AI systems.'
  },
  {
    name: 'Marcus Rodriguez',
    role: 'CTO',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200&h=200',
    description: 'Tech veteran with experience scaling systems at Amazon and Microsoft.'
  },
  {
    name: 'Aisha Patel',
    role: 'Head of Product',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200&h=200',
    description: 'Product leader focused on creating intuitive AI experiences for users.'
  },
  {
    name: 'David Kim',
    role: 'Lead Engineer',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200&h=200',
    description: 'Full-stack engineer specializing in AI infrastructure and scalable systems.'
  }
];

export default function About() {
  return (
    <section id="about" className="py-24 bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-4xl font-extrabold bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-transparent bg-clip-text">
            About DigiTwin
          </h2>
          <p className="mt-4 text-xl text-gray-400">
            Building the future of AI-powered personal assistance
          </p>
        </div>

        {/* Stats */}
        <div className="mt-20 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="relative group bg-gray-800/50 p-6 rounded-2xl hover:bg-gray-800/80 transition-all duration-300 border border-gray-700/50 backdrop-blur-sm"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              <div className="relative">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 flex items-center justify-center">
                  <stat.icon className="w-6 h-6 text-blue-400" />
                </div>
                
                <p className="mt-4 text-3xl font-bold text-white">
                  {stat.value}
                </p>
                
                <p className="mt-2 text-sm font-medium text-gray-400">
                  {stat.label}
                </p>
                
                <p className="mt-1 text-sm text-gray-500">
                  {stat.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Team */}
        <div className="mt-24">
          <h3 className="text-3xl font-bold text-center text-white">
            Meet Our Team
          </h3>
          
          <div className="mt-12 grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-4">
            {team.map((member) => (
              <div
                key={member.name}
                className="relative group bg-gray-800/50 rounded-2xl p-6 hover:bg-gray-800/80 transition-all duration-300 border border-gray-700/50 backdrop-blur-sm"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                <div className="relative">
                  <div className="aspect-square rounded-xl overflow-hidden mb-4">
                    <img
                      src={member.image}
                      alt={member.name}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                  
                  <h4 className="text-lg font-semibold text-white">
                    {member.name}
                  </h4>
                  
                  <p className="mt-1 text-sm font-medium text-purple-400">
                    {member.role}
                  </p>
                  
                  <p className="mt-2 text-sm text-gray-400">
                    {member.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mission */}
        <div className="mt-24 text-center max-w-3xl mx-auto">
          <h3 className="text-3xl font-bold text-white">
            Our Mission
          </h3>
          <p className="mt-6 text-lg text-gray-400">
            At DigiTwin, we're committed to revolutionizing personal productivity through ethical AI. 
            Our mission is to create AI assistants that truly understand and adapt to each individual, 
            while maintaining the highest standards of privacy and security.
          </p>
        </div>
      </div>
    </section>
  );
}
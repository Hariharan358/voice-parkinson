
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const Home = () => {
  return (
    <div className="container mx-auto p-4 min-h-screen flex flex-col">
      {/* Navigation Bar */}
      <nav className="flex justify-between items-center py-4 mb-8 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-blue-600">Voice Insight</h1>
        <div className="space-x-4">
          <Link to="/" className="text-gray-600 hover:text-blue-600 font-medium">
            Home
          </Link>
          <Link to="/dash" className="text-gray-600 hover:text-blue-600 font-medium">
            Analyze Audio
          </Link>
          <Link to="/about" className="text-gray-600 hover:text-blue-600 font-medium">
            About
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="flex-grow flex flex-col items-center justify-center text-center animate-fade-in">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
          Detect Parkinson’s with Voice Analysis
        </h1>
        <p className="text-lg md:text-xl text-gray-600 max-w-2xl mb-8">
          Upload a .wav or .mp3 audio file to analyze voice patterns for early indicators of Parkinson’s disease using advanced machine learning.
        </p>
        <Link to="/dash">
          <Button className="px-8 py-3 bg-blue-600 text-white text-lg rounded-xl hover:bg-blue-700 transition-all">
            Start Analysis
          </Button>
        </Link>
      </section>

      {/* Features Section */}
      <section className="py-12">
        <h2 className="text-3xl font-semibold text-center text-gray-800 mb-8">Why Voice Insight?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="animate-fade-in">
            <CardHeader>
              <CardTitle className="text-xl">Easy Audio Upload</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Drag and drop or select .wav/.mp3 files for seamless analysis with instant feedback.
              </p>
            </CardContent>
          </Card>
          <Card className="animate-fade-in">
            <CardHeader>
              <CardTitle className="text-xl">Accurate Predictions</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Leverage machine learning to detect Parkinson’s indicators with high precision.
              </p>
            </CardContent>
          </Card>
          <Card className="animate-fade-in">
            <CardHeader>
              <CardTitle className="text-xl">Detailed Visualizations</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Explore probability distributions and audio features through intuitive charts.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 text-center text-gray-500 border-t border-gray-200">
        <p>&copy; {new Date().getFullYear()} Voice Insight. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Home;

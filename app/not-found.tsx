'use client';

import Link from 'next/link';
import { Dumbbell, Home } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        {/* Animated 404 */}
        <div className="mb-8">
          <Dumbbell className="w-24 h-24 text-yellow-500 mx-auto mb-6 animate-bounce" />
          <h1 className="text-9xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent mb-4">
            404
          </h1>
        </div>

        {/* Error Message */}
        <h2 className="text-3xl font-bold text-white mb-4">Page Not Found</h2>
        <p className="text-gray-400 mb-8 leading-relaxed">
          Oops! It looks like you're trying to lift weights that don't exist. 
          The page you're looking for can't be found.
        </p>

        {/* Suggestions */}
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-yellow-600/20 rounded-xl p-6 mb-8">
          <h3 className="text-lg font-semibold text-yellow-400 mb-3">Possible reasons:</h3>
          <ul className="text-gray-400 text-sm space-y-2 text-left">
            <li>• The page was moved or deleted</li>
            <li>• There's a typo in the URL</li>
            <li>• The page doesn't exist yet</li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 px-6 py-3 rounded-lg text-white font-semibold transition shadow-lg shadow-yellow-500/30 transform hover:scale-105"
          >
            <Home className="w-5 h-5 mr-2" />
            Back to Home
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center border-2 border-yellow-600/50 hover:border-yellow-500 px-6 py-3 rounded-lg text-yellow-400 font-semibold transition hover:bg-yellow-500/10"
          >
            Go to Dashboard
          </Link>
        </div>

        {/* Help Text */}
        <p className="text-gray-500 text-sm mt-8">
          Need help?{' '}
          <a href="mailto:support@fitaipro.com" className="text-yellow-400 hover:underline">
            Contact support
          </a>
        </p>
      </div>
    </div>
  );
}

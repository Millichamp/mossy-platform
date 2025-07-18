import React from "react";
import { MessageCircle, User } from "lucide-react";

interface LoginPromptProps {
  propertyTitle: string;
}

const LoginPrompt: React.FC<LoginPromptProps> = ({ propertyTitle }) => {
  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-200 rounded-lg shadow-lg p-4 max-w-sm z-40">
      <div className="flex items-start gap-3">
        <div className="p-2 bg-blue-100 rounded-lg">
          <MessageCircle className="w-5 h-5 text-blue-600" />
        </div>
        <div className="flex-1">
          <h4 className="font-medium text-gray-900 text-sm">
            Interested in {propertyTitle}?
          </h4>
          <p className="text-gray-600 text-xs mt-1">
            Log in to message the seller, make an offer, or book a viewing.
          </p>
          <div className="flex gap-2 mt-3">
            <button
              onClick={() => window.location.href = '/login'}
              className="flex items-center gap-1 bg-blue-600 text-white px-3 py-1.5 rounded text-xs hover:bg-blue-700 transition-colors"
            >
              <User className="w-3 h-3" />
              Log In
            </button>
            <button
              onClick={() => window.location.href = '/register'}
              className="bg-gray-100 text-gray-700 px-3 py-1.5 rounded text-xs hover:bg-gray-200 transition-colors"
            >
              Sign Up
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPrompt;

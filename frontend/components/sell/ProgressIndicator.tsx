import React from "react";

interface ProgressIndicatorProps {
  steps: { title: string }[];
  currentStep: number;
}

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({ steps, currentStep }) => (
  <div className="flex justify-between mb-8">
    {steps.map((step, index) => (
      <div
        key={step.title}
        className={`flex-1 h-2 mx-1 rounded-full transition-all duration-300 ${
          index < currentStep
            ? "bg-emerald-500"
            : index === currentStep
            ? "bg-emerald-400"
            : "bg-gray-200"
        }`}
      >
        <span className="block text-xs text-center mt-2 font-medium text-gray-700">{step.title}</span>
      </div>
    ))}
  </div>
);

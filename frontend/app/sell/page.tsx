'use client';
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { PropertyListingStep1 } from "../../components/sell/PropertyListingStep1";
import { PropertyListingStep2 } from "../../components/sell/PropertyListingStep2";
import { PropertyListingStep3 } from "../../components/sell/PropertyListingStep3";
import { PropertyListingStep4 } from "../../components/sell/PropertyListingStep4";
import { PropertyListingStep5 } from "../../components/sell/PropertyListingStep5";
import { PropertyListingStep6 } from "../../components/sell/PropertyListingStep6";
import { ProgressIndicator } from "../../components/sell/ProgressIndicator";
import { CongratulationsModal } from "../../components/sell/CongratulationsModal";

const steps = [
  { title: "Basic Details" },
  { title: "Location & Address" },
  { title: "Specifications" },
  { title: "Description & Features" },
  { title: "Photos & Media" },
  { title: "Review & Publish" },
];

export default function SellPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<any>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCongratulations, setShowCongratulations] = useState(false);
  const [createdListing, setCreatedListing] = useState<any>(null);

  // Show loading or redirect if user is not authenticated
  if (!user) {
    return (
      <main className="max-w-2xl mx-auto py-8 px-4 min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center bg-gradient-to-r from-white to-gray-50 rounded-lg shadow-sm border border-gray-200 p-8">
          <p className="text-gray-700 text-lg">Please log in to list a property.</p>
        </div>
      </main>
    );
  }

  const handlePublish = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch('http://localhost:4000/api/listings/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          seller_id: user.id, // Use the authenticated user's ID
          status: 'published'
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('API Error:', errorData);
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      // Store the created listing data and show congratulations modal
      setCreatedListing(result.listing);
      setShowCongratulations(true);
      
    } catch (error) {
      console.error('Error submitting listing:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      alert(`Error submitting listing: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleModalClose = () => {
    setShowCongratulations(false);
    // Reset form for potential new listing
    setFormData({});
    setCurrentStep(0);
  };

  return (
    <main className="max-w-2xl mx-auto py-8 px-4 min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <ProgressIndicator steps={steps} currentStep={currentStep} />
      {currentStep === 0 && (
        <PropertyListingStep1
          data={formData}
          onNext={(data) => {
            setFormData({ ...formData, ...data });
            setCurrentStep(1);
          }}
        />
      )}
      {currentStep === 1 && (
        <PropertyListingStep2
          data={formData}
          onNext={(data) => {
            setFormData({ ...formData, ...data });
            setCurrentStep(2);
          }}
          onBack={() => setCurrentStep(0)}
        />
      )}
      {currentStep === 2 && (
        <PropertyListingStep3
          data={formData}
          onNext={(data) => {
            setFormData({ ...formData, ...data });
            setCurrentStep(3);
          }}
          onBack={() => setCurrentStep(1)}
        />
      )}
      {currentStep === 3 && (
        <PropertyListingStep4
          data={formData}
          onNext={(data) => {
            setFormData({ ...formData, ...data });
            setCurrentStep(4);
          }}
          onBack={() => setCurrentStep(2)}
        />
      )}
      {currentStep === 4 && (
        <PropertyListingStep5
          data={formData}
          onNext={(data) => {
            setFormData({ ...formData, ...data });
            setCurrentStep(5);
          }}
          onBack={() => setCurrentStep(3)}
        />
      )}
      {currentStep === 5 && (
        <PropertyListingStep6
          data={formData}
          onPublish={handlePublish}
          onBack={() => setCurrentStep(4)}
          isSubmitting={isSubmitting}
        />
      )}

      {/* Congratulations Modal */}
      {showCongratulations && createdListing && (
        <CongratulationsModal
          isOpen={showCongratulations}
          listingId={createdListing.id}
          propertyTitle={createdListing.title}
          onClose={handleModalClose}
        />
      )}
    </main>
  );
}
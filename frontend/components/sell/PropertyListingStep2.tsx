import React, { useState } from "react";
import { useForm } from "react-hook-form";

export interface Step2Form {
  postcode: string;
  line1: string;
  city: string;
  displayAddress: boolean;
  lat: number;
  lng: number;
}

interface PropertyListingStep2Props {
  data: Partial<Step2Form>;
  onNext: (data: Step2Form) => void;
  onBack: () => void;
}

export const PropertyListingStep2: React.FC<PropertyListingStep2Props> = ({ data, onNext, onBack }) => {
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [lookupResults, setLookupResults] = useState<any[]>([]);
  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<Step2Form>({
    defaultValues: {
      postcode: data.postcode || "",
      line1: data.line1 || "",
      city: data.city || "",
      displayAddress: data.displayAddress ?? true,
      lat: data.lat || 0,
      lng: data.lng || 0,
    },
  });

  const postcode = watch("postcode");

  const lookupPostcode = async () => {
    if (!postcode || postcode.length < 5) {
      alert("Please enter a valid postcode");
      return;
    }

    setIsLookingUp(true);
    try {
      // Using the free postcodes.io API
      const response = await fetch(`https://api.postcodes.io/postcodes/${postcode.replace(/\s+/g, '')}`);
      const data = await response.json();
      
      if (data.status === 200) {
        const { admin_ward, admin_district, region, latitude, longitude } = data.result;
        
        // Update form with location data
        setValue("city", admin_district || region || "");
        setValue("lat", latitude);
        setValue("lng", longitude);
        
        // For demonstration, show some address suggestions
        // In a real app, you'd use a proper address lookup service
        setLookupResults([
          { line1: "123 Example Street", city: admin_district },
          { line1: "456 Sample Road", city: admin_district },
          { line1: "789 Demo Avenue", city: admin_district },
        ]);
      } else {
        alert("Postcode not found. Please check and try again.");
      }
    } catch (error) {
      console.error("Postcode lookup error:", error);
      alert("Error looking up postcode. Please try again.");
    } finally {
      setIsLookingUp(false);
    }
  };

  const selectAddress = (address: any) => {
    setValue("line1", address.line1);
    setValue("city", address.city);
    setLookupResults([]);
  };

  return (
    <form onSubmit={handleSubmit(onNext)} className="space-y-6">
      <div>
        <label className="block font-semibold mb-1">Postcode</label>
        <div className="flex gap-2">
          <input
            {...register("postcode", { required: "Postcode is required" })}
            className="flex-1 border rounded px-3 py-2"
            placeholder="e.g. SW1A 1AA"
          />
          <button
            type="button"
            onClick={lookupPostcode}
            disabled={isLookingUp}
            className={`px-4 py-2 rounded font-semibold transition ${
              isLookingUp
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {isLookingUp ? 'Looking up...' : 'Find Address'}
          </button>
        </div>
        {errors.postcode && <span className="text-red-500 text-sm">{errors.postcode.message}</span>}
      </div>

      {lookupResults.length > 0 && (
        <div className="border rounded p-4 bg-gray-50">
          <h3 className="font-semibold mb-2">Select your address:</h3>
          <div className="space-y-2">
            {lookupResults.map((address, index) => (
              <button
                key={index}
                type="button"
                onClick={() => selectAddress(address)}
                className="w-full text-left p-2 border rounded bg-white hover:bg-gray-100 transition"
              >
                {address.line1}, {address.city}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-4">
        <div className="flex-1">
          <label className="block font-semibold mb-1">Address Line 1</label>
          <input
            {...register("line1", { required: "Address is required" })}
            className="w-full border rounded px-3 py-2"
            placeholder="123 Main Street"
          />
          {errors.line1 && <span className="text-red-500 text-sm">{errors.line1.message}</span>}
        </div>
        <div className="flex-1">
          <label className="block font-semibold mb-1">City</label>
          <input
            {...register("city", { required: "City is required" })}
            className="w-full border rounded px-3 py-2"
            placeholder="London"
          />
          {errors.city && <span className="text-red-500 text-sm">{errors.city.message}</span>}
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <input type="checkbox" {...register("displayAddress")} id="displayAddress" />
        <label htmlFor="displayAddress" className="text-sm">Hide house number in listing</label>
      </div>
      
      {/* Simple map placeholder with coordinates */}
      {watch("lat") && watch("lng") && (
        <div className="border rounded p-4 bg-gray-50">
          <h3 className="font-semibold mb-2">Location Preview</h3>
          <div className="bg-gray-200 h-32 rounded flex items-center justify-center text-gray-500">
            <div className="text-center">
              <p className="text-sm">Map preview</p>
              <p className="text-xs">Lat: {watch("lat")?.toFixed(4)}, Lng: {watch("lng")?.toFixed(4)}</p>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            In a full implementation, this would show an interactive map where you can adjust the pin location
          </p>
        </div>
      )}
      
      <div className="flex justify-between">
        <button type="button" onClick={onBack} className="bg-gray-200 text-gray-700 px-6 py-2 rounded font-semibold hover:bg-gray-300 transition">Back</button>
        <button type="submit" className="bg-emerald-600 text-white px-6 py-2 rounded font-semibold hover:bg-emerald-700 transition">Next</button>
      </div>
    </form>
  );
};

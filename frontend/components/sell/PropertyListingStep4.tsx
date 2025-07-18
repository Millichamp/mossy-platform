import React from "react";
import { useForm } from "react-hook-form";

export interface Step4Form {
  description: string;
  keyFeatures: string[];
  reasonForSale: string;
  customReason?: string;
  completionTimeline: string;
}

interface PropertyListingStep4Props {
  data: Partial<Step4Form>;
  onNext: (data: Step4Form) => void;
  onBack: () => void;
}

const featureSuggestions = [
  "Garden",
  "Parking",
  "Garage",
  "New Kitchen",
  "New Bathroom",
  "Period Features",
  "Balcony",
  "Fireplace",
  "Ensuite",
  "Loft",
];

const reasons = [
  "Upsizing",
  "Downsizing",
  "Relocating",
  "Investment",
  "Other",
];

const timelines = [
  "ASAP",
  "1-3 months",
  "3-6 months",
  "6+ months",
  "Flexible",
];

export const PropertyListingStep4: React.FC<PropertyListingStep4Props> = ({ data, onNext, onBack }) => {
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<Step4Form>({
    defaultValues: {
      description: data.description || "",
      keyFeatures: data.keyFeatures || [],
      reasonForSale: data.reasonForSale || "",
      customReason: data.customReason || "",
      completionTimeline: data.completionTimeline || "",
    },
  });

  const reason = watch("reasonForSale");
  const keyFeatures = watch("keyFeatures");

  // Tag input logic
  const addFeature = (feature: string) => {
    if (!keyFeatures.includes(feature)) {
      setValue("keyFeatures", [...keyFeatures, feature]);
    }
  };
  const removeFeature = (feature: string) => {
    setValue("keyFeatures", keyFeatures.filter((f) => f !== feature));
  };

  return (
    <form onSubmit={handleSubmit(onNext)} className="space-y-6">
      <div>
        <label className="block font-semibold mb-1">Description</label>
        <textarea
          {...register("description", { required: true, minLength: 100 })}
          className="w-full border rounded px-3 py-2 min-h-[120px]"
          placeholder="What makes your property special?"
        />
        <div className="text-xs text-gray-500 mt-1">Minimum 100 words</div>
        {errors.description && <span className="text-red-500 text-sm">Please enter at least 100 words.</span>}
      </div>
      <div>
        <label className="block font-semibold mb-1">Key Features</label>
        <div className="flex flex-wrap gap-2 mb-2">
          {featureSuggestions.map((feature) => (
            <button
              type="button"
              key={feature}
              className={`px-3 py-1 rounded-full border text-sm ${keyFeatures.includes(feature) ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-700'}`}
              onClick={() => addFeature(feature)}
            >
              {feature}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2 mb-2">
          {keyFeatures.map((feature) => (
            <span key={feature} className="inline-flex items-center bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full text-xs">
              {feature}
              <button type="button" className="ml-1 text-emerald-700 hover:text-red-500" onClick={() => removeFeature(feature)}>&times;</button>
            </span>
          ))}
        </div>
        <input
          type="text"
          className="w-full border rounded px-3 py-2"
          placeholder="Add custom feature and press Enter"
          onKeyDown={e => {
            if (e.key === 'Enter' && e.currentTarget.value.trim()) {
              e.preventDefault();
              addFeature(e.currentTarget.value.trim());
              e.currentTarget.value = '';
            }
          }}
        />
      </div>
      <div>
        <label className="block font-semibold mb-1">Reason for Sale</label>
        <select {...register("reasonForSale", { required: true })} className="w-full border rounded px-3 py-2">
          <option value="">Select</option>
          {reasons.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
        {reason === "Other" && (
          <input
            type="text"
            {...register("customReason", { required: true })}
            className="w-full border rounded px-3 py-2 mt-2"
            placeholder="Please specify"
          />
        )}
      </div>
      <div>
        <label className="block font-semibold mb-1">Completion Timeline</label>
        <div className="flex gap-4 flex-wrap">
          {timelines.map((t) => (
            <label key={t} className="flex items-center gap-1">
              <input type="radio" value={t} {...register("completionTimeline", { required: true })} /> {t}
            </label>
          ))}
        </div>
      </div>
      <div className="flex justify-between mt-6">
        <button type="button" onClick={onBack} className="bg-gray-200 text-gray-700 px-6 py-2 rounded font-semibold hover:bg-gray-300 transition">Back</button>
        <button type="submit" className="bg-emerald-600 text-white px-6 py-2 rounded font-semibold hover:bg-emerald-700 transition">Next</button>
      </div>
    </form>
  );
};

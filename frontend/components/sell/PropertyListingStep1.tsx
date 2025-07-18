import React from "react";
import { useForm } from "react-hook-form";

export interface Step1Form {
  title: string;
  propertyType: string;
  bedrooms: number;
  bathrooms: number;
  receptions: number;
}

interface PropertyListingStep1Props {
  data: Partial<Step1Form>;
  onNext: (data: Step1Form) => void;
}

const propertyTypes = [
  { value: "detached", label: "Detached House", icon: "🏠" },
  { value: "semi-detached", label: "Semi-Detached", icon: "🏘️" },
  { value: "terraced", label: "Terraced", icon: "🏠" },
  { value: "flat", label: "Flat/Apartment", icon: "🏢" },
  { value: "bungalow", label: "Bungalow", icon: "🏡" },
];

export const PropertyListingStep1: React.FC<PropertyListingStep1Props> = ({ data, onNext }) => {
  const { register, handleSubmit, formState: { errors } } = useForm<Step1Form>({
    defaultValues: {
      title: data.title || "",
      propertyType: data.propertyType || "",
      bedrooms: data.bedrooms || 0,
      bathrooms: data.bathrooms || 0,
      receptions: data.receptions || 0,
    },
  });

  return (
    <form onSubmit={handleSubmit(onNext)} className="space-y-6">
      <div>
        <label className="block font-semibold mb-1">Listing Title</label>
        <input
          {...register("title", { required: "Title is required" })}
          className="w-full border rounded px-3 py-2"
          placeholder="Be descriptive to attract buyers"
        />
        {errors.title && <span className="text-red-500 text-sm">{errors.title.message}</span>}
      </div>
      <div>
        <label className="block font-semibold mb-1 mb-2">Property Type</label>
        <div className="flex gap-2 flex-wrap">
          {propertyTypes.map((type) => (
            <label key={type.value} className="flex items-center gap-1 border rounded px-3 py-2 cursor-pointer hover:bg-emerald-50">
              <input
                type="radio"
                value={type.value}
                {...register("propertyType", { required: "Select a property type" })}
                className="mr-1"
              />
              <span className="text-xl">{type.icon}</span>
              <span>{type.label}</span>
            </label>
          ))}
        </div>
        {errors.propertyType && <span className="text-red-500 text-sm">{errors.propertyType.message}</span>}
      </div>
      <div className="flex gap-4">
        <div className="flex-1">
          <label className="block font-semibold mb-1">Bedrooms</label>
          <input
            type="number"
            min={0}
            max={10}
            {...register("bedrooms", { required: true, min: 0, max: 10 })}
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <div className="flex-1">
          <label className="block font-semibold mb-1">Bathrooms</label>
          <input
            type="number"
            min={0}
            max={5}
            {...register("bathrooms", { required: true, min: 0, max: 5 })}
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <div className="flex-1">
          <label className="block font-semibold mb-1 flex items-center">Receptions
            <span className="ml-1 text-xs text-gray-400" title="Living rooms, dining rooms, etc.">(?)</span>
          </label>
          <input
            type="number"
            min={0}
            max={5}
            {...register("receptions", { required: true, min: 0, max: 5 })}
            className="w-full border rounded px-3 py-2"
          />
        </div>
      </div>
      <div className="flex justify-end">
        <button type="submit" className="bg-emerald-600 text-white px-6 py-2 rounded font-semibold hover:bg-emerald-700 transition">Next</button>
      </div>
    </form>
  );
};

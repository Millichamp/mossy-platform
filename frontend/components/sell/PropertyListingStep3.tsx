import React, { useState } from "react";
import { useForm } from "react-hook-form";

export interface Step3Form {
  price: number;
  squareFeet: number;
  yearBuilt: string;
  tenure: string;
  serviceCharge?: number;
  groundRent?: number;
  councilTaxBand: string;
  epcRating: string;
  epcCertificateUrl: string;
  chainFree: boolean;
}

interface PropertyListingStep3Props {
  data: Partial<Step3Form>;
  onNext: (data: Step3Form) => void;
  onBack: () => void;
}

const councilTaxBands = ["A", "B", "C", "D", "E", "F", "G", "H"];
const epcRatings = ["A", "B", "C", "D", "E", "F", "G"];

export const PropertyListingStep3: React.FC<PropertyListingStep3Props> = ({ data, onNext, onBack }) => {
  const [tenure, setTenure] = useState(data.tenure || "freehold");
  const { register, handleSubmit, watch, formState: { errors } } = useForm<Step3Form>({
    defaultValues: {
      price: data.price || 0,
      squareFeet: data.squareFeet || 0,
      yearBuilt: data.yearBuilt || "",
      tenure: data.tenure || "freehold",
      serviceCharge: data.serviceCharge || 0,
      groundRent: data.groundRent || 0,
      councilTaxBand: data.councilTaxBand || "",
      epcRating: data.epcRating || "",
      epcCertificateUrl: data.epcCertificateUrl || "",
      chainFree: data.chainFree ?? false,
    },
  });

  const selectedTenure = watch("tenure", tenure);

  return (
    <form onSubmit={handleSubmit(onNext)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block font-semibold mb-1">Price (£)</label>
          <input
            type="number"
            min={50000}
            max={50000000}
            step={1000}
            {...register("price", { required: true, min: 50000, max: 50000000 })}
            className="w-full border rounded px-3 py-2"
            placeholder="e.g. 650000"
          />
          {errors.price && <span className="text-red-500 text-sm">Enter a valid price (£50,000 - £50,000,000)</span>}
        </div>
        <div>
          <label className="block font-semibold mb-1">Square Feet</label>
          <input
            type="number"
            min={0}
            {...register("squareFeet", { required: true, min: 0 })}
            className="w-full border rounded px-3 py-2"
            placeholder="e.g. 1200"
          />
        </div>
        <div>
          <label className="block font-semibold mb-1">Year Built</label>
          <input
            type="text"
            {...register("yearBuilt")}
            className="w-full border rounded px-3 py-2"
            placeholder="e.g. 2015 or Not sure"
          />
        </div>
        <div>
          <label className="block font-semibold mb-1">Tenure</label>
          <div className="flex gap-4">
            <label className="flex items-center gap-1">
              <input type="radio" value="freehold" {...register("tenure", { required: true })} /> Freehold
            </label>
            <label className="flex items-center gap-1">
              <input type="radio" value="leasehold" {...register("tenure", { required: true })} /> Leasehold
            </label>
            <label className="flex items-center gap-1">
              <input type="radio" value="share-of-freehold" {...register("tenure", { required: true })} /> Share of Freehold
            </label>
          </div>
        </div>
        {selectedTenure === "leasehold" && (
          <>
            <div>
              <label className="block font-semibold mb-1">Service Charge (£/year)</label>
              <input
                type="number"
                min={0}
                {...register("serviceCharge", { required: true, min: 0 })}
                className="w-full border rounded px-3 py-2"
                placeholder="e.g. 2500"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">Ground Rent (£/year)</label>
              <input
                type="number"
                min={0}
                {...register("groundRent", { required: true, min: 0 })}
                className="w-full border rounded px-3 py-2"
                placeholder="e.g. 300"
              />
            </div>
          </>
        )}
        <div>
          <label className="block font-semibold mb-1">Council Tax Band</label>
          <select {...register("councilTaxBand", { required: true })} className="w-full border rounded px-3 py-2">
            <option value="">Select</option>
            {councilTaxBands.map((band) => (
              <option key={band} value={band}>{band}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block font-semibold mb-1">EPC Rating</label>
          <select {...register("epcRating", { required: true })} className="w-full border rounded px-3 py-2">
            <option value="">Select</option>
            {epcRatings.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block font-semibold mb-1">EPC Certificate (URL)</label>
          <input
            type="url"
            {...register("epcCertificateUrl", { required: false })}
            className="w-full border rounded px-3 py-2"
            placeholder="https://..."
          />
        </div>
        <div className="flex items-center gap-2 mt-2">
          <input type="checkbox" {...register("chainFree")} id="chainFree" />
          <label htmlFor="chainFree" className="text-sm">Chain Free</label>
        </div>
      </div>
      <div className="flex justify-between mt-6">
        <button type="button" onClick={onBack} className="bg-gray-200 text-gray-700 px-6 py-2 rounded font-semibold hover:bg-gray-300 transition">Back</button>
        <button type="submit" className="bg-emerald-600 text-white px-6 py-2 rounded font-semibold hover:bg-emerald-700 transition">Next</button>
      </div>
    </form>
  );
};

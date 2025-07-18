import React from "react";
import { Bed, Bath, Ruler, Car, Home, Calendar, Zap, Building } from "lucide-react";
import EditableField from "./EditableField";
import ContactSellerButton from "./messaging/ContactSellerButton";

interface PropertyDetailsProps {
  property: any;
  canEdit: boolean;
  onSave: (field: string, value: any) => Promise<void>;
}

const PropertyDetails: React.FC<PropertyDetailsProps> = ({
  property,
  canEdit,
  onSave
}) => {
  const keyFeatures = [
    { icon: Bed, label: "Bedrooms", value: property.bedrooms, field: "bedrooms", type: "number" },
    { icon: Bath, label: "Bathrooms", value: property.bathrooms, field: "bathrooms", type: "number" },
    { icon: Ruler, label: "Sq. Feet", value: property.square_feet, field: "squareFeet", type: "number" },
    { icon: Car, label: "Parking", value: property.parking_spaces, field: "parkingSpaces", type: "number" },
  ];

  const propertyDetails = [
    { label: "Property Type", value: property.property_type, field: "propertyType", type: "select", options: ["House", "Flat", "Bungalow", "Cottage", "Townhouse", "Maisonette"] },
    { label: "Tenure", value: property.tenure, field: "tenure", type: "select", options: ["Freehold", "Leasehold", "Shared Ownership", "Commonhold"] },
    { label: "Energy Rating", value: property.energy_rating, field: "epcRating", type: "select", options: ["A", "B", "C", "D", "E", "F", "G"] },
    { label: "Year Built", value: property.year_built, field: "yearBuilt", type: "number" },
    { label: "Garden", value: property.garden ? "Yes" : "No", field: "garden", type: "select", options: ["Yes", "No"] },
    { label: "Furnished", value: property.furnished, field: "furnished", type: "select", options: ["Furnished", "Unfurnished", "Part Furnished"] },
  ];

  return (
    <div className="p-6 lg:p-8 space-y-8">
      {/* Key Features Grid */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Key Features</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {keyFeatures.map(({ icon: Icon, label, value, field, type }) => (
            <div key={field} className="bg-gray-50 rounded-lg p-4 text-center">
              <Icon className="w-8 h-8 mx-auto mb-2 text-gray-600" />
              <div className="text-sm text-gray-600 mb-1">{label}</div>
              <div className="font-semibold">
                <EditableField
                  value={value || 0}
                  field={field}
                  type={type as any}
                  canEdit={canEdit}
                  onSave={onSave}
                  className="text-center bg-transparent border-0 font-semibold"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Description */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Description</h2>
        <div className="prose max-w-none">
          <EditableField
            value={property.description || ""}
            field="description"
            type="textarea"
            canEdit={canEdit}
            onSave={onSave}
            rows={6}
            className="w-full p-3 border border-gray-200 rounded-lg resize-none"
          />
        </div>
      </div>

      {/* Property Details */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Property Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {propertyDetails.map(({ label, value, field, type, options }) => (
            <div key={field} className="flex justify-between items-center py-3 border-b border-gray-200">
              <span className="text-gray-600">{label}</span>
              <div className="font-medium">
                <EditableField
                  value={value || ""}
                  field={field}
                  type={type as any}
                  options={options}
                  canEdit={canEdit}
                  onSave={onSave}
                  className="text-right bg-transparent border-0"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Contact */}
      <div className="bg-green-50 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Contact Seller</h2>
        
        {!canEdit && (
          <div className="mb-4">
            <ContactSellerButton
              propertyId={property.id}
              propertyTitle={property.title}
              sellerId={property.seller_id}
              className="w-full sm:w-auto"
            />
          </div>
        )}
        
        <div className="space-y-3">
          <div>
            <span className="text-gray-600">Name:</span>
            <span className="ml-2 font-medium">
              <EditableField
                value={property.contact_name || ""}
                field="contactName"
                type="text"
                canEdit={canEdit}
                onSave={onSave}
                className="bg-transparent border-0"
              />
            </span>
          </div>
          <div>
            <span className="text-gray-600">Phone:</span>
            <span className="ml-2 font-medium">
              <EditableField
                value={property.contact_phone || ""}
                field="contactPhone"
                type="text"
                canEdit={canEdit}
                onSave={onSave}
                className="bg-transparent border-0"
              />
            </span>
          </div>
          <div>
            <span className="text-gray-600">Email:</span>
            <span className="ml-2 font-medium">
              <EditableField
                value={property.contact_email || ""}
                field="contactEmail"
                type="text"
                canEdit={canEdit}
                onSave={onSave}
                className="bg-transparent border-0"
              />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetails;

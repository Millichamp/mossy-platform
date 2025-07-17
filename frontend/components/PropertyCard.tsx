import Image from 'next/image';

interface PropertyCardProps {
  id: string;
  title: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  location: string;
  imageUrl: string;
}

export default function PropertyCard({
  id,
  title,
  price,
  bedrooms,
  bathrooms,
  location,
  imageUrl
}: PropertyCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative h-48 w-full">
        <Image
          src={imageUrl || "/placeholder-property.jpg"}
          alt={title}
          fill
          className="object-cover"
        />
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-2xl font-bold text-green-600 mb-2">
          £{price.toLocaleString()}
        </p>
        <div className="flex items-center text-gray-600 text-sm mb-2">
          <span className="mr-4">{bedrooms} bed</span>
          <span className="mr-4">{bathrooms} bath</span>
        </div>
        <p className="text-gray-600 text-sm">{location}</p>
      </div>
    </div>
  );
}
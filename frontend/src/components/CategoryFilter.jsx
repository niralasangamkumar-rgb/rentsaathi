import { categories } from '../services/listingService';

export default function CategoryFilter({ selectedCategory, onSelectCategory }) {
  return (
    <div className="overflow-x-auto pb-2" data-testid="category-filter">
      <div className="flex space-x-2 min-w-max">
        <button
          onClick={() => onSelectCategory(null)}
          className={`px-4 py-2 rounded-full text-sm font-medium transition whitespace-nowrap ${
            !selectedCategory
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-600 border border-gray-200 hover:border-blue-300'
          }`}
          data-testid="category-all"
        >
          All
        </button>
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => onSelectCategory(category.id)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition whitespace-nowrap ${
              selectedCategory === category.id
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-600 border border-gray-200 hover:border-blue-300'
            }`}
            data-testid={`category-${category.id}`}
          >
            {category.icon} {category.name}
          </button>
        ))}
      </div>
    </div>
  );
}

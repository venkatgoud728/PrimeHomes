
namespace PrimeHomes.API.Models
{
    public class Property
    {
        public int PropertyId { get; set; }

        public string Title { get; set; } = string.Empty;

        public string Description { get; set; } = string.Empty;

        public string PropertyType { get; set; } = string.Empty;

        public int BHK { get; set; }

        public decimal Price { get; set; }

        public decimal Area { get; set; }

        public string Location { get; set; } = string.Empty;

        public string City { get; set; } = string.Empty;

        // Property map coordinates
        public double? Latitude { get; set; }

        public double? Longitude { get; set; }

        public string? ImageUrl { get; set; }

        public int OwnerId { get; set; }

        public string Status { get; set; } = "Pending";

        public string? Badge { get; set; }

        public DateTime CreatedDate { get; set; } = DateTime.Now;

        // Multiple images for this property
        public ICollection<PropertyImage> Images { get; set; }
            = new List<PropertyImage>();

        // Selected lifestyle and community features stored as JSON
        public string LifestyleFeatures { get; set; } = "[]";
    }
}

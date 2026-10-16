using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PrimeHomes.API.Models
{
    public class PropertyImage
    {
        [Key]
        public int PropertyImageId { get; set; }

        public int PropertyId { get; set; }

        [Required]
        public string ImageUrl { get; set; } = string.Empty;

        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;

        [ForeignKey("PropertyId")]
        public Property Property { get; set; } = null!;
    }
}


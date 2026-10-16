using System.ComponentModel.DataAnnotations;

namespace PrimeHomes.API.Models
{
    public class PropertyReview
    {
        [Key]
        public int ReviewId { get; set; }

        public int PropertyId { get; set; }

        public int UserId { get; set; }

        public int Rating { get; set; }

        public string Comment { get; set; } = string.Empty;

        public DateTime CreatedDate { get; set; } = DateTime.Now;

        // Navigation properties
        public Property? Property { get; set; }

        public User? User { get; set; }


    }
}

using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PrimeHomes.API.Models
{
    public class UserProfile
    {
        [Key]
        public int UserProfileId { get; set; }

        public int UserId { get; set; }

        public string? ProfileImageUrl { get; set; }

        public string? City { get; set; }

        public string? State { get; set; }

        public string? Bio { get; set; }

        public string? CompanyName { get; set; }

        // Buyer preferences
        public string? PreferredCity { get; set; }

        public string? PreferredPropertyType { get; set; }

        public int? PreferredBHK { get; set; }

        public decimal? MinBudget { get; set; }

        public decimal? MaxBudget { get; set; }

        public DateTime UpdatedDate { get; set; } = DateTime.Now;

        [ForeignKey("UserId")]
        public User? User { get; set; }
    }
}
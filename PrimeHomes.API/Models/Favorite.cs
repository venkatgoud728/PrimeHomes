using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PrimeHomes.API.Models
{
    public class Favorite
    {
        [Key]
        public int FavoriteId { get; set; }

        public int BuyerId { get; set; }

        public int PropertyId { get; set; }

        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;

        [ForeignKey("BuyerId")]
        public User Buyer { get; set; } = null!;

        [ForeignKey("PropertyId")]
        public Property Property { get; set; } = null!;
    }
}
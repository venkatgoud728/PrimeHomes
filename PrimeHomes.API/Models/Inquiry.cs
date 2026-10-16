namespace PrimeHomes.API.Models
{
    public class Inquiry
    {
        public int InquiryId { get; set; }

        public int PropertyId { get; set; }

        public int BuyerId { get; set; }

        public int OwnerId { get; set; }

        public string Message { get; set; } = string.Empty;

        public string Status { get; set; } = "New";

        public DateTime CreatedDate { get; set; } = DateTime.Now;

        public Property? Property { get; set; }
    }
}
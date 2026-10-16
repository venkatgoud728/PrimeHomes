namespace PrimeHomes.API.Models
{
    public class ContactRequest
    {
        public int ContactRequestId { get; set; }

        // If the user is logged in, we can store their UserId.
        // Guest users will have null.
        public int? UserId { get; set; }

        // Later we can connect the request to a specific property.
        // For a general callback request this will be null.
        public int? PropertyId { get; set; }

        public string FullName { get; set; } = string.Empty;

        public string Email { get; set; } = string.Empty;

        public string PhoneNumber { get; set; } = string.Empty;

        public string InterestedIn { get; set; } = string.Empty;

        public string Message { get; set; } = string.Empty;

        // New / Contacted / Closed
        public string Status { get; set; } = "New";

        public DateTime CreatedDate { get; set; } = DateTime.Now;
    }
}
namespace PrimeHomes.API.Models
{
    public class Notification
    {
        public int NotificationId { get; set; }

        public int UserId { get; set; }

        public string Title { get; set; } = string.Empty;

        public string Message { get; set; } = string.Empty;

        public string Type { get; set; } = string.Empty;

        public bool IsRead { get; set; } = false;

        public int? RelatedPropertyId { get; set; }

        public DateTime CreatedDate { get; set; } = DateTime.Now;
    }
}


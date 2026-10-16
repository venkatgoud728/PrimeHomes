using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PrimeHomes.API.Data;
using System.Security.Claims;

namespace PrimeHomes.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class NotificationsController : ControllerBase
    {
        private readonly PrimeHomesDbContext _context;

        public NotificationsController(PrimeHomesDbContext context)
        {
            _context = context;
        }


        // ==========================================
        // Get My Notifications
        // ==========================================

        [HttpGet]
        public async Task<IActionResult> GetMyNotifications()
        {
            var userIdClaim =
                User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (!int.TryParse(userIdClaim, out int userId))
            {
                return Unauthorized(new
                {
                    message = "Invalid user."
                });
            }


            var notifications = await _context.Notifications
                .Where(n => n.UserId == userId)
                .OrderByDescending(n => n.CreatedDate)
                .ToListAsync();


            return Ok(notifications);
        }


        // ==========================================
        // Get Unread Notifications
        // ==========================================

        [HttpGet("unread")]
        public async Task<IActionResult> GetUnreadNotifications()
        {
            var userIdClaim =
                User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (!int.TryParse(userIdClaim, out int userId))
            {
                return Unauthorized(new
                {
                    message = "Invalid user."
                });
            }


            var notifications = await _context.Notifications
                .Where(n =>
                    n.UserId == userId &&
                    !n.IsRead)
                .OrderByDescending(n => n.CreatedDate)
                .ToListAsync();


            return Ok(notifications);
        }


        // ==========================================
        // Get Unread Count
        // ==========================================

        [HttpGet("unread-count")]
        public async Task<IActionResult> GetUnreadCount()
        {
            var userIdClaim =
                User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (!int.TryParse(userIdClaim, out int userId))
            {
                return Unauthorized(new
                {
                    message = "Invalid user."
                });
            }


            var count = await _context.Notifications
                .CountAsync(n =>
                    n.UserId == userId &&
                    !n.IsRead);


            return Ok(new
            {
                count
            });
        }


        // ==========================================
        // Mark Notification As Read
        // ==========================================

        [HttpPut("{id}/read")]
        public async Task<IActionResult> MarkAsRead(int id)
        {
            var userIdClaim =
                User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (!int.TryParse(userIdClaim, out int userId))
            {
                return Unauthorized(new
                {
                    message = "Invalid user."
                });
            }


            var notification =
                await _context.Notifications
                    .FirstOrDefaultAsync(n =>
                        n.NotificationId == id &&
                        n.UserId == userId);


            if (notification == null)
            {
                return NotFound(new
                {
                    message = "Notification not found."
                });
            }


            notification.IsRead = true;


            await _context.SaveChangesAsync();


            return Ok(new
            {
                message =
                    "Notification marked as read."
            });
        }
    }
}
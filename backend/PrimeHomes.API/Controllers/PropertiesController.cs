using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PrimeHomes.API.Data;
using PrimeHomes.API.Models;

namespace PrimeHomes.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PropertiesController : ControllerBase
    {
        private readonly PrimeHomesDbContext _context;

        public PropertiesController(PrimeHomesDbContext context)
        {
            _context = context;
        }


        // GET: api/Properties
        [HttpGet]
        public async Task<IActionResult> GetProperties()
        {
            var properties = await _context.Properties
                .Where(p => p.Status == "Approved")
                .ToListAsync();

            return Ok(properties);
        }


        // GET: api/Properties/1

        [HttpGet("{id}")]
        public async Task<IActionResult> GetPropertyById(int id)
        {
            var property = await _context.Properties
                .FirstOrDefaultAsync(p => p.PropertyId == id);

            if (property == null)
            {
                return NotFound("Property not found");
            }

            return Ok(property);
        }

        

        [Authorize(Roles = "Owner")]
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateProperty(int id, Property property)
        {
            var existingProperty = await _context.Properties
                .FirstOrDefaultAsync(p => p.PropertyId == id);

            if (existingProperty == null)
            {
                return NotFound("Property not found");
            }

            var userId = int.Parse(
                User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

            if (existingProperty.OwnerId != userId)
            {
                return Forbid();
            }

            existingProperty.Title = property.Title;
            existingProperty.Description = property.Description;
            existingProperty.PropertyType = property.PropertyType;
            existingProperty.BHK = property.BHK;
            existingProperty.Price = property.Price;
            existingProperty.Area = property.Area;
            existingProperty.Location = property.Location;
            existingProperty.City = property.City;
            existingProperty.Latitude = property.Latitude;
            existingProperty.Longitude = property.Longitude;
            existingProperty.ImageUrl = property.ImageUrl;
            existingProperty.LifestyleFeatures = property.LifestyleFeatures ?? "[]";

            await _context.SaveChangesAsync();

            return Ok(existingProperty);
        }


        [Authorize(Roles = "Owner")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteProperty(int id)
        {
            var property = await _context.Properties
                .FirstOrDefaultAsync(p => p.PropertyId == id);

            if (property == null)
            {
                return NotFound(new
                {
                    message = "Property not found."
                });
            }

            var userId = int.Parse(
                User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

            // Owner can delete only their own property
            if (property.OwnerId != userId)
            {
                return Forbid();
            }

            // Delete related inquiries
            var inquiries = await _context.Inquiries
                .Where(i => i.PropertyId == id)
                .ToListAsync();

            if (inquiries.Any())
            {
                _context.Inquiries.RemoveRange(inquiries);
            }

            // Delete related gallery image records
            var propertyImages = await _context.PropertyImages
                .Where(i => i.PropertyId == id)
                .ToListAsync();

            if (propertyImages.Any())
            {
                _context.PropertyImages.RemoveRange(propertyImages);
            }

            // Delete property
            _context.Properties.Remove(property);

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Property deleted successfully."
            });
        }

        [Authorize(Roles = "Admin")]
        [HttpPut("{id}/approve")]
        public async Task<IActionResult> ApproveProperty(int id)
        {
            var property = await _context.Properties
                .FirstOrDefaultAsync(p => p.PropertyId == id);

            if (property == null)
            {
                return NotFound(new
                {
                    message = "Property not found."
                });
            }


            // ==========================================
            // Approve Property
            // ==========================================

            property.Status = "Approved";


            // ==========================================
            // Create Notification for Owner
            // ==========================================

            var notification = new Notification
            {
                UserId = property.OwnerId,

                Title = "Property Approved",

                Message =
                    $"Your property '{property.Title}' has been approved and is now visible to buyers.",

                Type = "PropertyApproved",

                IsRead = false,

                RelatedPropertyId = property.PropertyId,

                CreatedDate = DateTime.Now
            };


            _context.Notifications.Add(notification);


            // ==========================================
            // Save Property + Notification
            // ==========================================

            await _context.SaveChangesAsync();


            return Ok(new
            {
                message = "Property approved successfully."
            });
        }


        [Authorize(Roles = "Admin")]
        [HttpPut("{id}/reject")]
        public async Task<IActionResult> RejectProperty(int id)
        {
            var property = await _context.Properties.FindAsync(id);

            if (property == null)
            {
                return NotFound(new { message = "Property not found." });
            }

            property.Status = "Rejected";

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Property rejected successfully."
            });
        }

        [Authorize(Roles = "Owner")]
        [HttpGet("my-properties")]
        public async Task<IActionResult> GetMyProperties()
        {
            var ownerId = int.Parse(
                User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

            var properties = await _context.Properties
                .Where(p => p.OwnerId == ownerId)
                .ToListAsync();

            return Ok(properties);
        }

        [Authorize(Roles = "Owner")]
        [HttpPost]
        public async Task<IActionResult> AddProperty(Property property)
        {
            var ownerId = int.Parse(
                User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

            property.OwnerId = ownerId;
            property.Status = "Pending";
            property.CreatedDate = DateTime.Now;
            property.LifestyleFeatures ??= "[]";

            _context.Properties.Add(property);

            await _context.SaveChangesAsync();

            return Ok(property);
        }
        [Authorize(Roles = "Admin")]
        [HttpGet("all")]
        public async Task<IActionResult> GetAllPropertiesForAdmin()
        {
            var properties = await _context.Properties
                .OrderByDescending(p => p.CreatedDate)
                .ToListAsync();

            return Ok(properties);
        }


        [Authorize(Roles = "Admin")]
        [HttpPut("{id}/badge")]
        public async Task<IActionResult> UpdatePropertyBadge(
    int id,
    [FromBody] UpdatePropertyBadgeDto request)
        {
            var property = await _context.Properties
                .FirstOrDefaultAsync(p => p.PropertyId == id);

            if (property == null)
            {
                return NotFound(new
                {
                    message = "Property not found."
                });
            }

            var allowedBadges = new[]
            {
        "NEW",
        "FEATURED",
        "HOT PROPERTY",
        "PRICE DROP",
        "PREMIUM",
        "VERIFIED"
    };

            var badge = request.Badge?.Trim();

            if (!string.IsNullOrWhiteSpace(badge) &&
                !allowedBadges.Contains(
                    badge,
                    StringComparer.OrdinalIgnoreCase))
            {
                return BadRequest(new
                {
                    message = "Invalid property badge."
                });
            }

            property.Badge = string.IsNullOrWhiteSpace(badge)
                ? null
                : badge.ToUpperInvariant();

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Property badge updated successfully.",
                badge = property.Badge
            });
        }




    }
}
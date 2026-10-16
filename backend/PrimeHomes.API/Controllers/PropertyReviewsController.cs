
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
    public class PropertyReviewsController : ControllerBase
    {
        private readonly PrimeHomesDbContext _context;

        public PropertyReviewsController(PrimeHomesDbContext context)
        {
            _context = context;
        }

        // GET: api/PropertyReviews/property/1
        [HttpGet("property/{propertyId}")]
        public async Task<IActionResult> GetPropertyReviews(int propertyId)
        {
            var propertyExists = await _context.Properties
                .AnyAsync(p => p.PropertyId == propertyId);

            if (!propertyExists)
            {
                return NotFound(new
                {
                    message = "Property not found."
                });
            }

            var reviews = await _context.PropertyReviews
                .Where(r => r.PropertyId == propertyId)
                .OrderByDescending(r => r.CreatedDate)
                .Select(r => new
                {
                    r.ReviewId,
                    r.PropertyId,
                    r.UserId,
                    r.Rating,
                    r.Comment,
                    r.CreatedDate
                })
                .ToListAsync();

            var averageRating = reviews.Count > 0
                ? reviews.Average(r => r.Rating)
                : 0;

            return Ok(new
            {
                propertyId,
                totalReviews = reviews.Count,
                averageRating = Math.Round(averageRating, 1),
                reviews
            });
        }

        // POST: api/PropertyReviews
        [Authorize(Roles = "Buyer")]
        [HttpPost]
        public async Task<IActionResult> AddReview(
            [FromBody] PropertyReview request)
        {
            var userIdValue = User.FindFirst(
                ClaimTypes.NameIdentifier)?.Value;

            if (!int.TryParse(userIdValue, out var userId))
            {
                return Unauthorized(new
                {
                    message = "Unable to identify the logged-in user."
                });
            }

            if (request.PropertyId <= 0)
            {
                return BadRequest(new
                {
                    message = "A valid property ID is required."
                });
            }

            if (request.Rating < 1 || request.Rating > 5)
            {
                return BadRequest(new
                {
                    message = "Rating must be between 1 and 5."
                });
            }

            if (string.IsNullOrWhiteSpace(request.Comment))
            {
                return BadRequest(new
                {
                    message = "Please enter a review comment."
                });
            }

            if (request.Comment.Trim().Length > 1000)
            {
                return BadRequest(new
                {
                    message = "Review comments cannot exceed 1000 characters."
                });
            }

            var property = await _context.Properties
                .FirstOrDefaultAsync(p =>
                    p.PropertyId == request.PropertyId &&
                    p.Status == "Approved");

            if (property == null)
            {
                return NotFound(new
                {
                    message = "Approved property not found."
                });
            }

            var alreadyReviewed = await _context.PropertyReviews
                .AnyAsync(r =>
                    r.PropertyId == request.PropertyId &&
                    r.UserId == userId);

            if (alreadyReviewed)
            {
                return Conflict(new
                {
                    message = "You have already reviewed this property."
                });
            }

            var review = new PropertyReview
            {
                PropertyId = request.PropertyId,
                UserId = userId,
                Rating = request.Rating,
                Comment = request.Comment.Trim(),
                CreatedDate = DateTime.Now
            };

            _context.PropertyReviews.Add(review);

            await _context.SaveChangesAsync();

            return CreatedAtAction(
                nameof(GetPropertyReviews),
                new { propertyId = review.PropertyId },
                new
                {
                    message = "Review submitted successfully.",
                    review
                });
        }
    }
}

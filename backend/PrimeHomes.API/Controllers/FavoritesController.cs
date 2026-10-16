using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PrimeHomes.API.Data;
using PrimeHomes.API.Models;
using System.Security.Claims;

namespace PrimeHomes.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Buyer")]
    public class FavoritesController : ControllerBase
    {
        private readonly PrimeHomesDbContext _context;

        public FavoritesController(PrimeHomesDbContext context)
        {
            _context = context;
        }


        // ==========================================
        // Add Property to Favorites
        // ==========================================

        [HttpPost]
        public async Task<IActionResult> AddFavorite(
            [FromBody] AddFavoriteDto request)
        {
            var userIdClaim =
                User.FindFirst("UserId")?.Value
                ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                ?? User.FindFirst("sub")?.Value;

            if (string.IsNullOrEmpty(userIdClaim))
            {
                return Unauthorized(new
                {
                    message = "User ID not found in token."
                });
            }

            if (!int.TryParse(userIdClaim, out int buyerId))
            {
                return Unauthorized(new
                {
                    message = "Invalid User ID."
                });
            }


            // ==========================================
            // Check Property Exists
            // ==========================================

            var property = await _context.Properties
                .FirstOrDefaultAsync(p =>
                    p.PropertyId == request.PropertyId);

            if (property == null)
            {
                return NotFound(new
                {
                    message = "Property not found."
                });
            }


            // ==========================================
            // Check Already Favorited
            // ==========================================

            var existingFavorite = await _context.Favorites
                .FirstOrDefaultAsync(f =>
                    f.BuyerId == buyerId &&
                    f.PropertyId == request.PropertyId);

            if (existingFavorite != null)
            {
                return BadRequest(new
                {
                    message = "Property is already in your favorites."
                });
            }


            // ==========================================
            // Create Favorite
            // ==========================================

            var newFavorite = new Favorite
            {
                BuyerId = buyerId,
                PropertyId = request.PropertyId,
                CreatedDate = DateTime.UtcNow
            };

            _context.Favorites.Add(newFavorite);

            await _context.SaveChangesAsync();


            // ==========================================
            // Response
            // ==========================================

            return Ok(new
            {
                message = "Property added to favorites successfully.",
                favoriteId = newFavorite.FavoriteId
            });
        }


        // ==========================================
        // Get My Favorites
        // ==========================================

        [HttpGet]
        public async Task<IActionResult> GetMyFavorites()
        {
            var userIdClaim =
                User.FindFirst("UserId")?.Value
                ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                ?? User.FindFirst("sub")?.Value;

            if (string.IsNullOrEmpty(userIdClaim))
            {
                return Unauthorized(new
                {
                    message = "User ID not found in token."
                });
            }

            if (!int.TryParse(userIdClaim, out int buyerId))
            {
                return Unauthorized(new
                {
                    message = "Invalid User ID."
                });
            }


            // ==========================================
            // Get Favorites
            // ==========================================

            var favorites = await _context.Favorites
                .Where(f => f.BuyerId == buyerId)
                .Include(f => f.Property)
                .OrderByDescending(f => f.CreatedDate)
                .Select(f => new
                {
                    favoriteId = f.FavoriteId,

                    propertyId = f.PropertyId,

                    title = f.Property.Title,

                    description = f.Property.Description,

                    propertyType = f.Property.PropertyType,

                    bhk = f.Property.BHK,

                    price = f.Property.Price,

                    area = f.Property.Area,

                    location = f.Property.Location,

                    city = f.Property.City,

                    imageUrl = f.Property.ImageUrl,

                    status = f.Property.Status,

                    createdDate = f.CreatedDate
                })
                .ToListAsync();


            return Ok(favorites);
        }


        // ==========================================
        // Remove Favorite
        // ==========================================

        [HttpDelete("{propertyId}")]
        public async Task<IActionResult> RemoveFavorite(int propertyId)
        {
            var userIdClaim =
                User.FindFirst("UserId")?.Value
                ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                ?? User.FindFirst("sub")?.Value;

            if (string.IsNullOrEmpty(userIdClaim))
            {
                return Unauthorized(new
                {
                    message = "User ID not found in token."
                });
            }

            if (!int.TryParse(userIdClaim, out int buyerId))
            {
                return Unauthorized(new
                {
                    message = "Invalid User ID."
                });
            }


            // ==========================================
            // Find Favorite
            // ==========================================

            var favorite = await _context.Favorites
                .FirstOrDefaultAsync(f =>
                    f.BuyerId == buyerId &&
                    f.PropertyId == propertyId);

            if (favorite == null)
            {
                return NotFound(new
                {
                    message = "Favorite property not found."
                });
            }


            // ==========================================
            // Delete Favorite
            // ==========================================

            _context.Favorites.Remove(favorite);

            await _context.SaveChangesAsync();


            // ==========================================
            // Response
            // ==========================================

            return Ok(new
            {
                message = "Property removed from favorites successfully."
            });
        }
    }
}
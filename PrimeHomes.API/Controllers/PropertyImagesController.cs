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
    public class PropertyImagesController : ControllerBase
    {
        private readonly PrimeHomesDbContext _context;
        private readonly IWebHostEnvironment _environment;

        public PropertyImagesController(
            PrimeHomesDbContext context,
            IWebHostEnvironment environment)
        {
            _context = context;
            _environment = environment;
        }

        // ============================================
        // UPLOAD MULTIPLE IMAGES FOR A PROPERTY
        // ============================================

        [HttpPost("upload/{propertyId}")]
        [Authorize(Roles = "Owner")]
        public async Task<IActionResult> UploadImages(
            int propertyId,
            List<IFormFile> files)
        {
            // Check whether the property exists
            var property = await _context.Properties
                .FirstOrDefaultAsync(p => p.PropertyId == propertyId);

            if (property == null)
            {
                return NotFound("Property not found.");
            }

            var userIdClaim =
    User.FindFirst("UserId")?.Value
    ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value
    ?? User.FindFirst("sub")?.Value;

            if (string.IsNullOrEmpty(userIdClaim))
            {
                return Unauthorized("User ID not found in token.");
            }

            if (!int.TryParse(userIdClaim, out int userId))
            {
                return Unauthorized("Invalid User ID.");
            }
            // Check whether the logged-in owner owns this property
            if (property.OwnerId != userId)
            {
                return Forbid();
            }

            // Check whether files were selected
            if (files == null || files.Count == 0)
            {
                return BadRequest("Please select at least one image.");
            }

            // Upload folder:
            // wwwroot/uploads
            string uploadsFolder = Path.Combine(
                _environment.WebRootPath,
                "uploads"
            );

            // Create folder if it doesn't exist
            if (!Directory.Exists(uploadsFolder))
            {
                Directory.CreateDirectory(uploadsFolder);
            }

            var uploadedImages = new List<PropertyImage>();

            // Process each image
            foreach (var file in files)
            {
                // Skip empty files
                if (file == null || file.Length == 0)
                {
                    continue;
                }

                // Generate unique file name
                string fileName =
                    Guid.NewGuid().ToString() +
                    Path.GetExtension(file.FileName);

                // Complete file path
                string filePath = Path.Combine(
                    uploadsFolder,
                    fileName
                );

                // Save image to wwwroot/uploads
                using (var stream = new FileStream(
                    filePath,
                    FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }

                // Create image URL
                string imageUrl =
                    $"{Request.Scheme}://{Request.Host}/uploads/{fileName}";

                // Create PropertyImage record
                var propertyImage = new PropertyImage
                {
                    PropertyId = propertyId,
                    ImageUrl = imageUrl,
                    CreatedDate = DateTime.UtcNow
                };

                _context.PropertyImages.Add(propertyImage);

                uploadedImages.Add(propertyImage);
            }

            // Check whether any valid images were uploaded
            if (uploadedImages.Count == 0)
            {
                return BadRequest("No valid images were uploaded.");
            }

            // Save image records to database
            await _context.SaveChangesAsync();

            // Return response
            return Ok(new
            {
                message = "Images uploaded successfully.",

                images = uploadedImages.Select(x => new
                {
                    x.PropertyImageId,
                    x.PropertyId,
                    x.ImageUrl,
                    x.CreatedDate
                })
            });
        }


        // ============================================
        // GET ALL IMAGES FOR A PROPERTY
        // ============================================

        [HttpGet("{propertyId}")]
        public async Task<IActionResult> GetPropertyImages(
            int propertyId)
        {
            var images = await _context.PropertyImages
                .Where(x => x.PropertyId == propertyId)
                .OrderBy(x => x.CreatedDate)
                .ToListAsync();

            return Ok(images);
        }





        // ============================================
        // DELETE PROPERTY IMAGE
        // ============================================

        [HttpDelete("{imageId}")]
        [Authorize(Roles = "Owner")]
        public async Task<IActionResult> DeletePropertyImage(int imageId)
        {
            // Find image record
            var propertyImage = await _context.PropertyImages
                .FirstOrDefaultAsync(x => x.PropertyImageId == imageId);

            if (propertyImage == null)
            {
                return NotFound(new
                {
                    message = "Property image not found."
                });
            }

            // Find the property
            var property = await _context.Properties
                .FirstOrDefaultAsync(x => x.PropertyId == propertyImage.PropertyId);

            if (property == null)
            {
                return NotFound(new
                {
                    message = "Property not found."
                });
            }

            // Get logged-in user ID
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

            if (!int.TryParse(userIdClaim, out int userId))
            {
                return Unauthorized(new
                {
                    message = "Invalid User ID."
                });
            }

            // Check whether the logged-in owner owns the property
            if (property.OwnerId != userId)
            {
                return Forbid();
            }

            // Get physical file name from ImageUrl
            string fileName = Path.GetFileName(
                new Uri(propertyImage.ImageUrl).LocalPath
            );

            string filePath = Path.Combine(
                _environment.WebRootPath,
                "uploads",
                fileName
            );

            // Delete physical image file
            if (System.IO.File.Exists(filePath))
            {
                System.IO.File.Delete(filePath);
            }

            // Delete database record
            _context.PropertyImages.Remove(propertyImage);

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Property image deleted successfully."
            });
        }
    }
}
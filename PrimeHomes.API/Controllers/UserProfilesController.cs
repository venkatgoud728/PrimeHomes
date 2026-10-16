using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PrimeHomes.API.Data;
using PrimeHomes.API.Models;

namespace PrimeHomes.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class UserProfilesController : ControllerBase
    {
        private readonly PrimeHomesDbContext _context;
        private readonly IWebHostEnvironment _environment;

        public UserProfilesController(
            PrimeHomesDbContext context,
            IWebHostEnvironment environment)
        {
            _context = context;
            _environment = environment;
        }


        // ============================================
        // GET MY PROFILE
        // GET: api/UserProfiles/me
        // ============================================

        [HttpGet("me")]
        public async Task<IActionResult> GetMyProfile()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);

            if (userIdClaim == null)
            {
                return Unauthorized(new
                {
                    message = "User ID not found."
                });
            }

            var userId = int.Parse(userIdClaim.Value);

            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.UserId == userId);

            if (user == null)
            {
                return NotFound(new
                {
                    message = "User not found."
                });
            }

            var profile = await _context.UserProfiles
                .FirstOrDefaultAsync(p => p.UserId == userId);

            return Ok(new
            {
                user.UserId,
                user.Name,
                user.Email,
                user.Phone,
                user.Role,

                Profile = profile
            });
        }


        // ============================================
        // CREATE PROFILE
        // POST: api/UserProfiles
        // ============================================

        [HttpPost]
        public async Task<IActionResult> CreateProfile(
            UserProfile profile)
        {
            var userIdClaim = User.FindFirst(
                ClaimTypes.NameIdentifier);

            if (userIdClaim == null)
            {
                return Unauthorized(new
                {
                    message = "User ID not found."
                });
            }

            var userId = int.Parse(userIdClaim.Value);

            var existingProfile = await _context.UserProfiles
                .FirstOrDefaultAsync(p => p.UserId == userId);

            if (existingProfile != null)
            {
                return BadRequest(new
                {
                    message =
                        "Profile already exists. Please update your existing profile."
                });
            }

            profile.UserId = userId;
            profile.User = null;
            profile.UpdatedDate = DateTime.Now;

            _context.UserProfiles.Add(profile);

            await _context.SaveChangesAsync();

            return Ok(profile);
        }


        // ============================================
        // UPDATE PROFILE
        // PUT: api/UserProfiles
        // ============================================

        [HttpPut]
        public async Task<IActionResult> UpdateProfile(
            UserProfile profile)
        {
            var userIdClaim = User.FindFirst(
                ClaimTypes.NameIdentifier);

            if (userIdClaim == null)
            {
                return Unauthorized(new
                {
                    message = "User ID not found."
                });
            }

            var userId = int.Parse(userIdClaim.Value);

            var existingProfile = await _context.UserProfiles
                .FirstOrDefaultAsync(p => p.UserId == userId);

            // If profile does not exist, create it
            if (existingProfile == null)
            {
                profile.UserId = userId;
                profile.User = null;
                profile.UpdatedDate = DateTime.Now;

                _context.UserProfiles.Add(profile);

                await _context.SaveChangesAsync();

                return Ok(profile);
            }

            // Update existing profile
            existingProfile.ProfileImageUrl =
                profile.ProfileImageUrl;

            existingProfile.City =
                profile.City;

            existingProfile.State =
                profile.State;

            existingProfile.Bio =
                profile.Bio;

            existingProfile.CompanyName =
                profile.CompanyName;

            existingProfile.PreferredCity =
                profile.PreferredCity;

            existingProfile.PreferredPropertyType =
                profile.PreferredPropertyType;

            existingProfile.PreferredBHK =
                profile.PreferredBHK;

            existingProfile.MinBudget =
                profile.MinBudget;

            existingProfile.MaxBudget =
                profile.MaxBudget;

            existingProfile.UpdatedDate =
                DateTime.Now;

            await _context.SaveChangesAsync();

            return Ok(existingProfile);
        }


        // ============================================
        // UPLOAD PROFILE IMAGE
        // POST: api/UserProfiles/upload-image
        // ============================================

        [HttpPost("upload-image")]
        public async Task<IActionResult> UploadProfileImage(
            IFormFile file)
        {
            var userIdClaim = User.FindFirst(
                ClaimTypes.NameIdentifier);

            if (userIdClaim == null)
            {
                return Unauthorized(new
                {
                    message = "User ID not found."
                });
            }

            var userId = int.Parse(userIdClaim.Value);

            var profile = await _context.UserProfiles
                .FirstOrDefaultAsync(p => p.UserId == userId);

            if (profile == null)
            {
                return NotFound(new
                {
                    message =
                        "User profile not found. Please save your profile first."
                });
            }

            // Check file
            if (file == null || file.Length == 0)
            {
                return BadRequest(new
                {
                    message = "Please select an image."
                });
            }

            // Allowed image types
            var allowedExtensions = new[]
            {
                ".jpg",
                ".jpeg",
                ".png",
                ".webp"
            };

            var extension = Path
                .GetExtension(file.FileName)
                .ToLowerInvariant();

            if (!allowedExtensions.Contains(extension))
            {
                return BadRequest(new
                {
                    message =
                        "Only JPG, JPEG, PNG and WEBP images are allowed."
                });
            }

            // Maximum file size: 5 MB
            if (file.Length > 5 * 1024 * 1024)
            {
                return BadRequest(new
                {
                    message =
                        "Profile image must be smaller than 5 MB."
                });
            }

            // ============================================
            // UPLOAD FOLDER
            // ============================================

            string uploadsFolder = Path.Combine(
                _environment.WebRootPath,
                "uploads"
            );

            if (!Directory.Exists(uploadsFolder))
            {
                Directory.CreateDirectory(uploadsFolder);
            }

            // ============================================
            // GENERATE UNIQUE FILE NAME
            // ============================================

            string fileName =
                Guid.NewGuid().ToString() +
                extension;

            string filePath = Path.Combine(
                uploadsFolder,
                fileName
            );

            // ============================================
            // SAVE FILE
            // ============================================

            using (var stream = new FileStream(
                filePath,
                FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            // ============================================
            // CREATE IMAGE URL
            // ============================================

            string imageUrl =
                $"{Request.Scheme}://{Request.Host}/uploads/{fileName}";

            // ============================================
            // SAVE URL TO PROFILE
            // ============================================

            profile.ProfileImageUrl = imageUrl;
            profile.UpdatedDate = DateTime.Now;

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message =
                    "Profile image uploaded successfully.",

                imageUrl =
                    profile.ProfileImageUrl
            });
        }
    }
}
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
    public class ContactRequestsController : ControllerBase
    {
        private readonly PrimeHomesDbContext _context;

        public ContactRequestsController(PrimeHomesDbContext context)
        {
            _context = context;
        }


        // =========================================================
        // CREATE CONTACT / CALLBACK REQUEST
        // =========================================================

        [HttpPost]
        public async Task<IActionResult> CreateContactRequest(
            ContactRequest request)
        {
            try
            {
                // -------------------------------------------------
                // Get logged-in UserId if available
                // -------------------------------------------------

                var userIdClaim =
                    User.FindFirst(ClaimTypes.NameIdentifier);

                if (userIdClaim != null &&
                    int.TryParse(userIdClaim.Value, out int userId))
                {
                    request.UserId = userId;
                }


                // -------------------------------------------------
                // Default status
                // -------------------------------------------------

                request.Status = "New";

                request.CreatedDate = DateTime.Now;


                // -------------------------------------------------
                // Save request
                // -------------------------------------------------

                _context.ContactRequests.Add(request);

                await _context.SaveChangesAsync();


                return Ok(new
                {
                    message =
                        "Your callback request has been submitted successfully.",

                    contactRequestId =
                        request.ContactRequestId
                });
            }
            catch (Exception ex)
            {
                return StatusCode(
                    500,
                    new
                    {
                        message =
                            "An error occurred while submitting your request.",

                        error = ex.Message
                    });
            }
        }


        // =========================================================
        // GET ALL CONTACT REQUESTS
        // ADMIN USE
        // =========================================================

        [Authorize(Roles = "Admin")]
        [HttpGet]
        public async Task<IActionResult> GetContactRequests()
        {
            var requests = await _context.ContactRequests
                .OrderByDescending(x => x.CreatedDate)
                .ToListAsync();

            return Ok(requests);
        }


        // =========================================================
        // GET SINGLE CONTACT REQUEST
        // ADMIN USE
        // =========================================================

        [Authorize(Roles = "Admin")]
        [HttpGet("{id}")]
        public async Task<IActionResult> GetContactRequest(
            int id)
        {
            var request =
                await _context.ContactRequests
                    .FirstOrDefaultAsync(
                        x => x.ContactRequestId == id);

            if (request == null)
            {
                return NotFound(new
                {
                    message = "Contact request not found."
                });
            }

            return Ok(request);
        }


        // =========================================================
        // UPDATE REQUEST STATUS
        // ADMIN USE
        // =========================================================

        [Authorize(Roles = "Admin")]
        [HttpPut("{id}/status")]
        public async Task<IActionResult> UpdateStatus(
            int id,
            [FromBody] string status)
        {
            var request =
                await _context.ContactRequests
                    .FirstOrDefaultAsync(
                        x => x.ContactRequestId == id);

            if (request == null)
            {
                return NotFound(new
                {
                    message = "Contact request not found."
                });
            }


            // -------------------------------------------------
            // Allowed statuses
            // -------------------------------------------------

            var allowedStatuses = new[]
            {
                "New",
                "Contacted",
                "Closed"
            };


            if (!allowedStatuses.Contains(
                status,
                StringComparer.OrdinalIgnoreCase))
            {
                return BadRequest(new
                {
                    message =
                        "Invalid status. Use New, Contacted or Closed."
                });
            }


            request.Status = status;

            await _context.SaveChangesAsync();


            return Ok(new
            {
                message =
                    "Contact request status updated successfully."
            });
        }
    }
}
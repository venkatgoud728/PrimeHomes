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
    public class InquiriesController : ControllerBase
    {
        private readonly PrimeHomesDbContext _context;

        public InquiriesController(PrimeHomesDbContext context)
        {
            _context = context;
        }

        // POST: api/Inquiries
        [Authorize(Roles = "Buyer")]
        [HttpPost]
        public async Task<IActionResult> AddInquiry(Inquiry inquiry)
        {
            var buyerId = int.Parse(
                User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

            inquiry.BuyerId = buyerId;
            inquiry.Status = "New";
            inquiry.CreatedDate = DateTime.Now;

            var property = await _context.Properties
                .FirstOrDefaultAsync(p => p.PropertyId == inquiry.PropertyId);

            if (property == null)
            {
                return NotFound("Property not found");
            }

            inquiry.OwnerId = property.OwnerId;

            _context.Inquiries.Add(inquiry);

            await _context.SaveChangesAsync();

            return Ok(inquiry);
        }

        [HttpGet("my-inquiries")]
        [Authorize(Roles = "Buyer")]
        public async Task<IActionResult> GetMyInquiries()
        {
            var buyerId = int.Parse(
                User.FindFirstValue(ClaimTypes.NameIdentifier)!
            );

            var inquiries = await _context.Inquiries
                .Where(i => i.BuyerId == buyerId)
                .Include(i => i.Property)
                .Select(i => new InquiryResponseDto
                {
                    InquiryId = i.InquiryId,
                    PropertyId = i.PropertyId,
                    PropertyTitle = i.Property.Title,
                    BuyerId = i.BuyerId,
                    OwnerId = i.OwnerId,
                    Message = i.Message,
                    Status = i.Status,
                    CreatedDate = i.CreatedDate
                })
                .ToListAsync();

            return Ok(inquiries);
        }

        // GET: api/Inquiries
        [Authorize(Roles = "Owner")]
        [HttpGet]
        public async Task<IActionResult> GetInquiries()
        {
            var ownerId = int.Parse(
                User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

            var inquiries = await _context.Inquiries
                .Where(i => i.OwnerId == ownerId)
                .Include(i => i.Property)
                .Select(i => new InquiryResponseDto
                {
                    InquiryId = i.InquiryId,
                    PropertyId = i.PropertyId,
                    PropertyTitle = i.Property.Title,
                    BuyerId = i.BuyerId,
                    OwnerId = i.OwnerId,
                    Message = i.Message,
                    Status = i.Status,
                    CreatedDate = i.CreatedDate
                })
                .ToListAsync();

            return Ok(inquiries);
        }
        // PUT: api/Inquiries/1
        [Authorize(Roles = "Owner")]
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateInquiryStatus(
            int id,
            [FromBody] UpdateInquiryStatusDto dto)
        {
            var existingInquiry = await _context.Inquiries
                .FirstOrDefaultAsync(i => i.InquiryId == id);

            if (existingInquiry == null)
            {
                return NotFound("Inquiry not found");
            }

            var ownerId = int.Parse(
                User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

            if (existingInquiry.OwnerId != ownerId)
            {
                return Forbid();
            }

            if (string.IsNullOrWhiteSpace(dto.Status))
            {
                return BadRequest("Status is required.");
            }

            existingInquiry.Status = dto.Status;

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Inquiry status updated successfully.",
                inquiryId = existingInquiry.InquiryId,
                status = existingInquiry.Status
            });
        }


    }
}
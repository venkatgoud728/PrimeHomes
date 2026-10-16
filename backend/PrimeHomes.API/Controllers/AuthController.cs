
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.IdentityModel.Tokens;

using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PrimeHomes.API.Data;
using PrimeHomes.API.Models;

namespace PrimeHomes.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly PrimeHomesDbContext _context;
        private readonly SymmetricSecurityKey _jwtSigningKey;

        public AuthController(
            PrimeHomesDbContext context,
            SymmetricSecurityKey jwtSigningKey)
        {
            _context = context;
            _jwtSigningKey = jwtSigningKey;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register(User user)
        {
            var existingUser = await _context.Users
                .FirstOrDefaultAsync(u => u.Email == user.Email);

            if (existingUser != null)
            {
                return BadRequest("Email already registered");
            }

            _context.Users.Add(user);

            await _context.SaveChangesAsync();

            return Ok(user);
        }
        [HttpPost("login")]
        public async Task<IActionResult> Login(User user)
        {
            var existingUser = await _context.Users
                .FirstOrDefaultAsync(u =>
                    u.Email == user.Email &&
                    u.Password == user.Password);

            if (existingUser == null)
            {
                return Unauthorized("Invalid email or password");
            }

            var claims = new[]
            {
        new Claim(ClaimTypes.NameIdentifier, existingUser.UserId.ToString()),
        new Claim(ClaimTypes.Name, existingUser.Name),
        new Claim(ClaimTypes.Email, existingUser.Email),
        new Claim(ClaimTypes.Role, existingUser.Role)
    };

            var credentials = new SigningCredentials(
                _jwtSigningKey,
                SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                claims: claims,
                expires: DateTime.UtcNow.AddHours(2),
                signingCredentials: credentials);

            var jwtToken = new JwtSecurityTokenHandler()
                .WriteToken(token);

            return Ok(new
            {
                existingUser.UserId,
                existingUser.Name,
                existingUser.Email,
                existingUser.Phone,
                existingUser.Role,
                Token = jwtToken
            });
        }
    }
}
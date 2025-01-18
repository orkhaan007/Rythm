using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using Rythm.IdentityService.DTOS;
using Rythm.IdentityService.Services;
using Rythm.Infrastructure.Entities.Entities;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace Rythm.IdentityService.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly RoleManager<IdentityRole> _roleManager;
        private readonly IConfiguration _configuration;
        private readonly IdentityCloudService _cloudService;

        public AuthController(UserManager<ApplicationUser> userManager,
            RoleManager<IdentityRole> roleManager,
            IConfiguration configuration,
            IdentityCloudService cloudService)
        {
            _userManager = userManager;
            _roleManager = roleManager;
            _configuration = configuration;
            _cloudService = cloudService;
        }

        [HttpPost("signup")]
        public async Task<IActionResult> SignUp([FromForm] SignUpDTO dto)
        {
            string profileImageUrl = null;

            if (dto.ProfilePhoto != null)
            {
                try
                {
                    profileImageUrl = await _cloudService.UploadImageAsync(dto.ProfilePhoto, "profile_photos");
                }
                catch (Exception ex)
                {
                    return BadRequest(new { Status = "Error", Message = "Image upload failed.", Details = ex.Message });
                }
            }

            var newUser = new ApplicationUser
            {
                UserName = dto.UserName,
                Email = dto.Email,
                ProfilePhotoPath = profileImageUrl
            };

            var result = await _userManager.CreateAsync(newUser, dto.Password);
            if (result.Succeeded)
            {
                if (!await _roleManager.RoleExistsAsync("User"))
                    await _roleManager.CreateAsync(new IdentityRole("User"));

                await _userManager.AddToRoleAsync(newUser, "User");
                return Ok(new { Status = "Success", Message = "User created Successfully" });
            }
            return BadRequest(new { Status = "Error", Message = "User creation failed!", Errors = result.Errors });
        }

        [HttpPost("signin")]
        public async Task<IActionResult> SignIn([FromBody] SignInDTO dto)
        {
            var normalizedUserName = dto.UserName.ToUpperInvariant();
            var user = await _userManager.FindByNameAsync(normalizedUserName);

            if (user != null && await _userManager.CheckPasswordAsync(user, dto.Password))
            {
                var userRoles = await _userManager.GetRolesAsync(user);

                var authClaims = new List<Claim>
                {
                    new Claim(ClaimTypes.Name, user.UserName),
                    new Claim(ClaimTypes.Email, user.Email),
                    new Claim(ClaimTypes.NameIdentifier, user.Id),
                    new Claim("profile-photo",user.ProfilePhotoPath),
                    new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                };

                foreach (var role in userRoles)
                {
                    authClaims.Add(new Claim(ClaimTypes.Role, role));
                }

                var token = GetToken(authClaims);

                return Ok(new { Token = new JwtSecurityTokenHandler().WriteToken(token), Expiration = token.ValidTo });
            }
            return Unauthorized(new { Status = "Error", Message = "Invalid username or password" });
        }

        private JwtSecurityToken GetToken(List<Claim> authClaims)
        {
            var authSigninKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]));

            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"],
                audience: _configuration["Jwt:Issuer"],
                expires: DateTime.Now.AddHours(3),
                claims: authClaims,
                signingCredentials: new SigningCredentials(authSigninKey, SecurityAlgorithms.HmacSha256)
                );

            return token;
        }

        [HttpPut("changeUsername")]
        public async Task<IActionResult> ChangeUsername([FromBody] ChangeUsernameDTO dto)
        {
            var user = await _userManager.FindByIdAsync(dto.UserId);
            if (user == null)
            {
                return NotFound(new { Status = "Error", Message = "User not found" });
            }

            var existingUser = await _userManager.FindByNameAsync(dto.NewUsername);
            if (existingUser != null)
            {
                return BadRequest(new { Status = "Error", Message = "Username already taken" });
            }

            user.UserName = dto.NewUsername;
            var result = await _userManager.UpdateAsync(user);

            if (result.Succeeded)
            {
                return Ok(new { Status = "Success", Message = "Username updated successfully" });
            }

            return BadRequest(new { Status = "Error", Message = "Failed to update username", Errors = result.Errors });
        }

        [HttpPut("changeEmail")]
        public async Task<IActionResult> ChangeEmail([FromBody] ChangeEmailDTO dto)
        {
            var user = await _userManager.FindByIdAsync(dto.UserId);
            if (user == null)
            {
                return NotFound(new { Status = "Error", Message = "User not found" });
            }

            var existingUser = await _userManager.FindByEmailAsync(dto.NewEmail);
            if (existingUser != null)
            {
                return BadRequest(new { Status = "Error", Message = "Email already in use" });
            }

            user.Email = dto.NewEmail;
            var result = await _userManager.UpdateAsync(user);

            if (result.Succeeded)
            {
                return Ok(new { Status = "Success", Message = "Email updated successfully" });
            }

            return BadRequest(new { Status = "Error", Message = "Failed to update email", Errors = result.Errors });
        }

        [HttpGet("getUserById/{id}")]
        public async Task<IActionResult> GetUserById(string id)
        {
            var user = await _userManager.FindByIdAsync(id);
            if (user == null)
            {
                return NotFound(new { Status = "Error", Message = "User not found" });
            }
            return Ok(new { user.Id, user.UserName });
        }

        [HttpGet("getUserProfilePhoto/{id}")]
        public async Task<IActionResult> GetUserProfilePhoto(string id)
        {
            var user = await _userManager.FindByIdAsync(id);
            if (user == null)
            {
                return NotFound(new { Status = "Error", Message = "User not found" });
            }

            if (string.IsNullOrEmpty(user.ProfilePhotoPath))
            {
                return NotFound(new { Status = "Error", Message = "User does not have a profile photo" });
            }

            return Ok(new { user.Id, ProfilePhotoUrl = user.ProfilePhotoPath });
        }

        [HttpDelete("deleteAccount/{userId}")]
        public async Task<IActionResult> DeleteAccount(string userId)
        {
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
            {
                return NotFound(new { Status = "Error", Message = "User not found" });
            }

            var result = await _userManager.DeleteAsync(user);
            if (result.Succeeded)
            {
                return Ok(new { Status = "Success", Message = "Account deleted successfully" });
            }

            return BadRequest(new { Status = "Error", Message = "Failed to delete account", Errors = result.Errors });
        }

    }
}
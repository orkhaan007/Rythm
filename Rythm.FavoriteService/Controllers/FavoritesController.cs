using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Rythm.FavoriteService.Services;

namespace Rythm.FavoriteService.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class FavoritesController : ControllerBase
    {
        private readonly MyFavoritesService _favoritesService;

        public FavoritesController(MyFavoritesService favoritesService)
        {
            _favoritesService = favoritesService;
        }

        [HttpGet("{userId}")]
        public async Task<IActionResult> GetFavorites(string userId)
        {
            var favorites = await _favoritesService.GetFavoritesAsync(userId);
            if (favorites == null)
            {
                return NotFound("No favorites found for this user.");
            }
            return Ok(favorites);
        }

        [HttpPost("{userId}")]
        public async Task<IActionResult> AddToFavorites(string userId, [FromBody] string musicId)
        {
            await _favoritesService.AddToFavoritesAsync(userId, musicId);
            return Ok("Music added to favorites.");
        }

        [HttpDelete("{userId}")]
        public async Task<IActionResult> RemoveFromFavorites(string userId, [FromBody] string musicId)
        {
            await _favoritesService.RemoveFromFavoritesAsync(userId, musicId);
            return Ok("Music removed from favorites.");
        }
    }
}

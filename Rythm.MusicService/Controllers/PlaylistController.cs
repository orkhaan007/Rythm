using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Rythm.Infrastructure.Entities.Data;
using Rythm.MusicService.DTOS;
using Rythm.MusicService.Services;

namespace Rythm.MusicService.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PlaylistController : ControllerBase
    {
        private readonly PlaylistService _playlistService;
        private readonly MusicDataBaseContext _dbContext;

        public PlaylistController(PlaylistService playlistService, MusicDataBaseContext dbContext)
        {
            _playlistService = playlistService;
            _dbContext = dbContext;
        }

        [HttpPost("create")]
        public async Task<IActionResult> CreatePlaylist([FromForm] PlaylistDTO dto)
        {
            try
            {
                await _playlistService.CreatePlaylistAsync(dto.Name, dto.FilePath, dto.UserId);
                return Ok(new
                {
                    Message = "Playlist created successfully",

                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { Message = $"Error: {ex.Message}" });
            }
        }
        [Authorize]
        [AllowAnonymous]
        [HttpGet("user/{userId}")]
        public async Task<IActionResult> GetPlaylistsByUser(string userId)
        {
            var playlists = await _dbContext.Playlists
                .Where(p => p.UserId == userId) 
                .Include(p => p.Songs)
                .ToListAsync();

            if (playlists == null || !playlists.Any())
                return NotFound(new { Message = "No playlists found for this user" });

            return Ok(playlists);
        }

        [HttpPost("{playlistId}/add-song/{musicId}")]
        public async Task<IActionResult> AddSongToPlaylist(string playlistId, string musicId)
        {
            try
            {
                var playlist = await _dbContext.Playlists
                    .Include(p => p.Songs)
                    .FirstOrDefaultAsync(p => p.Id == playlistId);

                if (playlist == null)
                    return NotFound("Playlist not found");

                var music = await _dbContext.Songs
                    .FirstOrDefaultAsync(m => m.Id == musicId);

                if (music == null)
                    return NotFound("Music not found");

                playlist.Songs.Add(music);
                await _dbContext.SaveChangesAsync();

                return Ok(new { Message = "Song added to playlist successfully" });
            }
            catch (Exception ex)
            {
                return BadRequest($"Error adding song to playlist: {ex.Message}");
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetPlaylistsMusics(string id)
        {
            var playlist = await _dbContext.Playlists
                .Include(p => p.Songs)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (playlist == null)
                return NotFound("Playlist not found");

            var musics = playlist.Songs.Select(m => new SongDTO
            {
                Id = m.Id,
                Title = m.Title,
                FilePath = m.FilePath,
                UploadedAt = m.UploadedAt,
                UploadedBy = m.UploadedBy,  
                MusicPath = m.MusicPath
            }).ToList();

            return Ok(musics);
        }

        [HttpDelete("del/{id}")]
        public async Task<IActionResult> DeletePlaylist(string id)
        {
            var playlist = await _dbContext.Playlists.FindAsync(id);
            if (playlist == null)
                return NotFound(new { Message = "Playlist not found" });

            _dbContext.Playlists.Remove(playlist);
            await _dbContext.SaveChangesAsync();

            return Ok(new { Message = "Playlist deleted successfully" });
        }
    }
}

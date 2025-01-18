using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Rythm.MusicService.Services;

namespace Rythm.MusicService.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class MusicController : ControllerBase
    {
        private readonly MusicOperation _musicOperation;

        public MusicController(MusicOperation musicOperation)
        {
            _musicOperation = musicOperation;
        }

        [HttpGet("all")]
        public async Task<IActionResult> GetAllMusics()
        {
            var musics = await _musicOperation.GetAll();
            return Ok(musics);
        }

        [HttpGet("uploaded-by/{userId}")]
        public async Task<IActionResult> GetUserUploadedMusics(string userId)
        {
            var musics = await _musicOperation.GetUserUploadedMusicsAsync(userId);
            return Ok(musics);
        }
        [HttpDelete("delete-music/{musicId}")]
        public async Task<IActionResult> DeleteMusicAsync(string musicId)
        {
            _musicOperation.DeleteMusicAsync(musicId);
            return Ok("Deleted successfuly");
        }

        [HttpGet("{musicId}")]
        public async Task<IActionResult> GetMusic(string musicId)
        {
            var music = await _musicOperation.FindMusicAsync(musicId);
            return Ok(music);
        }

        [HttpPost("upload")]
        public async Task<IActionResult> UploadMusic(
            [FromForm] string userId,
            [FromForm] string title,
            [FromForm] string album,
            [FromForm] IFormFile musicFile,
            [FromForm] IFormFile coverImage)
        {
            try
            {
                var musicFileUrl = await _musicOperation.UploadFileToCloudinaryAsync(musicFile, "music_files");
                var coverImageUrl = await _musicOperation.UploadFileToCloudinaryAsync(coverImage, "music_covers");

                var music = await _musicOperation.UploadMusicAsync(userId, title, album, musicFileUrl, coverImageUrl);

                return Ok(new
                {
                    Message = "Files successfuly uploaded clodinary.",
                    Title = title,
                    Album = album,
                    MusicFileUrl = musicFileUrl,
                    CoverImageUrl = coverImageUrl,
                    Music = music
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error while uploading files: {ex.Message}");
            }
        }
    }
}
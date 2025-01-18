using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using Microsoft.EntityFrameworkCore;
using Rythm.Infrastructure.Entities.Data;
using Rythm.Infrastructure.Entities.Entities;
using Rythm.Services.CloudService;

namespace Rythm.MusicService.Services
{
    public class MusicOperation
    {
        private readonly CloudService _cloudService;
        private readonly MusicDataBaseContext _context;

        public MusicOperation(MusicDataBaseContext context, CloudService cloudService)
        {
            _context = context;
            _cloudService = cloudService;
        }

        public async Task<List<Song>> GetAll()
        {
            return await _context.Songs.ToListAsync();
        }

        public async Task<Song> FindMusicAsync(string musicId)
        {
            return await _context.Songs.FindAsync(musicId);
        }

        public async Task DeleteMusicAsync(string musicId)
        {
            var obj = _context.Songs.FirstOrDefault(x => x.Id == musicId);
            _context.Songs.Remove(obj);
        }

        public async Task<string> UploadFileToCloudinaryAsync(IFormFile file, string folder)
        {
            if (file.ContentType.Contains("image"))
                return await _cloudService.UploadImageAsync(file, folder);
            else
                return await _cloudService.UploadFileAsync(file, folder);
        }

        public async Task<Song> UploadMusicAsync(string userId, string title, string Album, string musicFileUrl, string coverImageUrl)
        {
            var music = new Song
            {
                Title = title,
                Album = Album,
                FilePath = coverImageUrl,
                MusicPath = musicFileUrl,
                UploadedBy = userId,
            };

            _context.Songs.Add(music);
            await _context.SaveChangesAsync();
            return music;
        }

        public async Task<List<Song>> GetUserUploadedMusicsAsync(string userID)
        {
            return await _context.Songs
                .Where(m => m.UploadedBy == userID)
                .ToListAsync();
        }
    }
}

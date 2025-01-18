using Microsoft.EntityFrameworkCore;
using Rythm.Infrastructure.Entities.Data;
using Rythm.Infrastructure.Entities.Entities;
using Rythm.Services.CloudService;

namespace Rythm.MusicService.Services
{
    public class PlaylistService
    {
        private readonly MusicDataBaseContext _dbContext;
        private readonly CloudService _cloudinaryService;

        public PlaylistService(MusicDataBaseContext dbContext, CloudService cloudinaryService)
        {
            _dbContext = dbContext;
            _cloudinaryService = cloudinaryService;
        }

        public async Task<Playlist> CreatePlaylistAsync(string name, IFormFile coverImage, string userId)
        {
            var coverUrl = await _cloudinaryService.UploadImageAsync(coverImage, "playlist-covers");

            var playlist = new Playlist
            {
                Name = name,
                FilePath = coverUrl,
                UserId = userId
            };

            _dbContext.Playlists.Add(playlist);
            await _dbContext.SaveChangesAsync();

            return playlist;
        }
        public async Task AddSongToPlaylist(string playlistId, string musicId)
        {
            var playlist = await _dbContext.Playlists
                .Include(p => p.Songs)
                .FirstOrDefaultAsync(x => x.Id == playlistId);

            var music = await _dbContext.Songs
                .FirstOrDefaultAsync(x => x.Id == musicId);

            if (playlist != null && music != null)
            {
                if (playlist.Songs == null) 
                {
                    playlist.Songs = new List<Song>();
                }

                playlist.Songs.Add(music);
                await _dbContext.SaveChangesAsync();
            }
            else
            {
                throw new Exception(playlist == null ? "Playlist not found" : "Music not found");
            }
        }

        public async Task<List<Song>> GetMusicsInPlaylist(string playlistId)
        {
            var musics = _dbContext.Playlists.FirstOrDefault(x => x.Id == playlistId).Songs.ToList();
            return musics;
        }

        public async Task<List<Playlist>> GetPlaylistsByUserAsync(string userId)
        {
            return await _dbContext.Playlists
                .Where(p => p.UserId == userId)
                .ToListAsync();
        }

        public async Task<bool> DeletePlaylistAsync(int id)
        {
            var playlist = await _dbContext.Playlists.FindAsync(id);
            if (playlist == null)
                return false;

            _dbContext.Playlists.Remove(playlist);
            await _dbContext.SaveChangesAsync();
            return true;
        }
    }
}

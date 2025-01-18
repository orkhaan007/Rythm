using System.ComponentModel.DataAnnotations;

namespace Rythm.MusicService.DTOS
{
    public class SongDTO
    {
        public string Id { get; set; }
        public string Title { get; set; }
        public string MusicPath { get; set; }
        public string FilePath { get; set; }
        public string UploadedBy { get; set; }
        public DateTime UploadedAt { get; set; } = DateTime.UtcNow;
    }
}

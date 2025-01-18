namespace Rythm.MusicService.DTOS
{
    public class PlaylistDTO
    {
        public string Name { get; set; }
        public IFormFile FilePath { get; set; }
        public string UserId { get; set; }
    }
}

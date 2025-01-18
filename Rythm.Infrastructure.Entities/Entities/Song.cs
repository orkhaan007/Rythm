using Rythm.Infrastructure.Core.Repository.Abstraction;

namespace Rythm.Infrastructure.Entities.Entities;

public class Song : IEntity
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string Title { get; set; }
    public string? Album { get; set; }
    public string MusicPath { get; set; }
    public string FilePath { get; set; }
    public string? UploadedBy { get; set; }
    public DateTime UploadedAt { get; set; } = DateTime.UtcNow;
    public virtual ICollection<Playlist> Playlists { get; set; }
}

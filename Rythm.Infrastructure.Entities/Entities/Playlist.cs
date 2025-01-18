using Rythm.Infrastructure.Core.Repository.Abstraction;

namespace Rythm.Infrastructure.Entities.Entities;

public class Playlist : IEntity
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string UserId { get; set; }
    public string Name { get; set; }
    public string FilePath { get; set; }
    public ICollection<Song> Songs { get; set; } = new List<Song>();
}

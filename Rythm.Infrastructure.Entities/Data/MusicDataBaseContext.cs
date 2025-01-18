using Microsoft.EntityFrameworkCore;
using Rythm.Infrastructure.Entities.Entities;

namespace Rythm.Infrastructure.Entities.Data;

public class MusicDataBaseContext : DbContext
{
    public MusicDataBaseContext(DbContextOptions<MusicDataBaseContext> options) : base(options) { }

    public virtual DbSet<Song> Songs { get; set; } = null!;
    public virtual DbSet<Playlist> Playlists { get; set; } = null!;
}

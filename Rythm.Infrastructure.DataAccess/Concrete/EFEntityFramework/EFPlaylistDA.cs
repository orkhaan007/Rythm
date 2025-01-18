using Rythm.Infrastructure.Core.Repository.DataAccess.EntityFramework;
using Rythm.Infrastructure.DataAccess.Abstraction;
using Rythm.Infrastructure.Entities.Data;
using Rythm.Infrastructure.Entities.Entities;

namespace Rythm.Infrastructure.DataAccess.Concrete.EFEntityFramework;

public class EFPlaylistDA : EFEntityRepositoryBase<Playlist, MusicDataBaseContext>, IPlaylistDA
{
    public EFPlaylistDA(MusicDataBaseContext context) : base(context) { }
}

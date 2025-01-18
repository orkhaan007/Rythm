using Rythm.Infrastructure.Core.Repository.DataAccess.EntityFramework;
using Rythm.Infrastructure.DataAccess.Abstraction;
using Rythm.Infrastructure.Entities.Data;
using Rythm.Infrastructure.Entities.Entities;

namespace Rythm.Infrastructure.DataAccess.Concrete.EFEntityFramework;

public class EFSongDA : EFEntityRepositoryBase<Song, MusicDataBaseContext>, ISongDA
{
    public EFSongDA(MusicDataBaseContext context) : base(context) { }
}

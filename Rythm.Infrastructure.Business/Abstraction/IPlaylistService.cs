using Rythm.Infrastructure.Entities.Entities;
using System.Linq.Expressions;

namespace Rythm.Infrastructure.Business.Abstraction;

public interface IPlaylistService 
{
    Task<Playlist> GetByIdAsync(string id);
    Task<List<Playlist>> GetAllAsync(Expression<Func<Playlist, bool>> filter = null);
    Task AddAsync(Playlist playlist);
    Task DeleteAsync(Playlist playlist);
    Task UpdateAsync(Playlist playlist);
}

using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Rythm.Infrastructure.Core.Repository.Abstraction;
using System.Linq.Expressions;

namespace Rythm.Infrastructure.Core.Repository.DataAccess.EntityFramework;

public class EFEntityRepositoryBase<TEntity, TContext>
    : IEntityRepository<TEntity>
    where TEntity : class, IEntity, new()
    where TContext : DbContext
{
    private readonly TContext _context;

    public EFEntityRepositoryBase(TContext context)
    {
        _context = context;
    }

    public async Task Add(TEntity entity)
    {
        var addedEntity = _context.Entry(entity);
        addedEntity.State = EntityState.Added;
        await _context.SaveChangesAsync();
    }

    public async Task Delete(TEntity entity)
    {
        var deletedEntity = _context.Entry(entity);
        deletedEntity.State = EntityState.Deleted;
        await _context.SaveChangesAsync();
    }

    public async Task<TEntity> Get(Expression<Func<TEntity, bool>> filter)
    {
        return await _context.Set<TEntity>().SingleOrDefaultAsync(filter);
    }

    public async Task<List<TEntity>> GetList(Expression<Func<TEntity, bool>> filter = null)
    {
        return filter == null ?
               await _context.Set<TEntity>().ToListAsync() :
               await _context.Set<TEntity>().Where(filter).ToListAsync();
    }

    public async Task Update(TEntity entity)
    {
        var updatedEntity = _context.Entry(entity);
        updatedEntity.State = EntityState.Modified;
        await _context.SaveChangesAsync();
    }

    protected DbSet<TEntity> GetDbSet()
    {
        return _context.Set<TEntity>();
    }
}

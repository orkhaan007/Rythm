using StackExchange.Redis;

namespace Rythm.FavoriteService.Services
{
    public class MyFavoritesService
    {
        private readonly IDatabase _redisDatabase;

        public MyFavoritesService(IConnectionMultiplexer redisConnection)
        {
            _redisDatabase = redisConnection.GetDatabase();
        }

        public async Task<List<string>> GetFavoritesAsync(string userId)
        {
            var favorites = await _redisDatabase.ListRangeAsync($"favorites:{userId}");
            return favorites.Select(fav => fav.ToString()).ToList();
        }

        public async Task AddToFavoritesAsync(string userId, string musicId)
        {
            await _redisDatabase.ListRightPushAsync($"favorites:{userId}", musicId);
        }

        public async Task RemoveFromFavoritesAsync(string userId, string musicId)
        {
            await _redisDatabase.ListRemoveAsync($"favorites:{userId}", musicId);
        }
    }
}

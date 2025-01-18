using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Rythm.Infrastructure.Entities.Entities;

namespace Rythm.Infrastructure.Entities.Data;

public class IdentityDataBaseContext : IdentityDbContext<ApplicationUser>
{
    public IdentityDataBaseContext(DbContextOptions<IdentityDataBaseContext> options) : base(options) { }

}
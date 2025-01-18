using Microsoft.AspNetCore.Identity;
using Rythm.Infrastructure.Core.Repository.Abstraction;

namespace Rythm.Infrastructure.Entities.Entities;

public class ApplicationUser : IdentityUser, IEntity
{
    public string? ProfilePhotoPath { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
}
using Microsoft.EntityFrameworkCore;
using Rythm.Infrastructure.Entities.Data;
using Rythm.MusicService.Services;
using Rythm.Services.CloudService;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers().AddNewtonsoftJson(options =>
{
    options.SerializerSettings.ReferenceLoopHandling = Newtonsoft.Json.ReferenceLoopHandling.Ignore;
});
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddDbContext<MusicDataBaseContext>(opt =>
{
    opt.UseSqlServer(builder.Configuration.GetConnectionString("MusicDbConnectionProduction"));
});

builder.Services.AddScoped<MusicOperation>();
builder.Services.AddScoped<PlaylistService>();

builder.Services.AddSingleton<CloudService>(sp =>
{
    var configuration = sp.GetRequiredService<IConfiguration>();
    return new CloudService(
        configuration["Cloudinary:CloudName"],
        configuration["Cloudinary:ApiKey"],
        configuration["Cloudinary:ApiSecret"]
    );
});

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});


var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseCors("AllowAll");
app.UseAuthorization();

app.MapControllers();

app.Run();
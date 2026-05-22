using TicTacToe.API.Hubs;
using TicTacToe.API.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddSignalR();
builder.Services.AddSingleton<GameService>();

var allowedOrigins = builder.Configuration["AllowedOrigins"]?
    .Split(';', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
    ?? ["http://localhost:4200"];

builder.Services.AddCors(options =>
{
    options.AddPolicy("CorsPolicy", policy =>
    {
        policy.WithOrigins("https://brave-beach-0543e7010.7.azurestaticapps.net/", "http://localhost:4200")
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});

var app = builder.Build();

app.UseCors("CorsPolicy");
app.MapControllers();
app.MapHub<GameHub>("/gamehub");

app.Run();

using Microsoft.AspNetCore.Mvc;

namespace TicTacToe.API.Controllers;

[ApiController]
public class HealthController : ControllerBase
{
    [HttpGet("/")]
    public ActionResult<string> Index()
    {
        return "Tic Tac Toe Web API is running.";
    }

    [HttpGet("health")]
    public IActionResult Health()
    {
        return Ok(new { status = "Healthy" });
    }
}

using System.Text.Json;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SmartInvoiceAnalyzerApi.Data;
using SmartInvoiceAnalyzerApi.Models;
using System.Text.RegularExpressions;
using Microsoft.AspNetCore.Authorization;

namespace SmartInvoiceAnalyzerApi.Controllers
{
  [ApiController]
  [Route("api/invoices")]
  public class InvoicesController : ControllerBase
  {
    private readonly InvoiceDbContext _context;
    private readonly AIService _aiService;

    public InvoicesController(InvoiceDbContext context, AIService aiService)
    {
      _context = context;
      _aiService = aiService;
    }

    [HttpGet]
    [Authorize]
    public async Task<IActionResult> GetInvoices()
    {
      var invoices = await _context.Invoices.ToListAsync();
      return Ok(invoices);
    }

    [HttpGet("{id}")]
    [Authorize]
    public async Task<IActionResult> GetInvoice(int id)
    {
      var invoice = await _context.Invoices.FindAsync(id);
      if (invoice == null)
        return NotFound();

      return Ok(invoice);
    }

    [HttpPost]
    public async Task<IActionResult> CreateInvoice([FromBody] Invoice invoice)
    {
      var aiResultJson = await _aiService.ClassifyInvoice(
          invoice.Vendor,
          invoice.Amount,
          invoice.TaxId,
          invoice.DueDate,
          invoice.Date,
          invoice.Status
      );

      Console.WriteLine(aiResultJson);
      using var doc = JsonDocument.Parse(aiResultJson);
      var root = doc.RootElement;

      if (!root.TryGetProperty("candidates", out JsonElement candidatesElem) || candidatesElem.GetArrayLength() == 0)
      {
        return BadRequest("AI response is empty or malformed.");
      }

      var firstCandidate = candidatesElem[0];
      if (!firstCandidate.TryGetProperty("content", out JsonElement contentElem))
      {
        return BadRequest("AI response missing content.");
      }

      if (!contentElem.TryGetProperty("parts", out JsonElement partsElem) || partsElem.GetArrayLength() == 0)
      {
        return BadRequest("AI response content missing parts.");
      }

      var rawText = partsElem[0].GetProperty("text").GetString();

      var jsonMatch = Regex.Match(rawText ?? "", @"```json\s*(\{.*\})\s*```", RegexOptions.Singleline);

      if (!jsonMatch.Success)
      {
        return BadRequest("AI response JSON parsing failed.");
      }

      var jsonInsideCodeBlock = jsonMatch.Groups[1].Value;

      using var innerDoc = JsonDocument.Parse(jsonInsideCodeBlock);
      var innerRoot = innerDoc.RootElement;

      var redFlags = innerRoot.TryGetProperty("redFlags", out var rf) && rf.ValueKind == JsonValueKind.Array
          ? rf.EnumerateArray().Select(e => e.GetString()).Where(s => !string.IsNullOrEmpty(s)).ToList()
          : new List<string>();

      var classification = innerRoot.TryGetProperty("classification", out var cl) && cl.ValueKind == JsonValueKind.Array
          ? cl[0].GetString()
          : null;

      var aioutputString = innerRoot.TryGetProperty("aioutput", out var aiout) && aiout.ValueKind == JsonValueKind.String
          ? aiout.GetString()
          : null;

      invoice.Anomalies = redFlags.Any() ? string.Join("; ", redFlags) : null;
      var allowedTypes = new HashSet<string> { "To Pay", "To Collect" };
      if (string.IsNullOrEmpty(invoice.InvoiceType) || !allowedTypes.Contains(invoice.InvoiceType))
      {
        invoice.InvoiceType = classification ?? "Unknown";
      }

      invoice.AiOutput = aioutputString ?? rawText;

      _context.Invoices.Add(invoice);
      await _context.SaveChangesAsync();

      return CreatedAtAction(nameof(GetInvoice), new { id = invoice.Id }, invoice);
    }

    [HttpGet("summary")]
    [Authorize]
    public async Task<IActionResult> GetInvoicesSummary()
    {
      var invoices = await _context.Invoices.ToListAsync();

      var summary = new
      {
        totalInvoices = invoices.Count,
        anomalies = invoices.Count(i => !string.IsNullOrEmpty(i.Anomalies)),
        toPay = invoices.Count(i => i.InvoiceType == "To Pay"),
        toCollect = invoices.Count(i => i.InvoiceType == "To Collect")
      };

      return Ok(summary);
    }
  }
}

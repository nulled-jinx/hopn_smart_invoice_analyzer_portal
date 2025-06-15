using System.Text;
using System.Text.Json;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SmartInvoiceAnalyzerApi.Data;
using SmartInvoiceAnalyzerApi.Models;

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
    public async Task<IActionResult> GetInvoices()
    {
      var invoices = await _context.Invoices.ToListAsync();
      return Ok(invoices);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetInvoice(int id)
    {
      var invoice = await _context.Invoices.FindAsync(id);
      if (invoice == null)
        return NotFound();

      return Ok(invoice);
    }

    /*
        [HttpPost]
        public async Task<IActionResult> CreateInvoice([FromBody] Invoice invoice)
        {
          // _context.Invoices.Add(invoice);
          // await _context.SaveChangesAsync();

          // return CreatedAtAction(nameof(GetInvoice), new { id = invoice.Id }, invoice);

          var inputText = $"Vendor: {invoice.Vendor}, Amount: {invoice.Amount}, Tax ID: {invoice.TaxId}, Due Date: {invoice.DueDate}, Status: {invoice.Status}";

          var aiResultJson = await _aiService.ClassifyInvoice(inputText);

          using var doc = JsonDocument.Parse(aiResultJson);
          var predictions = doc.RootElement.EnumerateArray().ToList();
          var topLabel = predictions.OrderByDescending(p => p.GetProperty("score").GetDecimal()).First().GetProperty("label").GetString();

          invoice.InvoiceType = topLabel == "ENTAILMENT" ? "To Pay" : "To Collect";

          var anomalies = new List<string>();

          if (string.IsNullOrWhiteSpace(invoice.Vendor)) anomalies.Add("Missing Vendor");
          if (string.IsNullOrWhiteSpace(invoice.TaxId)) anomalies.Add("Missing Tax ID");
          if (invoice.Amount <= 0) anomalies.Add("Amount is zero or negative");
          if (invoice.DueDate < invoice.Date) anomalies.Add("Due date is before invoice date");

          invoice.Anomalies = anomalies.Any() ? string.Join("; ", anomalies) : null;

          // Step 5: Save to DB
          _context.Invoices.Add(invoice);
          await _context.SaveChangesAsync();

          return CreatedAtAction(nameof(GetInvoice), new { id = invoice.Id }, invoice);

        }
        */

    [HttpPost]
    public async Task<IActionResult> CreateInvoice([FromBody] Invoice invoice)
    {
      var inputText = $"Vendor: {invoice.Vendor}, Amount: {invoice.Amount}, Tax ID: {invoice.TaxId}, Due Date: {invoice.DueDate}, Status: {invoice.Status}";

      var aiResultJson = await _aiService.ClassifyInvoice(inputText);

      using var doc = JsonDocument.Parse(aiResultJson);
      var root = doc.RootElement;

      // Assuming Gemini response looks like this:
      // {
      //   "candidates": [
      //     {
      //       "content": {
      //         "parts": [
      //           { "text": "some result text" }
      //         ]
      //       }
      //     }
      //   ]
      // }

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

      // Concatenate all part texts (if multiple)
      var aiTextBuilder = new StringBuilder();
      foreach (var part in partsElem.EnumerateArray())
      {
        if (part.TryGetProperty("text", out JsonElement textElem))
        {
          aiTextBuilder.Append(textElem.GetString());
        }
      }
      var aiText = aiTextBuilder.ToString();

      // For demo: Decide InvoiceType based on AI text content, you can customize logic here
      invoice.InvoiceType = aiText.Contains("To Pay", StringComparison.OrdinalIgnoreCase) ? "To Pay" : "To Collect";

      // Existing anomaly detection logic
      var anomalies = new List<string>();
      if (string.IsNullOrWhiteSpace(invoice.Vendor)) anomalies.Add("Missing Vendor");
      if (string.IsNullOrWhiteSpace(invoice.TaxId)) anomalies.Add("Missing Tax ID");
      if (invoice.Amount <= 0) anomalies.Add("Amount is zero or negative");
      if (invoice.DueDate < invoice.Date) anomalies.Add("Due date is before invoice date");

      invoice.Anomalies = anomalies.Any() ? string.Join("; ", anomalies) : null;

      _context.Invoices.Add(invoice);
      await _context.SaveChangesAsync();

      return CreatedAtAction(nameof(GetInvoice), new { id = invoice.Id }, invoice);
    }

    [HttpGet("summary")]
    public async Task<IActionResult> GetInvoicesSummary()
    {
      var invoices = await _context.Invoices.ToListAsync();

      var summary = new
      {
        totalInvoices = invoices.Count,
        anomalies = invoices.Count(i => i.Anomalies != null && i.Anomalies.Any()),
        toPay = invoices.Count(i => i.InvoiceType == "To Pay"),
        toCollect = invoices.Count(i => i.InvoiceType == "To Collect")
      };

      return Ok(summary);
    }
  }
}

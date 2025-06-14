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

    public InvoicesController(InvoiceDbContext context)
    {
      _context = context;
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

    [HttpPost]
    public async Task<IActionResult> CreateInvoice([FromBody] Invoice invoice)
    {
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

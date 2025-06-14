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

    // [HttpPut("{id}")]
    // public async Task<IActionResult> UpdateInvoice(int id, [FromBody] Invoice updatedInvoice)
    // {
    //   if (id != updatedInvoice.Id)
    //     return BadRequest();

    //   var invoice = await _context.Invoices.FindAsync(id);
    //   if (invoice == null)
    //     return NotFound();

    //   invoice.Vendor = updatedInvoice.Vendor;
    //   invoice.Date = updatedInvoice.Date;
    //   invoice.Amount = updatedInvoice.Amount;
    //   invoice.TaxId = updatedInvoice.TaxId;
    //   invoice.DueDate = updatedInvoice.DueDate;
    //   invoice.Status = updatedInvoice.Status;
    //   invoice.InvoiceType = updatedInvoice.InvoiceType;
    //   invoice.Anomalies = updatedInvoice.Anomalies;

    //   await _context.SaveChangesAsync();

    //   return NoContent();
    // }

    // [HttpDelete("{id}")]
    // public async Task<IActionResult> DeleteInvoice(int id)
    // {
    //   var invoice = await _context.Invoices.FindAsync(id);
    //   if (invoice == null)
    //     return NotFound();

    //   _context.Invoices.Remove(invoice);
    //   await _context.SaveChangesAsync();

    //   return NoContent();
    // }
  }
}

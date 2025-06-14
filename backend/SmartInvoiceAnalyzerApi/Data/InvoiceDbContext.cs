using Microsoft.EntityFrameworkCore;
using SmartInvoiceAnalyzerApi.Models;

namespace SmartInvoiceAnalyzerApi.Data
{
  public class InvoiceDbContext : DbContext
  {
    public InvoiceDbContext(DbContextOptions<InvoiceDbContext> options) : base(options) { }

    public DbSet<Invoice> Invoices { get; set; }
  }
}
